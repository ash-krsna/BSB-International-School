CREATE TABLE quiz_questions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_name VARCHAR(50) NOT NULL,
  category VARCHAR(80) NOT NULL,
  question VARCHAR(255) NOT NULL,
  option_a VARCHAR(120) NOT NULL,
  option_b VARCHAR(120) NOT NULL,
  option_c VARCHAR(120) NOT NULL,
  option_d VARCHAR(120) NOT NULL,
  correct_option CHAR(1) NOT NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_scores (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_name VARCHAR(120) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  score INT NOT NULL,
  total_questions INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO quiz_questions (class_name, category, question, option_a, option_b, option_c, option_d, correct_option, sort_order) VALUES
('Class 1', 'World Around Us', 'Which animal gives us milk?', 'Lion', 'Cow', 'Tiger', 'Fox', 'B', 1),
('Class 1', 'Good Habits', 'What should we say when someone helps us?', 'Thank you', 'Go away', 'Nothing', 'Shout', 'A', 2),
('Class 1', 'Safety', 'Which light means stop on the road?', 'Green', 'Blue', 'Red', 'White', 'C', 3),
('Class 1', 'Nature', 'Which one is a fruit?', 'Chair', 'Apple', 'Pencil', 'Shoe', 'B', 4),
('Class 2', 'World Around Us', 'Who treats sick people?', 'Doctor', 'Farmer', 'Driver', 'Tailor', 'A', 1),
('Class 2', 'Good Habits', 'Where should we throw waste paper?', 'On road', 'In dustbin', 'In water', 'Under bed', 'B', 2),
('Class 2', 'Safety', 'Before crossing a road, we should look', 'Only down', 'Left and right', 'At phone', 'Behind only', 'B', 3),
('Class 2', 'India', 'What is our national flag called?', 'Tricolour', 'Rainbow', 'Circle', 'Star', 'A', 4),
('Class 3', 'World Around Us', 'Which planet do we live on?', 'Mars', 'Earth', 'Jupiter', 'Venus', 'B', 1),
('Class 3', 'Social Awareness', 'If a friend falls down, what should you do?', 'Laugh', 'Help and call teacher', 'Run away', 'Hide', 'B', 2),
('Class 3', 'Health', 'Which habit keeps teeth clean?', 'Brushing daily', 'Eating only sweets', 'Never washing', 'Sleeping late', 'A', 3),
('Class 3', 'Environment', 'Trees give us', 'Smoke', 'Oxygen', 'Plastic', 'Dust', 'B', 4),
('Class 4', 'World Around Us', 'Which direction does the sun rise from?', 'West', 'North', 'East', 'South', 'C', 1),
('Class 4', 'Social Awareness', 'What should you do if you find a lost younger child?', 'Ignore', 'Tell a trusted adult', 'Take money', 'Scold them', 'B', 2),
('Class 4', 'Environment', 'Saving water means', 'Leaving taps open', 'Using water carefully', 'Wasting water', 'Breaking taps', 'B', 3),
('Class 4', 'India', 'The capital of India is', 'Mumbai', 'Delhi', 'Pune', 'Nagpur', 'B', 4),
('Class 5', 'World Around Us', 'What is the main source of energy for Earth?', 'Moon', 'Sun', 'Cloud', 'Wind only', 'B', 1),
('Class 5', 'Social Awareness', 'Cyber safety means', 'Sharing passwords', 'Keeping personal details safe', 'Talking to strangers online', 'Posting everything', 'B', 2),
('Class 5', 'Health', 'A balanced meal includes', 'Only chips', 'Different healthy foods', 'Only sweets', 'Only cold drinks', 'B', 3),
('Class 5', 'Environment', 'Planting trees helps to', 'Clean air', 'Make more plastic', 'Waste water', 'Increase smoke', 'A', 4);
