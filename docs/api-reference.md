# API Reference

Base URL:

- Local: `http://localhost:4000/api`
- Production: `https://your-backend-domain.com/api`

## Public APIs

- `POST /public/admissions`
  Online admission with student photo and documents.
- `POST /public/enquiries`
  Saves enquiry, emails school office, and can notify via WhatsApp.
- `GET /public/gallery`
  Published gallery feed for website visitors.
- `GET /public/notices`
  Published school notices.
- `GET /public/results?rollNo=...&dob=YYYY-MM-DD`
  Limited public result lookup.

## Auth

- `POST /auth/login`
  Login for staff, parent, and student roles.
- `GET /auth/me`
  Returns current authenticated user and modules.

## Dashboard

- `GET /dashboard/summary`
  ERP summary metrics.
- `GET /dashboard/analytics`
  Class strength, weekly collection, attendance trend, exam performance, and admission breakdown.

## Students

- `GET /students`
  Search and filter by name, student ID, roll number, Aadhaar, parent phone, class, status, fee pending, low attendance, or admission year.
- `POST /students`
  Create full student profile with optional portal credentials and uploads.
- `PATCH /students/:id`
  Update advanced student profile details and uploads.
- `GET /students/:id`
  Full student profile with history, documents, notes, achievements, fees, attendance, and results.
- `GET /students/:id/dashboard`
  Student profile dashboard payload for portals and ERP views.
- `POST /students/:id/documents`
  Upload additional documents.
- `POST /students/:id/notes`
  Add teacher remarks or behavior notes.
- `POST /students/:id/achievements`
  Add awards or achievements.
- `POST /students/promotions`
  Promote students to the next class while preserving permanent history.
- `GET /students/:id/id-card`
  Printable PDF student ID card with QR payload.

## Admissions

- `GET /admissions`
  List admission applications.
- `PATCH /admissions/:id/review`
  Review and update admission status.

## Fees

- `GET /fees/ledger`
  Fee overview for all assigned students.
- `GET /fees/student/:studentId`
  Student-wise installment ledger.
- `POST /fees/assignments`
  Assign fee structure and installments to a student.
- `POST /fees/payments`
  Record payment and generate receipt reference.

## Results

- `POST /results/exams`
  Create exam shell.
- `POST /results/upload`
  Bulk result upload.
- `GET /results/student/:studentId`
  Detailed subject-wise result rows.
- `GET /results/student/:studentId/summary`
  Growth chart summary and latest result view.
- `POST /results/publish-notice`
  Send published-result alerts.

## Attendance

- `POST /attendance/mark`
  Create or update daily attendance session.
- `GET /attendance/student/:studentId`
  Student attendance history.

## Content

- `POST /content/homework`
  Teacher homework upload.
- `GET /content/homework`
  Homework listing.
- `POST /content/notices`
  Publish notice.
- `POST /content/gallery`
  Publish gallery item.

## Communications

- `POST /communications/broadcast`
  Send class-wise or global SMS, WhatsApp, and email campaigns.
- `GET /communications/campaigns`
  List recent message campaigns and delivery counts.

## Reports

- `GET /reports/fees-pending?format=json|csv|xlsx`
- `GET /reports/daily-collection?format=json|csv|xlsx`
- `GET /reports/attendance?format=json|csv|xlsx`
- `GET /reports/exam-performance?format=json|csv|xlsx`
- `GET /reports/admissions?format=json|csv|xlsx`

## System

- `POST /system/backup`
  Manual backup trigger for super admin.
