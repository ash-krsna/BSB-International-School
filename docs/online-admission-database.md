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

The seed creates the current academic year and classes from Nursery to Class 5.

## 3. Deploy The API

Deploy the API on Render or Railway and add the environment variables from `.env.example`.

Important values:

```txt
APP_ORIGINS=https://bsb-international-school.vercel.app
CONTACT_RECEIVER_EMAIL=akash.gita.bhagwat@gmail.com
UPLOAD_BASE_URL=https://your-api-service-url
```

## 4. Connect Website To API

On Vercel, set:

```txt
VITE_API_BASE_URL=https://your-api-service-url/api
```

Redeploy the website.

## 5. Admission Storage

Online submissions are saved into:

```txt
admission_applications
student_documents
```

Uploaded photos/documents are stored by the API under:

```txt
uploads/admissions
```

The admin dashboard can read admission entries from:

```txt
GET /api/admissions
```
