CREATE TABLE roles (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  username VARCHAR(80) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('active', 'inactive', 'locked') DEFAULT 'active',
  last_login_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE academic_years (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(20) NOT NULL UNIQUE,
  starts_on DATE NOT NULL,
  ends_on DATE NOT NULL,
  is_current BOOLEAN DEFAULT FALSE
);

CREATE TABLE classes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE sections (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id BIGINT NOT NULL,
  name VARCHAR(20) NOT NULL,
  class_teacher_user_id BIGINT NULL,
  CONSTRAINT fk_sections_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_sections_teacher FOREIGN KEY (class_teacher_user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_class_section (class_id, name)
);

CREATE TABLE parents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  father_name VARCHAR(150) NULL,
  mother_name VARCHAR(150) NULL,
  guardian_name VARCHAR(150) NULL,
  phone_primary VARCHAR(20) NOT NULL,
  phone_secondary VARCHAR(20) NULL,
  email VARCHAR(150) NULL,
  occupation VARCHAR(120) NULL,
  address_line1 VARCHAR(255) NULL,
  address_line2 VARCHAR(255) NULL,
  city VARCHAR(100) NULL,
  state VARCHAR(100) NULL,
  postal_code VARCHAR(20) NULL,
  CONSTRAINT fk_parents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE students (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  student_id VARCHAR(50) NOT NULL UNIQUE,
  admission_no VARCHAR(50) NOT NULL UNIQUE,
  roll_no VARCHAR(50) NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100) NULL,
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  date_of_birth DATE NOT NULL,
  blood_group VARCHAR(10) NULL,
  aadhaar_no VARCHAR(20) NULL,
  photo_url VARCHAR(255) NULL,
  current_class_id BIGINT NULL,
  current_section_id BIGINT NULL,
  parent_id BIGINT NULL,
  joined_academic_year_id BIGINT NULL,
  admission_date DATE NULL,
  status ENUM('active', 'graduated', 'transferred', 'inactive') DEFAULT 'active',
  previous_school VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_students_class FOREIGN KEY (current_class_id) REFERENCES classes(id) ON DELETE SET NULL,
  CONSTRAINT fk_students_section FOREIGN KEY (current_section_id) REFERENCES sections(id) ON DELETE SET NULL,
  CONSTRAINT fk_students_parent FOREIGN KEY (parent_id) REFERENCES parents(id) ON DELETE SET NULL,
  CONSTRAINT fk_students_year FOREIGN KEY (joined_academic_year_id) REFERENCES academic_years(id) ON DELETE SET NULL
);

CREATE TABLE student_histories (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  academic_year_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL,
  section_id BIGINT NULL,
  roll_no VARCHAR(50) NULL,
  remarks VARCHAR(255) NULL,
  promoted_to_class_id BIGINT NULL,
  CONSTRAINT fk_histories_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_histories_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  CONSTRAINT fk_histories_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_histories_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
  CONSTRAINT fk_histories_promoted_class FOREIGN KEY (promoted_to_class_id) REFERENCES classes(id) ON DELETE SET NULL
);

CREATE TABLE admission_applications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  academic_year_id BIGINT NOT NULL,
  applying_class_id BIGINT NOT NULL,
  assigned_student_id VARCHAR(50) NULL UNIQUE,
  student_first_name VARCHAR(100) NOT NULL,
  student_middle_name VARCHAR(100) NULL,
  student_last_name VARCHAR(100) NOT NULL,
  student_gender ENUM('male', 'female', 'other') NOT NULL,
  student_dob DATE NOT NULL,
  aadhaar_no VARCHAR(20) NULL,
  parent_name VARCHAR(150) NOT NULL,
  mother_name VARCHAR(150) NULL,
  parent_phone VARCHAR(20) NOT NULL,
  parent_email VARCHAR(150) NULL,
  address TEXT NULL,
  previous_school VARCHAR(255) NULL,
  scholarship_details TEXT NULL,
  wants_bus_service BOOLEAN DEFAULT FALSE,
  pickup_address TEXT NULL,
  preferred_route VARCHAR(150) NULL,
  total_fee DECIMAL(12,2) DEFAULT 0,
  paid_fee DECIMAL(12,2) DEFAULT 0,
  remaining_fee DECIMAL(12,2) DEFAULT 0,
  fee_notes VARCHAR(255) NULL,
  photo_url VARCHAR(255) NULL,
  status ENUM('submitted', 'under_review', 'approved', 'rejected') DEFAULT 'submitted',
  reviewed_by BIGINT NULL,
  reviewed_at DATETIME NULL,
  remarks TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admission_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id),
  CONSTRAINT fk_admission_class FOREIGN KEY (applying_class_id) REFERENCES classes(id),
  CONSTRAINT fk_admission_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE student_documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NULL,
  admission_application_id BIGINT NULL,
  document_type VARCHAR(100) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url VARCHAR(255) NOT NULL,
  uploaded_by BIGINT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_application FOREIGN KEY (admission_application_id) REFERENCES admission_applications(id) ON DELETE CASCADE,
  CONSTRAINT fk_documents_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE transfer_certificates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  certificate_no VARCHAR(50) NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  reason TEXT NULL,
  issued_by BIGINT NULL,
  file_url VARCHAR(255) NULL,
  CONSTRAINT fk_tc_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_tc_user FOREIGN KEY (issued_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE student_notes (
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

CREATE TABLE student_achievements (
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

CREATE TABLE fee_structures (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  academic_year_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL,
  title VARCHAR(150) NOT NULL,
  total_amount DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_fee_structure_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  CONSTRAINT fk_fee_structure_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);

CREATE TABLE fee_components (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  fee_structure_id BIGINT NOT NULL,
  component_name VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  CONSTRAINT fk_fee_components_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

CREATE TABLE student_fee_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  fee_structure_id BIGINT NOT NULL,
  discount_amount DECIMAL(12,2) DEFAULT 0,
  fine_amount DECIMAL(12,2) DEFAULT 0,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fee_assignment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_fee_assignment_structure FOREIGN KEY (fee_structure_id) REFERENCES fee_structures(id) ON DELETE CASCADE
);

CREATE TABLE fee_installments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  installment_name VARCHAR(100) NOT NULL,
  due_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status ENUM('pending', 'partial', 'paid', 'overdue') DEFAULT 'pending',
  CONSTRAINT fk_installment_assignment FOREIGN KEY (assignment_id) REFERENCES student_fee_assignments(id) ON DELETE CASCADE
);

CREATE TABLE fee_payments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  installment_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  receipt_no VARCHAR(50) NOT NULL UNIQUE,
  payment_date DATETIME NOT NULL,
  amount_paid DECIMAL(12,2) NOT NULL,
  payment_mode ENUM('cash', 'upi', 'card', 'net_banking') NOT NULL,
  reference_no VARCHAR(100) NULL,
  collected_by BIGINT NULL,
  notes VARCHAR(255) NULL,
  CONSTRAINT fk_payment_installment FOREIGN KEY (installment_id) REFERENCES fee_installments(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_user FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE fee_receipts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id BIGINT NOT NULL,
  receipt_url VARCHAR(255) NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_receipt_payment FOREIGN KEY (payment_id) REFERENCES fee_payments(id) ON DELETE CASCADE
);

CREATE TABLE subjects (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id BIGINT NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  max_marks DECIMAL(8,2) DEFAULT 100,
  CONSTRAINT fk_subject_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE KEY uq_subject_class_code (class_id, code)
);

CREATE TABLE exams (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  academic_year_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  starts_on DATE NULL,
  ends_on DATE NULL,
  published_at DATETIME NULL,
  created_by BIGINT NULL,
  CONSTRAINT fk_exam_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  CONSTRAINT fk_exam_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_exam_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE exam_results (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  exam_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  marks_obtained DECIMAL(8,2) NOT NULL,
  percentage DECIMAL(6,2) NULL,
  grade VARCHAR(20) NULL,
  remarks VARCHAR(255) NULL,
  entered_by BIGINT NULL,
  CONSTRAINT fk_result_exam FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  CONSTRAINT fk_result_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_result_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  CONSTRAINT fk_result_user FOREIGN KEY (entered_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE attendance_sessions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  academic_year_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL,
  section_id BIGINT NOT NULL,
  attendance_date DATE NOT NULL,
  taken_by BIGINT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_session_year FOREIGN KEY (academic_year_id) REFERENCES academic_years(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_session_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_session_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_session_user FOREIGN KEY (taken_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_attendance_session (class_id, section_id, attendance_date)
);

CREATE TABLE attendance_records (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  session_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  status ENUM('present', 'absent', 'late', 'leave') NOT NULL,
  remark VARCHAR(255) NULL,
  CONSTRAINT fk_attendance_record_session FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_record_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  UNIQUE KEY uq_attendance_student_session (session_id, student_id)
);

CREATE TABLE homework (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  class_id BIGINT NOT NULL,
  section_id BIGINT NULL,
  subject_id BIGINT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  due_date DATE NULL,
  attachment_url VARCHAR(255) NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_homework_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  CONSTRAINT fk_homework_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL,
  CONSTRAINT fk_homework_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  CONSTRAINT fk_homework_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE notices (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  audience ENUM('all', 'staff', 'parents', 'students', 'teachers') DEFAULT 'all',
  published_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_by BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notices_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE gallery_items (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  category ENUM('events', 'achievements', 'classrooms', 'activities') NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  image_url VARCHAR(255) NOT NULL,
  uploaded_by BIGINT NULL,
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_gallery_user FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE student_media_assets (
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

CREATE TABLE student_media_links (
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

CREATE TABLE contact_enquiries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(150) NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notification_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  channel ENUM('sms', 'whatsapp', 'email') NOT NULL,
  recipient VARCHAR(150) NOT NULL,
  subject VARCHAR(150) NULL,
  payload JSON NULL,
  status ENUM('queued', 'sent', 'failed') DEFAULT 'queued',
  provider_response TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE message_campaigns (
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

CREATE TABLE message_campaign_recipients (
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

CREATE TABLE bus_drivers (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NULL,
  full_name VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  license_no VARCHAR(80) NULL,
  vehicle_no VARCHAR(50) NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bus_drivers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE bus_routes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  route_name VARCHAR(150) NOT NULL,
  route_code VARCHAR(50) NOT NULL UNIQUE,
  driver_id BIGINT NULL,
  monthly_fee DECIMAL(12,2) DEFAULT 0,
  school_commission_per_student DECIMAL(12,2) DEFAULT 100,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bus_routes_driver FOREIGN KEY (driver_id) REFERENCES bus_drivers(id) ON DELETE SET NULL
);

CREATE TABLE student_transport_assignments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  student_id BIGINT NOT NULL,
  route_id BIGINT NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_note VARCHAR(255) NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  status ENUM('active', 'paused', 'stopped') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_transport_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_transport_route FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE CASCADE,
  UNIQUE KEY uq_active_student_transport (student_id, status)
);

CREATE TABLE bus_pickup_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_status ENUM('picked', 'absent', 'not_using_bus') NOT NULL,
  marked_by BIGINT NULL,
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pickup_assignment FOREIGN KEY (assignment_id) REFERENCES student_transport_assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_pickup_user FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_pickup_day (assignment_id, pickup_date)
);

CREATE TABLE bus_payment_collections (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  collection_month CHAR(7) NOT NULL,
  amount_collected DECIMAL(12,2) NOT NULL,
  school_commission DECIMAL(12,2) NOT NULL DEFAULT 100,
  collected_by_driver_id BIGINT NULL,
  payment_status ENUM('pending', 'collected', 'submitted_to_school') DEFAULT 'pending',
  collected_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_bus_payment_assignment FOREIGN KEY (assignment_id) REFERENCES student_transport_assignments(id) ON DELETE CASCADE,
  CONSTRAINT fk_bus_payment_driver FOREIGN KEY (collected_by_driver_id) REFERENCES bus_drivers(id) ON DELETE SET NULL,
  UNIQUE KEY uq_bus_payment_month (assignment_id, collection_month)
);

CREATE TABLE fee_reminder_jobs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  installment_id BIGINT NOT NULL,
  reminder_type ENUM('before_due', 'after_due') NOT NULL,
  scheduled_for DATE NOT NULL,
  sent_at DATETIME NULL,
  status ENUM('queued', 'sent', 'failed') DEFAULT 'queued',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_fee_reminder_installment FOREIGN KEY (installment_id) REFERENCES fee_installments(id) ON DELETE CASCADE,
  UNIQUE KEY uq_fee_reminder (installment_id, reminder_type, scheduled_for)
);
