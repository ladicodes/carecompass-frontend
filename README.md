# CareCompass Frontend

This repo contains a Next.js (App Router) frontend that follows `agent.md` and calls the CareCompass FastAPI backend.

## Run locally

### 1) Start the backend API

From your backend repo root (where `backend_api/main.py` lives):

```bash
uvicorn backend_api.main:app --reload
```

### 2) Configure the frontend

```bash
cd frontend
copy .env.example .env.local
```

Edit `.env.local` if your API is not at `http://127.0.0.1:8000`.

### 3) Start the UI

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## What’s implemented (per `agent.md`)

- **Chat (Triage)**: `/chat`
  - `POST /triage/analyze`
  - `POST /triage/match_facilities` (handles HTTP 200 with `{ error, status }`)
  - Shows **verbatim disclaimers**, citations table, degraded/warnings banners, and a correlation id debug line.
- **Mission Planner (Policy)**: `/planner`
  - `GET /policy/deserts`
  - `GET /policy/pin-risk/{pin}`
- **Map**: `/map`
  - Uses Leaflet + OSM tiles (no API key)
  - Overlays desert states using lightweight centroid approximations (story-first, as required)

## Notes

- Frontend sends `X-Request-Id` on every request and propagates it across calls.
- No Databricks/Tavily/Twilio secrets live in the browser (FastAPI owns integrations).

