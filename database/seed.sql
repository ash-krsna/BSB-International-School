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
