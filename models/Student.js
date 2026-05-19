const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    className: { type: String, required: true, trim: true },
    section: { type: String, trim: true },
    parentName: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    attendancePercentage: { type: Number, default: 0 },
    growthNote: { type: String, default: "" },
    teacherRemarks: { type: String, default: "" },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
