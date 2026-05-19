const express = require("express");
const Enquiry = require("../models/Enquiry");
const { sendWhatsAppMessage } = require("../services/whatsappService");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { name, phoneNumber, message } = req.body;

    if (!name || !phoneNumber || !message) {
      return res.status(400).json({ success: false, message: "Please complete all enquiry fields." });
    }

    const enquiry = await Enquiry.create({ name, phoneNumber, message });

    try {
      await sendWhatsAppMessage(
        [
          "New Enquiry Form:",
          `Name: ${name}`,
          `Phone: ${phoneNumber}`,
          `Message: ${message}`
        ].join("\n")
      );
    } catch (notificationError) {
      console.error("Enquiry WhatsApp notification failed:", notificationError.message);
    }

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      data: enquiry
    });
  } catch (error) {
    console.error("Enquiry route error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to submit enquiry." });
  }
});

module.exports = router;
