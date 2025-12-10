# AgriMarket Analytics Dashboard

## 📖 Project Overview
AgriMarket Analytics Dashboard is an interactive web application that transforms raw agricultural commodity data into clear, insightful visualisations.  
Key capabilities include:

- **Real-time price tracking** across 100+ commodities and 25+ markets.
- **Interactive analytics** (pie, line, bar, heat-map & candlestick charts) powered by Plotly.js.
- **AI-driven forecasts** with seasonality and confidence-interval visualisations.
- **Responsive design** inspired by Airbnb’s aesthetics – works seamlessly on desktop, tablet & mobile.
- **Theme switching** (Light ⬌ Dark) and **mobile chart toggles** for space-saving views.

The goal is to help farmers, traders, researchers and policy-makers make data-driven decisions quickly.

---

## 🏗️ Tech Stack
| Layer | Technology | Notes |
|-------|------------|-------|
| **Frontend** | **HTML 5**, **CSS 3** (custom + CSS variables), **JavaScript (ES6)** | No framework – lightweight vanilla stack for maximum portability. |
| **Charting** | **Plotly.js 2.x** | Rich, interactive charts with theme awareness. |
| **Backend (API)** | **FastAPI (Python 3.10)** | Exposes REST endpoints on `http://localhost:5000/api/*` – provides all data & ML forecasts. |
| **AI / Forecasting** | **Prophet & scikit-learn** | Runs server-side (not included in this folder). |
| **Deployment** | **Static hosting** (Vercel / Netlify) | Pure-frontend; no build step required. |

> **Note** – this folder contains **only the static frontend**.  Backend code lives in `../backend/`.

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
$ git clone https://github.com/<your-org>/agrimarket.git
$ cd agrimarket
```

### 2. Start the backend (FastAPI)
```bash
# in a new terminal
$ cd backend
$ python -m venv venv && source venv/bin/activate
$ pip install -r requirements.txt
$ uvicorn main:app --reload --port 5000
```
- Backend is now live at **`http://localhost:5000`**.

### 3. Start the frontend
```bash
# from repository root OR ./deployment/frontend
$ cd deployment/frontend
$ ./start-frontend.sh
#   └─> serves the site on http://localhost:8000
```
`start-frontend.sh` is a thin wrapper around **`python -m http.server 8000`**.

### 4. Open the dashboard
Browse to **`http://localhost:8000`**  →  you should see live price data.  
(If the backend is down, the UI falls back to mock data.)

### 5. Explore features
- Use the sidebar filters to slice data by state, market & commodity.  
- Switch themes with the sun/moon button.  
- On mobile, collapse any chart via the "Hide Chart" toggle.  
- Click **“Show Price Forecast”** to open the AI-powered predictions modal.

---

## 🌐 Production Deployment
The dashboard is continuously deployed as a static site. 

#### Note - The site is currently not live and will be made live soon

> Replace with your actual URL if you fork the project.

Deployment steps (Vercel example):
1. Import the repository in Vercel.
2. Set **Framework = “Other”** (no build).  
3. Output directory → `deployment/frontend`.
4. Click **Deploy**.  Done!

Netlify or any static host works the same way.

---

## 🛠️ Customising & Contributing
1. **Update colours / spacing** – edit `styles.css` (CSS variables at the top).  
2. **Add new charts** – create a new `<div class="chart-content">` in `index.html` and a matching `render*Chart()` in `app.js`.
3. **Improve forecasts** – enhance the ML models in `backend/forecasting.py` and expose new endpoints.
4. **Raise issues / PRs** – we welcome community contributions!

---

## 📝 File Structure (frontend)
```
deployment/frontend/
├── app.js              # All interactive logic & Plotly rendering
├── index.html          # Single-page UI
├── styles.css          # Design system & responsive rules
├── start-frontend.sh   # Helper to launch a local dev server
└── README.md           # ← you are here
```

Enjoy analysing agri-commodity markets! 🌾📈
