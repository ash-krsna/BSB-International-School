const bcrypt = require("bcryptjs");
const { query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { signAccessToken } = require("../services/tokenService");
const { getModulesForRoles } = require("../utils/roles");

async function loadUserRoles(userId) {
  const roles = await query(
    `
      SELECT r.code
      FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = :userId
    `,
    { userId }
  );

  return roles.map((role) => role.code);
}

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new HttpError(400, "Identifier and password are required.");
  }

  const users = await query(
    `
      SELECT id, full_name, email, phone, username, password_hash, status
      FROM users
      WHERE email = :identifier OR phone = :identifier OR username = :identifier
      LIMIT 1
    `,
    { identifier }
  );

  const user = users[0];
  if (!user) {
    throw new HttpError(401, "Invalid login credentials.");
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new HttpError(401, "Invalid login credentials.");
  }

  const roles = await loadUserRoles(user.id);
  const modules = getModulesForRoles(roles);
  const token = signAccessToken({ userId: user.id, roles });

  await query("UPDATE users SET last_login_at = NOW() WHERE id = :id", { id: user.id });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      roles,
      modules
    }
  });
});

const me = asyncHandler(async (req, res) => {
  const users = await query(
    `
      SELECT id, full_name, email, phone, username, status
      FROM users
      WHERE id = :id
      LIMIT 1
    `,
    { id: req.auth.userId }
  );

  const user = users[0];
  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  const roles = await loadUserRoles(user.id);

  res.json({
    success: true,
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      phone: user.phone,
      username: user.username,
      status: user.status,
      roles,
      modules: getModulesForRoles(roles)
    }
  });
});

module.exports = {
  login,
  me
};
