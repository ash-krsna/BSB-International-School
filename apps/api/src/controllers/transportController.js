const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sendSms, sendWhatsApp } = require("../services/notificationService");

const listRoutes = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        br.id,
        br.route_name AS routeName,
        br.route_code AS routeCode,
        br.monthly_fee AS monthlyFee,
        br.school_commission_per_student AS schoolCommissionPerStudent,
        br.status,
        bd.id AS driverId,
        bd.full_name AS driverName,
        bd.phone AS driverPhone,
        COUNT(sta.id) AS activeStudentCount
      FROM bus_routes br
      LEFT JOIN bus_drivers bd ON bd.id = br.driver_id
      LEFT JOIN student_transport_assignments sta ON sta.route_id = br.id AND sta.status = 'active'
      GROUP BY br.id, bd.id
      ORDER BY br.route_name ASC
    `
  );

  res.json({ success: true, data: rows });
});

const createDriver = asyncHandler(async (req, res) => {
  const { fullName, phone, licenseNo, vehicleNo, userId } = req.body;

  if (!fullName || !phone) {
    throw new HttpError(400, "Driver name and phone are required.");
  }

  const result = await query(
    `
      INSERT INTO bus_drivers (user_id, full_name, phone, license_no, vehicle_no)
      VALUES (:userId, :fullName, :phone, :licenseNo, :vehicleNo)
    `,
    {
      userId: userId || null,
      fullName,
      phone,
      licenseNo: licenseNo || null,
      vehicleNo: vehicleNo || null
    }
  );

  res.status(201).json({ success: true, data: { driverId: result.insertId } });
});

const createRoute = asyncHandler(async (req, res) => {
  const { routeName, routeCode, driverId, monthlyFee, schoolCommissionPerStudent } = req.body;

  if (!routeName || !routeCode) {
    throw new HttpError(400, "Route name and code are required.");
  }

  const result = await query(
    `
      INSERT INTO bus_routes (route_name, route_code, driver_id, monthly_fee, school_commission_per_student)
      VALUES (:routeName, :routeCode, :driverId, :monthlyFee, :schoolCommissionPerStudent)
    `,
    {
      routeName,
      routeCode,
      driverId: driverId || null,
      monthlyFee: monthlyFee || 0,
      schoolCommissionPerStudent: schoolCommissionPerStudent || 100
    }
  );

  res.status(201).json({ success: true, data: { routeId: result.insertId } });
});

const assignStudentTransport = asyncHandler(async (req, res) => {
  const { studentId, routeId, pickupAddress, pickupNote, startDate } = req.body;

  if (!studentId || !routeId || !pickupAddress || !startDate) {
    throw new HttpError(400, "Student, route, pickup address, and start date are required.");
  }

  const assignmentId = await transaction(async (connection) => {
    await connection.execute(
      `UPDATE student_transport_assignments SET status = 'stopped', end_date = CURDATE() WHERE student_id = ? AND status = 'active'`,
      [studentId]
    );

    const [result] = await connection.execute(
      `
        INSERT INTO student_transport_assignments (student_id, route_id, pickup_address, pickup_note, start_date)
        VALUES (?, ?, ?, ?, ?)
      `,
      [studentId, routeId, pickupAddress, pickupNote || null, startDate]
    );

    const [routeRows] = await connection.execute(
      `
        SELECT br.monthly_fee AS monthlyFee, br.school_commission_per_student AS commission, bd.id AS driverId
        FROM bus_routes br
        LEFT JOIN bus_drivers bd ON bd.id = br.driver_id
        WHERE br.id = ?
        LIMIT 1
      `,
      [routeId]
    );

    const route = routeRows[0];
    if (route?.monthlyFee) {
      const collectionMonth = startDate.slice(0, 7);
      await connection.execute(
        `
          INSERT INTO bus_payment_collections
            (assignment_id, collection_month, amount_collected, school_commission, collected_by_driver_id, payment_status)
          VALUES (?, ?, ?, ?, ?, 'pending')
        `,
        [result.insertId, collectionMonth, route.monthlyFee, route.commission || 100, route.driverId || null]
      );
    }

    return result.insertId;
  });

  const rows = await query(
    `
      SELECT
        CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS studentName,
        s.student_id AS studentCode,
        p.phone_primary AS parentPhone,
        bd.phone AS driverPhone,
        br.route_name AS routeName
      FROM student_transport_assignments sta
      JOIN students s ON s.id = sta.student_id
      JOIN parents p ON p.id = s.parent_id
      JOIN bus_routes br ON br.id = sta.route_id
      LEFT JOIN bus_drivers bd ON bd.id = br.driver_id
      WHERE sta.id = :assignmentId
      LIMIT 1
    `,
    { assignmentId }
  );
  const assignment = rows[0];

  if (assignment?.parentPhone) {
    await sendSms({
      phone: assignment.parentPhone,
      message: `BSB bus service assigned for ${assignment.studentName} on ${assignment.routeName}.`
    });
  }

  if (assignment?.driverPhone) {
    await sendWhatsApp({
      to: `whatsapp:+91${assignment.driverPhone.replace(/\D/g, "").slice(-10)}`,
      message: `New bus student assigned: ${assignment.studentName} (${assignment.studentCode}). Pickup: ${pickupAddress}`
    });
  }

  res.status(201).json({ success: true, data: { assignmentId } });
});

const driverPickupList = asyncHandler(async (req, res) => {
  const { driverId } = req.params;

  const rows = await query(
    `
      SELECT
        sta.id AS assignmentId,
        s.id AS studentId,
        s.student_id AS studentCode,
        CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS studentName,
        c.name AS className,
        p.phone_primary AS parentPhone,
        sta.pickup_address AS pickupAddress,
        sta.pickup_note AS pickupNote,
        br.route_name AS routeName,
        bpc.payment_status AS busPaymentStatus
      FROM student_transport_assignments sta
      JOIN students s ON s.id = sta.student_id
      LEFT JOIN classes c ON c.id = s.current_class_id
      JOIN parents p ON p.id = s.parent_id
      JOIN bus_routes br ON br.id = sta.route_id
      LEFT JOIN bus_payment_collections bpc
        ON bpc.assignment_id = sta.id AND bpc.collection_month = DATE_FORMAT(CURDATE(), '%Y-%m')
      WHERE br.driver_id = :driverId AND sta.status = 'active'
      ORDER BY br.route_name ASC, studentName ASC
    `,
    { driverId }
  );

  res.json({ success: true, data: rows });
});

const markPickup = asyncHandler(async (req, res) => {
  const { assignmentId, pickupDate, pickupStatus } = req.body;

  if (!assignmentId || !pickupDate || !pickupStatus) {
    throw new HttpError(400, "Assignment, date, and pickup status are required.");
  }

  await query(
    `
      INSERT INTO bus_pickup_logs (assignment_id, pickup_date, pickup_status, marked_by)
      VALUES (:assignmentId, :pickupDate, :pickupStatus, :markedBy)
      ON DUPLICATE KEY UPDATE pickup_status = VALUES(pickup_status), marked_by = VALUES(marked_by), marked_at = NOW()
    `,
    {
      assignmentId,
      pickupDate,
      pickupStatus,
      markedBy: req.auth.userId
    }
  );

  res.json({ success: true, message: "Pickup status saved." });
});

const collectionReport = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT
        br.route_name AS routeName,
        bd.full_name AS driverName,
        COUNT(DISTINCT sta.student_id) AS studentCount,
        COALESCE(SUM(bpc.amount_collected), 0) AS collectedAmount,
        COALESCE(SUM(bpc.school_commission), 0) AS schoolCommission,
        bpc.collection_month AS collectionMonth,
        bpc.payment_status AS paymentStatus
      FROM bus_routes br
      LEFT JOIN bus_drivers bd ON bd.id = br.driver_id
      LEFT JOIN student_transport_assignments sta ON sta.route_id = br.id AND sta.status = 'active'
      LEFT JOIN bus_payment_collections bpc ON bpc.assignment_id = sta.id
      GROUP BY br.id, bd.id, bpc.collection_month, bpc.payment_status
      ORDER BY bpc.collection_month DESC, br.route_name ASC
    `
  );

  res.json({ success: true, data: rows });
});

module.exports = {
  listRoutes,
  createDriver,
  createRoute,
  assignStudentTransport,
  driverPickupList,
  markPickup,
  collectionReport
};
