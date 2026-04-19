# Werkstudent Job Tracker

A clean, dark-mode Next.js app to track your Werkstudent job applications — title, company, link, status, salary, location, and notes.

## Features
- Add / delete applications
- Update status inline (Applied → Interview → Offer / Rejected)
- Filter by status & search
- Stats overview at the top
- Persistent storage via SQLite (local) or Turso (Vercel)

---

## Local development

```bash
npm install
npm run dev
# Open http://localhost:3000
```

Data is stored in `jobs.db` (SQLite file, created automatically).

---

## Deploy to Vercel

Vercel's serverless functions can't use a local SQLite file between requests, so you need **Turso** — a free hosted SQLite-compatible database.

### 1. Create a Turso database (free)

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Log in
turso auth login

# Create a database
turso db create werkstudent-tracker

# Get the URL
turso db show werkstudent-tracker --url

# Create an auth token
turso db tokens create werkstudent-tracker
```

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/werkstudent-tracker.git
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo
2. In **Environment Variables**, add:
   - `TURSO_DATABASE_URL` → your Turso DB URL (e.g. `libsql://werkstudent-tracker-xxx.turso.io`)
   - `TURSO_AUTH_TOKEN` → your Turso auth token
3. Click **Deploy** — done!

---

## Tech stack

- **Next.js 14** (App Router)
- **Turso / libSQL** (SQLite, works locally and on Vercel)
- **Tailwind CSS**
- **TypeScript**
