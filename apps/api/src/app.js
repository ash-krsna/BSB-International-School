const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const env = require("./config/env");
const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const { createRateLimiter } = require("./middleware/rateLimiter");

const app = express();
app.set("trust proxy", 1);

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  if (env.appOrigins.includes(origin)) {
    return true;
  }

  if (env.allowVercelPreviews && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return true;
  }

  return false;
}

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(morgan("dev"));
app.use(createRateLimiter({ windowMs: 15 * 60 * 1000, max: 400 }));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
