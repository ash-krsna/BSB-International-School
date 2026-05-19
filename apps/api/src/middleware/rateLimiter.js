const buckets = new Map();

function createRateLimiter({ windowMs, max, keyPrefix = "global" }) {
  return function rateLimiter(req, res, next) {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const bucketKey = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const bucket = buckets.get(bucketKey);

    if (!bucket || now > bucket.expiresAt) {
      buckets.set(bucketKey, {
        count: 1,
        expiresAt: now + windowMs
      });
      next();
      return;
    }

    if (bucket.count >= max) {
      res.status(429).json({
        success: false,
        message: "Too many requests. Please try again after a short while."
      });
      return;
    }

    bucket.count += 1;
    next();
  };
}

module.exports = {
  createRateLimiter
};
