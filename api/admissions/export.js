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

  const headers = [
    "Admission Enquiry ID",
    "Student ID",
    "Class",
    "Student Full Name",
    "Mother Name",
    "Parent Contact",
    "Parent Email",
    "Address",
    "Total Fee",
    "Paid Fee",
    "Remaining Fee",
    "Fee Notes",
    "Status",
    "Student Photo Given",
    "Any Document Given",
    "Document Count",
    "Document Types"
  ];
  const lines = [
    headers.join(","),
    ...getStore().map((item) => [
      item.admissionCode,
      item.assignedStudentId,
      item.className,
      item.studentFullName,
      item.motherName,
      item.parentPhone,
      item.parentEmail,
      item.address,
      item.totalFee,
      item.paidFee,
      item.remainingFee,
      item.feeNotes,
      item.status,
      item.photoUrl ? "Yes" : "No",
      item.documentCount > 0 ? "Yes" : "No",
      item.documentCount || 0,
      item.documents || ""
    ].map((value) => JSON.stringify(value || "")).join(","))
  ];

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="bsb-combined-student-admission-register.csv"');
  res.status(200).send(lines.join("\n"));
};
