# 🌾 AgriMarket Analytics Dashboard - Deployment Guide

A modern, real-time agricultural commodity market analytics dashboard with AI-powered price forecasting.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [Database Setup](#database-setup)
4. [Deployment Options](#deployment-options)
5. [Vercel Deployment](#vercel-deployment-recommended)
6. [Local Development](#local-development)
7. [Environment Variables](#environment-variables)
8. [Troubleshooting](#troubleshooting)

## 🎯 Overview

This dashboard provides:
- **Real-time Market Data**: Live commodity prices across Indian markets
- **AI Price Forecasting**: Prophet-based predictions for 78 commodities
- **Advanced Analytics**: Seasonality analysis, trend decomposition, confidence intervals
- **Interactive Visualizations**: Dynamic charts with Plotly.js
- **Responsive Design**: Works seamlessly on desktop and mobile

## 📁 Project Structure

```
deployment/
├── api/
│   ├── app.py                 # Flask backend API
│   └── requirements.txt       # Python dependencies
├── frontend/
│   ├── index.html            # Main dashboard HTML
│   ├── app.js                # JavaScript logic
│   └── styles.css            # Styling
├── DB/
│   ├── .gitkeep              # Keep folder in git
│   ├── data.db               # Main market data (NOT in git - 44MB)
│   └── predictions.db        # Forecast data (NOT in git - 46MB)
├── vercel.json               # Vercel configuration
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 💾 Database Setup

### ⚠️ Important: Databases are NOT included in Git

The databases (`data.db` and `predictions.db`) are **44MB and 46MB** respectively, exceeding GitHub's 25MB file limit.

### Option 1: Download from Cloud Storage (Recommended for Deployment)

1. **Upload your databases** to a cloud storage service:
   - **Google Drive**: Upload and get shareable link
   - **Dropbox**: Upload and get direct download link
   - **GitHub Releases**: Attach files to a release
   - **AWS S3**: Upload as public objects
   - **Any CDN**: Host the files

2. **Convert to direct download URLs**:
   
   **Google Drive Example:**
   ```
   Share Link: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   Direct URL: https://drive.google.com/uc?export=download&id=FILE_ID
   ```
   
   **Dropbox Example:**
   ```
   Share Link: https://www.dropbox.com/s/FILE_ID/data.db?dl=0
   Direct URL: https://www.dropbox.com/s/FILE_ID/data.db?dl=1
   ```

3. **Set environment variables** (see below)

### Option 2: Local Development

For local development, copy your database files:

```bash
# Copy your databases to the DB folder
cp /path/to/your/data.db deployment/DB/
cp /path/to/your/predictions.db deployment/DB/
```

## 🚀 Deployment Options

### 🌐 Vercel Deployment (Recommended)

Vercel provides:
- ✅ Free hosting for frontend + serverless API
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Zero configuration deployments
- ✅ Environment variable management

#### Step-by-Step Vercel Deployment:

1. **Prepare Database URLs**
   - Upload `data.db` and `predictions.db` to cloud storage
   - Get direct download URLs
   - Test URLs in browser (should download file)

2. **Install Vercel CLI** (optional but recommended)
   ```bash
   npm install -g vercel
   ```

3. **Push to GitHub**
   ```bash
   cd deployment/
   git init
   git add .
   git commit -m "Initial commit: AgriMarket Dashboard"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/agrimarket-dashboard.git
   git push -u origin main
   ```

4. **Deploy to Vercel**
   
   **Option A: Using Vercel Dashboard (Easiest)**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables (see below)
   - Click "Deploy"

   **Option B: Using Vercel CLI**
   ```bash
   cd deployment/
   vercel
   # Follow prompts
   ```

5. **Configure Environment Variables in Vercel**
   
   In Vercel Dashboard → Project → Settings → Environment Variables:
   
   ```env
   DATABASE_URL=https://your-storage.com/data.db
   PREDICTIONS_DATABASE_URL=https://your-storage.com/predictions.db
   FLASK_ENV=production
   ```

6. **Redeploy**
   - Vercel will automatically redeploy when you push changes
   - Or click "Redeploy" in Vercel dashboard

### 🐳 Alternative: Docker Deployment

Create `Dockerfile` in deployment folder:

```dockerfile
FROM python:3.10-slim

WORKDIR /app

# Copy application
COPY api/ /app/api/
COPY frontend/ /app/frontend/
COPY DB/ /app/DB/

# Install dependencies
RUN pip install --no-cache-dir -r api/requirements.txt

# Expose port
EXPOSE 5000

# Run application
CMD ["python", "api/app.py"]
```

```bash
docker build -t agrimarket-dashboard .
docker run -p 5000:5000 agrimarket-dashboard
```

### 🖥️ Traditional Server Deployment

```bash
# Install Python dependencies
cd deployment/api/
pip install -r requirements.txt

# Run with gunicorn (production)
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# Or use supervisor/systemd for process management
```

## 💻 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/agrimarket-dashboard.git
   cd agrimarket-dashboard
   ```

2. **Place database files**
   ```bash
   # Copy your databases
   mkdir -p DB
   cp /path/to/data.db DB/
   cp /path/to/predictions.db DB/
   ```

3. **Install Python dependencies**
   ```bash
   cd api/
   pip install -r requirements.txt
   ```

4. **Start the backend**
   ```bash
   python app.py
   # Server runs on http://localhost:5000
   ```

5. **Serve the frontend**
   ```bash
   # Option 1: Simple HTTP server
   cd frontend/
   python -m http.server 8000
   
   # Option 2: Live Server (VS Code extension)
   # Right-click index.html → "Open with Live Server"
   
   # Option 3: Any static file server
   npx serve frontend/
   ```

6. **Open dashboard**
   - Navigate to `http://localhost:8000` (or your frontend URL)
   - The frontend will connect to backend at `http://localhost:5000`

## 🔐 Environment Variables

### Required for Vercel Deployment

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Direct download URL for data.db | `https://drive.google.com/uc?export=download&id=...` |
| `PREDICTIONS_DATABASE_URL` | Direct download URL for predictions.db | `https://dropbox.com/s/.../predictions.db?dl=1` |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_PATH` | Custom local path to data.db | `../DB/data.db` |
| `PREDICTIONS_DATABASE_PATH` | Custom local path to predictions.db | `../DB/predictions.db` |
| `FLASK_ENV` | Flask environment | `production` |

### Setting Environment Variables

**Vercel Dashboard:**
1. Go to your project
2. Settings → Environment Variables
3. Add each variable
4. Redeploy

**Local (.env file):**
```bash
# Create .env file in api/ folder
echo "DATABASE_URL=https://..." > api/.env
echo "PREDICTIONS_DATABASE_URL=https://..." >> api/.env

# Install python-dotenv
pip install python-dotenv

# Load in app.py (add at top)
from dotenv import load_dotenv
load_dotenv()
```

## 🔧 Troubleshooting

### Database Download Issues

**Problem:** Database not downloading from URL

**Solutions:**
1. **Test URL directly**: Paste URL in browser - should download file
2. **Check URL permissions**: Ensure file is publicly accessible
3. **Use direct download links**: Not sharing/preview links
4. **Check Vercel logs**: `vercel logs` to see errors

### CORS Issues

**Problem:** Frontend can't connect to backend API

**Solutions:**
1. **Check API URL**: In `frontend/app.js`, verify `API_BASE_URL`
2. **Vercel deployment**: Should auto-handle with routes in `vercel.json`
3. **Local dev**: Ensure CORS is enabled in `app.py` (already done)

### Database Not Loading

**Problem:** API returns empty data

**Solutions:**
1. **Check database paths**: Verify `DB_PATH` and `PREDICTIONS_DB_PATH`
2. **Check database files**: Ensure files exist and are valid SQLite databases
3. **Check permissions**: Ensure read permissions on database files
4. **Check logs**: Look for "✓ Market data loaded" or error messages

### Vercel Build Failures

**Problem:** Deployment fails on Vercel

**Solutions:**
1. **Check `vercel.json`**: Ensure paths are correct
2. **Check `requirements.txt`**: Ensure all dependencies are listed
3. **Check Python version**: Vercel uses Python 3.9 by default
4. **Check file sizes**: Ensure no files >4.5MB in deployment

## 📊 Features Overview

### Main Dashboard
- **KPI Cards**: Total Markets, Avg Price, Commodities Count
- **Commodity Distribution**: Pie chart of top commodities
- **Price Trends**: Line chart showing price evolution
- **Top Commodities**: Bar chart of highest-priced items
- **Dynamic Filters**: State, Market, Commodity, Date range

### Price Forecast Modal
- **AI Predictions**: Prophet-based forecasts for 78 commodities
- **Predicted Price Calendar**: Future price heatmap
- **Seasonality Analysis**: Trend decomposition charts
- **Confidence Intervals**: Forecast uncertainty visualization
- **Price Comparison**: Actual vs. Predicted data

### Historical Analytics
- **Candlestick Chart**: Price volatility analysis
- **Historical Calendar**: Past price heatmap
- **Market-Commodity Filtering**: Dynamic dropdown updates

### UI/UX
- **Dark/Light Mode**: Theme toggle with localStorage
- **Collapsible Sidebar**: Optimized screen space
- **Responsive Design**: Mobile-friendly
- **Loading States**: Smooth data loading
- **Error Handling**: User-friendly error messages

## 🛡️ Security Notes

- **Never commit** `.env` files with secrets
- **Never commit** database files to Git (already in `.gitignore`)
- **Use HTTPS** for database URLs when possible
- **Validate** all user inputs (already implemented)
- **Rate limiting**: Consider adding for production

## 📝 License

This project is provided as-is for educational and commercial use.

## 🤝 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Vercel logs: `vercel logs`
3. Check backend logs in Flask console

---

**Made with ❤️ for Agricultural Market Analytics**
