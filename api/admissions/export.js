function getStore() {
  return globalThis.__bsbAdmissionStore || [];
}

function requireAdmin(req, res) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (token !== "vercel-admin-session") {
    res.status(401).json({ success: false, message: "Please login again." });
    return false;
  }
  return true;
}

module.exports = function handler(req, res) {
  if (!requireAdmin(req, res)) {
    return;
  }

  const headers = ["Student ID", "Name", "Class", "Mother", "Contact", "Total Fee", "Paid", "Remaining", "Status"];
  const lines = [
    headers.join(","),
    ...getStore().map((item) => [
      item.assignedStudentId,
      item.studentFullName,
      item.className,
      item.motherName,
      item.parentPhone,
      item.totalFee,
      item.paidFee,
      item.remainingFee,
      item.status
    ].map((value) => JSON.stringify(value || "")).join(","))
  ];

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="bsb-admission-register.csv"');
  res.status(200).send(lines.join("\n"));
};
