const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const AdminUser = require("../models/AdminUser");

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
}

async function protectStudent(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Student token is missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decoded.id).select("-password");

    if (!student || decoded.role !== "student") {
      return res.status(401).json({ success: false, message: "Invalid student token." });
    }

    req.student = student;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Student authorization failed." });
  }
}

async function protectAdmin(req, res, next) {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({ success: false, message: "Admin token is missing." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await AdminUser.findById(decoded.id).select("-password");

    if (!admin || decoded.role !== "admin") {
      return res.status(401).json({ success: false, message: "Invalid admin token." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Admin authorization failed." });
  }
}

module.exports = {
  protectStudent,
  protectAdmin
};
