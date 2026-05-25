const roleModules = {
  super_admin: ["dashboard", "students", "admissions", "fees", "transport", "results", "attendance", "content", "communications", "reports", "settings"],
  admin_staff: ["dashboard", "students", "admissions", "fees", "transport", "content", "communications", "reports"],
  principal: ["dashboard", "students", "transport", "results", "attendance", "content", "communications", "reports"],
  teacher: ["dashboard", "results", "attendance", "homework", "notices"],
  accountant: ["dashboard", "fees", "transport", "reports"],
  driver: ["dashboard", "transport"],
  parent: ["dashboard", "attendance", "results", "fees", "homework", "notices"],
  student: ["dashboard", "attendance", "results", "homework", "notices"]
};

function getModulesForRoles(roles) {
  return [...new Set(roles.flatMap((role) => roleModules[role] || []))];
}

module.exports = {
  getModulesForRoles
};
