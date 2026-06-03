const { query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");
const { toPublicFileUrl } = require("../services/uploadService");

const createHomework = asyncHandler(async (req, res) => {
  const { classId, sectionId, subjectId, title, description, dueDate } = req.body;
  if (!classId || !title || !description) {
    throw new HttpError(400, "Homework class, title, and description are required.");
  }

  const attachmentUrl = req.file ? await toPublicFileUrl(req.file) : null;

  const result = await query(
    `
      INSERT INTO homework (class_id, section_id, subject_id, title, description, due_date, attachment_url, created_by)
      VALUES (:classId, :sectionId, :subjectId, :title, :description, :dueDate, :attachmentUrl, :createdBy)
    `,
    {
      classId,
      sectionId: sectionId || null,
      subjectId: subjectId || null,
      title,
      description,
      dueDate: dueDate || null,
      attachmentUrl,
      createdBy: req.auth.userId
    }
  );

  res.status(201).json({ success: true, data: { id: result.insertId } });
});

const listHomework = asyncHandler(async (req, res) => {
  const rows = await query(
    `
      SELECT h.id, h.title, h.description, h.due_date AS dueDate, h.attachment_url AS attachmentUrl, c.name AS className
      FROM homework h
      JOIN classes c ON c.id = h.class_id
      ORDER BY h.created_at DESC
    `
  );

  res.json({ success: true, data: rows });
});

const createNotice = asyncHandler(async (req, res) => {
  const { title, body, audience, publishedAt, expiresAt } = req.body;
  if (!title || !body) {
    throw new HttpError(400, "Notice title and body are required.");
  }

  const result = await query(
    `
      INSERT INTO notices (title, body, audience, published_at, expires_at, created_by)
      VALUES (:title, :body, :audience, :publishedAt, :expiresAt, :createdBy)
    `,
    {
      title,
      body,
      audience: audience || "all",
      publishedAt: publishedAt || new Date(),
      expiresAt: expiresAt || null,
      createdBy: req.auth.userId
    }
  );

  res.status(201).json({ success: true, data: { id: result.insertId } });
});

const createGalleryItem = asyncHandler(async (req, res) => {
  const { category, title, description, imageUrl } = req.body;
  const finalImageUrl = req.file ? await toPublicFileUrl(req.file) : imageUrl;

  if (!category || !title || !finalImageUrl) {
    throw new HttpError(400, "Gallery category, title, and image are required.");
  }

  const result = await query(
    `
      INSERT INTO gallery_items (category, title, description, image_url, uploaded_by, published_at)
      VALUES (:category, :title, :description, :imageUrl, :uploadedBy, NOW())
    `,
    {
      category,
      title,
      description: description || null,
      imageUrl: finalImageUrl,
      uploadedBy: req.auth.userId
    }
  );

  res.status(201).json({ success: true, data: { id: result.insertId } });
});

module.exports = {
  createHomework,
  listHomework,
  createNotice,
  createGalleryItem
};
