# Vercel Website Guide

## Recommended Deployment Split

- `apps/web` -> deploy on **Vercel**
- `apps/api` -> deploy on **Render / Railway / VPS / Docker host**
- `apps/desktop` -> use the same deployed API URL, or local office API URL

This ERP backend should **not** be treated as a Vercel serverless backend because it includes:

- file uploads
- report generation
- daily backups
- long-running office workflows
- MySQL connections for an ERP-style API

## Vercel Project Setup

Official Vercel docs say monorepos can be imported as separate projects per directory, so create a Vercel project for `apps/web` as the website app:

- Vercel monorepos: [Using Monorepos](https://vercel.com/docs/monorepos)
- Vercel project config: [Project settings](https://vercel.com/docs/project-configuration/project-settings)

### Import Settings

- Root Directory: `apps/web`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Node.js Version: `20.x` or newer

## Required Vercel Environment Variable

Set this in the Vercel project:

```env
VITE_API_BASE_URL=https://your-api-domain.com/api
```

Use the deployed backend URL from Render, Railway, or your VPS. Do not leave this as a placeholder for production.

Vercel environment variable behavior is documented here:

- [Environment variables](https://vercel.com/docs/environment-variables)

After changing the variable, redeploy the site.

## SPA Routing

The file [apps/web/vercel.json](D:\BSB\BSB International School WEB\apps\web\vercel.json) adds a rewrite for client-side React routes while leaving `/api/*` free for backend/proxy use.

Vercel rewrite behavior is documented here:

- [Rewrites on Vercel](https://vercel.com/docs/rewrites)

## Preview Deployments

The API backend now supports:

- local website origin
- local desktop origin
- optional Vercel preview origins via `ALLOW_VERCEL_PREVIEWS=true`

For production APIs, add the main Vercel domain to `APP_ORIGINS`.

## Pre-Deploy Check

Run this from the repository root before connecting Vercel:

```powershell
npm.cmd --workspace apps/web run build
```

If it builds locally, Vercel should build with the settings above.
