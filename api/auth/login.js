const { getFallbackConfig } = require("../_shared/adminAuth");

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ success: false, message: "Method not allowed." });
    return;
  }

  const { identifier, password } = req.body || {};
  const config = getFallbackConfig();

  if (!config.enabled) {
    res.status(503).json({
      success: false,
      message: "Backend API is not connected. Set VITE_API_BASE_URL to the deployed backend API. For temporary demos only, configure VERCEL_FALLBACK_ADMIN_IDENTIFIER, VERCEL_FALLBACK_ADMIN_PASSWORD, and VERCEL_FALLBACK_SESSION_TOKEN in Vercel."
    });
    return;
  }

  if (identifier !== config.identifier || password !== config.password) {
    res.status(401).json({ success: false, message: "Invalid login credentials." });
    return;
  }

  res.status(200).json({
    success: true,
    token: config.token,
    user: {
      id: 1,
      fullName: "Akash Bhagwat",
      email: null,
      phone: null,
      username: config.identifier,
      roles: ["super_admin"],
      modules: [
        "Admissions",
        "Admission Register",
        "Fees",
        "Student Records",
        "Reports",
        "Teacher Portal",
        "Student Portal"
      ]
    }
  });
};
