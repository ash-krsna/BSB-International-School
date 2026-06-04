const app = require("./app");
const env = require("./config/env");
const { pool } = require("./config/db");
const { scheduleDailyBackup } = require("./services/backupService");
const { scheduleFeeReminders } = require("./services/feeReminderService");

async function start() {
  env.validateProductionConfig();
  await pool.query("SELECT 1");
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
