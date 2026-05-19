const express = require("express");
const Admission = require("../models/Admission");
const { sendWhatsAppMessage } = require("../services/whatsappService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      studentName,
      parentName,
      phoneNumber,
      email,
      classApplyingFor,
      address
    } = req.body;

    if (!studentName || !parentName || !phoneNumber || !email || !classApplyingFor || !address) {
      return res.status(400).json({ success: false, message: "Please complete all admission fields." });
    }

    const admission = await Admission.create({
      studentName,
      parentName,
      phoneNumber,
      email,
      classApplyingFor,
      address
    });

    try {
      await sendWhatsAppMessage(
        [
          "New Admission Form:",
          `Name: ${studentName}`,
          `Parent: ${parentName}`,
          `Phone: ${phoneNumber}`,
          `Class: ${classApplyingFor}`
        ].join("\n")
      );
    } catch (notificationError) {
      console.error("Admission WhatsApp notification failed:", notificationError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Admission form submitted successfully.",
      data: admission
    });
  } catch (error) {
    console.error("Admission route error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to submit admission form." });
  }
});

module.exports = router;
