const express = require("express");
const { authenticate, authorize } = require("../middleware/auth");
const authController = require("../controllers/authController");
const publicController = require("../controllers/publicController");
const dashboardController = require("../controllers/dashboardController");
const studentsController = require("../controllers/studentsController");
const admissionsController = require("../controllers/admissionsController");
const feesController = require("../controllers/feesController");
const resultsController = require("../controllers/resultsController");
const attendanceController = require("../controllers/attendanceController");
const contentController = require("../controllers/contentController");
const studentMediaController = require("../controllers/studentMediaController");
const reportsController = require("../controllers/reportsController");
const communicationsController = require("../controllers/communicationsController");
const transportController = require("../controllers/transportController");
const { upload } = require("../services/uploadService");
const { runBackup } = require("../services/backupService");
const { runFeeReminderCycle } = require("../services/feeReminderService");
const { createRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();
const publicFormLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, keyPrefix: "public-forms" });

router.get("/health", publicController.health);
router.post("/auth/login", authController.login);
router.get("/auth/me", authenticate, authController.me);

router.post(
  "/public/admissions",
  (req, res, next) => {
    req.uploadFolder = "admissions";
    next();
  },
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "photoCamera", maxCount: 1 },
    { name: "documents", maxCount: 10 },
    { name: "documentCamera", maxCount: 10 },
    { name: "passportPhoto", maxCount: 1 },
    { name: "birthCertificate", maxCount: 1 },
    { name: "previousMarksheet", maxCount: 1 },
    { name: "transferCertificate", maxCount: 1 }
  ]),
  publicController.submitAdmission
);
router.post("/public/enquiries", publicFormLimiter, publicController.submitEnquiry);
router.get("/public/gallery", publicController.listGallery);
router.get("/public/notices", publicController.listNotices);
router.get("/public/results", publicController.resultLookup);

router.get("/dashboard/summary", authenticate, dashboardController.getDashboardSummary);
router.get("/dashboard/analytics", authenticate, dashboardController.getDashboardAnalytics);

router.get("/students", authenticate, authorize("super_admin", "admin_staff", "principal"), studentsController.listStudents);
router.post(
  "/students",
  authenticate,
  authorize("super_admin", "admin_staff"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhaarFile", maxCount: 1 },
    { name: "birthCertificateFile", maxCount: 1 },
    { name: "previousMarksheetFile", maxCount: 1 },
    { name: "passportPhotoFile", maxCount: 1 },
    { name: "transferCertificateFile", maxCount: 1 },
    { name: "documents", maxCount: 10 }
  ]),
  studentsController.createStudent
);
router.get("/students/:id", authenticate, authorize("super_admin", "admin_staff", "principal", "teacher", "parent", "student"), studentsController.getStudentProfile);
router.patch(
  "/students/:id",
  authenticate,
  authorize("super_admin", "admin_staff", "principal"),
  upload.fields([
    { name: "photo", maxCount: 1 },
    { name: "aadhaarFile", maxCount: 1 },
    { name: "birthCertificateFile", maxCount: 1 },
    { name: "previousMarksheetFile", maxCount: 1 },
    { name: "passportPhotoFile", maxCount: 1 },
    { name: "transferCertificateFile", maxCount: 1 },
    { name: "documents", maxCount: 10 }
  ]),
  studentsController.updateStudent
);
router.get("/students/:id/dashboard", authenticate, authorize("super_admin", "admin_staff", "principal", "teacher", "parent", "student"), studentsController.getStudentDashboard);
router.post(
  "/students/:id/documents",
  authenticate,
  authorize("super_admin", "admin_staff", "principal", "teacher"),
  upload.fields([
    { name: "aadhaarFile", maxCount: 1 },
    { name: "birthCertificateFile", maxCount: 1 },
    { name: "previousMarksheetFile", maxCount: 1 },
    { name: "passportPhotoFile", maxCount: 1 },
    { name: "transferCertificateFile", maxCount: 1 },
    { name: "documents", maxCount: 10 }
  ]),
  studentsController.uploadStudentDocuments
);
router.post("/students/:id/notes", authenticate, authorize("super_admin", "admin_staff", "principal", "teacher"), studentsController.addStudentNote);
router.post("/students/:id/achievements", authenticate, authorize("super_admin", "admin_staff", "principal", "teacher"), studentsController.addStudentAchievement);
router.post("/students/promotions", authenticate, authorize("super_admin", "admin_staff", "principal"), studentsController.promoteStudents);
router.get("/students/:id/id-card", authenticate, authorize("super_admin", "admin_staff", "principal", "teacher", "parent", "student"), studentsController.downloadStudentIdCard);
router.get("/student-media/search", authenticate, authorize("super_admin", "admin_staff", "principal", "teacher", "parent", "student"), studentMediaController.searchStudentMedia);
router.post(
  "/student-media",
  authenticate,
  authorize("super_admin", "admin_staff", "principal", "teacher"),
  (req, res, next) => {
    req.uploadFolder = "student-media";
    next();
  },
  upload.array("media", 20),
  studentMediaController.uploadStudentMedia
);

router.get("/admissions", authenticate, authorize("super_admin", "admin_staff", "principal"), admissionsController.listAdmissions);
router.patch("/admissions/:id/review", authenticate, authorize("super_admin", "admin_staff", "principal"), admissionsController.reviewAdmission);

router.get("/fees/ledger", authenticate, authorize("super_admin", "admin_staff", "accountant", "principal"), feesController.listFeeLedger);
router.get("/fees/student/:studentId", authenticate, authorize("super_admin", "admin_staff", "accountant", "principal", "parent", "student"), feesController.getStudentFeeLedger);
router.post("/fees/assignments", authenticate, authorize("super_admin", "admin_staff", "accountant"), feesController.assignFeeStructure);
router.post("/fees/payments", authenticate, authorize("super_admin", "admin_staff", "accountant"), feesController.createFeePayment);
router.post("/fees/reminders/run", authenticate, authorize("super_admin", "admin_staff", "accountant", "principal"), async (req, res, next) => {
  try {
    const result = await runFeeReminderCycle();
    res.json({ success: true, message: "Fee reminders processed.", data: result });
  } catch (error) {
    next(error);
  }
});

router.get("/transport/routes", authenticate, authorize("super_admin", "admin_staff", "principal", "driver"), transportController.listRoutes);
router.post("/transport/drivers", authenticate, authorize("super_admin", "admin_staff", "principal"), transportController.createDriver);
router.post("/transport/routes", authenticate, authorize("super_admin", "admin_staff", "principal"), transportController.createRoute);
router.post("/transport/assignments", authenticate, authorize("super_admin", "admin_staff", "principal"), transportController.assignStudentTransport);
router.get("/transport/drivers/:driverId/pickups", authenticate, authorize("super_admin", "admin_staff", "principal", "driver"), transportController.driverPickupList);
router.post("/transport/pickups", authenticate, authorize("super_admin", "admin_staff", "principal", "driver"), transportController.markPickup);
router.get("/transport/collections", authenticate, authorize("super_admin", "admin_staff", "accountant", "principal"), transportController.collectionReport);

router.post("/results/exams", authenticate, authorize("super_admin", "principal", "teacher"), resultsController.publishExam);
router.post("/results/upload", authenticate, authorize("super_admin", "principal", "teacher"), resultsController.uploadResults);
router.get("/results/student/:studentId", authenticate, authorize("super_admin", "principal", "teacher", "parent", "student"), resultsController.studentResults);
router.get("/results/student/:studentId/summary", authenticate, authorize("super_admin", "principal", "teacher", "parent", "student"), resultsController.studentResultSummary);
router.post("/results/publish-notice", authenticate, authorize("super_admin", "principal"), resultsController.publishResultsNotice);

router.post("/attendance/mark", authenticate, authorize("super_admin", "principal", "teacher"), attendanceController.markAttendance);
router.get("/attendance/student/:studentId", authenticate, authorize("super_admin", "principal", "teacher", "parent", "student"), attendanceController.getAttendanceReport);

router.post("/content/homework", authenticate, authorize("super_admin", "principal", "teacher"), upload.single("attachment"), contentController.createHomework);
router.get("/content/homework", authenticate, contentController.listHomework);
router.post("/content/notices", authenticate, authorize("super_admin", "admin_staff", "principal"), contentController.createNotice);
router.post("/content/gallery", authenticate, authorize("super_admin", "admin_staff", "principal"), upload.single("image"), contentController.createGalleryItem);

router.post("/communications/broadcast", authenticate, authorize("super_admin", "admin_staff", "principal"), communicationsController.broadcastMessage);
router.get("/communications/campaigns", authenticate, authorize("super_admin", "admin_staff", "principal"), communicationsController.listCampaigns);

router.get("/reports/fees-pending", authenticate, authorize("super_admin", "admin_staff", "accountant", "principal"), reportsController.feePendingReport);
router.get("/reports/daily-collection", authenticate, authorize("super_admin", "admin_staff", "accountant", "principal"), reportsController.dailyCollectionReport);
router.get("/reports/attendance", authenticate, authorize("super_admin", "principal", "teacher"), reportsController.attendanceReport);
router.get("/reports/exam-performance", authenticate, authorize("super_admin", "principal", "teacher"), reportsController.examPerformanceReport);
router.get("/reports/admissions", authenticate, authorize("super_admin", "admin_staff", "principal"), reportsController.admissionReport);

router.post("/system/backup", authenticate, authorize("super_admin"), async (req, res, next) => {
  try {
    const result = await runBackup();
    res.json({ success: true, message: "Backup created successfully.", data: result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
