const nodemailer = require("nodemailer");
const env = require("../config/env");
const { query } = require("../config/db");

let transporter;

function getTransporter() {
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass
      }
    });
  }

  return transporter;
}

async function logEmail({ recipient, subject, html, status, providerResponse = null }) {
  await query(
    `
      INSERT INTO notification_logs (channel, recipient, subject, payload, status, provider_response)
      VALUES (:channel, :recipient, :subject, :payload, :status, :providerResponse)
    `,
    {
      channel: "email",
      recipient,
      subject,
      payload: JSON.stringify({ html }),
      status,
      providerResponse
    }
  );
}

async function sendEmail({ to, subject, text, html }) {
  const mailer = getTransporter();
  if (!mailer || !to) {
    await logEmail({
      recipient: to || "not-configured",
      subject,
      html: html || text || "",
      status: "queued",
      providerResponse: "SMTP not configured"
    });
    return { skipped: true };
  }

  try {
    const result = await mailer.sendMail({
      from: env.mailFrom,
      to,
      subject,
      text,
      html
    });

    await logEmail({
      recipient: to,
      subject,
      html: html || text || "",
      status: "sent",
      providerResponse: result.messageId || "sent"
    });

    return { ok: true, result };
  } catch (error) {
    await logEmail({
      recipient: to,
      subject,
      html: html || text || "",
      status: "failed",
      providerResponse: error.message
    });

    return { ok: false, error: error.message };
  }
}

module.exports = {
  sendEmail
};
