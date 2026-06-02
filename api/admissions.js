function getStore() {
  if (!globalThis.__bsbAdmissionStore) {
    globalThis.__bsbAdmissionStore = [];
  }
  return globalThis.__bsbAdmissionStore;
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

  const store = getStore();

  if (req.method === "GET") {
    res.status(200).json({ success: true, data: store });
    return;
  }

  if (req.method === "POST") {
    const now = new Date();
    const body = req.body || {};
    const id = store.length + 1;
    const className = body.applyingClassName || "Class 1";
    const classNumber = String(className).replace(/\D/g, "") || "1";
    const assignedStudentId = `BSB-${now.getFullYear()}-C${classNumber}-${String(id).padStart(4, "0")}`;
    const totalFee = Number(body.totalFee || 0);
    const paidFee = Number(body.paidFee || 0);

    const item = {
      id,
      admissionCode: `BSB-ADM-${now.getFullYear()}-${String(id).padStart(4, "0")}`,
      assignedStudentId,
      studentFullName: [body.studentFirstName, body.studentMiddleName, body.studentLastName].filter(Boolean).join(" "),
      className,
      motherName: body.motherName || "",
      parentPhone: body.parentPhone || "",
      documents: "Pending upload sync",
      totalFee,
      paidFee,
      remainingFee: Math.max(totalFee - paidFee, 0),
      status: "approved",
      createdAt: now.toISOString()
    };

    store.unshift(item);

    res.status(201).json({
      success: true,
      message: "Official admission saved.",
      admissionId: id,
      admissionCode: item.admissionCode,
      studentId: assignedStudentId
    });
    return;
  }

  res.setHeader("Allow", "GET,POST");
  res.status(405).json({ success: false, message: "Method not allowed." });
};
