# Silver Shine

A small farm bookkeeping app for egg production and expenses.

---

## Project overview

- Frontend: React (Vite + TailwindCSS)
- Backend: Node + Express, packaged to run as a local server or as a Vercel serverless API using `serverless-http`
- Exports / downloads: cleaned XLSX files for egg production and expenses

---

## Repository structure

- /client — React frontend (Vite)
- /server — Express backend API
- /api/index.js — Vercel serverless handler (exports handler for server)
- `egg_production_cleaned.xlsx`, `expenses_cleaned.xlsx` — data files (expected at repository root)

---

## Requirements 💡

- Node.js (16+ recommended)
- npm (or yarn/pnpm)
- PostgreSQL if you use the API features that write to DB

---

## Local development 

1. Install dependencies

   - Frontend: cd client && npm install
   - Backend: cd server && npm install

2. Run servers

   - Start backend: in a terminal run `cd server && npm run dev`
   - Start frontend: in another terminal run `cd client && npm run dev`

   The backend listens on port 8080 by default; frontend (Vite) runs on 5173/5174.

3. API base path

   - Locally the backend is mounted with prefix `/api` (e.g. `http://localhost:8080/api/`)
   - On Vercel the serverless function is mounted at `/api` by default; the server code detects `process.env.VERCEL` and omits the extra prefix where necessary.

---

## Build & Deploy 

- Frontend build: `cd client && npm run build`
- Backend production: `cd server && npm run start`

If deploying to Vercel: keep `api/index.js` (exports the server via `serverless-http`) at the repository root (Vercel looks for `api` folder). The server code is already compatible with Vercel serverless deployment.

---

## Environment variables (server)

Create a `.env` file in `/server` (or set env vars in your host):

- `DATABASE_URL` — Postgres connection string (if using DB)
- `JWT_SECRET` — secret used to sign JSON web tokens
- `PORT` — optional, defaults to 8080

---

## Downloading the cleaned Excel files (known issue + troubleshooting) 

The app serves two cleaned spreadsheets for download:
- `egg_production_cleaned.xlsx`
- `expenses_cleaned.xlsx`

These are expected at the repository root. If the `/api/records/download?type=egg` (or `type=expense`) endpoint returns `404` with `{"message":"No data file found"}`, try the following:

1. Confirm the files exist at the repo root:
   - `ls -la egg_production_cleaned.xlsx expenses_cleaned.xlsx`

2. Ensure the running server process is the updated one (restart it):
   - Kill any stale node server (`ps aux | grep server.js`) and start again: `cd server && npm run dev`.

3. Validate that the server process can see the files using a quick Node check from the repo root:

   node -e "const fs=require('fs'); console.log('egg ok', fs.existsSync('./egg_production_cleaned.xlsx')); console.log('expenses ok', fs.existsSync('./expenses_cleaned.xlsx'))"

4. Check response headers when requesting the download locally:
   - `curl -I "http://localhost:8080/api/records/download?type=egg"`

5. If the server still returns 404, inspect `server/routes/records.js` which attempts multiple relative paths; add diagnostic logging there to see which candidate paths were checked.


Contributing

- Use branches for features/fixes
- Keep frontend and backend changes scoped to `client/` and `server/`



