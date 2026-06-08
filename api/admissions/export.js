const { requireAdmin } = require("../_shared/adminAuth");

module.exports = function handler(req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  res.status(503).json({
    success: false,
    message: "Admission Excel export requires the deployed backend API connected to MySQL. Set VITE_API_BASE_URL to the backend API URL."
  });
};
