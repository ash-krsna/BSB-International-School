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

### Upload Storage

For production admission photos, documents, gallery images, homework files, and student media, set these Cloudinary variables on the backend host:

```text
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=bsb-international-school
DELETE_LOCAL_AFTER_CLOUD_UPLOAD=true
```

If these variables are empty, the API falls back to local `/uploads`, which is useful for localhost but not recommended for Render/Railway production because container storage can be temporary.

### Render Settings

- Root Directory: `apps/api`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Node.js Version: `20.x` or newer

Required production values include `APP_ORIGINS`, `MYSQL_HOST`, `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `JWT_SECRET`, Cloudinary variables for file uploads, and the SMTP/contact variables if contact emails should be sent.

Admission enquiries and staff admissions are saved through the API into MySQL. Contact and enquiry email notifications should use the SMTP/contact variables above.

### Temporary Vercel API Fallback

The repository includes lightweight `/api/*` Vercel fallback functions only for emergency website demos before the real backend is connected. For production, prefer `VITE_API_BASE_URL=https://your-backend/api`.

If you intentionally use the fallback, set these Vercel environment variables. Without them, fallback staff login is disabled in production:

```text
VERCEL_FALLBACK_ADMIN_IDENTIFIER=your_private_staff_username
VERCEL_FALLBACK_ADMIN_PASSWORD=your_strong_private_password
VERCEL_FALLBACK_SESSION_TOKEN=generate_a_long_random_token
```

Do not store real admissions in the fallback because serverless memory is temporary. Real data belongs in MySQL and files belong in Cloudinary.

## Website Deployment

1. Deploy `apps/web` to Vercel, or deploy from the repository root using the root [vercel.json](D:\BSB\BSB International School WEB\vercel.json)
2. Set `VITE_API_BASE_URL` to the deployed backend URL for gallery, notices, results, portal, and contact features
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
- Keep staff credentials in environment variables only
- Confirm Vercel security headers are active after deployment
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
