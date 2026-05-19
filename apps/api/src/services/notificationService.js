const { query } = require("../config/db");
const env = require("../config/env");

async function logNotification({ channel, recipient, subject = null, payload = null, status = "queued", providerResponse = null }) {
  await query(
    `
      INSERT INTO notification_logs (channel, recipient, subject, payload, status, provider_response)
      VALUES (:channel, :recipient, :subject, :payload, :status, :providerResponse)
    `,
    {
      channel,
      recipient,
      subject,
      payload: payload ? JSON.stringify(payload) : null,
      status,
      providerResponse
    }
  );
}

async function sendSms({ phone, message }) {
  if (!env.msg91AuthKey) {
    await logNotification({ channel: "sms", recipient: phone, subject: "SMS skipped", payload: { message }, status: "queued" });
    return { skipped: true };
  }

  const response = await fetch("https://api.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authkey: env.msg91AuthKey
    },
    body: JSON.stringify({
      template_id: env.msg91TemplateId,
      short_url: "0",
      recipients: [{ mobiles: phone.replace(/\D/g, ""), message }]
    })
  });

  const payload = await response.text();
  await logNotification({
    channel: "sms",
    recipient: phone,
    subject: "ERP SMS",
    payload: { message },
    status: response.ok ? "sent" : "failed",
    providerResponse: payload
  });

  return { ok: response.ok, payload };
}

async function sendWhatsApp({ to, message }) {
  if (!env.twilioAccountSid || !env.twilioAuthToken || !env.twilioWhatsappFrom) {
    await logNotification({ channel: "whatsapp", recipient: to, subject: "WhatsApp skipped", payload: { message }, status: "queued" });
    return { skipped: true };
  }

  const auth = Buffer.from(`${env.twilioAccountSid}:${env.twilioAuthToken}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.twilioAccountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      From: env.twilioWhatsappFrom,
      To: to,
      Body: message
    })
  });

  const payload = await response.text();
  await logNotification({
    channel: "whatsapp",
    recipient: to,
    subject: "ERP WhatsApp",
    payload: { message },
    status: response.ok ? "sent" : "failed",
    providerResponse: payload
  });

  return { ok: response.ok, payload };
}

async function notifyAdminEnquiry(message) {
  if (env.adminNotificationWhatsapp) {
    await sendWhatsApp({ to: env.adminNotificationWhatsapp, message });
  }
}

module.exports = {
  sendSms,
  sendWhatsApp,
  notifyAdminEnquiry
};
