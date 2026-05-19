const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    caption: { type: String, default: "", trim: true },
    category: {
      type: String,
      enum: ["Events", "Activities", "Classroom", "Achievements"],
      required: true
    },
    weekLabel: { type: String, default: "", trim: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AdminUser" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);
