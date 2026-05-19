const { query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");

const getDashboardSummary = asyncHandler(async (req, res) => {
  const [students, pendingFees, collections, admissions] = await Promise.all([
    query("SELECT COUNT(*) AS total FROM students WHERE status = 'active'"),
    query(
      `
        SELECT COALESCE(SUM(fi.amount), 0) - COALESCE(SUM(fp.amount_paid), 0) AS pendingAmount
        FROM fee_installments fi
        LEFT JOIN fee_payments fp ON fp.installment_id = fi.id
      `
    ),
    query(
      `
        SELECT COALESCE(SUM(amount_paid), 0) AS todayCollection
        FROM fee_payments
        WHERE DATE(payment_date) = CURDATE()
      `
    ),
    query(
      `
        SELECT COUNT(*) AS openAdmissions
        FROM admission_applications
        WHERE status IN ('submitted', 'under_review')
      `
    )
  ]);

  res.json({
    success: true,
    summary: {
      activeStudents: students[0]?.total || 0,
      pendingFees: Number(pendingFees[0]?.pendingAmount || 0),
      todayCollection: Number(collections[0]?.todayCollection || 0),
      openAdmissions: admissions[0]?.openAdmissions || 0
    }
  });
});

const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const [classStrength, weeklyCollections, attendanceTrend, examPerformance, admissionBreakdown] = await Promise.all([
    query(
      `
        SELECT c.name AS className, COUNT(s.id) AS totalStudents
        FROM classes c
        LEFT JOIN students s ON s.current_class_id = c.id AND s.status = 'active'
        GROUP BY c.id, c.name
        ORDER BY c.display_order ASC, c.name ASC
      `
    ),
    query(
      `
        SELECT DATE(payment_date) AS label, SUM(amount_paid) AS amount
        FROM fee_payments
        WHERE payment_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(payment_date)
        ORDER BY DATE(payment_date) ASC
      `
    ),
    query(
      `
        SELECT
          DATE(att.attendance_date) AS label,
          ROUND(SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*), 0), 2) AS attendancePercentage
        FROM attendance_records ar
        JOIN attendance_sessions att ON att.id = ar.session_id
        WHERE att.attendance_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        GROUP BY DATE(att.attendance_date)
        ORDER BY DATE(att.attendance_date) ASC
      `
    ),
    query(
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
        LIMIT 8
      `
    ),
    query(
      `
        SELECT status, COUNT(*) AS total
        FROM admission_applications
        GROUP BY status
      `
    )
  ]);

  res.json({
    success: true,
    data: {
      classStrength,
      weeklyCollections,
      attendanceTrend,
      examPerformance,
      admissionBreakdown
    }
  });
});

module.exports = {
  getDashboardSummary,
  getDashboardAnalytics
};
