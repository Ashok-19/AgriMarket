# 🚀 Vercel Deployment Guide - AgriMarket Analytics

## 📋 Overview

This guide explains how to deploy the AgriMarket Analytics Dashboard to Vercel with data hosted on Dropbox.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Vercel Deployment                     │
│                                                          │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │   Frontend       │         │   Backend API    │     │
│  │   (Static)       │────────▶│   (Serverless)   │     │
│  │   /frontend/     │         │   /api/          │     │
│  └──────────────────┘         └──────────────────┘     │
│                                        │                │
└────────────────────────────────────────┼────────────────┘
                                         │
                                         ▼
                              ┌──────────────────┐
                              │  Dropbox URLs    │
                              │  (Environment    │
                              │   Variables)     │
                              └──────────────────┘
                                         │
                    ┌────────────────────┴────────────────────┐
                    │                                         │
                    ▼                                         ▼
          ┌─────────────────┐                    ┌─────────────────┐
          │  data.db        │                    │ predictions.db  │
          │  (Market Data)  │                    │ (Forecasts)     │
          └─────────────────┘                    └─────────────────┘
```

---

## 🔧 Setup Instructions

### Step 1: Prepare Dropbox Links

1. **Upload databases to Dropbox:**
   - Upload `data.db` (market data)
   - Upload `predictions.db` (forecast data)

2. **Get shareable links:**
   - Right-click each file → Share → Create link
   - Copy the links (they look like: `https://www.dropbox.com/s/xxxxx/data.db?dl=0`)

3. **Important:** The backend automatically converts these to direct download URLs by:
   - Replacing `www.dropbox.com` with `dl.dropboxusercontent.com`
   - Removing `?dl=0` parameter

### Step 2: Configure Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Add the following variables:

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `DATA_DB_URL` | `https://www.dropbox.com/s/xxxxx/data.db?dl=0` | Market data database URL |
| `PREDICTIONS_DB_URL` | `https://www.dropbox.com/s/xxxxx/predictions.db?dl=0` | Predictions database URL |
| `FLASK_ENV` | `production` | Flask environment |

4. **Apply to:** All environments (Production, Preview, Development)

### Step 3: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Navigate to deployment folder
cd /home/nnmax/Desktop/eda-final/deployment

# Deploy
vercel --prod
```

#### Option B: Using Git Integration

1. Push your code to GitHub/GitLab/Bitbucket
2. Import project in Vercel dashboard
3. Set **Root Directory** to `deployment/`
4. Deploy

---

## 📁 Project Structure

```
deployment/
├── api/
│   ├── app.py              # Flask backend (serverless function)
│   └── requirements.txt    # Python dependencies
├── frontend/
│   ├── index.html          # Main HTML
│   ├── app.js              # JavaScript (auto-detects production)
│   └── styles.css          # Styling
├── vercel.json             # Vercel configuration
└── README.md               # Documentation
```

---

## 🔍 How It Works

### Frontend (app.js)

The frontend automatically detects the environment:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'  // Development: use local backend
    : '';                       // Production: use same origin (Vercel routes /api)
```

**Development:** Calls `http://localhost:5000/api/...`  
**Production:** Calls `/api/...` (Vercel routes to serverless function)

### Backend (app.py)

The backend checks for environment variables:

```python
# Get database URLs from environment variables
DATA_DB_URL = os.environ.get('DATA_DB_URL', '')
PREDICTIONS_DB_URL = os.environ.get('PREDICTIONS_DB_URL', '')

def get_data():
    if DATA_DB_URL:
        # Production: Fetch from Dropbox
        download_url = DATA_DB_URL.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '')
        response = requests.get(download_url, timeout=30)
        # Load into in-memory SQLite database
    else:
        # Development: Use local database
        conn = sqlite3.connect(DB_PATH)
```

**Development:** Uses local `DB/data.db` and `DB/predictions.db`  
**Production:** Fetches from Dropbox URLs and loads into memory

---

## 🧪 Testing

### Local Development

1. **Start backend:**
   ```bash
   cd /home/nnmax/Desktop/eda-final/web/api-server
   bash start-backend.sh
   ```

2. **Start frontend:**
   ```bash
   cd /home/nnmax/Desktop/eda-final/web/frontend
   bash start-frontend.sh
   ```

3. **Access:** `http://localhost:8000`

### Production Testing

1. **Deploy to Vercel**
2. **Access:** `https://your-project.vercel.app`
3. **Check:**
   - Frontend loads correctly
   - Charts display data
   - All tabs work
   - Predictions load

---

## 🐛 Troubleshooting

### Issue: "No data available" on production

**Cause:** Environment variables not set or incorrect Dropbox URLs

**Solution:**
1. Verify environment variables in Vercel dashboard
2. Check Dropbox links are accessible
3. View Vercel function logs for errors

### Issue: Charts not loading

**Cause:** API calls failing

**Solution:**
1. Open browser DevTools → Network tab
2. Check if `/api/...` requests are failing
3. View response errors
4. Check Vercel function logs

### Issue: Slow initial load

**Cause:** Backend fetching databases from Dropbox on cold start

**Solution:**
- This is expected behavior (serverless cold start)
- First request may take 5-10 seconds
- Subsequent requests are faster
- Consider upgrading to Vercel Pro for faster cold starts

### Issue: Database too large

**Cause:** Vercel serverless functions have memory limits

**Solution:**
1. Reduce database size by filtering data
2. Use Vercel Pro (higher limits)
3. Consider alternative hosting (Railway, Render) for backend

---

## 📊 Performance Optimization

### 1. Database Caching

The backend loads databases into memory on startup. They persist during the function's lifetime (warm starts).

### 2. Compression

Ensure Dropbox files are as small as possible:
- Remove unnecessary columns
- Filter to relevant date ranges
- Use SQLite's VACUUM command

### 3. CDN

Vercel automatically serves frontend assets via CDN for fast global access.

---

## 🔒 Security Best Practices

1. **Never commit database URLs to Git**
   - Use environment variables only
   - Add `.env` to `.gitignore`

2. **Use Dropbox private links**
   - Don't use public folders
   - Regenerate links if exposed

3. **CORS Configuration**
   - Backend has CORS enabled for all origins
   - Restrict in production if needed

---

## 📈 Monitoring

### Vercel Analytics

1. Enable in Vercel dashboard
2. Monitor:
   - Page views
   - API calls
   - Function execution time
   - Errors

### Function Logs

View real-time logs:
```bash
vercel logs --follow
```

---

## 🔄 Updating Deployment

### Update Code

```bash
cd /home/nnmax/Desktop/eda-final/deployment
git add .
git commit -m "Update dashboard"
git push
```

Vercel auto-deploys on push (if Git integration enabled).

### Update Data

1. Upload new database files to Dropbox
2. Update environment variables with new URLs (if changed)
3. Redeploy or wait for next cold start

---

## 💡 Tips

1. **Test locally first** before deploying
2. **Use Preview Deployments** for testing changes
3. **Monitor function execution time** to stay within limits
4. **Keep databases optimized** for faster loads
5. **Use Vercel CLI** for quick deployments

---

## 📞 Support

**Vercel Issues:**
- Check [Vercel Status](https://www.vercel-status.com/)
- View [Vercel Docs](https://vercel.com/docs)

**Application Issues:**
- Check browser console
- View Vercel function logs
- Test API endpoints directly

---

## ✅ Deployment Checklist

- [ ] Databases uploaded to Dropbox
- [ ] Dropbox URLs added to Vercel environment variables
- [ ] `vercel.json` configured correctly
- [ ] `requirements.txt` includes all dependencies
- [ ] Frontend `app.js` uses dynamic API_BASE_URL
- [ ] Backend `app.py` fetches from Dropbox URLs
- [ ] Local testing completed
- [ ] Deployed to Vercel
- [ ] Production testing completed
- [ ] All charts loading correctly
- [ ] Predictions working
- [ ] Dark/Light mode working

---

**Deployment URL:** https://agri-market-visualisation.vercel.app/

**Status:** ✅ Live and working with Dropbox-hosted databases
