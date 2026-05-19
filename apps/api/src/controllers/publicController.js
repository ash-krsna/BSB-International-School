const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { toPublicFileUrl } = require("../services/uploadService");
const { notifyAdminEnquiry, sendSms, sendWhatsApp } = require("../services/notificationService");
const { sendEmail } = require("../services/mailService");
const env = require("../config/env");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildUploadedFileLinks(files = []) {
  return files.map((file) => ({
    name: file.originalname,
    url: toPublicFileUrl(file)
  }));
}

const health = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "BSB ERP API is live." });
});

const submitAdmission = asyncHandler(async (req, res) => {
  const {
    academicYearId,
    applyingClassId,
    studentFirstName,
    studentLastName,
    studentGender,
    studentDob,
    parentName,
    parentPhone,
    parentEmail,
    address
  } = req.body;

  if (!academicYearId || !applyingClassId || !studentFirstName || !studentLastName || !studentGender || !studentDob || !parentName || !parentPhone) {
    throw new HttpError(400, "Please complete the required admission fields.");
  }

  req.uploadFolder = "admissions";

  const photoUrl = req.files?.photo?.[0] ? toPublicFileUrl(req.files.photo[0]) : null;
  const documentLinks = buildUploadedFileLinks(req.files?.documents || []);

  const admissionId = await transaction(async (connection) => {
    const [result] = await connection.execute(
      `
        INSERT INTO admission_applications
          (academic_year_id, applying_class_id, student_first_name, student_last_name, student_gender, student_dob, parent_name, parent_phone, parent_email, address, photo_url)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [academicYearId, applyingClassId, studentFirstName, studentLastName, studentGender, studentDob, parentName, parentPhone, parentEmail || null, address || null, photoUrl]
    );

    const applicationId = result.insertId;

    const documents = req.files?.documents || [];
    for (const document of documents) {
      await connection.execute(
        `
          INSERT INTO student_documents (admission_application_id, document_type, file_name, file_url)
          VALUES (?, ?, ?, ?)
        `,
        [applicationId, "admission_upload", document.originalname, toPublicFileUrl(document)]
      );
    }

    return applicationId;
  });

  await sendSms({
    phone: parentPhone,
    message: `Dear Parent, admission application received for ${studentFirstName} ${studentLastName} at BSB International School.`
  });

  if (parentEmail) {
    await sendEmail({
      to: parentEmail,
      subject: "BSB International School admission received",
      text: `Dear Parent,\n\nYour admission application for ${studentFirstName} ${studentLastName} has been received successfully.\n\nThank you,\nBSB International School`,
      html: `
        <h2>Admission application received</h2>
        <p>Dear Parent,</p>
        <p>Your admission application for <strong>${escapeHtml(studentFirstName)} ${escapeHtml(studentLastName)}</strong> has been received successfully.</p>
        <p>Thank you,<br/>BSB International School</p>
      `
    });
  }

  if (env.admissionReceiverEmail) {
    const safeStudentName = escapeHtml(`${studentFirstName} ${studentLastName}`);
    const safeParentName = escapeHtml(parentName);
    const safeParentPhone = escapeHtml(parentPhone);
    const safeParentEmail = escapeHtml(parentEmail || "Not provided");
    const safeAddress = escapeHtml(address || "Not provided");
    const safeDob = escapeHtml(studentDob);
    const safeGender = escapeHtml(studentGender);
    const safeClassId = escapeHtml(applyingClassId);
    const safeApplicationId = escapeHtml(admissionId);
    const safePhotoLink = photoUrl ? `<p><strong>Student Photo:</strong> <a href="${escapeHtml(photoUrl)}">Open photo</a></p>` : "";
    const safeDocumentList = documentLinks.length
      ? `<ul>${documentLinks.map((document) => `<li><a href="${escapeHtml(document.url)}">${escapeHtml(document.name)}</a></li>`).join("")}</ul>`
      : "<p>No documents uploaded.</p>";

    await sendEmail({
      to: env.admissionReceiverEmail,
      subject: `New admission application: ${studentFirstName} ${studentLastName}`,
      text: [
        `Application ID: ${admissionId}`,
        `Student: ${studentFirstName} ${studentLastName}`,
        `Applying Class ID: ${applyingClassId}`,
        `Gender: ${studentGender}`,
        `Date of Birth: ${studentDob}`,
        `Parent: ${parentName}`,
        `Parent Phone: ${parentPhone}`,
        `Parent Email: ${parentEmail || "Not provided"}`,
        `Address: ${address || "Not provided"}`,
        `Student Photo: ${photoUrl || "Not uploaded"}`,
        `Documents: ${documentLinks.map((document) => `${document.name}: ${document.url}`).join(", ") || "Not uploaded"}`
      ].join("\n"),
      html: `
        <h2>New admission application</h2>
        <p><strong>Application ID:</strong> ${safeApplicationId}</p>
        <p><strong>Student:</strong> ${safeStudentName}</p>
        <p><strong>Applying Class ID:</strong> ${safeClassId}</p>
        <p><strong>Gender:</strong> ${safeGender}</p>
        <p><strong>Date of Birth:</strong> ${safeDob}</p>
        <p><strong>Parent:</strong> ${safeParentName}</p>
        <p><strong>Parent Phone:</strong> ${safeParentPhone}</p>
        <p><strong>Parent Email:</strong> ${safeParentEmail}</p>
        <p><strong>Address:</strong><br/>${safeAddress}</p>
        ${safePhotoLink}
        <h3>Uploaded Documents</h3>
        ${safeDocumentList}
      `
    });
  }

  await notifyAdminEnquiry(`New online admission received for ${studentFirstName} ${studentLastName}. Parent phone: ${parentPhone}`);

  res.status(201).json({
    success: true,
    message: "Admission submitted successfully.",
    admissionId
  });
});

const submitEnquiry = asyncHandler(async (req, res) => {
  const { name, phone, email, message } = req.body;
  if (!name || !phone || !message) {
    throw new HttpError(400, "Name, phone, and message are required.");
  }

  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email || "Not provided");
  const safeMessage = escapeHtml(message);

  await query(
    `INSERT INTO contact_enquiries (name, phone, email, message) VALUES (:name, :phone, :email, :message)`,
    { name, phone, email: email || null, message }
  );

  await notifyAdminEnquiry(`New website enquiry from ${name} (${phone}): ${message}`);
  await sendEmail({
    to: env.contactReceiverEmail,
    subject: `New website enquiry from ${name}`,
    text: `Name: ${name}\nPhone: ${phone}\nEmail: ${email || "Not provided"}\nMessage: ${message}`,
    html: `
      <h2>New website enquiry</h2>
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Phone:</strong> ${safePhone}</p>
      <p><strong>Email:</strong> ${safeEmail}</p>
      <p><strong>Message:</strong><br/>${safeMessage}</p>
    `
  });

  if (email) {
    await sendEmail({
      to: email,
      subject: "BSB International School enquiry received",
      text: `Hello ${name},\n\nWe have received your enquiry and the school office will contact you soon.\n\nThank you,\nBSB International School`,
      html: `
        <h2>We received your enquiry</h2>
        <p>Hello ${safeName},</p>
        <p>We have received your enquiry and the school office will contact you soon.</p>
        <p>Thank you,<br/>BSB International School</p>
      `
    });
  }

  res.status(201).json({
    success: true,
    message: "Enquiry submitted successfully."
  });
});

const listGallery = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT id, category, title, description, image_url AS imageUrl, published_at AS publishedAt
      FROM gallery_items
      ORDER BY created_at DESC
    `
  );

  res.json({ success: true, data: rows });
});

const listNotices = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT id, title, body, audience, published_at AS publishedAt, expires_at AS expiresAt
      FROM notices
      WHERE published_at IS NOT NULL
      ORDER BY published_at DESC
    `
  );

  res.json({ success: true, data: rows });
});

const resultLookup = asyncHandler(async (req, res) => {
  const { rollNo, dob } = req.query;

  if (!rollNo || !dob) {
    throw new HttpError(400, "Roll number and date of birth are required.");
  }

  const rows = await query(
    `
      SELECT
        s.id,
        CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS studentName,
        c.name AS className
      FROM students s
      LEFT JOIN classes c ON c.id = s.current_class_id
      WHERE s.roll_no = :rollNo AND s.date_of_birth = :dob
      LIMIT 1
    `,
    { rollNo, dob }
  );

  const student = rows[0];
  if (!student) {
    throw new HttpError(404, "No student matched the provided details.");
  }

  const results = await query(
    `
      SELECT
        e.title AS examName,
        ay.title AS academicYear,
        ROUND(AVG(er.marks_obtained), 2) AS averageMarks,
        ROUND(AVG(er.percentage), 2) AS averagePercentage
      FROM exam_results er
      JOIN exams e ON e.id = er.exam_id
      JOIN academic_years ay ON ay.id = e.academic_year_id
      WHERE er.student_id = :studentId
      GROUP BY e.id, e.title, ay.title
      ORDER BY e.id DESC
      LIMIT 1
    `,
    { studentId: student.id }
  );

  res.json({
    success: true,
    data: {
      studentName: student.studentName,
      className: student.className,
      latestResult: results[0] || null
    }
  });
});

module.exports = {
  health,
  submitAdmission,
  submitEnquiry,
  listGallery,
  listNotices,
  resultLookup
};
