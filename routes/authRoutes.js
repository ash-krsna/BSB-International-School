const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const AdminUser = require("../models/AdminUser");

const router = express.Router();

function signToken(id, role) {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/login", async (req, res) => {
  try {
    const { rollNumber, password } = req.body;

    if (!rollNumber || !password) {
      return res.status(400).json({ success: false, message: "Roll number and password are required." });
    }

    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(401).json({ success: false, message: "Invalid student credentials." });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid student credentials." });
    }

    return res.json({
      success: true,
      message: "Student login successful.",
      token: signToken(student._id, "student"),
      student: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        className: student.className
      }
    });
  } catch (error) {
    console.error("Student login error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to login student." });
  }
});

router.post("/admin/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({ success: false, message: "Username/email and password are required." });
    }

    const admin = await AdminUser.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail.toLowerCase() }]
    });

    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials." });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials." });
    }

    return res.json({
      success: true,
      message: "Admin login successful.",
      token: signToken(admin._id, "admin"),
      admin: {
        id: admin._id,
        name: admin.name,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error("Admin login error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to login admin." });
  }
});

module.exports = router;
