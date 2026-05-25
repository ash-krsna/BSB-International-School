const cron = require("node-cron");
const { query } = require("../config/db");
const { sendSms, sendWhatsApp } = require("./notificationService");

async function queueFeeReminderJobs() {
  await query(`
    UPDATE fee_installments
    SET status = 'overdue'
    WHERE status IN ('pending', 'partial') AND due_date < CURDATE()
  `);

  await query(`
    INSERT IGNORE INTO fee_reminder_jobs (installment_id, reminder_type, scheduled_for)
    SELECT id, 'before_due', CURDATE()
    FROM fee_installments
    WHERE status IN ('pending', 'partial')
      AND due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 15 DAY)
  `);

  await query(`
    INSERT IGNORE INTO fee_reminder_jobs (installment_id, reminder_type, scheduled_for)
    SELECT id, 'after_due', CURDATE()
    FROM fee_installments
    WHERE status IN ('pending', 'partial', 'overdue')
      AND due_date < CURDATE()
  `);
}

async function sendQueuedFeeReminders() {
  const reminders = await query(`
    SELECT
      frj.id,
      frj.reminder_type AS reminderType,
      fi.installment_name AS installmentName,
      fi.due_date AS dueDate,
      fi.amount,
      s.student_id AS studentCode,
      CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS studentName,
      p.phone_primary AS parentPhone
    FROM fee_reminder_jobs frj
    JOIN fee_installments fi ON fi.id = frj.installment_id
    JOIN student_fee_assignments sfa ON sfa.id = fi.assignment_id
    JOIN students s ON s.id = sfa.student_id
    JOIN parents p ON p.id = s.parent_id
    WHERE frj.status = 'queued' AND frj.scheduled_for <= CURDATE()
    ORDER BY frj.scheduled_for ASC
    LIMIT 100
  `);

  for (const item of reminders) {
    const message = item.reminderType === "before_due"
      ? `BSB fee reminder: ${item.installmentName} of Rs ${item.amount} for ${item.studentName} is due on ${item.dueDate}.`
      : `BSB fee overdue: ${item.installmentName} of Rs ${item.amount} for ${item.studentName} is pending. Please pay soon.`;

    try {
      await sendSms({ phone: item.parentPhone, message });
      await sendWhatsApp({ to: `whatsapp:+91${item.parentPhone.replace(/\D/g, "").slice(-10)}`, message });
      await query(`UPDATE fee_reminder_jobs SET status = 'sent', sent_at = NOW() WHERE id = :id`, { id: item.id });
    } catch (error) {
      await query(`UPDATE fee_reminder_jobs SET status = 'failed' WHERE id = :id`, { id: item.id });
    }
  }

  return { queued: reminders.length };
}

async function runFeeReminderCycle() {
  await queueFeeReminderJobs();
  return sendQueuedFeeReminders();
}

function scheduleFeeReminders() {
  cron.schedule("0 9 * * *", () => {
    runFeeReminderCycle().catch((error) => {
      console.error("Fee reminder cycle failed:", error);
    });
  });
}

module.exports = {
  queueFeeReminderJobs,
  sendQueuedFeeReminders,
  runFeeReminderCycle,
  scheduleFeeReminders
};
