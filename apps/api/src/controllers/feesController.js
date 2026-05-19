const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sendSms } = require("../services/notificationService");

const listFeeLedger = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        s.id AS studentId,
        s.student_id AS studentCode,
        CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS studentName,
        s.roll_no AS rollNo,
        fs.title AS feePlan,
        fs.total_amount AS totalAmount,
        COALESCE(SUM(fp.amount_paid), 0) AS paidAmount,
        (fs.total_amount + sfa.fine_amount - sfa.discount_amount - COALESCE(SUM(fp.amount_paid), 0)) AS pendingAmount
      FROM student_fee_assignments sfa
      JOIN students s ON s.id = sfa.student_id
      JOIN fee_structures fs ON fs.id = sfa.fee_structure_id
      LEFT JOIN fee_installments fi ON fi.assignment_id = sfa.id
      LEFT JOIN fee_payments fp ON fp.installment_id = fi.id
      GROUP BY sfa.id, s.id, fs.id
      ORDER BY studentName ASC
    `
  );

  res.json({ success: true, data: rows });
});

const getStudentFeeLedger = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const rows = await query(
    `
      SELECT
        sfa.id AS assignmentId,
        fs.title AS feePlan,
        fs.total_amount AS totalFee,
        sfa.discount_amount AS discountAmount,
        sfa.fine_amount AS fineAmount,
        fi.id AS installmentId,
        fi.installment_name AS installmentName,
        fi.due_date AS dueDate,
        fi.amount,
        fi.status,
        COALESCE(SUM(fp.amount_paid), 0) AS paidAmount
      FROM student_fee_assignments sfa
      JOIN fee_structures fs ON fs.id = sfa.fee_structure_id
      LEFT JOIN fee_installments fi ON fi.assignment_id = sfa.id
      LEFT JOIN fee_payments fp ON fp.installment_id = fi.id
      WHERE sfa.student_id = :studentId
      GROUP BY sfa.id, fi.id, fs.id
      ORDER BY fi.due_date ASC
    `,
    { studentId }
  );

  res.json({ success: true, data: rows });
});

const assignFeeStructure = asyncHandler(async (req, res) => {
  const { studentId, feeStructureId, discountAmount, fineAmount, installments } = req.body;

  if (!studentId || !feeStructureId) {
    throw new HttpError(400, "Student and fee structure are required.");
  }

  const assignmentId = await transaction(async (connection) => {
    const [assignmentResult] = await connection.execute(
      `
        INSERT INTO student_fee_assignments (student_id, fee_structure_id, discount_amount, fine_amount)
        VALUES (?, ?, ?, ?)
      `,
      [studentId, feeStructureId, discountAmount || 0, fineAmount || 0]
    );

    if (Array.isArray(installments) && installments.length) {
      for (const installment of installments) {
        await connection.execute(
          `
            INSERT INTO fee_installments (assignment_id, installment_name, due_date, amount, status)
            VALUES (?, ?, ?, ?, 'pending')
          `,
          [assignmentResult.insertId, installment.installmentName, installment.dueDate, installment.amount]
        );
      }
    }

    return assignmentResult.insertId;
  });

  res.status(201).json({ success: true, data: { assignmentId } });
});

const createFeePayment = asyncHandler(async (req, res) => {
  const { installmentId, studentId, amountPaid, paymentMode, referenceNo, notes } = req.body;

  if (!installmentId || !studentId || !amountPaid || !paymentMode) {
    throw new HttpError(400, "Installment, student, amount, and mode are required.");
  }

  const receiptNo = `BSB-${Date.now()}`;

  const paymentId = await transaction(async (connection) => {
    const [result] = await connection.execute(
      `
        INSERT INTO fee_payments
          (installment_id, student_id, receipt_no, payment_date, amount_paid, payment_mode, reference_no, collected_by, notes)
        VALUES
          (?, ?, ?, NOW(), ?, ?, ?, ?, ?)
      `,
      [installmentId, studentId, receiptNo, amountPaid, paymentMode, referenceNo || null, req.auth.userId, notes || null]
    );

    await connection.execute(`INSERT INTO fee_receipts (payment_id, receipt_url) VALUES (?, ?)`, [result.insertId, `/receipts/${receiptNo}.pdf`]);

    const [summaryRows] = await connection.execute(
      `
        SELECT
          fi.amount,
          COALESCE(SUM(fp.amount_paid), 0) AS totalPaid
        FROM fee_installments fi
        LEFT JOIN fee_payments fp ON fp.installment_id = fi.id
        WHERE fi.id = ?
        GROUP BY fi.id
      `,
      [installmentId]
    );

    const dueSummary = summaryRows[0];
    if (dueSummary) {
      const nextStatus = Number(dueSummary.totalPaid) >= Number(dueSummary.amount) ? "paid" : "partial";
      await connection.execute(`UPDATE fee_installments SET status = ? WHERE id = ?`, [nextStatus, installmentId]);
    }

    return result.insertId;
  });

  const rows = await query(
    `
      SELECT p.phone_primary AS phone
      FROM students s
      JOIN parents p ON p.id = s.parent_id
      WHERE s.id = :studentId
      LIMIT 1
    `,
    { studentId }
  );

  if (rows[0]?.phone) {
    await sendSms({
      phone: rows[0].phone,
      message: `Fee payment of Rs ${amountPaid} received. Receipt number: ${receiptNo}.`
    });
  }

  res.status(201).json({
    success: true,
    message: "Fee payment recorded successfully.",
    data: {
      paymentId,
      receiptNo
    }
  });
});

module.exports = {
  listFeeLedger,
  getStudentFeeLedger,
  assignFeeStructure,
  createFeePayment
};
