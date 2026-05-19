const express = require("express");
const bcrypt = require("bcryptjs");
const AdminUser = require("../models/AdminUser");
const Student = require("../models/Student");
const Result = require("../models/Result");
const Gallery = require("../models/Gallery");
const Admission = require("../models/Admission");
const Enquiry = require("../models/Enquiry");
const { protectAdmin } = require("../middleware/authMiddleware");
const { upload, uploadBufferToCloudinary } = require("../services/uploadService");

const router = express.Router();

router.post("/bootstrap", async (req, res) => {
  try {
    const { name, email, username, password, bootstrapSecret } = req.body;

    if (!name || !email || !username || !password || !bootstrapSecret) {
      return res.status(400).json({ success: false, message: "All bootstrap fields are required." });
    }

    if (bootstrapSecret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      return res.status(401).json({ success: false, message: "Invalid bootstrap secret." });
    }

    const existingAdmin = await AdminUser.findOne({
      $or: [{ email: email.toLowerCase() }, { username }]
    });

    if (existingAdmin) {
      return res.status(400).json({ success: false, message: "Admin user already exists with this email or username." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await AdminUser.create({
      name,
      email: email.toLowerCase(),
      username,
      password: hashedPassword
    });

    return res.status(201).json({
      success: true,
      message: "Admin user created successfully.",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        username: admin.username
      }
    });
  } catch (error) {
    console.error("Admin bootstrap error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to bootstrap admin." });
  }
});

router.get("/dashboard", protectAdmin, async (req, res) => {
  try {
    const [students, results, gallery, admissions, enquiries, totalResults, totalGallery] = await Promise.all([
      Student.find().select("-password").sort({ createdAt: -1 }),
      Result.find().populate("student", "name rollNumber className").sort({ createdAt: -1 }).limit(10),
      Gallery.find().sort({ createdAt: -1 }).limit(10),
      Admission.find().sort({ createdAt: -1 }),
      Enquiry.find().sort({ createdAt: -1 }),
      Result.countDocuments(),
      Gallery.countDocuments()
    ]);

    return res.json({
      success: true,
      stats: {
        students: students.length,
        results: totalResults,
        galleryItems: totalGallery,
        admissions: admissions.length,
        enquiries: enquiries.length
      },
      students,
      recentResults: results,
      recentGallery: gallery,
      admissions,
      enquiries
    });
  } catch (error) {
    console.error("Admin dashboard error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load admin dashboard." });
  }
});

router.get("/students", protectAdmin, async (req, res) => {
  try {
    const students = await Student.find().select("-password").sort({ createdAt: -1 });
    return res.json({ success: true, data: students });
  } catch (error) {
    console.error("Student list error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to fetch students." });
  }
});

router.post("/students", protectAdmin, async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      password,
      dob,
      className,
      section,
      parentName,
      phoneNumber,
      email,
      address,
      attendancePercentage,
      growthNote,
      teacherRemarks
    } = req.body;

    if (!name || !rollNumber || !password || !dob || !className) {
      return res.status(400).json({ success: false, message: "Name, roll number, password, DOB, and class are required." });
    }

    const existingStudent = await Student.findOne({ rollNumber });
    if (existingStudent) {
      return res.status(400).json({ success: false, message: "Roll number already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const student = await Student.create({
      name,
      rollNumber,
      password: hashedPassword,
      dob,
      className,
      section,
      parentName,
      phoneNumber,
      email,
      address,
      attendancePercentage: attendancePercentage || 0,
      growthNote,
      teacherRemarks
    });

    return res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber
      }
    });
  } catch (error) {
    console.error("Student create error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to create student." });
  }
});

router.put("/students/:id", protectAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    }).select("-password");

    return res.json({
      success: true,
      message: "Student updated successfully.",
      data: updatedStudent
    });
  } catch (error) {
    console.error("Student update error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to update student." });
  }
});

router.delete("/students/:id", protectAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found." });
    }

    await Result.deleteMany({ student: student._id });
    await Student.findByIdAndDelete(student._id);

    return res.json({ success: true, message: "Student and related results deleted successfully." });
  } catch (error) {
    console.error("Student delete error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to delete student." });
  }
});

router.post("/upload-result", protectAdmin, upload.single("marksheet"), async (req, res) => {
  try {
    const {
      rollNumber,
      academicYear,
      className,
      examName,
      summary,
      marksJson,
      percentage,
      grade,
      attendancePercentage,
      growthScore,
      teacherRemarks,
      marksheetUrl
    } = req.body;

    if (!rollNumber || !academicYear || !className || !examName || !summary) {
      return res.status(400).json({ success: false, message: "Please complete the required result fields." });
    }

    const student = await Student.findOne({ rollNumber });
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found for this roll number." });
    }

    let uploadedMarksheetUrl = marksheetUrl || "";
    let uploadedMarksheetPublicId = "";

    if (req.file) {
      const uploaded = await uploadBufferToCloudinary(req.file.buffer, "bsb-school/marksheets", "auto");
      uploadedMarksheetUrl = uploaded.secure_url;
      uploadedMarksheetPublicId = uploaded.public_id;
    }

    const marks = marksJson ? JSON.parse(marksJson) : [];

    const result = await Result.create({
      student: student._id,
      academicYear,
      className,
      examName,
      summary,
      marks,
      percentage: percentage || 0,
      grade,
      attendancePercentage: attendancePercentage || student.attendancePercentage || 0,
      growthScore: growthScore || 0,
      teacherRemarks,
      marksheetUrl: uploadedMarksheetUrl,
      marksheetPublicId: uploadedMarksheetPublicId
    });

    return res.status(201).json({
      success: true,
      message: "Result uploaded successfully.",
      data: result
    });
  } catch (error) {
    console.error("Result upload error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to upload result." });
  }
});

router.post("/upload-gallery", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    const { title, caption, category, weekLabel, imageUrl } = req.body;

    if (!title || !category) {
      return res.status(400).json({ success: false, message: "Title and category are required for gallery upload." });
    }

    let finalImageUrl = imageUrl || "";
    let publicId = "";

    if (req.file) {
      const uploadedImage = await uploadBufferToCloudinary(req.file.buffer, "bsb-school/gallery", "image");
      finalImageUrl = uploadedImage.secure_url;
      publicId = uploadedImage.public_id;
    }

    if (!finalImageUrl) {
      return res.status(400).json({ success: false, message: "Please provide an image file or image URL." });
    }

    const galleryItem = await Gallery.create({
      title,
      caption,
      category,
      weekLabel,
      imageUrl: finalImageUrl,
      imagePublicId: publicId,
      createdBy: req.admin._id
    });

    return res.status(201).json({
      success: true,
      message: "Gallery item uploaded successfully.",
      data: galleryItem
    });
  } catch (error) {
    console.error("Gallery upload error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to upload gallery item." });
  }
});

module.exports = router;
