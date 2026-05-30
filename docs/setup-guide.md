# Setup Guide

## Requirements

- Node.js 20+
- MySQL 8+
- npm 10+

## Steps

1. Import [schema.sql](D:\BSB\BSB International School WEB\database\schema.sql)
2. Import [seed.sql](D:\BSB\BSB International School WEB\database\seed.sql)
3. If you are upgrading an older local database, run [2026-05-19-erp-upgrade.sql](D:\BSB\BSB International School WEB\database\migrations\2026-05-19-erp-upgrade.sql)
4. For transport, driver portal, and fee reminder features, run [2026-05-25-transport-web.sql](D:\BSB\BSB International School WEB\database\migrations\2026-05-25-transport-web.sql)
5. For Student ID based photo/video sorting, run [2026-05-30-student-media.sql](D:\BSB\BSB International School WEB\database\migrations\2026-05-30-student-media.sql)
6. Copy `apps/api/.env.example` to `apps/api/.env`
7. Copy `apps/web/.env.development.example` to `apps/web/.env.local`
8. Copy `apps/desktop/.env.local.example` to `apps/desktop/.env.local`
9. In `apps/api/.env`, set:

- `CONTACT_RECEIVER_EMAIL=akash.gita.bhagwat@gmail.com`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- For Gmail, use an App Password instead of your normal Gmail password

10. Install dependencies from the root:

```bash
npm install
```

11. Start the backend:

```bash
npm run dev:api
```

12. Start the website:

```bash
npm run dev:web
```

13. Start the desktop software:

```bash
npm run dev:desktop
```

## Default Flow

- API: `http://localhost:4000`
- Web: `http://localhost:5173`
- Desktop: Electron shell pointed to the same API
- Hidden staff login route: `http://localhost:5173/campus-connect`

## Optional Local Database Stack

If you want a ready local MySQL setup:

```bash
docker compose -f docker-compose.local.yml up -d
```

## Staff And Admin Access

- The public website does not show the admin link in the menu.
- School staff can access the hidden staff page directly using `/campus-connect`.
- Only users with staff roles like `super_admin`, `admin_staff`, `principal`, `teacher`, or `accountant` can stay logged in there.
- The main operational admin workflow is still intended for the desktop ERP software.
- Desktop ERP staff login uses the same cloud backend login as the website and parent/student portal.
