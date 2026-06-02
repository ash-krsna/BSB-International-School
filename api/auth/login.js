const ADMIN_IDENTIFIER = "Akash_";
const ADMIN_PASSWORD = "akashBhagwat";

module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ success: false, message: "Method not allowed." });
    return;
  }

  const { identifier, password } = req.body || {};
  if (identifier !== ADMIN_IDENTIFIER || password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, message: "Invalid login credentials." });
    return;
  }

  res.status(200).json({
    success: true,
    token: "vercel-admin-session",
    user: {
      id: 1,
      fullName: "Akash Bhagwat",
      email: null,
      phone: null,
      username: ADMIN_IDENTIFIER,
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
