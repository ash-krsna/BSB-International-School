INSERT INTO roles (code, name) VALUES
('super_admin', 'Super Admin'),
('admin_staff', 'Admin Staff'),
('principal', 'Principal'),
('teacher', 'Teacher'),
('accountant', 'Accountant'),
('driver', 'Bus Driver'),
('parent', 'Parent'),
('student', 'Student');

INSERT INTO academic_years (title, starts_on, ends_on, is_current) VALUES
('2026-2027', '2026-06-01', '2027-04-30', TRUE);

INSERT INTO classes (name, display_order) VALUES
('Nursery', 1),
('Junior KG', 2),
('Senior KG', 3),
('Class 1', 4),
('Class 2', 5),
('Class 3', 6),
('Class 4', 7),
('Class 5', 8);

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
