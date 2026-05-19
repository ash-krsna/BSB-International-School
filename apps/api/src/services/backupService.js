const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const cron = require("node-cron");
const env = require("../config/env");

const backupDir = path.resolve(__dirname, "../../backups");
fs.mkdirSync(backupDir, { recursive: true });

function runBackup() {
  return new Promise((resolve, reject) => {
    const filename = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.sql`;
    const target = path.join(backupDir, filename);

    const args = [
      `-h${env.mysql.host}`,
      `-P${env.mysql.port}`,
      `-u${env.mysql.user}`,
      `-p${env.mysql.password}`,
      env.mysql.database
    ];

    execFile(env.mysqlDumpBin, args, { maxBuffer: 1024 * 1024 * 20 }, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      fs.writeFileSync(target, stdout);
      resolve({ file: target });
    });
  });
}

function scheduleDailyBackup() {
  cron.schedule("0 2 * * *", async () => {
    try {
      await runBackup();
      console.log("Daily MySQL backup completed.");
    } catch (error) {
      console.error("Daily MySQL backup failed:", error.message);
    }
  });
}

module.exports = {
  runBackup,
  scheduleDailyBackup
};
