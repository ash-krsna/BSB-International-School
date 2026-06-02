const { query } = require("../config/db");
const asyncHandler = require("../utils/asyncHandler");
const HttpError = require("../utils/httpError");

const listQuizQuestions = asyncHandler(async (req, res) => {
  const className = req.query.className || "Class 1";
  const rows = await query(
    `
      SELECT id, class_name AS className, category, question, option_a AS optionA, option_b AS optionB, option_c AS optionC, option_d AS optionD, correct_option AS correctOption
      FROM quiz_questions
      WHERE is_active = TRUE AND class_name = :className
      ORDER BY sort_order ASC, id ASC
      LIMIT 12
    `,
    { className }
  );

  res.json({ success: true, data: rows });
});

const submitQuizScore = asyncHandler(async (req, res) => {
  const { studentName, className, score, totalQuestions } = req.body;
  const cleanName = String(studentName || "").trim();
  const cleanClass = String(className || "").trim();
  const scoreNumber = Number(score);
  const totalNumber = Number(totalQuestions);

  if (!cleanName || !cleanClass || !Number.isFinite(scoreNumber) || !Number.isFinite(totalNumber)) {
    throw new HttpError(400, "Student name, class, score, and total questions are required.");
  }

  await query(
    `
      INSERT INTO quiz_scores (student_name, class_name, score, total_questions)
      VALUES (:studentName, :className, :score, :totalQuestions)
    `,
    {
      studentName: cleanName.slice(0, 120),
      className: cleanClass.slice(0, 50),
      score: Math.max(0, Math.min(scoreNumber, totalNumber)),
      totalQuestions: Math.max(1, totalNumber)
    }
  );

  res.status(201).json({ success: true, message: "Quiz score saved." });
});

const listScoreboard = asyncHandler(async (req, res) => {
  const className = req.query.className || null;
  const rows = await query(
    `
      SELECT student_name AS studentName, class_name AS className, score, total_questions AS totalQuestions, created_at AS createdAt
      FROM quiz_scores
      WHERE (:className IS NULL OR class_name = :className)
      ORDER BY score DESC, total_questions DESC, created_at ASC
      LIMIT 20
    `,
    { className }
  );

  res.json({ success: true, data: rows });
});

module.exports = {
  listQuizQuestions,
  submitQuizScore,
  listScoreboard
};
