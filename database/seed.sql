INSERT INTO roles (code, name) VALUES
('super_admin', 'Super Admin'),
('admin_staff', 'Admin Staff'),
('principal', 'Principal'),
('teacher', 'Teacher'),
('accountant', 'Accountant'),
('driver', 'Bus Driver'),
('parent', 'Parent'),
('student', 'Student')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO academic_years (title, starts_on, ends_on, is_current)
VALUES ('2026-2027', '2026-06-01', '2027-04-30', TRUE)
ON DUPLICATE KEY UPDATE
  starts_on = VALUES(starts_on),
  ends_on = VALUES(ends_on),
  is_current = VALUES(is_current);

INSERT INTO classes (name, display_order)
SELECT 'Nursery', 1 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Nursery');
INSERT INTO classes (name, display_order)
SELECT 'Junior KG', 2 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Junior KG');
INSERT INTO classes (name, display_order)
SELECT 'Senior KG', 3 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Senior KG');
INSERT INTO classes (name, display_order)
SELECT 'Class 1', 4 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Class 1');
INSERT INTO classes (name, display_order)
SELECT 'Class 2', 5 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Class 2');
INSERT INTO classes (name, display_order)
SELECT 'Class 3', 6 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Class 3');
INSERT INTO classes (name, display_order)
SELECT 'Class 4', 7 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Class 4');
INSERT INTO classes (name, display_order)
SELECT 'Class 5', 8 WHERE NOT EXISTS (SELECT 1 FROM classes WHERE name = 'Class 5');

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

INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 1', 'World Around Us', 'Which animal gives us milk?', 'Lion', 'Cow', 'Tiger', 'Fox', 'B', 1 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 1' AND question = 'Which animal gives us milk?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 1', 'Good Habits', 'What should we say when someone helps us?', 'Thank you', 'Go away', 'Nothing', 'Shout', 'A', 2 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 1' AND question = 'What should we say when someone helps us?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 1', 'Safety', 'Which light means stop on the road?', 'Green', 'Blue', 'Red', 'White', 'C', 3 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 1' AND question = 'Which light means stop on the road?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 1', 'Nature', 'Which one is a fruit?', 'Chair', 'Apple', 'Pencil', 'Shoe', 'B', 4 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 1' AND question = 'Which one is a fruit?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 2', 'World Around Us', 'Who treats sick people?', 'Doctor', 'Farmer', 'Driver', 'Tailor', 'A', 1 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 2' AND question = 'Who treats sick people?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 2', 'Good Habits', 'Where should we throw waste paper?', 'On road', 'In dustbin', 'In water', 'Under bed', 'B', 2 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 2' AND question = 'Where should we throw waste paper?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 2', 'Safety', 'Before crossing a road, we should look', 'Only down', 'Left and right', 'At phone', 'Behind only', 'B', 3 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 2' AND question = 'Before crossing a road, we should look');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 2', 'India', 'What is our national flag called?', 'Tricolour', 'Rainbow', 'Circle', 'Star', 'A', 4 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 2' AND question = 'What is our national flag called?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 3', 'World Around Us', 'Which planet do we live on?', 'Mars', 'Earth', 'Jupiter', 'Venus', 'B', 1 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 3' AND question = 'Which planet do we live on?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 3', 'Social Awareness', 'If a friend falls down, what should you do?', 'Laugh', 'Help and call teacher', 'Run away', 'Hide', 'B', 2 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 3' AND question = 'If a friend falls down, what should you do?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 3', 'Health', 'Which habit keeps teeth clean?', 'Brushing daily', 'Eating only sweets', 'Never washing', 'Sleeping late', 'A', 3 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 3' AND question = 'Which habit keeps teeth clean?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 3', 'Environment', 'Trees give us', 'Smoke', 'Oxygen', 'Plastic', 'Dust', 'B', 4 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 3' AND question = 'Trees give us');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 4', 'World Around Us', 'Which direction does the sun rise from?', 'West', 'North', 'East', 'South', 'C', 1 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 4' AND question = 'Which direction does the sun rise from?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 4', 'Social Awareness', 'What should you do if you find a lost younger child?', 'Ignore', 'Tell a trusted adult', 'Take money', 'Scold them', 'B', 2 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 4' AND question = 'What should you do if you find a lost younger child?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 4', 'Environment', 'Saving water means', 'Leaving taps open', 'Using water carefully', 'Wasting water', 'Breaking taps', 'B', 3 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 4' AND question = 'Saving water means');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 4', 'India', 'The capital of India is', 'Mumbai', 'Delhi', 'Pune', 'Nagpur', 'B', 4 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 4' AND question = 'The capital of India is');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 5', 'World Around Us', 'What is the main source of energy for Earth?', 'Moon', 'Sun', 'Cloud', 'Wind only', 'B', 1 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 5' AND question = 'What is the main source of energy for Earth?');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 5', 'Social Awareness', 'Cyber safety means', 'Sharing passwords', 'Keeping personal details safe', 'Talking to strangers online', 'Posting everything', 'B', 2 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 5' AND question = 'Cyber safety means');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 5', 'Health', 'A balanced meal includes', 'Only chips', 'Different healthy foods', 'Only sweets', 'Only cold drinks', 'B', 3 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 5' AND question = 'A balanced meal includes');
INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order)
SELECT 'Class 5', 'Environment', 'Planting trees helps to', 'Clean air', 'Make more plastic', 'Waste water', 'Increase smoke', 'A', 4 WHERE NOT EXISTS (SELECT 1 FROM quiz_questions WHERE class_name = 'Class 5' AND question = 'Planting trees helps to');
