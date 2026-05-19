const { query, transaction } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { sendSms, sendWhatsApp } = require("../services/notificationService");
const { sendEmail } = require("../services/mailService");

async function resolveTargets({ targetType, classId, studentId }) {
  if (targetType === "individual" && !studentId) {
    throw new HttpError(400, "Student ID is required for individual campaigns.");
  }

  if (targetType === "class" && !classId) {
    throw new HttpError(400, "Class ID is required for class-wise campaigns.");
  }

  return query(
    `
      SELECT
        s.id AS studentId,
        p.id AS parentId,
        CONCAT_WS(' ', s.first_name, s.middle_name, s.last_name) AS studentName,
        p.phone_primary AS parentPhone,
        p.email AS parentEmail
      FROM students s
      LEFT JOIN parents p ON p.id = s.parent_id
      WHERE
        (:targetType = 'all')
        OR (:targetType = 'class' AND s.current_class_id = :classId)
        OR (:targetType = 'individual' AND s.id = :studentId)
      ORDER BY s.id ASC
    `,
    {
      targetType,
      classId: classId || null,
      studentId: studentId || null
    }
  );
}

const broadcastMessage = asyncHandler(async (req, res) => {
  const {
    title,
    messageBody,
    targetType = "all",
    classId,
    studentId,
    sendSms: shouldSendSms = true,
    sendWhatsApp: shouldSendWhatsapp = false,
    sendEmail: shouldSendEmail = false
  } = req.body;

  if (!title || !messageBody) {
    throw new HttpError(400, "Title and message body are required.");
  }

  const targets = await resolveTargets({ targetType, classId, studentId });
  if (!targets.length) {
    throw new HttpError(404, "No recipients matched the campaign filters.");
  }

  const campaignId = await transaction(async (connection) => {
    const [campaignResult] = await connection.execute(
      `
        INSERT INTO message_campaigns
          (title, message_body, target_type, class_id, student_id, send_sms, send_whatsapp, send_email, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        messageBody,
        targetType,
        classId || null,
        studentId || null,
        shouldSendSms ? 1 : 0,
        shouldSendWhatsapp ? 1 : 0,
        shouldSendEmail ? 1 : 0,
        req.auth.userId
      ]
    );

    for (const target of targets) {
      if (shouldSendSms && target.parentPhone) {
        const result = await sendSms({ phone: target.parentPhone, message: messageBody });
        await connection.execute(
          `
            INSERT INTO message_campaign_recipients (campaign_id, student_id, parent_id, channel, recipient, delivery_status)
            VALUES (?, ?, ?, 'sms', ?, ?)
          `,
          [campaignResult.insertId, target.studentId, target.parentId || null, target.parentPhone, result.ok ? "sent" : "queued"]
        );
      }

      if (shouldSendWhatsapp && target.parentPhone) {
        const whatsappNumber = target.parentPhone.startsWith("whatsapp:") ? target.parentPhone : `whatsapp:${target.parentPhone}`;
        const result = await sendWhatsApp({ to: whatsappNumber, message: messageBody });
        await connection.execute(
          `
            INSERT INTO message_campaign_recipients (campaign_id, student_id, parent_id, channel, recipient, delivery_status)
            VALUES (?, ?, ?, 'whatsapp', ?, ?)
          `,
          [campaignResult.insertId, target.studentId, target.parentId || null, whatsappNumber, result.ok ? "sent" : "queued"]
        );
      }

      if (shouldSendEmail && target.parentEmail) {
        const result = await sendEmail({
          to: target.parentEmail,
          subject: title,
          text: messageBody,
          html: `<p>${messageBody}</p>`
        });
        await connection.execute(
          `
            INSERT INTO message_campaign_recipients (campaign_id, student_id, parent_id, channel, recipient, delivery_status)
            VALUES (?, ?, ?, 'email', ?, ?)
          `,
          [campaignResult.insertId, target.studentId, target.parentId || null, target.parentEmail, result.ok ? "sent" : "queued"]
        );
      }
    }

    return campaignResult.insertId;
  });

  res.status(201).json({
    success: true,
    message: "Campaign processed successfully.",
    data: {
      campaignId,
      recipients: targets.length
    }
  });
});

const listCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await query(
    `
      SELECT
        mc.id,
        mc.title,
        mc.target_type AS targetType,
        mc.send_sms AS sendSms,
        mc.send_whatsapp AS sendWhatsApp,
        mc.send_email AS sendEmail,
        mc.created_at AS createdAt,
        u.full_name AS createdBy,
        COUNT(mcr.id) AS deliveryAttempts
      FROM message_campaigns mc
      LEFT JOIN users u ON u.id = mc.created_by
      LEFT JOIN message_campaign_recipients mcr ON mcr.campaign_id = mc.id
      GROUP BY mc.id, u.full_name
      ORDER BY mc.created_at DESC
    `
  );

  res.json({ success: true, data: campaigns });
});

module.exports = {
  broadcastMessage,
  listCampaigns
};
