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

Run the schema first, then seed data:

```bash
mysql -h MYSQL_HOST -P MYSQL_PORT -u MYSQL_USER -p MYSQL_DATABASE < database/schema.sql
mysql -h MYSQL_HOST -P MYSQL_PORT -u MYSQL_USER -p MYSQL_DATABASE < database/seed.sql
```

Then run the migration files in `database/migrations` in date order. These add the newer admission register, transport, quiz, and student media tables used by the hosted website.

The seed creates the current academic year and classes from Nursery to Class 5.

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
