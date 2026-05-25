const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sendSms, sendWhatsApp } = require("../services/notificationService");

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

  const absentIds = records.filter((record) => record.status === "absent").map((record) => record.studentId);
  if (absentIds.length) {
    const absentRows = await query(
      `
        SELECT
          CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS studentName,
          p.phone_primary AS parentPhone
        FROM students s
        JOIN parents p ON p.id = s.parent_id
        WHERE s.id IN (${absentIds.map(() => "?").join(",")})
      `,
      absentIds
    );

    for (const item of absentRows) {
      const message = `BSB attendance alert: ${item.studentName} is marked absent on ${attendanceDate}. Contact school office if this is incorrect.`;
      await sendSms({ phone: item.parentPhone, message });
      await sendWhatsApp({ to: `whatsapp:+91${item.parentPhone.replace(/\D/g, "").slice(-10)}`, message });
    }
  }

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
