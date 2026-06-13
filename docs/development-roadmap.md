# BSB International School Development Roadmap

## Audit Snapshot

The project already has a React/Vite public website, Express API, JWT auth, MySQL schema, optional MongoDB connection, admission portals, gallery, notices, feedback, results, quiz, upload handling, health checks, and deployment guides.

The public website had strong admissions, gallery, and learning foundations, but the master prompt still needed clearer public pages for facilities and events, plus homepage sections for leadership messages, latest notices, upcoming events, achievements, and testimonials.

## Phase 1 - Public Website Completion

- Add Facilities and Events public routes.
- Improve homepage with leadership, notices, events, achievements, and testimonials.
- Keep the navbar lightweight and mobile-friendly.
- Preserve existing admission, gallery, portal, quiz, feedback, and backend functionality.

## Phase 2 - Portal Dashboards

- Expand student and parent portal screens behind authenticated routes.
- Connect attendance, homework, fees, results, ID card, and notification summaries.
- Keep teacher admissions separate from admin controls.

## Phase 3 - ERP Operations

- Add richer admin management screens for students, teachers, fees, attendance, exams, transport, gallery, notices, and reports.
- Add PDF exports where missing.
- Add audit logs for critical operations.

## Phase 4 - LMS and Learning

- Add class-wise homework, assignment submissions, notes, teacher-created quizzes, and score dashboards.
- Add safe external educational APIs behind backend endpoints.

## Phase 5 - AI Assistance

- Add AI homework generator, question paper generator, report-card remarks, and study assistant after backend secrets and safety controls are configured.

## Deployment Guardrails

- MySQL remains the primary database for official records.
- MongoDB remains optional secondary storage for flexible logs, media, and activity data.
- Vercel fallback API must not be used for real admissions.
- Backend `/api/health` must show MySQL ready before staff uses live admissions.
