# ✅ Deployment Checklist

Use this checklist before and after deployment to ensure everything works correctly.

## 📋 Pre-Deployment Checklist

### 1. Database Preparation
- [ ] Located both database files: `data.db` (44MB) and `predictions.db` (46MB)
- [ ] Databases are valid SQLite files (can open with SQLite browser)
- [ ] Databases contain data (not empty)
- [ ] Uploaded databases to cloud storage (Google Drive, Dropbox, etc.)
- [ ] Obtained direct download URLs (not share/preview links)
- [ ] Tested URLs in browser - files download immediately
- [ ] URLs are publicly accessible (no login required)

### 2. Code Repository
- [ ] Created GitHub repository
- [ ] All files from `deployment/` folder are in repository
- [ ] `.gitignore` is present and excludes `.db` files
- [ ] `vercel.json` is in the root of repository
- [ ] `README.md` is present and describes the project
- [ ] No sensitive data (API keys, passwords) in code

### 3. Configuration Files
- [ ] `vercel.json` exists and routes are configured
- [ ] `.gitignore` excludes database files and env files
- [ ] `api/requirements.txt` lists all Python dependencies
- [ ] `frontend/app.js` has correct API_BASE_URL logic
- [ ] `.env.example` template is provided (don't commit actual .env)

### 4. File Structure Verification
```
deployment/
├── api/
│   ├── app.py ✓
│   └── requirements.txt ✓
├── frontend/
│   ├── index.html ✓
│   ├── app.js ✓
│   └── styles.css ✓
├── DB/
│   └── .gitkeep ✓
├── vercel.json ✓
├── .gitignore ✓
├── package.json ✓
├── README.md ✓
├── QUICK_START.md ✓
├── DATABASE_SETUP.md ✓
└── .env.example ✓
```

## 🚀 Deployment Steps

### 1. Vercel Account Setup
- [ ] Created Vercel account (free tier is fine)
- [ ] Connected GitHub to Vercel
- [ ] Verified email address

### 2. Project Deployment
- [ ] Imported GitHub repository to Vercel
- [ ] Project name is set
- [ ] Build settings are correct:
  - Framework Preset: **Other** (or leave default)
  - Build Command: (leave empty)
  - Output Directory: `frontend`
  - Install Command: (leave empty)

### 3. Environment Variables
- [ ] Added `DATABASE_URL` in Vercel settings
- [ ] Added `PREDICTIONS_DATABASE_URL` in Vercel settings
- [ ] Set `FLASK_ENV=production`
- [ ] Saved all environment variables
- [ ] Applied to Production environment

### 4. First Deployment
- [ ] Clicked "Deploy" button
- [ ] Waited for build to complete (1-3 minutes)
- [ ] Deployment succeeded (no errors in log)
- [ ] Received deployment URL

## 🧪 Post-Deployment Testing

### 1. Backend Health Check
- [ ] Visit: `https://your-app.vercel.app/api/health`
- [ ] Response status is 200 OK
- [ ] JSON response shows:
  ```json
  {
    "status": "healthy",
    "data_loaded": true,
    "predictions_loaded": true,
    "timestamp": "2024-..."
  }
  ```
- [ ] Both `data_loaded` and `predictions_loaded` are `true`

### 2. Frontend Loading
- [ ] Visit: `https://your-app.vercel.app`
- [ ] Page loads without errors
- [ ] No console errors (press F12 to check)
- [ ] Theme toggle works (sun/moon icon)
- [ ] Sidebar toggle works (☰ button)

### 3. Dashboard Functionality
- [ ] **KPI Cards** show actual data (not zeros):
  - [ ] Total Markets > 0
  - [ ] Avg Modal Price > 0
  - [ ] Commodities Count > 0
- [ ] **Pie Chart** renders with commodity data
- [ ] **Line Chart** shows price trends by year
- [ ] **Bar Chart** displays top commodities

### 4. Filters Testing
- [ ] State filter dropdown populates
- [ ] Market filter checkboxes appear
- [ ] Commodity filter checkboxes appear
- [ ] Date range picker works
- [ ] Applying filters updates charts
- [ ] Charts update smoothly without errors

### 5. Price Forecast Modal
- [ ] "Price Forecast" button is visible
- [ ] Clicking button opens modal
- [ ] Modal has close button (X)
- [ ] Market dropdown populates with prediction markets
- [ ] Commodity dropdown populates
- [ ] Selecting commodity loads charts:
  - [ ] Predicted Price Calendar renders
  - [ ] Seasonality & Trend chart renders
  - [ ] Forecast with Confidence Intervals renders
  - [ ] Price Comparison chart renders

### 6. Historical Analytics (Select Market & Commodity section)
- [ ] Market dropdown populates
- [ ] Commodity dropdown updates based on selected market
- [ ] Selecting both loads analytics charts:
  - [ ] Historical Price Volatility (Candlestick) renders
  - [ ] Historical Price Calendar renders

### 7. Theme Switching
- [ ] Light mode displays correctly
- [ ] Dark mode displays correctly
- [ ] Toggle switches between modes instantly
- [ ] Charts update colors on theme change
- [ ] All text is readable in both modes
- [ ] Theme preference persists on page reload

### 8. Responsive Design
- [ ] **Desktop** (>1024px):
  - [ ] Sidebar is visible by default
  - [ ] Toggle button moves sidebar in/out
  - [ ] Charts display properly
- [ ] **Tablet** (768-1024px):
  - [ ] Sidebar collapses
  - [ ] Toggle button works
  - [ ] Layout adjusts appropriately
- [ ] **Mobile** (<768px):
  - [ ] All elements are readable
  - [ ] Charts are scrollable if needed
  - [ ] Buttons are touch-friendly

### 9. KPI Detail Modals
- [ ] Clicking "Total Markets" card opens detail modal
- [ ] Clicking "Avg Modal Price" card opens detail modal
- [ ] Clicking "Commodities Count" card opens detail modal
- [ ] Each modal displays relevant filtered data
- [ ] Close buttons work on all modals

### 10. Performance Check
- [ ] Initial page load < 5 seconds
- [ ] Charts render < 2 seconds
- [ ] Filter updates < 1 second
- [ ] No memory leaks (check DevTools Performance tab)
- [ ] Smooth animations

## 🐛 Common Issues & Fixes

### Issue: KPI Cards Show 0
**Cause:** Database not loaded

**Fix:**
1. Check Vercel logs: `vercel logs --follow`
2. Verify environment variables are set correctly
3. Test database URLs in browser
4. Ensure URLs are direct downloads, not share links

### Issue: Charts Not Rendering
**Cause:** API not responding or CORS error

**Fix:**
1. Open browser console (F12)
2. Check for error messages
3. Verify `vercel.json` routes are correct
4. Check API health endpoint: `/api/health`

### Issue: "Failed to fetch" Errors
**Cause:** API routes not configured properly

**Fix:**
1. Verify `vercel.json` exists in repository root
2. Check routes configuration
3. Redeploy from Vercel dashboard

### Issue: Theme Not Persisting
**Cause:** localStorage issue

**Fix:**
1. Check browser console for errors
2. Try different browser
3. Clear browser cache

### Issue: Slow Loading
**Cause:** Large database download on cold start

**Fix:**
1. Compress databases with gzip
2. Use faster cloud storage (AWS S3 + CloudFront)
3. Consider migrating to PostgreSQL
4. Implement caching (Vercel KV, Redis)

## 📊 Monitoring & Maintenance

### Daily Checks
- [ ] Site is accessible
- [ ] No error alerts from Vercel
- [ ] SSL certificate is valid

### Weekly Checks
- [ ] Review Vercel Analytics (if enabled)
- [ ] Check for deployment errors
- [ ] Verify data freshness

### Monthly Checks
- [ ] Update databases if needed
- [ ] Review and update dependencies
- [ ] Check for security updates
- [ ] Monitor usage limits (Vercel free tier)

### As Needed
- [ ] Respond to user feedback
- [ ] Fix reported bugs
- [ ] Add new features
- [ ] Update documentation

## 🎯 Production Readiness Checklist

### Security
- [ ] No hardcoded API keys or secrets
- [ ] Environment variables are secure
- [ ] HTTPS is enabled (Vercel provides this)
- [ ] Database URLs are from trusted sources
- [ ] No sensitive data in public repository

### Performance
- [ ] Page load time < 5 seconds
- [ ] Time to Interactive < 3 seconds
- [ ] Charts render smoothly
- [ ] No console errors or warnings
- [ ] Optimized for mobile

### Reliability
- [ ] Error handling in place
- [ ] Graceful degradation if API fails
- [ ] Loading states for async operations
- [ ] Fallback data if needed

### User Experience
- [ ] Intuitive navigation
- [ ] Clear loading indicators
- [ ] Helpful error messages
- [ ] Responsive on all devices
- [ ] Accessible (WCAG basics)

### Documentation
- [ ] README.md is comprehensive
- [ ] Setup instructions are clear
- [ ] API endpoints documented
- [ ] Troubleshooting guide included
- [ ] Contributing guidelines (if open source)

## 🚀 Going Live

### Final Steps
1. [ ] Complete all checklist items above
2. [ ] Test with real users (friends, colleagues)
3. [ ] Fix any issues found
4. [ ] Set up custom domain (optional)
5. [ ] Announce launch! 🎉

### Post-Launch
- [ ] Monitor error logs
- [ ] Gather user feedback
- [ ] Plan future improvements
- [ ] Celebrate your achievement! 🥳

---

## 📝 Notes

- **Vercel Free Tier Limits:**
  - Bandwidth: 100 GB/month
  - Deployments: Unlimited
  - Serverless functions: 100 GB-Hrs/month
  - Execution time: 10 seconds max

- **Database Download Frequency:**
  - Happens only on cold starts
  - Typically once per deployment
  - Use `vercel env pull` to test locally

- **Updating the App:**
  - Push to GitHub → Auto-deploys to Vercel
  - Or use `vercel --prod` from CLI

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Vercel URL:** _____________

**Status:** ☐ In Progress  ☐ Testing  ☐ Production Ready  ☐ Live

---

✨ **Good luck with your deployment!** ✨
