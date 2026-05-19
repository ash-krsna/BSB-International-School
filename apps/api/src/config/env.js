const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  appOrigins: (process.env.APP_ORIGINS || "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean),
  allowVercelPreviews: process.env.ALLOW_VERCEL_PREVIEWS !== "false",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "12h",
  mysql: {
    host: process.env.MYSQL_HOST || "127.0.0.1",
    port: Number(process.env.MYSQL_PORT || 3306),
    database: process.env.MYSQL_DATABASE || "bsb_erp",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || ""
  },
  uploadBaseUrl: process.env.UPLOAD_BASE_URL || "http://localhost:4000",
  msg91AuthKey: process.env.MSG91_AUTH_KEY || "",
  msg91TemplateId: process.env.MSG91_TEMPLATE_ID || "",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "",
  adminNotificationWhatsapp: process.env.ADMIN_NOTIFICATION_WHATSAPP || "",
  contactReceiverEmail: process.env.CONTACT_RECEIVER_EMAIL || "",
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  mailFrom: process.env.MAIL_FROM || process.env.SMTP_USER || "",
  mysqlDumpBin: process.env.MYSQL_DUMP_BIN || "mysqldump"
};

module.exports = env;
