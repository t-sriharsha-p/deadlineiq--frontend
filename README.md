# DeadlineIQ AI - Frontend

React (Vite) single page. Paste a class announcement, and the extracted deadline appears on a date-sorted list.

Talks to the Spring Boot backend (see the `deadlineiq-backend` repo).

## Run locally
Needs Node 18+. Start the backend first (http://localhost:8080).
```
npm install
npm run dev
```
Open http://localhost:5173.

## Configuration
The backend address is read from `VITE_API_URL`. Copy `.env.example` to `.env` to change it. Default: `http://localhost:8080`.

## Deploy (Vercel)
1. Import this repo on vercel.com. Framework preset: **Vite**.
2. Add environment variable `VITE_API_URL` = your Render backend URL (no trailing slash).
3. Deploy. Then put the Vercel URL into the backend's `ALLOWED_ORIGINS`.

(Netlify also works: build command `npm run build`, publish directory `dist`.)

## Known limitations
- No login, search, or filters yet (planned in the project abstract).
- The first request after the backend sleeps takes about a minute (free-tier cold start).
