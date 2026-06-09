# Online Admission Database Setup

Use this when admissions are already open and the school needs online form data saved immediately.

## 1. Create A MySQL Cloud Database

Use any MySQL provider such as Railway, Aiven, PlanetScale, DigitalOcean, or AWS RDS.

Create one database named:

```txt
bsb_erp
```

Copy these values from the provider:

```txt
MYSQL_HOST
MYSQL_PORT
MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
```

## 2. Import School Tables

For a fresh empty MySQL cloud database, run this from the repository root after setting the backend environment variables:

```bash
npm run db:setup
```

This creates the full schema, seeds roles/classes/Akash/Sarika/quiz data, and marks included migrations as applied.

For an existing database that already has tables, run:

```bash
npm run db:migrate
npm run db:seed
```

Check the connection at any time:

```bash
npm run db:check
```

The seed creates the current academic year and classes from Nursery to Class 5.
The migration `2026-06-08-teacher-admission-access.sql` creates the teacher admission login for Sarika Bankar.

## 3. Deploy The API

Deploy the API on Render or Railway and add the environment variables from `.env.example`.

Important values:

```txt
APP_ORIGINS=https://bsb-international-school.vercel.app
CONTACT_RECEIVER_EMAIL=akash.gita.bhagwat@gmail.com
UPLOAD_BASE_URL=https://your-api-service-url
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLOUDINARY_FOLDER=bsb-international-school
DELETE_LOCAL_AFTER_CLOUD_UPLOAD=true
```

## 4. Connect Website To API

On Vercel, set:

```txt
VITE_API_BASE_URL=https://your-api-service-url/api
```

Redeploy the website.

## 4A. Teacher Admission Access

Teachers can open the separate teacher admission route and fill the official admission form after login:

```txt
/teacher-admissions
```

Sarika Bankar's teacher login is created by the seed/migration:

```txt
Username: Sarika_
Password: SarikaBankar
```

This login can save confirmed admissions, upload student photos/documents, and download the combined admission Excel register.

Parent confirmation messages are sent through the backend notification service. Set `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID` for SMS, or Twilio WhatsApp variables for WhatsApp. If keys are not configured, messages are safely logged as queued in `notification_logs`.

## 5. Admission Storage

Admission text data is saved in the MySQL cloud database:

```txt
admission_applications
student_documents
```

Photos and document files are uploaded to Cloudinary in production. MySQL stores the returned file URL in:

```txt
admission_applications.photo_url
student_documents.file_url
```

If Cloudinary variables are empty, files fall back to local `apps/api/uploads/admissions`, which is only suitable for localhost testing because cloud host disk storage can be temporary.

The admin dashboard can read admission entries from:

```txt
GET /api/admissions
```

The staff Excel register downloads from:

```txt
GET /api/admissions/export
```

That Excel contains the combined admission/student office data and Yes/No columns for photo and document submission status.

## 6. Backend Health Check

After deploying the API, open:

```txt
https://your-api-service-url/api/health
```

It should say the API is live and connected to MySQL. It also reports whether the admission, document, and user tables are ready, plus whether Cloudinary, SMS/WhatsApp, and email are configured.
