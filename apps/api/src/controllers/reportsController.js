const { query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { toExcelBuffer, toCsv } = require("../services/exportService");

async function sendReport(res, title, rows, format) {
  if (format === "xlsx") {
    const buffer = await toExcelBuffer(title, rows);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.xlsx"`);
    res.send(buffer);
    return;
  }

  if (format === "csv") {
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${title}.csv"`);
    res.send(toCsv(rows));
    return;
  }

  res.json({ success: true, data: rows });
}

const feePendingReport = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        CONCAT_WS(' ', s.first_name, s.last_name) AS studentName,
        s.roll_no AS rollNo,
        fs.title AS feePlan,
        fs.total_amount AS totalFee,
        COALESCE(SUM(fp.amount_paid), 0) AS paidAmount,
        (fs.total_amount + sfa.fine_amount - sfa.discount_amount - COALESCE(SUM(fp.amount_paid), 0)) AS pendingAmount
      FROM student_fee_assignments sfa
      JOIN students s ON s.id = sfa.student_id
      JOIN fee_structures fs ON fs.id = sfa.fee_structure_id
      LEFT JOIN fee_installments fi ON fi.assignment_id = sfa.id
      LEFT JOIN fee_payments fp ON fp.installment_id = fi.id
      GROUP BY sfa.id, s.id, fs.id
    `
  );

  await sendReport(res, "fee-pending-report", rows, req.query.format);
});

const dailyCollectionReport = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT DATE(payment_date) AS paymentDate, payment_mode AS paymentMode, SUM(amount_paid) AS totalCollected
      FROM fee_payments
      GROUP BY DATE(payment_date), payment_mode
      ORDER BY DATE(payment_date) DESC
    `
  );

  await sendReport(res, "daily-collection-report", rows, req.query.format);
});

const attendanceReport = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        CONCAT_WS(' ', s.first_name, s.last_name) AS studentName,
        s.roll_no AS rollNo,
        SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) AS presentDays,
        SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) AS absentDays
      FROM attendance_records ar
      JOIN students s ON s.id = ar.student_id
      GROUP BY s.id
      ORDER BY studentName ASC
    `
  );

  await sendReport(res, "attendance-report", rows, req.query.format);
});

const examPerformanceReport = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        e.title AS examName,
        c.name AS className,
        ROUND(AVG(er.percentage), 2) AS averagePercentage
      FROM exam_results er
      JOIN exams e ON e.id = er.exam_id
      JOIN classes c ON c.id = e.class_id
      GROUP BY e.id, c.id
      ORDER BY e.id DESC
    `
  );

  await sendReport(res, "exam-performance-report", rows, req.query.format);
});

const admissionReport = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT status, COUNT(*) AS totalApplications
      FROM admission_applications
      GROUP BY status
    `
  );

  await sendReport(res, "admission-report", rows, req.query.format);
});

module.exports = {
  feePendingReport,
  dailyCollectionReport,
  attendanceReport,
  examPerformanceReport,
  admissionReport
};
