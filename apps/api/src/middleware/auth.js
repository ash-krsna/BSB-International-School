const { query } = require("../config/db");
const { verifyAccessToken } = require("../services/tokenService");

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : "";

    if (!token) {
      return res.status(401).json({ success: false, message: "Authentication token is missing." });
    }

    const decoded = verifyAccessToken(token);
    const roles = await query(
      `
        SELECT r.code
        FROM users u
        JOIN user_roles ur ON ur.user_id = u.id
        JOIN roles r ON r.id = ur.role_id
        WHERE u.id = :userId
      `,
      { userId: decoded.userId }
    );

    req.auth = {
      userId: decoded.userId,
      roles: roles.map((item) => item.code)
    };

    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    const currentRoles = req.auth?.roles || [];
    const isAllowed = currentRoles.some((role) => allowedRoles.includes(role));

    if (!isAllowed) {
      return res.status(403).json({ success: false, message: "You do not have permission for this action." });
    }

    return next();
  };
}

module.exports = {
  authenticate,
  authorize
};
