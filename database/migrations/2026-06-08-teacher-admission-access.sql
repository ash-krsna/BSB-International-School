INSERT INTO users (full_name, email, phone, username, password_hash, status)
VALUES ('Sarika Bankar', NULL, NULL, 'Sarika_', '$2a$10$CSd1icOguxNHzyQxdtfpiuVpErcH8vbiNkp.TJERKXWoul5.WCDhe', 'active')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  password_hash = VALUES(password_hash),
  status = 'active';

INSERT INTO user_roles (user_id, role_id)
SELECT u.id, r.id
FROM users u
JOIN roles r ON r.code = 'teacher'
WHERE u.username = 'Sarika_'
ON DUPLICATE KEY UPDATE role_id = role_id;
