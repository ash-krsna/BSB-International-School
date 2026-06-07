# BSB International School ERP

Production-style monorepo for an integrated **School Management Software + Website ERP System** for **BSB International School**.

## Workspace Structure

```text
apps/
  api/       Node.js + Express + MySQL backend
  web/       React website for parents, students, and public visitors
  desktop/   Electron + React desktop ERP for office staff
database/
  schema.sql
  seed.sql
docs/
  setup-guide.md
  localhost-guide.md
  deployment-guide.md
  api-reference.md
  windows-installer-guide.md
```

## Major Capabilities

- Role-based login for super admin, admin staff, principal, teacher, accountant, parent, and student
- Online admissions with workflow-ready structure
- Student profile management and previous history
- Advanced student profile dashboard, permanent timeline, promotions, notes, achievements, and printable ID cards
- Fees, receipts, discounts, fines, and installment tracking
- Automatic fee reminder job queue and daily reminder scheduler
- School bus routes, driver pickup list, bus payments, and school commission tracking
- Attendance, results, marksheets, homework, notices, and gallery
- Messaging campaigns for SMS, WhatsApp, and email alerts
- Reports for collection, pending fees, attendance, admission, and performance
- MSG91 and Twilio/WhatsApp notification service hooks
- Daily MySQL backup workflow for office use
- Electron desktop shell connected to the same cloud backend and database as the website

## How To Start

1. Read [docs/setup-guide.md](D:\BSB\BSB International School WEB\docs\setup-guide.md)
2. Import [database/schema.sql](D:\BSB\BSB International School WEB\database\schema.sql) into MySQL
3. If upgrading an existing database, run [database/migrations/2026-05-19-erp-upgrade.sql](D:\BSB\BSB International School WEB\database\migrations\2026-05-19-erp-upgrade.sql)
4. Configure `.env` from [apps/api/.env.example](D:\BSB\BSB International School WEB\apps\api\.env.example)
5. Run the API, website, and desktop apps from the root workspace

## Deployment Split

- Vercel website: [docs/vercel-website-guide.md](D:\BSB\BSB International School WEB\docs\vercel-website-guide.md)
- Backend host: [docs/deployment-guide.md](D:\BSB\BSB International School WEB\docs\deployment-guide.md)
- API reference: [docs/api-reference.md](D:\BSB\BSB International School WEB\docs\api-reference.md)
- Local office stack: [docker-compose.local.yml](D:\BSB\BSB International School WEB\docker-compose.local.yml)
- Render backend blueprint: [render.yaml](D:\BSB\BSB International School WEB\render.yaml)

## Admission Data Storage

- Student/admission details save in MySQL table `admission_applications`
- Uploaded document records save in MySQL table `student_documents`
- Photo and document files save in Cloudinary for production
- MySQL stores Cloudinary URLs in `photo_url` and `file_url` fields
- The Vercel fallback API is only for emergency demos and must not be used for real admission records

## Hosting Checklist

1. Deploy `apps/api` to Render/Railway with MySQL and Cloudinary environment variables.
2. Import `database/schema.sql`, `database/seed.sql`, and required files in `database/migrations`.
3. Deploy the website to Vercel from the root config or `apps/web`.
4. Set `VITE_API_BASE_URL=https://your-backend-domain/api` in Vercel.
5. Confirm `/api/health`, `/admissions`, `/campus-connect`, and the Excel export work after deployment.

## Important Note

This repository now contains the **new ERP monorepo** under `apps/`. Older prototype website files are still present in the root for reference, but the production-oriented ERP implementation lives inside the workspace apps and docs added here.
