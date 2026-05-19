ALTER TABLE students
  ADD COLUMN student_id VARCHAR(50) NULL AFTER user_id,
  ADD COLUMN admission_date DATE NULL AFTER joined_academic_year_id;

UPDATE students
SET student_id = CONCAT('BSB-', YEAR(COALESCE(created_at, CURRENT_DATE())), '-', LPAD(id, 4, '0'))
WHERE student_id IS NULL;

ALTER TABLE students
  MODIFY COLUMN student_id VARCHAR(50) NOT NULL,
  ADD UNIQUE KEY uq_students_student_id (student_id);

CREATE TABLE IF NOT EXISTS student_notes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  note_type ENUM('teacher_remark', 'behavior', 'counselling', 'general') DEFAULT 'general',
  title VARCHAR(150) NOT NULL,
  note TEXT NOT NULL,
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_notes_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_notes_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_achievements (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  achieved_on DATE NULL,
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_achievements_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_achievements_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS message_campaigns (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  message_body TEXT NOT NULL,
  target_type ENUM('all', 'class', 'individual') DEFAULT 'all',
  class_id BIGINT NULL,
  student_id BIGINT NULL,
  send_sms BOOLEAN DEFAULT TRUE,
  send_whatsapp BOOLEAN DEFAULT FALSE,
  send_email BOOLEAN DEFAULT FALSE,
  created_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_campaign_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL,
  CONSTRAINT fk_message_campaign_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
  CONSTRAINT fk_message_campaign_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS message_campaign_recipients (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  campaign_id BIGINT NOT NULL,
  student_id BIGINT NULL,
  parent_id BIGINT NULL,
  channel ENUM('sms', 'whatsapp', 'email') NOT NULL,
  recipient VARCHAR(150) NOT NULL,
  delivery_status ENUM('queued', 'sent', 'failed') DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_recipient_campaign FOREIGN KEY (campaign_id) REFERENCES message_campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_recipient_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE SET NULL,
  CONSTRAINT fk_message_recipient_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL
);
