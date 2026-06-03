const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
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

function getLocalPublicFileUrl(file) {
  if (!file) {
    return null;
  }

  const relativePath = path.relative(uploadRoot, file.path).replace(/\\/g, "/");
  return `${env.uploadBaseUrl}/uploads/${relativePath}`;
}

function hasCloudinaryConfig() {
  return Boolean(env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret);
}

function getCloudinaryFolder(file) {
  const folder = file?.destination ? path.basename(file.destination) : "general";
  return `${env.cloudinary.folder}/${folder}`.replace(/\/+/g, "/");
}

function signCloudinaryParams(params) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${payload}${env.cloudinary.apiSecret}`)
    .digest("hex");
}

async function uploadToCloudinary(file) {
  if (!hasCloudinaryConfig() || !file?.path) {
    return null;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder: getCloudinaryFolder(file),
    timestamp
  };
  const signature = signCloudinaryParams(params);
  const data = new FormData();
  const buffer = await fs.promises.readFile(file.path);

  data.append("file", new Blob([buffer], { type: file.mimetype }), file.originalname);
  data.append("api_key", env.cloudinary.apiKey);
  data.append("folder", params.folder);
  data.append("timestamp", String(timestamp));
  data.append("signature", signature);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${env.cloudinary.cloudName}/auto/upload`, {
    method: "POST",
    body: data
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Cloudinary upload failed: ${text}`);
  }

  const result = await response.json();

  if (env.cloudinary.deleteLocalAfterUpload) {
    await fs.promises.unlink(file.path).catch(() => {});
  }

  return result.secure_url || result.url;
}

async function toPublicFileUrl(file) {
  if (!file) {
    return null;
  }

  const cloudUrl = await uploadToCloudinary(file);
  return cloudUrl || getLocalPublicFileUrl(file);
}

module.exports = {
  upload,
  toPublicFileUrl
};
