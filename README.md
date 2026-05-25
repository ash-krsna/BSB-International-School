# BSB International School ERP

Production-style monorepo for an integrated **School Management Software + Website ERP System** for **BSB International School**.

## Workspace Structure

```text
apps/
  api/       Node.js + Express + MySQL backend
  web/       React website for parents, students, and public visitors
  desktop/   Electron + React desktop ERP for office staff
  mobile/    React Native / Expo Android app shell
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
- Android app: [docs/android-play-store-guide.md](D:\BSB\BSB International School WEB\docs\android-play-store-guide.md)
- Local office stack: [docker-compose.local.yml](D:\BSB\BSB International School WEB\docker-compose.local.yml)
- Render backend blueprint: [render.yaml](D:\BSB\BSB International School WEB\render.yaml)

## Important Note

This repository now contains the **new ERP monorepo** under `apps/`. Older prototype website files are still present in the root for reference, but the production-oriented ERP implementation lives inside the workspace apps and docs added here.
