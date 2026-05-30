CREATE TABLE IF NOT EXISTS student_media_assets (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  category VARCHAR(100) DEFAULT 'Student Life',
  media_type ENUM('image', 'video') NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  mime_type VARCHAR(120) NULL,
  uploaded_by BIGINT NULL,
  captured_on DATE NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_student_media_uploaded_by FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS student_media_links (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  media_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  tagged_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_student_media_link (media_id, student_id),
  CONSTRAINT fk_student_media_link_asset FOREIGN KEY (media_id) REFERENCES student_media_assets(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_media_link_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_student_media_link_user FOREIGN KEY (tagged_by) REFERENCES users(id) ON DELETE SET NULL
);
