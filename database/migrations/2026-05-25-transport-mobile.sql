INSERT INTO roles (code, name)
VALUES ('driver', 'Bus Driver')
ON DUPLICATE KEY UPDATE name = VALUES(name);

ALTER TABLE admission_applications
  ADD COLUMN IF NOT EXISTS aadhaar_no VARCHAR(20) NULL AFTER student_dob,
  ADD COLUMN IF NOT EXISTS previous_school VARCHAR(255) NULL AFTER address,
  ADD COLUMN IF NOT EXISTS scholarship_details TEXT NULL AFTER previous_school,
  ADD COLUMN IF NOT EXISTS wants_bus_service BOOLEAN DEFAULT FALSE AFTER scholarship_details,
  ADD COLUMN IF NOT EXISTS pickup_address TEXT NULL AFTER wants_bus_service,
  ADD COLUMN IF NOT EXISTS preferred_route VARCHAR(150) NULL AFTER pickup_address;

CREATE TABLE IF NOT EXISTS bus_drivers (
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

CREATE TABLE IF NOT EXISTS bus_routes (
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

CREATE TABLE IF NOT EXISTS student_transport_assignments (
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
  CONSTRAINT fk_transport_route FOREIGN KEY (route_id) REFERENCES bus_routes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bus_pickup_logs (
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

CREATE TABLE IF NOT EXISTS bus_payment_collections (
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

CREATE TABLE IF NOT EXISTS fee_reminder_jobs (
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
