const mongoose = require("mongoose");

const admissionSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    parentName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    classApplyingFor: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admission", admissionSchema);
