const fs = require("fs");
const path = require("path");
const multer = require("multer");
const env = require("../config/env");

const uploadRoot = path.resolve(__dirname, "../../uploads");
fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.uploadFolder || "general";
    const destination = path.join(uploadRoot, folder);
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const sanitized = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, sanitized);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

function toPublicFileUrl(file) {
  if (!file) {
    return null;
  }

  const relativePath = path.relative(uploadRoot, file.path).replace(/\\/g, "/");
  return `${env.uploadBaseUrl}/uploads/${relativePath}`;
}

module.exports = {
  upload,
  toPublicFileUrl
};
