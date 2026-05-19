const roleModules = {
  super_admin: ["dashboard", "students", "admissions", "fees", "results", "attendance", "content", "communications", "reports", "settings"],
  admin_staff: ["dashboard", "students", "admissions", "fees", "content", "communications", "reports"],
  principal: ["dashboard", "students", "results", "attendance", "content", "communications", "reports"],
  teacher: ["dashboard", "results", "attendance", "homework", "notices"],
  accountant: ["dashboard", "fees", "reports"],
  parent: ["dashboard", "attendance", "results", "fees", "homework", "notices"],
  student: ["dashboard", "attendance", "results", "homework", "notices"]
};

function getModulesForRoles(roles) {
  return [...new Set(roles.flatMap((role) => roleModules[role] || []))];
}

module.exports = {
  getModulesForRoles
};
