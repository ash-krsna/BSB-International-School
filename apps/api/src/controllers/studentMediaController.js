const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { toPublicFileUrl } = require("../services/uploadService");

const staffRoles = new Set(["super_admin", "admin_staff", "principal", "teacher"]);
const allowedMimePrefixes = ["image/", "video/"];

function parseStudentCodes(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map(String).map((item) => item.trim()).filter(Boolean);
    }
  } catch {
    // Fall through to comma-separated parsing.
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function getMediaType(file) {
  if (file.mimetype.startsWith("image/")) {
    return "image";
  }

  if (file.mimetype.startsWith("video/")) {
    return "video";
  }

  return null;
}

function isStaff(auth) {
  return (auth?.roles || []).some((role) => staffRoles.has(role));
}

async function loadStudentByPublicId(studentCode) {
  const rows = await query(
    `
      SELECT
        s.id,
        s.student_id AS studentId,
        CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS fullName,
        c.name AS className,
        s.user_id AS studentUserId,
        p.user_id AS parentUserId
      FROM students s
      LEFT JOIN classes c ON c.id = s.current_class_id
      LEFT JOIN parents p ON p.id = s.parent_id
      WHERE s.student_id = :studentCode OR s.admission_no = :studentCode OR s.roll_no = :studentCode
      LIMIT 1
    `,
    { studentCode }
  );

  return rows[0] || null;
}

function assertCanViewStudentMedia(auth, student) {
  if (isStaff(auth)) {
    return;
  }

  const userId = Number(auth?.userId);
  if (Number(student.studentUserId) === userId || Number(student.parentUserId) === userId) {
    return;
  }

  throw new HttpError(403, "You can only view media linked to your own student record.");
}

const uploadStudentMedia = asyncHandler(async (req, res) => {
  const studentCodes = parseStudentCodes(req.body.studentIds || req.body.studentId);
  const files = req.files || [];

  if (!studentCodes.length) {
    throw new HttpError(400, "At least one Student ID is required for tagging media.");
  }

  if (!files.length) {
    throw new HttpError(400, "Upload at least one image or video.");
  }

  for (const file of files) {
    if (!allowedMimePrefixes.some((prefix) => file.mimetype.startsWith(prefix))) {
      throw new HttpError(400, "Only image and video files can be added to student media.");
    }
  }

  const created = await transaction(async (connection) => {
    const [students] = await connection.execute(
      `
        SELECT id, student_id AS studentId
        FROM students
        WHERE student_id IN (${studentCodes.map(() => "?").join(",")})
      `,
      studentCodes
    );

    const foundCodes = new Set(students.map((student) => student.studentId));
    const missingCodes = studentCodes.filter((code) => !foundCodes.has(code));
    if (missingCodes.length) {
      throw new HttpError(404, `Student ID not found: ${missingCodes.join(", ")}`);
    }

    const uploaded = [];

    for (const file of files) {
      const mediaType = getMediaType(file);
      const fileUrl = toPublicFileUrl(file);
      const [assetResult] = await connection.execute(
        `
          INSERT INTO student_media_assets
            (title, description, category, media_type, file_name, file_url, mime_type, uploaded_by, captured_on)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          req.body.title || file.originalname,
          req.body.description || null,
          req.body.category || "Student Life",
          mediaType,
          file.originalname,
          fileUrl,
          file.mimetype,
          req.auth.userId,
          req.body.capturedOn || null
        ]
      );

      for (const student of students) {
        await connection.execute(
          `
            INSERT IGNORE INTO student_media_links (media_id, student_id, tagged_by)
            VALUES (?, ?, ?)
          `,
          [assetResult.insertId, student.id, req.auth.userId]
        );
      }

      uploaded.push({
        id: assetResult.insertId,
        title: req.body.title || file.originalname,
        mediaType,
        fileUrl,
        taggedStudentIds: students.map((student) => student.studentId)
      });
    }

    return uploaded;
  });

  res.status(201).json({
    success: true,
    message: "Student media uploaded and tagged successfully.",
    data: created
  });
});

const searchStudentMedia = asyncHandler(async (req, res) => {
  const studentCode = req.query.studentId || req.params.studentId;
  if (!studentCode) {
    throw new HttpError(400, "Student ID is required.");
  }

  const student = await loadStudentByPublicId(studentCode);
  if (!student) {
    throw new HttpError(404, "Student not found.");
  }

  assertCanViewStudentMedia(req.auth, student);

  const media = await query(
    `
      SELECT
        sma.id,
        sma.title,
        sma.description,
        sma.category,
        sma.media_type AS mediaType,
        sma.file_url AS fileUrl,
        sma.mime_type AS mimeType,
        sma.captured_on AS capturedOn,
        sma.created_at AS uploadedAt
      FROM student_media_links sml
      JOIN student_media_assets sma ON sma.id = sml.media_id
      WHERE sml.student_id = :studentId
      ORDER BY COALESCE(sma.captured_on, DATE(sma.created_at)) DESC, sma.created_at DESC
    `,
    { studentId: student.id }
  );

  res.json({
    success: true,
    data: {
      student: {
        studentId: student.studentId,
        fullName: student.fullName,
        className: student.className
      },
      media
    }
  });
});

module.exports = {
  uploadStudentMedia,
  searchStudentMedia
};
