ALTER TABLE admission_applications
  ADD COLUMN form_payload JSON NULL AFTER photo_url,
  ADD COLUMN submitted_by BIGINT NULL AFTER form_payload,
  ADD CONSTRAINT fk_admission_submitter FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE SET NULL;
