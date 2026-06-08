const { requireAdmin } = require("./_shared/adminAuth");

module.exports = function handler(req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  res.status(503).json({
    success: false,
    message: "Admission database is not connected on this Vercel fallback API. Set VITE_API_BASE_URL to the deployed backend API so every admission field saves in MySQL."
  });
};
