const mongoose = require("mongoose");

const marksSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    obtainedMarks: { type: Number, required: true },
    totalMarks: { type: Number, required: true }
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    academicYear: { type: String, required: true, trim: true },
    className: { type: String, required: true, trim: true },
    examName: { type: String, required: true, trim: true },
    summary: { type: String, required: true, trim: true },
    marks: { type: [marksSchema], default: [] },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: "" },
    attendancePercentage: { type: Number, default: 0 },
    growthScore: { type: Number, default: 0 },
    teacherRemarks: { type: String, default: "" },
    marksheetUrl: { type: String, default: "" },
    marksheetPublicId: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
