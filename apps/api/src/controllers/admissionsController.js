const { query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const { sendSms, sendWhatsApp } = require("../services/notificationService");
const env = require("../config/env");

const listAdmissions = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        aa.id,
        aa.student_first_name AS studentFirstName,
        aa.student_last_name AS studentLastName,
        aa.parent_name AS parentName,
        aa.parent_phone AS parentPhone,
        aa.status,
        aa.created_at AS createdAt,
        c.name AS className,
        ay.title AS academicYear
      FROM admission_applications aa
      JOIN classes c ON c.id = aa.applying_class_id
      JOIN academic_years ay ON ay.id = aa.academic_year_id
      ORDER BY aa.created_at DESC
    `
  );

  res.json({ success: true, data: rows });
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
  reviewAdmission
};
