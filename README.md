# AgriMarket Deployment

## Overview

`deployment/` contains the production-ready bundle used for Vercel. The backend is served from `api/` (Flask) and the static frontend lives in `frontend/`.

```text
deployment/
├── api/        # Flask API
├── frontend/   # Static assets
├── DB/         # Empty placeholder; databases downloaded at runtime
├── vercel.json # Routing config
└── README.md   # This guide
```

## Quick Start

- **Clone repo:** `git clone ... && cd deployment`
- **Python deps:** `pip install -r api/requirements.txt`
- **Run locally:** `python api/app.py` then open `frontend/index.html` with any static server (`python -m http.server 8000`).

## Databases

- Databases are **not** committed. Upload `data.db` and `predictions.db` to a host that provides direct download URLs (Dropbox/S3/etc.).
- In production we download to `/tmp/` on each cold start; locally place copies under `deployment/DB/` if you prefer offline development.

## Environment Variables

Set these before deploying:

```env
DATABASE_URL=https://.../data.db
PREDICTIONS_DATABASE_URL=https://.../predictions.db
```

Optional overrides: `DATABASE_PATH`, `PREDICTIONS_DATABASE_PATH`, `FLASK_ENV`.

## Deploy to Vercel

- Push `deployment/` to GitHub.
- In Vercel → **New Project** → import repo.
- Add the environment variables above (Production + Preview).
- Deploy; Vercel downloads databases during the first API invocation.

## Local Notes

- Ensure backend runs on `http://localhost:5000`; the frontend auto-detects this when opened from disk or a local server.
- For clean redeploys or testing, remove cached databases under `/tmp/` (Vercel) or `deployment/DB/` (local).

## Troubleshooting

- **`data_loaded: false`** → check database URLs, confirm they return raw `.db` files.
- **Empty dropdowns** → backend failed to load; review Vercel function logs.
- **CORS/404** → verify `vercel.json` and `API_BASE_URL` in `frontend/app.js`.
