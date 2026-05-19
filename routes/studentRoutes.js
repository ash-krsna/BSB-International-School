const express = require("express");
const Student = require("../models/Student");
const Result = require("../models/Result");
const { protectStudent } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard/me", protectStudent, async (req, res) => {
  try {
    const results = await Result.find({ student: req.student._id }).sort({ createdAt: -1 });

    const growthHistory = results
      .slice()
      .reverse()
      .map((result) => ({
        label: `${result.academicYear} - ${result.examName}`,
        percentage: result.percentage,
        growthScore: result.growthScore
      }));

    return res.json({
      success: true,
      student: req.student,
      results,
      growthHistory
    });
  } catch (error) {
    console.error("Student dashboard error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load student dashboard." });
  }
});

router.get("/:roll", async (req, res) => {
  try {
    const { roll } = req.params;
    const { dob } = req.query;

    if (!dob) {
      return res.status(400).json({ success: false, message: "Date of birth is required for result search." });
    }

    const student = await Student.findOne({ rollNumber: roll });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const providedDob = new Date(dob);
    const studentDob = new Date(student.dob);

    if (
      Number.isNaN(providedDob.getTime()) ||
      providedDob.toISOString().slice(0, 10) !== studentDob.toISOString().slice(0, 10)
    ) {
      return res.status(401).json({ success: false, message: "Roll number and date of birth do not match." });
    }

    const latestResult = await Result.findOne({ student: student._id }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: {
        studentName: student.name,
        className: student.className,
        latestResultSummary: latestResult
          ? {
              examName: latestResult.examName,
              academicYear: latestResult.academicYear,
              summary: latestResult.summary,
              percentage: latestResult.percentage,
              grade: latestResult.grade
            }
          : null
      }
    });
  } catch (error) {
    console.error("Public result lookup error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to fetch public result." });
  }
});

module.exports = router;
