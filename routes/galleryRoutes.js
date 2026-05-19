const express = require("express");
const Gallery = require("../models/Gallery");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const galleryItems = await Gallery.find(filter).sort({ createdAt: -1 });
    return res.json({ success: true, data: galleryItems });
  } catch (error) {
    console.error("Gallery fetch error:", error.message);
    return res.status(500).json({ success: false, message: "Unable to load gallery." });
  }
});

module.exports = router;
