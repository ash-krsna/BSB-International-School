const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { toPublicFileUrl } = require("../services/uploadService");

const documentFieldMap = {
  aadhaarFile: "aadhaar",
  birthCertificateFile: "birth_certificate",
  previousMarksheetFile: "previous_marksheet",
  passportPhotoFile: "passport_photo",
  transferCertificateFile: "transfer_certificate",
  documents: "general_document"
};

async function getRoleId(connection, roleCode) {
  const [rows] = await connection.execute(`SELECT id FROM roles WHERE code = ? LIMIT 1`, [roleCode]);
  return rows[0]?.id || null;
}

async function createUserWithRole(connection, { fullName, email, phone, username, password, roleCode }) {
  if (!username || !password) {
    return null;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [userResult] = await connection.execute(
    `
      INSERT INTO users (full_name, email, phone, username, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `,
    [fullName, email || null, phone || null, username, passwordHash]
  );

  const roleId = await getRoleId(connection, roleCode);
  if (roleId) {
    await connection.execute(`INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)`, [userResult.insertId, roleId]);
  }

  return userResult.insertId;
}

async function generateStudentCode(connection) {
  const year = new Date().getFullYear();
  const [rows] = await connection.execute(`SELECT COUNT(*) AS total FROM students`);
  const next = Number(rows[0]?.total || 0) + 1;
  return `BSB-${year}-${String(next).padStart(4, "0")}`;
}

async function saveStudentDocuments(connection, studentId, files, uploadedBy) {
  const created = [];

  for (const [fieldName, documents] of Object.entries(files || {})) {
    for (const document of documents) {
      const documentType = fieldName === "documents" ? documentFieldMap.documents : (documentFieldMap[fieldName] || fieldName);
      const fileUrl = toPublicFileUrl(document);

      await connection.execute(
        `
          INSERT INTO student_documents (student_id, document_type, file_name, file_url, uploaded_by)
          VALUES (?, ?, ?, ?, ?)
        `,
        [studentId, documentType, document.originalname, fileUrl, uploadedBy || null]
      );

      created.push({
        documentType,
        fileName: document.originalname,
        fileUrl
      });
    }
  }

  return created;
}

async function loadStudentBundle(studentId) {
  const students = await query(
    `
      SELECT
        s.id,
        s.student_id AS studentId,
        s.admission_no AS admissionNo,
        s.roll_no AS rollNo,
        s.first_name AS firstName,
        s.middle_name AS middleName,
        s.last_name AS lastName,
        s.gender,
        s.date_of_birth AS dateOfBirth,
        s.blood_group AS bloodGroup,
        s.aadhaar_no AS aadhaarNo,
        s.photo_url AS photoUrl,
        s.admission_date AS admissionDate,
        s.previous_school AS previousSchool,
        s.status,
        c.id AS classId,
        c.name AS className,
        sec.id AS sectionId,
        sec.name AS sectionName,
        ay.title AS academicYear,
        p.id AS parentId,
        p.father_name AS fatherName,
        p.mother_name AS motherName,
        p.guardian_name AS guardianName,
        p.phone_primary AS parentPhone,
        p.phone_secondary AS alternateContactNumber,
        p.email AS parentEmail,
        p.occupation,
        p.address_line1 AS addressLine1,
        p.address_line2 AS addressLine2,
        p.city,
        p.state,
        p.postal_code AS postalCode
      FROM students s
      LEFT JOIN classes c ON c.id = s.current_class_id
      LEFT JOIN sections sec ON sec.id = s.current_section_id
      LEFT JOIN academic_years ay ON ay.id = s.joined_academic_year_id
      LEFT JOIN parents p ON p.id = s.parent_id
      WHERE s.id = :studentId
      LIMIT 1
    `,
    { studentId }
  );

  const student = students[0];
  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  const [history, documents, notes, achievements, attendanceRows, feeLedger, resultRows] = await Promise.all([
    query(
      `
        SELECT
          ay.title AS academicYear,
          c.name AS className,
          sec.name AS sectionName,
          sh.roll_no AS rollNo,
          sh.remarks,
          promoted.name AS promotedToClass
        FROM student_histories sh
        JOIN academic_years ay ON ay.id = sh.academic_year_id
        JOIN classes c ON c.id = sh.class_id
        LEFT JOIN sections sec ON sec.id = sh.section_id
        LEFT JOIN classes promoted ON promoted.id = sh.promoted_to_class_id
        WHERE sh.student_id = :studentId
        ORDER BY ay.starts_on DESC, sh.id DESC
      `,
      { studentId }
    ),
    query(
      `
        SELECT document_type AS documentType, file_name AS fileName, file_url AS fileUrl, uploaded_at AS uploadedAt
        FROM student_documents
        WHERE student_id = :studentId
        ORDER BY uploaded_at DESC
      `,
      { studentId }
    ),
    query(
      `
        SELECT
          sn.id,
          sn.note_type AS noteType,
          sn.title,
          sn.note,
          sn.created_at AS createdAt,
          u.full_name AS createdBy
        FROM student_notes sn
        LEFT JOIN users u ON u.id = sn.created_by
        WHERE sn.student_id = :studentId
        ORDER BY sn.created_at DESC
      `,
      { studentId }
    ),
    query(
      `
        SELECT
          sa.id,
          sa.title,
          sa.description,
          sa.achieved_on AS achievedOn,
          sa.created_at AS createdAt,
          u.full_name AS createdBy
        FROM student_achievements sa
        LEFT JOIN users u ON u.id = sa.created_by
        WHERE sa.student_id = :studentId
        ORDER BY COALESCE(sa.achieved_on, DATE(sa.created_at)) DESC
      `,
      { studentId }
    ),
    query(
      `
        SELECT ar.status
        FROM attendance_records ar
        WHERE ar.student_id = :studentId
      `,
      { studentId }
    ),
    query(
      `
        SELECT
          fs.title AS feePlan,
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
        GROUP BY fs.title, fi.id
        ORDER BY fi.due_date DESC
      `,
      { studentId }
    ),
    query(
      `
        SELECT
          e.title AS examName,
          ay.title AS academicYear,
          ROUND(AVG(er.marks_obtained), 2) AS averageMarks,
          ROUND(AVG(er.percentage), 2) AS averagePercentage,
          GROUP_CONCAT(CONCAT(sub.name, ': ', er.marks_obtained, '/', sub.max_marks) ORDER BY sub.name SEPARATOR ' | ') AS subjectBreakdown
        FROM exam_results er
        JOIN exams e ON e.id = er.exam_id
        JOIN academic_years ay ON ay.id = e.academic_year_id
        JOIN subjects sub ON sub.id = er.subject_id
        WHERE er.student_id = :studentId
        GROUP BY e.id, ay.title, e.title
        ORDER BY e.id DESC
      `,
      { studentId }
    )
  ]);

  const totalAttendance = attendanceRows.length;
  const presentDays = attendanceRows.filter((row) => row.status === "present").length;
  const lowAttendance = totalAttendance ? Number(((presentDays / totalAttendance) * 100).toFixed(2)) : 0;

  const totalFee = feeLedger.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalPaid = feeLedger.reduce((sum, item) => sum + Number(item.paidAmount || 0), 0);
  const latestResult = resultRows[0] || null;

  return {
    student,
    history,
    documents,
    notes,
    achievements,
    attendanceSummary: {
      totalSessions: totalAttendance,
      presentDays,
      attendancePercentage: lowAttendance
    },
    feeSummary: {
      totalFee,
      totalPaid,
      pendingAmount: Number((totalFee - totalPaid).toFixed(2))
    },
    feeLedger,
    resultSummary: {
      latestResult,
      exams: resultRows
    }
  };
}

async function writeStudentIdCardPdf(res, bundle) {
  const { student, feeSummary, attendanceSummary } = bundle;
  const logoPath = path.resolve(__dirname, "../../../web/public/showcase/logo.jpeg");
  const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ");
  const qrPayload = JSON.stringify({
    studentId: student.studentId,
    admissionNo: student.admissionNo,
    name: fullName,
    className: student.className,
    parentPhone: student.parentPhone
  });

  const qrDataUrl = await QRCode.toDataURL(qrPayload, { margin: 1, width: 180 });
  const qrBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename="${student.studentId}-id-card.pdf"`);

  const doc = new PDFDocument({ size: [340, 220], margin: 18 });
  doc.pipe(res);

  doc.roundedRect(8, 8, 324, 204, 18).fillAndStroke("#fff9ef", "#11786f");
  doc.fillColor("#11786f");
  doc.roundedRect(18, 18, 304, 28, 12).fill();

  if (fs.existsSync(logoPath)) {
    doc.image(logoPath, 26, 20, { width: 24, height: 24 });
  }

  doc.fillColor("#ffffff").fontSize(14).text("BSB International School", 58, 24, { align: "left" });
  doc.fontSize(8).text("Creating The Leaders", 58, 38);

  doc.fillColor("#204640");
  doc.roundedRect(22, 58, 92, 118, 18).fillAndStroke("#ffffff", "#d7ece9");
  if (student.photoUrl && /^https?:\/\//i.test(student.photoUrl)) {
    doc.fontSize(8).fillColor("#57766a").text("Photo available in cloud record", 30, 110, { width: 72, align: "center" });
  } else {
    doc.fontSize(9).fillColor("#57766a").text("Student Photo", 34, 110, { width: 66, align: "center" });
  }

  doc.fillColor("#204640").fontSize(13).text(fullName, 126, 62, { width: 110 });
  doc.fontSize(9);
  doc.text(`Student ID: ${student.studentId}`, 126, 88);
  doc.text(`Admission No: ${student.admissionNo}`, 126, 102);
  doc.text(`Class: ${student.className || "-"}`, 126, 116);
  doc.text(`Section: ${student.sectionName || "-"}`, 126, 130);
  doc.text(`Roll No: ${student.rollNo}`, 126, 144);
  doc.text(`Parent: ${student.guardianName || student.fatherName || "-"}`, 126, 158, { width: 110 });

  doc.image(qrBuffer, 246, 68, { width: 64, height: 64 });
  doc.fontSize(8).fillColor("#57766a").text("Scan for student record", 238, 138, { width: 78, align: "center" });

  doc.fillColor("#11786f").fontSize(8);
  doc.text(`Attendance: ${attendanceSummary.attendancePercentage}%`, 22, 188);
  doc.text(`Fee Pending: Rs ${feeSummary.pendingAmount}`, 126, 188);

  doc.end();
}

const listStudents = asyncHandler(async (req, res) => {
  const {
    search = "",
    classId,
    sectionId,
    status,
    admissionYearId,
    feePendingOnly,
    lowAttendanceOnly
  } = req.query;

  const rows = await query(
    `
      SELECT
        s.id,
        s.student_id AS studentId,
        s.admission_no AS admissionNo,
        s.roll_no AS rollNo,
        CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS fullName,
        s.date_of_birth AS dateOfBirth,
        s.admission_date AS admissionDate,
        c.name AS className,
        sec.name AS sectionName,
        p.phone_primary AS parentPhone,
        p.guardian_name AS guardianName,
        s.status,
        ROUND(COALESCE((
          SELECT SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0)
          FROM attendance_records ar
          WHERE ar.student_id = s.id
        ), 0), 2) AS attendancePercentage,
        COALESCE((
          SELECT SUM(fi.amount) - COALESCE(SUM(fp.amount_paid), 0)
          FROM student_fee_assignments sfa
          LEFT JOIN fee_installments fi ON fi.assignment_id = sfa.id
          LEFT JOIN fee_payments fp ON fp.installment_id = fi.id
          WHERE sfa.student_id = s.id
        ), 0) AS pendingFees
      FROM students s
      LEFT JOIN classes c ON c.id = s.current_class_id
      LEFT JOIN sections sec ON sec.id = s.current_section_id
      LEFT JOIN parents p ON p.id = s.parent_id
      WHERE
        (:search = '' OR
          s.student_id LIKE CONCAT('%', :search, '%') OR
          s.admission_no LIKE CONCAT('%', :search, '%') OR
          s.roll_no LIKE CONCAT('%', :search, '%') OR
          s.aadhaar_no LIKE CONCAT('%', :search, '%') OR
          p.phone_primary LIKE CONCAT('%', :search, '%') OR
          CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) LIKE CONCAT('%', :search, '%'))
        AND (:classId IS NULL OR s.current_class_id = :classId)
        AND (:sectionId IS NULL OR s.current_section_id = :sectionId)
        AND (:status IS NULL OR s.status = :status)
        AND (:admissionYearId IS NULL OR s.joined_academic_year_id = :admissionYearId)
      HAVING
        (:feePendingOnly = 0 OR pendingFees > 0)
        AND (:lowAttendanceOnly = 0 OR attendancePercentage < 75)
      ORDER BY s.created_at DESC
    `,
    {
      search,
      classId: classId || null,
      sectionId: sectionId || null,
      status: status || null,
      admissionYearId: admissionYearId || null,
      feePendingOnly: feePendingOnly === "true" ? 1 : 0,
      lowAttendanceOnly: lowAttendanceOnly === "true" ? 1 : 0
    }
  );

  res.json({ success: true, data: rows });
});

const createStudent = asyncHandler(async (req, res) => {
  const {
    studentId,
    admissionNo,
    rollNo,
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
    bloodGroup,
    aadhaarNo,
    classId,
    sectionId,
    academicYearId,
    admissionDate,
    previousSchool,
    fatherName,
    motherName,
    guardianName,
    parentPhone,
    alternateContactNumber,
    parentEmail,
    occupation,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    studentUsername,
    studentPassword,
    parentUsername,
    parentPassword
  } = req.body;

  if (!admissionNo || !rollNo || !firstName || !lastName || !gender || !dateOfBirth || !classId || !academicYearId || !parentPhone) {
    throw new HttpError(400, "Required student profile fields are missing.");
  }

  req.uploadFolder = "students";
  const photoUrl = req.files?.photo?.[0] ? toPublicFileUrl(req.files.photo[0]) : null;

  const createdStudentId = await transaction(async (connection) => {
    const nextStudentId = studentId || await generateStudentCode(connection);
    const studentUserId = await createUserWithRole(connection, {
      fullName: `${firstName} ${lastName}`,
      email: null,
      phone: null,
      username: studentUsername || null,
      password: studentPassword || null,
      roleCode: "student"
    });

    const parentUserId = await createUserWithRole(connection, {
      fullName: guardianName || fatherName || `${firstName} ${lastName} Parent`,
      email: parentEmail || null,
      phone: parentPhone,
      username: parentUsername || null,
      password: parentPassword || null,
      roleCode: "parent"
    });

    const [parentResult] = await connection.execute(
      `
        INSERT INTO parents
          (user_id, father_name, mother_name, guardian_name, phone_primary, phone_secondary, email, occupation, address_line1, address_line2, city, state, postal_code)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        parentUserId,
        fatherName || null,
        motherName || null,
        guardianName || null,
        parentPhone,
        alternateContactNumber || null,
        parentEmail || null,
        occupation || null,
        addressLine1 || null,
        addressLine2 || null,
        city || null,
        state || null,
        postalCode || null
      ]
    );

    const [studentResult] = await connection.execute(
      `
        INSERT INTO students
          (user_id, student_id, admission_no, roll_no, first_name, middle_name, last_name, gender, date_of_birth, blood_group, aadhaar_no, photo_url, current_class_id, current_section_id, parent_id, joined_academic_year_id, admission_date, status, previous_school)
        VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `,
      [
        studentUserId,
        nextStudentId,
        admissionNo,
        rollNo,
        firstName,
        middleName || null,
        lastName,
        gender,
        dateOfBirth,
        bloodGroup || null,
        aadhaarNo || null,
        photoUrl,
        classId,
        sectionId || null,
        parentResult.insertId,
        academicYearId,
        admissionDate || null,
        previousSchool || null
      ]
    );

    await connection.execute(
      `
        INSERT INTO student_histories (student_id, academic_year_id, class_id, section_id, roll_no, remarks)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [studentResult.insertId, academicYearId, classId, sectionId || null, rollNo, "Admission created in ERP"]
    );

    await saveStudentDocuments(connection, studentResult.insertId, req.files, req.auth?.userId);

    return studentResult.insertId;
  });

  res.status(201).json({
    success: true,
    message: "Student profile created successfully.",
    studentId: createdStudentId
  });
});

const updateStudent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    rollNo,
    firstName,
    middleName,
    lastName,
    gender,
    dateOfBirth,
    bloodGroup,
    aadhaarNo,
    classId,
    sectionId,
    academicYearId,
    admissionDate,
    previousSchool,
    status,
    fatherName,
    motherName,
    guardianName,
    parentPhone,
    alternateContactNumber,
    parentEmail,
    occupation,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode
  } = req.body;

  req.uploadFolder = "students";
  const photoUrl = req.files?.photo?.[0] ? toPublicFileUrl(req.files.photo[0]) : null;

  await transaction(async (connection) => {
    const [studentRows] = await connection.execute(`SELECT parent_id AS parentId FROM students WHERE id = ? LIMIT 1`, [id]);
    const student = studentRows[0];
    if (!student) {
      throw new HttpError(404, "Student not found.");
    }

    await connection.execute(
      `
        UPDATE students
        SET roll_no = COALESCE(?, roll_no),
            first_name = COALESCE(?, first_name),
            middle_name = ?,
            last_name = COALESCE(?, last_name),
            gender = COALESCE(?, gender),
            date_of_birth = COALESCE(?, date_of_birth),
            blood_group = ?,
            aadhaar_no = ?,
            photo_url = COALESCE(?, photo_url),
            current_class_id = COALESCE(?, current_class_id),
            current_section_id = ?,
            joined_academic_year_id = COALESCE(?, joined_academic_year_id),
            admission_date = ?,
            previous_school = ?,
            status = COALESCE(?, status)
        WHERE id = ?
      `,
      [
        rollNo || null,
        firstName || null,
        middleName || null,
        lastName || null,
        gender || null,
        dateOfBirth || null,
        bloodGroup || null,
        aadhaarNo || null,
        photoUrl,
        classId || null,
        sectionId || null,
        academicYearId || null,
        admissionDate || null,
        previousSchool || null,
        status || null,
        id
      ]
    );

    await connection.execute(
      `
        UPDATE parents
        SET father_name = ?,
            mother_name = ?,
            guardian_name = ?,
            phone_primary = COALESCE(?, phone_primary),
            phone_secondary = ?,
            email = ?,
            occupation = ?,
            address_line1 = ?,
            address_line2 = ?,
            city = ?,
            state = ?,
            postal_code = ?
        WHERE id = ?
      `,
      [
        fatherName || null,
        motherName || null,
        guardianName || null,
        parentPhone || null,
        alternateContactNumber || null,
        parentEmail || null,
        occupation || null,
        addressLine1 || null,
        addressLine2 || null,
        city || null,
        state || null,
        postalCode || null,
        student.parentId
      ]
    );

    await saveStudentDocuments(connection, Number(id), req.files, req.auth?.userId);
  });

  res.json({ success: true, message: "Student profile updated successfully." });
});

const getStudentProfile = asyncHandler(async (req, res) => {
  const bundle = await loadStudentBundle(req.params.id);
  res.json({
    success: true,
    data: {
      ...bundle.student,
      history: bundle.history,
      documents: bundle.documents,
      notes: bundle.notes,
      achievements: bundle.achievements,
      attendanceSummary: bundle.attendanceSummary,
      feeSummary: bundle.feeSummary,
      feeLedger: bundle.feeLedger,
      resultSummary: bundle.resultSummary
    }
  });
});

const getStudentDashboard = asyncHandler(async (req, res) => {
  const bundle = await loadStudentBundle(req.params.id);
  const latestNotice = await query(
    `
      SELECT title, body, published_at AS publishedAt
      FROM notices
      WHERE audience IN ('all', 'students', 'parents')
      ORDER BY published_at DESC, created_at DESC
      LIMIT 5
    `
  );

  res.json({
    success: true,
    data: {
      profile: bundle.student,
      idCardPreview: {
        downloadUrl: `/api/students/${req.params.id}/id-card`
      },
      attendance: bundle.attendanceSummary,
      fees: bundle.feeSummary,
      latestResult: bundle.resultSummary.latestResult,
      notices: latestNotice,
      performance: bundle.resultSummary.exams,
      achievements: bundle.achievements.slice(0, 5),
      timeline: [
        ...bundle.history.map((item) => ({
          type: "academic",
          title: `${item.academicYear} - ${item.className}`,
          description: item.remarks || "Academic year record stored in ERP"
        })),
        ...bundle.notes.slice(0, 5).map((item) => ({
          type: item.noteType,
          title: item.title,
          description: item.note
        }))
      ]
    }
  });
});

const uploadStudentDocuments = asyncHandler(async (req, res) => {
  const { id } = req.params;
  req.uploadFolder = "students";

  const created = await transaction(async (connection) => {
    const [studentRows] = await connection.execute(`SELECT id FROM students WHERE id = ? LIMIT 1`, [id]);
    if (!studentRows[0]) {
      throw new HttpError(404, "Student not found.");
    }

    return saveStudentDocuments(connection, Number(id), req.files, req.auth?.userId);
  });

  res.status(201).json({ success: true, message: "Documents uploaded successfully.", data: created });
});

const addStudentNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { noteType, title, note } = req.body;

  if (!title || !note) {
    throw new HttpError(400, "Title and note are required.");
  }

  const result = await query(
    `
      INSERT INTO student_notes (student_id, note_type, title, note, created_by)
      VALUES (:studentId, :noteType, :title, :note, :createdBy)
    `,
    {
      studentId: id,
      noteType: noteType || "general",
      title,
      note,
      createdBy: req.auth.userId
    }
  );

  res.status(201).json({ success: true, data: { id: result.insertId } });
});

const addStudentAchievement = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, achievedOn } = req.body;

  if (!title) {
    throw new HttpError(400, "Achievement title is required.");
  }

  const result = await query(
    `
      INSERT INTO student_achievements (student_id, title, description, achieved_on, created_by)
      VALUES (:studentId, :title, :description, :achievedOn, :createdBy)
    `,
    {
      studentId: id,
      title,
      description: description || null,
      achievedOn: achievedOn || null,
      createdBy: req.auth.userId
    }
  );

  res.status(201).json({ success: true, data: { id: result.insertId } });
});

const promoteStudents = asyncHandler(async (req, res) => {
  const { academicYearId, items } = req.body;

  if (!academicYearId || !Array.isArray(items) || !items.length) {
    throw new HttpError(400, "Academic year and promotion items are required.");
  }

  const promoted = await transaction(async (connection) => {
    const updates = [];

    for (const item of items) {
      if (!item.studentId || !item.nextClassId) {
        throw new HttpError(400, "Each promotion item must include studentId and nextClassId.");
      }

      const [currentRows] = await connection.execute(
        `
          SELECT id, current_class_id AS currentClassId, current_section_id AS currentSectionId, roll_no AS rollNo
          FROM students
          WHERE id = ?
          LIMIT 1
        `,
        [item.studentId]
      );

      const current = currentRows[0];
      if (!current) {
        throw new HttpError(404, `Student ${item.studentId} not found.`);
      }

      await connection.execute(
        `
          UPDATE student_histories
          SET promoted_to_class_id = ?
          WHERE student_id = ? AND academic_year_id = ?
        `,
        [item.nextClassId, item.studentId, academicYearId]
      );

      await connection.execute(
        `
          UPDATE students
          SET current_class_id = ?, current_section_id = ?, roll_no = COALESCE(?, roll_no)
          WHERE id = ?
        `,
        [item.nextClassId, item.nextSectionId || null, item.newRollNo || null, item.studentId]
      );

      await connection.execute(
        `
          INSERT INTO student_histories (student_id, academic_year_id, class_id, section_id, roll_no, remarks)
          VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
          item.studentId,
          academicYearId,
          item.nextClassId,
          item.nextSectionId || null,
          item.newRollNo || current.rollNo,
          item.remarks || "Promoted through ERP promotion workflow"
        ]
      );

      updates.push(item.studentId);
    }

    return updates;
  });

  res.json({
    success: true,
    message: "Students promoted successfully.",
    data: { promotedStudentIds: promoted }
  });
});

const downloadStudentIdCard = asyncHandler(async (req, res) => {
  const bundle = await loadStudentBundle(req.params.id);
  await writeStudentIdCardPdf(res, bundle);
});

module.exports = {
  listStudents,
  createStudent,
  updateStudent,
  getStudentProfile,
  getStudentDashboard,
  uploadStudentDocuments,
  addStudentNote,
  addStudentAchievement,
  promoteStudents,
  downloadStudentIdCard
};
