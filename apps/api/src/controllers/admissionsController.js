const { query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { sendSms, sendWhatsApp } = require("../services/notificationService");
const env = require("../config/env");
const { toExcelBuffer } = require("../services/exportService");

const listAdmissions = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        aa.id,
        CONCAT('BSB-ADM-', YEAR(aa.created_at), '-', LPAD(aa.id, 4, '0')) AS admissionCode,
        aa.assigned_student_id AS assignedStudentId,
        aa.student_first_name AS studentFirstName,
        aa.student_middle_name AS studentMiddleName,
        aa.student_last_name AS studentLastName,
        CONCAT_WS(' ', aa.student_first_name, aa.student_middle_name, aa.student_last_name) AS studentFullName,
        aa.mother_name AS motherName,
        aa.parent_name AS parentName,
        aa.parent_phone AS parentPhone,
        aa.parent_email AS parentEmail,
        aa.address,
        aa.total_fee AS totalFee,
        aa.paid_fee AS paidFee,
        aa.remaining_fee AS remainingFee,
        aa.fee_notes AS feeNotes,
        COUNT(sd.id) AS documentCount,
        GROUP_CONCAT(DISTINCT sd.document_type ORDER BY sd.document_type SEPARATOR ', ') AS documents,
        aa.status,
        aa.created_at AS createdAt,
        c.name AS className,
        ay.title AS academicYear
      FROM admission_applications aa
      JOIN classes c ON c.id = aa.applying_class_id
      JOIN academic_years ay ON ay.id = aa.academic_year_id
      LEFT JOIN student_documents sd ON sd.admission_application_id = aa.id
      GROUP BY aa.id, c.name, ay.title
      ORDER BY aa.created_at DESC
    `
  );

  res.json({ success: true, data: rows });
});

const exportAdmissionRegister = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        CONCAT('BSB-ADM-', YEAR(aa.created_at), '-', LPAD(aa.id, 4, '0')) AS admission_id,
        aa.assigned_student_id AS student_id,
        c.name AS class,
        aa.student_first_name AS first_name,
        aa.student_middle_name AS middle_name,
        aa.student_last_name AS last_name,
        CONCAT_WS(' ', aa.student_first_name, aa.student_middle_name, aa.student_last_name) AS full_name,
        aa.mother_name AS mother_name,
        aa.parent_name AS parent_guardian_name,
        aa.parent_phone AS contact_number,
        aa.parent_email AS email,
        aa.address,
        aa.total_fee AS total_fee,
        aa.paid_fee AS paid_fee,
        aa.remaining_fee AS remaining_fee,
        aa.fee_notes AS fee_notes,
        aa.status,
        COUNT(sd.id) AS uploaded_document_count,
        GROUP_CONCAT(DISTINCT sd.document_type ORDER BY sd.document_type SEPARATOR ', ') AS documents,
        aa.created_at AS submitted_at
      FROM admission_applications aa
      JOIN classes c ON c.id = aa.applying_class_id
      LEFT JOIN student_documents sd ON sd.admission_application_id = aa.id
      GROUP BY aa.id, c.name
      ORDER BY c.display_order DESC, aa.id ASC
    `
  );

  const buffer = await toExcelBuffer("admission-register", rows);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="admission-register.xlsx"');
  res.send(buffer);
});

const reviewAdmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  await query(
    `
      UPDATE admission_applications
      SET status = :status, remarks = :remarks, reviewed_by = :reviewedBy, reviewed_at = NOW()
      WHERE id = :id
    `,
    {
      id,
      status,
      remarks: remarks || null,
      reviewedBy: req.auth.userId
    }
  );

  const rows = await query(`SELECT parent_phone AS parentPhone, student_first_name AS firstName FROM admission_applications WHERE id = :id`, { id });
  const item = rows[0];

  if (item?.parentPhone) {
    await sendSms({
      phone: item.parentPhone,
      message: `Admission status for ${item.firstName} has been updated to ${status} by BSB International School.`
    });
  }

  if (env.adminNotificationWhatsapp) {
    await sendWhatsApp({
      to: env.adminNotificationWhatsapp,
      message: `Admission #${id} reviewed with status: ${status}`
    });
  }

  res.json({ success: true, message: "Admission review updated." });
});

module.exports = {
  listAdmissions,
  exportAdmissionRegister,
  reviewAdmission
};
