# Localhost Guide

## Backend

- Workspace: `apps/api`
- Dev command: `npm run dev:api`
- Health endpoint: `GET /health`
- Optional Docker stack: `docker compose -f docker-compose.local.yml up -d`
- DB admin UI: `http://localhost:8080`

## Website

- Workspace: `apps/web`
- Dev command: `npm run dev:web`
- Uses `VITE_API_BASE_URL`
- Hidden staff route: `http://localhost:5173/campus-connect`
- Teacher admission route: `http://localhost:5173/teacher-admissions`

## Desktop ERP

- Workspace: `apps/desktop`
- Dev command: `npm run dev:desktop`
- Electron renderer also uses `VITE_API_BASE_URL`
- For local office use, keep it pointing to `http://localhost:4000/api`

## Login Roles

Use seeded or manually created users for:

- Super Admin
- Admin Staff
- Principal
- Teacher
- Accountant
- Parent
- Student

Only staff-role users should use the hidden website staff page. Parents and students should keep using the regular portal at `/portal`.
