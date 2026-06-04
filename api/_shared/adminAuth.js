const DEFAULT_DEV_IDENTIFIER = "Akash_";
const DEFAULT_DEV_PASSWORD = "akashBhagwat";
const DEFAULT_DEV_TOKEN = "vercel-admin-session";

function isProduction() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function getFallbackConfig() {
  const production = isProduction();
  const identifier = process.env.VERCEL_FALLBACK_ADMIN_IDENTIFIER || (!production ? DEFAULT_DEV_IDENTIFIER : "");
  const password = process.env.VERCEL_FALLBACK_ADMIN_PASSWORD || (!production ? DEFAULT_DEV_PASSWORD : "");
  const token = process.env.VERCEL_FALLBACK_SESSION_TOKEN || (!production ? DEFAULT_DEV_TOKEN : "");

  return {
    identifier,
    password,
    token,
    enabled: Boolean(identifier && password && token)
  };
}

function requireAdmin(req, res) {
  const config = getFallbackConfig();
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");

  if (!config.enabled || token !== config.token) {
    res.status(401).json({ success: false, message: "Please login again." });
    return false;
  }

  return true;
}

module.exports = {
  getFallbackConfig,
  requireAdmin
};
