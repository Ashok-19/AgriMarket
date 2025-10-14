# AgriMarket Dashboard - Simple Frontend

A clean HTML/JS/CSS frontend for the Agricultural Market Dashboard. **No npm, no build tools, no package installation required!**

## 📁 Files

- **`index.html`** - Main dashboard page
- **`app.js`** - JavaScript for API calls and chart rendering
- **`styles.css`** - Styling and animations
- **`start-frontend.sh`** - Quick start script

## 🚀 Quick Start

### Prerequisites

- Python 3 (already installed on your system)
- Backend API running on port 5000

### Start the Dashboard

**Step 1: Start Backend (in one terminal)**
```bash
cd /home/nnmax/Desktop/eda-final/web/api-server
./start-backend.sh
```

**Step 2: Start Frontend (in another terminal)**
```bash
cd /home/nnmax/Desktop/eda-final/web/frontend
./start-frontend.sh
```

**Step 3: Open in Browser**
```
http://localhost:8000
```

## 🔧 Configuration

Edit `app.js` line 2 to change the backend URL:

```javascript
const API_BASE_URL = 'http://localhost:5000'; // Flask backend URL
```

Set `USE_MOCK_DATA = true` to test without backend.

## 📊 Features

- **Real-time Data**: Connects to Flask API for live market data
- **Interactive Charts**: Powered by Plotly.js
- **Dark Mode**: Toggle between light and dark themes
- **Price Forecasting**: AI-powered predictions for commodities
- **Responsive Design**: Works on desktop, tablet, and mobile
- **No Dependencies**: Pure HTML/JS/CSS (except Plotly.js via CDN)

## 🌐 API Endpoints Used

| Endpoint | Description |
|----------|-------------|
| `/api/kpis` | KPIs (markets, price, commodities) |
| `/api/commodities-by-count` | Top 10 commodities by count |
| `/api/price-by-year` | Price trends over years |
| `/api/commodities-by-price` | Top 10 by price |
| `/api/forecast-data/<commodity>` | Forecast data |

## 🐛 Troubleshooting

### CORS Errors in Browser Console

**Cause**: Backend not configured for CORS or not running

**Solution**: 
1. Ensure backend is running on port 5000
2. Flask backend already has CORS enabled

### Charts Not Loading

**Cause**: Plotly.js not loading from CDN

**Solution**: Check internet connection (Plotly.js loads from CDN)

### "Failed to fetch" Errors

**Cause**: Backend not running or wrong URL

**Solution**:
```bash
# Test backend
curl http://localhost:5000/api/health

# If not responding, restart backend
cd /home/nnmax/Desktop/eda-final/web/api-server
./start-backend.sh
```

## 🎨 Customization

### Change Colors

Edit `styles.css` - look for CSS variables at the top:
```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    ...
}
```

### Add New Charts

1. Add a `<div>` in `index.html` with an ID
2. Create a render function in `app.js`
3. Call your function in `loadData()`

## 📦 No Build Required!

This frontend uses:
- ✅ Plain HTML/CSS/JavaScript
- ✅ Plotly.js via CDN
- ✅ No npm packages
- ✅ No build process
- ✅ No node_modules

Just edit and refresh!

## 🔒 Production Deployment

For production:
1. Update `API_BASE_URL` to your production API URL
2. Serve static files with nginx or any web server
3. Enable HTTPS
4. Consider minifying CSS/JS

## 📝 Notes

- Frontend runs on port 8000 (configurable in start script)
- Backend must run on port 5000
- Uses Python's built-in HTTP server (perfect for development)
- All API calls use `fetch()` - modern browsers only
