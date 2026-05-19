const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sendSms } = require("../services/notificationService");

const publishExam = asyncHandler(async (req, res) => {
  const { academicYearId, classId, title, startsOn, endsOn } = req.body;
  if (!academicYearId || !classId || !title) {
    throw new HttpError(400, "Academic year, class, and exam title are required.");
  }

  const rows = await query(
    `
      INSERT INTO exams (academic_year_id, class_id, title, starts_on, ends_on, created_by)
      VALUES (:academicYearId, :classId, :title, :startsOn, :endsOn, :createdBy)
    `,
    {
      academicYearId,
      classId,
      title,
      startsOn: startsOn || null,
      endsOn: endsOn || null,
      createdBy: req.auth.userId
    }
  );

  res.status(201).json({ success: true, data: { examId: rows.insertId } });
});

const uploadResults = asyncHandler(async (req, res) => {
  const { examId, rows } = req.body;
  if (!examId || !Array.isArray(rows) || !rows.length) {
    throw new HttpError(400, "Exam ID and result rows are required.");
  }

  await transaction(async (connection) => {
    for (const row of rows) {
      await connection.execute(
        `
          INSERT INTO exam_results (exam_id, student_id, subject_id, marks_obtained, percentage, grade, remarks, entered_by)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          examId,
          row.studentId,
          row.subjectId,
          row.marksObtained,
          row.percentage || null,
          row.grade || null,
          row.remarks || null,
          req.auth.userId
        ]
      );
    }
  });

  res.status(201).json({ success: true, message: "Results uploaded successfully." });
});

const studentResults = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const rows = await query(
    `
      SELECT
        e.id AS examId,
        e.title AS examName,
        ay.title AS academicYear,
        sub.name AS subjectName,
        sub.max_marks AS maxMarks,
        er.marks_obtained AS marksObtained,
        er.percentage,
        er.grade,
        er.remarks
      FROM exam_results er
      JOIN exams e ON e.id = er.exam_id
      JOIN academic_years ay ON ay.id = e.academic_year_id
      JOIN subjects sub ON sub.id = er.subject_id
      WHERE er.student_id = :studentId
      ORDER BY ay.starts_on DESC, e.id DESC, sub.name ASC
    `,
    { studentId }
  );

  res.json({ success: true, data: rows });
});

const studentResultSummary = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const exams = await query(
    `
      SELECT
        e.id AS examId,
        e.title AS examName,
        ay.title AS academicYear,
        ROUND(AVG(er.marks_obtained), 2) AS averageMarks,
        ROUND(AVG(er.percentage), 2) AS averagePercentage,
        MAX(er.grade) AS grade
      FROM exam_results er
      JOIN exams e ON e.id = er.exam_id
      JOIN academic_years ay ON ay.id = e.academic_year_id
      WHERE er.student_id = :studentId
      GROUP BY e.id, e.title, ay.title, ay.starts_on
      ORDER BY ay.starts_on DESC, e.id DESC
    `,
    { studentId }
  );

  const subjects = await query(
    `
      SELECT
        e.title AS examName,
        sub.name AS subjectName,
        sub.max_marks AS maxMarks,
        er.marks_obtained AS marksObtained,
        er.percentage,
        er.grade,
        er.remarks
      FROM exam_results er
      JOIN exams e ON e.id = er.exam_id
      JOIN subjects sub ON sub.id = er.subject_id
      WHERE er.student_id = :studentId
      ORDER BY e.id DESC, sub.name ASC
    `,
    { studentId }
  );

  res.json({
    success: true,
    data: {
      latestResult: exams[0] || null,
      growthChart: exams.map((item) => ({
        label: `${item.academicYear} - ${item.examName}`,
        percentage: Number(item.averagePercentage || 0)
      })),
      exams,
      subjects
    }
  });
});

const publishResultsNotice = asyncHandler(async (req, res) => {
  const { classId } = req.body;

  const recipients = await query(
    `
      SELECT p.phone_primary AS phone
      FROM students s
      JOIN parents p ON p.id = s.parent_id
      WHERE s.current_class_id = :classId
    `,
    { classId }
  );

  await Promise.all(
    recipients.map((recipient) =>
      sendSms({
        phone: recipient.phone,
        message: "Results have been published for your child. Please login to the BSB ERP portal to view marks."
      })
    )
  );

  res.json({ success: true, message: "Result publication notifications triggered." });
});

module.exports = {
  publishExam,
  uploadResults,
  studentResults,
  studentResultSummary,
  publishResultsNotice
};
