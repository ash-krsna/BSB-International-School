const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sendSms, sendWhatsApp } = require("../services/notificationService");
const env = require("../config/env");
const { toExcelBuffer } = require("../services/exportService");
const { toPublicFileUrl } = require("../services/uploadService");

function normalizeGender(value) {
  const gender = String(value || "").trim().toLowerCase();
  if (["male", "female", "other"].includes(gender)) {
    return gender;
  }
  return "";
}

function normalizeYesNo(value) {
  return ["true", "yes", "1", "on"].includes(String(value || "").trim().toLowerCase());
}

function toMoney(value) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

async function resolveAdmissionSetup({ academicYearId, applyingClassId, applyingClassName }) {
  let resolvedAcademicYearId = academicYearId || null;
  if (!resolvedAcademicYearId) {
    const years = await query("SELECT id FROM academic_years WHERE is_current = TRUE ORDER BY id DESC LIMIT 1");
    resolvedAcademicYearId = years[0]?.id;
  }

  let resolvedClassId = applyingClassId || null;
  if (!resolvedClassId && applyingClassName) {
    const classes = await query("SELECT id FROM classes WHERE name = :name LIMIT 1", { name: applyingClassName });
    resolvedClassId = classes[0]?.id;
  }

  if (!resolvedAcademicYearId || !resolvedClassId) {
    throw new HttpError(400, "Admission database is missing current academic year or selected class setup.");
  }

  return { resolvedAcademicYearId, resolvedClassId };
}

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

const createStaffAdmission = asyncHandler(async (req, res) => {
  const {
    academicYearId,
    applyingClassId,
    applyingClassName,
    studentFirstName,
    studentMiddleName,
    studentLastName,
    studentGender,
    studentDob,
    aadhaarNo,
    parentName,
    motherName,
    parentPhone,
    parentEmail,
    address,
    previousSchool,
    scholarshipDetails,
    wantsBusService,
    pickupAddress,
    preferredRoute,
    totalFee,
    paidFee,
    feeNotes
  } = req.body;

  const resolvedGender = normalizeGender(studentGender);
  if (!studentFirstName || !studentLastName || !resolvedGender || !studentDob || !parentName || !motherName || !parentPhone) {
    throw new HttpError(400, "Please complete student name, gender, DOB, parent, mother name, and phone.");
  }

  const { resolvedAcademicYearId, resolvedClassId } = await resolveAdmissionSetup({ academicYearId, applyingClassId, applyingClassName });
  const photoFile = req.files?.photo?.[0] || req.files?.photoCamera?.[0] || null;
  const photoUrl = photoFile ? await toPublicFileUrl(photoFile) : null;
  const totalFeeAmount = toMoney(totalFee);
  const paidFeeAmount = Math.min(toMoney(paidFee), totalFeeAmount || toMoney(paidFee));
  const remainingFeeAmount = Math.max(totalFeeAmount - paidFeeAmount, 0);

  const result = await transaction(async (connection) => {
    const [classRows] = await connection.execute("SELECT name, display_order FROM classes WHERE id = ? LIMIT 1", [resolvedClassId]);
    const classInfo = classRows[0] || {};
    const classNumber = String(classInfo.name || applyingClassName || "CLS").replace(/\D/g, "") || String(classInfo.display_order || resolvedClassId);
    const [counterRows] = await connection.execute(
      "SELECT COUNT(*) AS count FROM admission_applications WHERE academic_year_id = ? AND applying_class_id = ? AND assigned_student_id IS NOT NULL",
      [resolvedAcademicYearId, resolvedClassId]
    );
    const nextClassSerial = Number(counterRows[0]?.count || 0) + 1;
    const assignedStudentId = `BSB-${new Date().getFullYear()}-C${classNumber}-${String(nextClassSerial).padStart(4, "0")}`;

    const [insertResult] = await connection.execute(
      `
        INSERT INTO admission_applications
          (academic_year_id, applying_class_id, assigned_student_id, student_first_name, student_middle_name, student_last_name, student_gender, student_dob, aadhaar_no, parent_name, mother_name, parent_phone, parent_email, address, previous_school, scholarship_details, wants_bus_service, pickup_address, preferred_route, total_fee, paid_fee, remaining_fee, fee_notes, photo_url, status, reviewed_by, reviewed_at)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, NOW())
      `,
      [
        resolvedAcademicYearId,
        resolvedClassId,
        assignedStudentId,
        studentFirstName,
        studentMiddleName || null,
        studentLastName,
        resolvedGender,
        studentDob,
        aadhaarNo || null,
        parentName,
        motherName,
        parentPhone,
        parentEmail || null,
        address || null,
        previousSchool || null,
        scholarshipDetails || null,
        normalizeYesNo(wantsBusService),
        pickupAddress || null,
        preferredRoute || null,
        totalFeeAmount,
        paidFeeAmount,
        remainingFeeAmount,
        feeNotes || null,
        photoUrl,
        req.auth.userId
      ]
    );

    const applicationId = insertResult.insertId;
    const documentGroups = [
      ["documents", "admission_upload"],
      ["documentCamera", "admission_camera_photo"],
      ["passportPhoto", "passport_photo"],
      ["birthCertificate", "birth_certificate"],
      ["previousMarksheet", "previous_marksheet"],
      ["transferCertificate", "transfer_certificate"]
    ];

    for (const [fieldName, documentType] of documentGroups) {
      const documents = req.files?.[fieldName] || [];
      for (const document of documents) {
        await connection.execute(
          `
            INSERT INTO student_documents (admission_application_id, document_type, file_name, file_url, uploaded_by)
            VALUES (?, ?, ?, ?, ?)
          `,
          [applicationId, documentType, document.originalname, await toPublicFileUrl(document), req.auth.userId]
        );
      }
    }

    return { applicationId, assignedStudentId };
  });

  res.status(201).json({
    success: true,
    message: "Official admission saved.",
    admissionId: result.applicationId,
    admissionCode: `BSB-ADM-${new Date().getFullYear()}-${String(result.applicationId).padStart(4, "0")}`,
    studentId: result.assignedStudentId
  });
});

const exportAdmissionRegister = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        CONCAT('BSB-ADM-', YEAR(aa.created_at), '-', LPAD(aa.id, 4, '0')) AS admission_enquiry_id,
        COALESCE(aa.assigned_student_id, 'Not assigned yet') AS student_id,
        ay.title AS academic_year,
        c.name AS applying_class,
        CONCAT_WS(' ', aa.student_first_name, aa.student_middle_name, aa.student_last_name) AS student_full_name,
        aa.student_first_name AS student_first_name,
        aa.student_middle_name AS student_middle_name,
        aa.student_last_name AS student_last_name,
        aa.student_gender AS gender,
        aa.student_dob AS date_of_birth,
        aa.aadhaar_no AS aadhaar_number,
        aa.mother_name AS mothers_name,
        aa.parent_name AS parent_guardian_name,
        aa.parent_phone AS parent_contact_number,
        aa.parent_email AS parent_email,
        aa.address,
        aa.previous_school,
        aa.scholarship_details,
        CASE WHEN aa.wants_bus_service = 1 THEN 'Yes' ELSE 'No' END AS bus_service_required,
        aa.pickup_address,
        aa.preferred_route,
        aa.total_fee AS total_fee,
        aa.paid_fee AS paid_fee,
        aa.remaining_fee AS remaining_fee,
        aa.fee_notes AS fee_notes,
        aa.status AS admission_status,
        CASE WHEN aa.photo_url IS NULL OR aa.photo_url = '' THEN 'No' ELSE 'Yes' END AS student_photo_given,
        CASE WHEN COALESCE(d.total_documents, 0) > 0 THEN 'Yes' ELSE 'No' END AS any_document_given,
        COALESCE(d.total_documents, 0) AS uploaded_document_count,
        CASE WHEN COALESCE(d.passport_photo_count, 0) > 0 THEN 'Yes' ELSE 'No' END AS passport_photo_given,
        CASE WHEN COALESCE(d.birth_certificate_count, 0) > 0 THEN 'Yes' ELSE 'No' END AS birth_certificate_given,
        CASE WHEN COALESCE(d.previous_marksheet_count, 0) > 0 THEN 'Yes' ELSE 'No' END AS previous_marksheet_given,
        CASE WHEN COALESCE(d.transfer_certificate_count, 0) > 0 THEN 'Yes' ELSE 'No' END AS transfer_certificate_given,
        CASE WHEN COALESCE(d.admission_upload_count, 0) > 0 THEN 'Yes' ELSE 'No' END AS other_documents_given,
        CASE WHEN COALESCE(d.camera_document_count, 0) > 0 THEN 'Yes' ELSE 'No' END AS camera_documents_given,
        COALESCE(d.document_types, '') AS document_types_saved,
        aa.created_at AS submitted_at,
        aa.reviewed_at AS confirmed_at
      FROM admission_applications aa
      JOIN classes c ON c.id = aa.applying_class_id
      JOIN academic_years ay ON ay.id = aa.academic_year_id
      LEFT JOIN (
        SELECT
          admission_application_id,
          COUNT(*) AS total_documents,
          SUM(document_type = 'passport_photo') AS passport_photo_count,
          SUM(document_type = 'birth_certificate') AS birth_certificate_count,
          SUM(document_type = 'previous_marksheet') AS previous_marksheet_count,
          SUM(document_type = 'transfer_certificate') AS transfer_certificate_count,
          SUM(document_type = 'admission_upload') AS admission_upload_count,
          SUM(document_type = 'admission_camera_photo') AS camera_document_count,
          GROUP_CONCAT(DISTINCT document_type ORDER BY document_type SEPARATOR ', ') AS document_types
        FROM student_documents
        WHERE admission_application_id IS NOT NULL
        GROUP BY admission_application_id
      ) d ON d.admission_application_id = aa.id
      ORDER BY c.display_order DESC, aa.id ASC
    `
  );

  const buffer = await toExcelBuffer("student-admission-register", rows);
  res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  res.setHeader("Content-Disposition", 'attachment; filename="bsb-combined-student-admission-register.xlsx"');
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
  createStaffAdmission,
  exportAdmissionRegister,
  reviewAdmission
};
