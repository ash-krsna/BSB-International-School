const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const markAttendance = asyncHandler(async (req, res) => {
  const { academicYearId, classId, sectionId, attendanceDate, records } = req.body;

  if (!academicYearId || !classId || !sectionId || !attendanceDate || !Array.isArray(records)) {
    throw new HttpError(400, "Attendance session and records are required.");
  }

  const sessionId = await transaction(async (connection) => {
    const [sessionResult] = await connection.execute(
      `
        INSERT INTO attendance_sessions (academic_year_id, class_id, section_id, attendance_date, taken_by)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE taken_by = VALUES(taken_by)
      `,
      [academicYearId, classId, sectionId, attendanceDate, req.auth.userId]
    );

    const sessionRows = await connection.execute(
      `SELECT id FROM attendance_sessions WHERE class_id = ? AND section_id = ? AND attendance_date = ? LIMIT 1`,
      [classId, sectionId, attendanceDate]
    );
    const sessionIdLocal = sessionRows[0][0].id;

    await connection.execute(`DELETE FROM attendance_records WHERE session_id = ?`, [sessionIdLocal]);

    for (const record of records) {
      await connection.execute(
        `
          INSERT INTO attendance_records (session_id, student_id, status, remark)
          VALUES (?, ?, ?, ?)
        `,
        [sessionIdLocal, record.studentId, record.status, record.remark || null]
      );
    }

    return sessionIdLocal;
  });

  res.json({ success: true, message: "Attendance saved successfully.", sessionId });
});

const getAttendanceReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;

  const rows = await query(
    `
      SELECT att.attendance_date AS attendanceDate, ar.status, ar.remark
      FROM attendance_records ar
      JOIN attendance_sessions att ON att.id = ar.session_id
      WHERE ar.student_id = :studentId
      ORDER BY att.attendance_date DESC
    `,
    { studentId }
  );

  res.json({ success: true, data: rows });
});

module.exports = {
  markAttendance,
  getAttendanceReport
};
