const app = require("./app");
const env = require("./config/env");
const { pool } = require("./config/db");
const { connectMongo, isMongoConfigured } = require("./config/mongo");
const { scheduleDailyBackup } = require("./services/backupService");
const { scheduleFeeReminders } = require("./services/feeReminderService");

async function start() {
  env.validateProductionConfig();
  await pool.query("SELECT 1");
  if (isMongoConfigured()) {
    await connectMongo();
    console.log("MongoDB connected.");
  } else {
    console.log("MongoDB not configured. Continuing with MySQL primary database.");
  }
  app.listen(env.port, () => {
    console.log(`BSB ERP API listening on http://localhost:${env.port}`);
  });
  scheduleDailyBackup();
  scheduleFeeReminders();
}

start().catch((error) => {
  console.error("Failed to start API:", error);
  process.exit(1);
});
