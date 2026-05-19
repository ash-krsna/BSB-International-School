const twilio = require("twilio");

async function sendWhatsAppMessage(body) {
  const {
    TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN,
    TWILIO_WHATSAPP_FROM,
    ADMIN_WHATSAPP_TO
  } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_WHATSAPP_FROM || !ADMIN_WHATSAPP_TO) {
    console.warn("Twilio WhatsApp environment variables are missing. Notification skipped.");
    return { skipped: true };
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  return client.messages.create({
    from: TWILIO_WHATSAPP_FROM,
    to: ADMIN_WHATSAPP_TO,
    body
  });
}

module.exports = {
  sendWhatsAppMessage
};
