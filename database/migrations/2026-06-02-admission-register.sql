ALTER TABLE admission_applications
  ADD COLUMN student_middle_name VARCHAR(100) NULL AFTER student_first_name,
  ADD COLUMN mother_name VARCHAR(150) NULL AFTER parent_name,
  ADD COLUMN assigned_student_id VARCHAR(50) NULL UNIQUE AFTER applying_class_id,
  ADD COLUMN total_fee DECIMAL(12,2) DEFAULT 0 AFTER preferred_route,
  ADD COLUMN paid_fee DECIMAL(12,2) DEFAULT 0 AFTER total_fee,
  ADD COLUMN remaining_fee DECIMAL(12,2) DEFAULT 0 AFTER paid_fee,
  ADD COLUMN fee_notes VARCHAR(255) NULL AFTER remaining_fee;

INSERT INTO users (full_name, email, phone, username, password_hash, status)
VALUES ('Akash Bhagwat', NULL, NULL, 'Akash_', '$2a$10$NDYx9AIs5zDKbvjLBwcguOmxZTyq3chDK.SCgUlsZjlBurf0.tQVS', 'active')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  password_hash = VALUES(password_hash),
  status = 'active';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.code = 'super_admin'
WHERE u.username = 'Akash_'
ON DUPLICATE KEY UPDATE role_id = role_id;
