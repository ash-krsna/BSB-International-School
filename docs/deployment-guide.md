# Cloud Deployment Guide

## Recommended Hosting

- API: Render / Railway / VPS / Docker host
- Website: Vercel
- Database: MySQL cloud instance such as PlanetScale, Amazon RDS, Azure Database for MySQL, or Hostinger Cloud MySQL
- Files: Cloudinary, S3, or secure server file storage

## Architecture Note

- Deploy the React website to Vercel.
- Deploy the Express API to Render, Railway, or a VPS.
- Point both the website and desktop ERP to the same cloud API and MySQL database.
- Do not deploy this Express ERP backend to Vercel serverless if you want stable uploads, backups, and long-running office workflows.

## Backend Deployment

1. Deploy `apps/api`, or use the root [render.yaml](D:\BSB\BSB International School WEB\render.yaml) blueprint on Render
2. Add environment variables from `apps/api/.env.example`
3. Point the MySQL connection at the cloud database
4. Configure upload storage and notification credentials
5. For website enquiries, set `CONTACT_RECEIVER_EMAIL=akash.gita.bhagwat@gmail.com`
6. Configure SMTP values so the contact form can email the school office inbox
7. Add your Vercel domain to `APP_ORIGINS`, for example `https://bsb-international-school.vercel.app`
8. Import [schema.sql](D:\BSB\BSB International School WEB\database\schema.sql) for fresh installs or run [2026-05-19-erp-upgrade.sql](D:\BSB\BSB International School WEB\database\migrations\2026-05-19-erp-upgrade.sql) for upgrades

### Render Settings

- Root Directory: `apps/api`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Node.js Version: `20.x` or newer

Required production values include `APP_ORIGINS`, `MYSQL_HOST`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `UPLOAD_BASE_URL`, `JWT_SECRET`, and the SMTP/contact variables if contact or admission emails should be sent.

For admission emails, set:

```env
ADMISSION_RECEIVER_EMAIL=akash.gita.bhagwat@gmail.com
CONTACT_RECEIVER_EMAIL=akash.gita.bhagwat@gmail.com
```

SMTP is required for real email delivery. For Gmail, use an app password in `SMTP_PASS`.

## Website Deployment

1. Deploy `apps/web` to Vercel, or deploy from the repository root using the root [vercel.json](D:\BSB\BSB International School WEB\vercel.json)
2. Set `VITE_API_BASE_URL` to the deployed backend URL
3. Redeploy after environment setup
4. See [vercel-website-guide.md](D:\BSB\BSB International School WEB\docs\vercel-website-guide.md)
5. Staff can use the hidden route `/campus-connect`, but do not place that route in public navigation or marketing copy

## Desktop Deployment

1. Build the backend and website first
2. Configure production API base URL in `apps/desktop/.env.production`
3. Build Electron installer using `electron-builder`

## Security Checklist

- Enforce HTTPS
- Use strong JWT secret
- Rotate admin passwords
- Share the hidden staff route only with school staff
- Restrict upload types and size
- Run daily database backups
- Enable database IP/network restrictions
- Review the API surface in [api-reference.md](D:\BSB\BSB International School WEB\docs\api-reference.md)

## Final Build Checks

Run these before cloud deployment:

```powershell
npm.cmd --workspace apps/web run build
npm.cmd --workspace apps/api run build
```
