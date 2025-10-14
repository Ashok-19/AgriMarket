# 💾 Database Setup Guide

Your databases are too large for GitHub (44MB + 46MB > 25MB limit). This guide shows you how to host them for free.

## 📊 Database Files

You have two SQLite databases:
- **data.db** (44MB) - Historical market data
- **predictions.db** (46MB) - AI forecast predictions

## ☁️ Cloud Storage Options

### Option 1: Google Drive (Recommended - Easy & Free)

**Advantages:**
- ✅ Free unlimited storage for files <15GB
- ✅ Reliable & fast
- ✅ Easy to update
- ✅ No bandwidth limits

**Steps:**

1. **Upload files**
   - Go to [drive.google.com](https://drive.google.com)
   - Click "New" → "File upload"
   - Upload `data.db` and `predictions.db`

2. **Make files public**
   - Right-click `data.db` → "Share"
   - Under "General access" → Change to "Anyone with the link"
   - Click "Copy link"
   - Repeat for `predictions.db`

3. **Convert to direct download URLs**
   
   Your links look like:
   ```
   https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
   ```
   
   Convert to:
   ```
   https://drive.google.com/uc?export=download&id=1A2B3C4D5E6F7G8H9I0J
   ```
   
   **Quick conversion formula:**
   - Extract the FILE_ID (the long random string between `/d/` and `/view`)
   - Use: `https://drive.google.com/uc?export=download&id=FILE_ID`

4. **Test URLs**
   - Paste each URL in your browser
   - File should download immediately
   - If it doesn't, check sharing permissions

5. **Use in Vercel**
   ```
   DATABASE_URL=https://drive.google.com/uc?export=download&id=YOUR_DATA_DB_ID
   PREDICTIONS_DATABASE_URL=https://drive.google.com/uc?export=download&id=YOUR_PREDICTIONS_DB_ID
   ```

---

### Option 2: Dropbox

**Advantages:**
- ✅ Free 2GB storage
- ✅ Simple URL conversion
- ✅ Good reliability

**Steps:**

1. **Upload files**
   - Go to [dropbox.com](https://www.dropbox.com)
   - Upload both database files

2. **Get shareable links**
   - Click "Share" button next to each file
   - Click "Create link"
   - Copy the link

3. **Convert to direct download**
   
   Your link:
   ```
   https://www.dropbox.com/s/abc123xyz/data.db?dl=0
   ```
   
   Change `dl=0` to `dl=1`:
   ```
   https://www.dropbox.com/s/abc123xyz/data.db?dl=1
   ```

4. **Use in Vercel**
   ```
   DATABASE_URL=https://www.dropbox.com/s/YOUR_ID/data.db?dl=1
   PREDICTIONS_DATABASE_URL=https://www.dropbox.com/s/YOUR_ID/predictions.db?dl=1
   ```

---

### Option 3: GitHub Releases (Not Recommended for your case)

**Note:** GitHub allows files up to 2GB in releases, but recommended max is 100MB. Your files are too large for optimal performance.

If you want to try anyway:

1. Create a new release in your repository
2. Upload databases as release assets
3. Get the raw download URLs
4. Use those URLs in environment variables

---

### Option 4: AWS S3 (Advanced - Free tier available)

**Advantages:**
- ✅ Professional solution
- ✅ Very fast (CDN)
- ✅ Free tier: 5GB storage, 15GB transfer/month
- ✅ Fine-grained permissions

**Steps:**

1. **Create S3 bucket**
   - Go to AWS Console → S3
   - Create new bucket (public access)

2. **Upload files**
   - Upload both databases
   - Make objects public

3. **Get object URLs**
   - Click on each file
   - Copy "Object URL"

4. **Use in Vercel**
   ```
   DATABASE_URL=https://your-bucket.s3.amazonaws.com/data.db
   PREDICTIONS_DATABASE_URL=https://your-bucket.s3.amazonaws.com/predictions.db
   ```

---

### Option 5: Cloudinary / Uploadcare (Media CDN)

**Advantages:**
- ✅ Fast CDN
- ✅ Free tiers available
- ✅ Built for file delivery

**Steps:**
1. Sign up for free tier
2. Upload databases as "raw" files
3. Get public URLs
4. Use in environment variables

---

## 🔄 Updating Databases

When you need to update the data:

1. **Upload new version** to your cloud storage
2. **Same URL?** 
   - No action needed - changes reflect automatically
   - May need to clear Vercel's cache
3. **New URL?**
   - Update environment variables in Vercel
   - Redeploy the app

### Vercel Cache Clearing

If data doesn't update after replacing files:
```bash
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# Enter the same URL
vercel --prod
```

---

## 📏 Database Size Considerations

Your current databases:
- **data.db**: 44MB
- **predictions.db**: 46MB
- **Total**: 90MB

**Download time estimates:**
- Fast connection (100 Mbps): ~7 seconds
- Average connection (25 Mbps): ~30 seconds
- Slow connection (5 Mbps): ~2.5 minutes

**Optimization options:**

### 1. Compress databases
```bash
# Compress with gzip
gzip -k data.db
gzip -k predictions.db

# Upload .gz files instead
# Modify app.py to decompress on load
```

This could reduce size by 50-70%!

### 2. Split databases
```bash
# Split into smaller chunks
split -b 20M data.db data.db.part-

# Modify app.py to merge on load
```

### 3. Use PostgreSQL (Advanced)
- Host on free tier of Railway, Supabase, or Neon
- Convert SQLite to PostgreSQL
- Update app.py to use PostgreSQL instead

### 4. Lazy loading
- Load only essential data on startup
- Fetch additional data on demand
- Cache frequently accessed queries

---

## 🔒 Security Best Practices

### Public databases considerations

Your databases are now publicly accessible. Consider:

1. **Data sensitivity**
   - Is the data confidential?
   - Does it contain PII (Personal Identifiable Information)?
   - If yes → Use authentication or private storage

2. **Add basic protection**
   ```python
   # In app.py, add token-based access
   DOWNLOAD_TOKEN = os.getenv('DATABASE_DOWNLOAD_TOKEN')
   
   def download_database(url, local_path):
       if DOWNLOAD_TOKEN:
           url = f"{url}?token={DOWNLOAD_TOKEN}"
       # ... rest of code
   ```

3. **Rate limiting**
   - Add CloudFlare in front of your storage
   - Use AWS S3 with request throttling
   - Monitor download metrics

4. **Encryption** (if needed)
   ```bash
   # Encrypt before upload
   openssl enc -aes-256-cbc -salt -in data.db -out data.db.enc
   
   # Decrypt in app.py on download
   ```

---

## 🧪 Testing Your Setup

### Test 1: Direct URL download
```bash
# Test in terminal
curl -L "YOUR_DATABASE_URL" -o test_download.db

# Check file size
ls -lh test_download.db

# Should be 44MB for data.db, 46MB for predictions.db
```

### Test 2: Python download test
```python
import urllib.request
import os

url = "YOUR_DATABASE_URL"
urllib.request.urlretrieve(url, "test.db")

# Check if valid SQLite database
import sqlite3
conn = sqlite3.connect("test.db")
cursor = conn.cursor()
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
print(cursor.fetchall())
conn.close()
```

### Test 3: Verify in app
```bash
# Set environment variable locally
export DATABASE_URL="YOUR_URL"
export PREDICTIONS_DATABASE_URL="YOUR_URL"

# Run app
cd api/
python app.py

# Check logs for:
# ✓ Market data loaded successfully: XXXXX records
# ✓ Predictions loaded successfully: XX commodities
```

---

## ❓ FAQ

**Q: Can I use a different cloud provider?**  
A: Yes! Any provider that gives you a direct download URL will work.

**Q: Do I need to keep files on my local machine?**  
A: Yes, keep backups! Cloud storage can fail or accounts can be suspended.

**Q: How often should I update the databases?**  
A: Depends on your data freshness needs. Daily, weekly, or monthly are common.

**Q: Will this work with Vercel free tier?**  
A: Yes! The databases are downloaded once on startup, not on every request.

**Q: Can I use a database service instead?**  
A: Yes! Consider PostgreSQL on Railway, Supabase, or PlanetScale for production.

**Q: What if the URL changes?**  
A: Update the environment variable in Vercel and redeploy.

---

## 🎯 Recommended Approach

**For quick deployment (now):**
→ Use Google Drive (easiest, no size limits)

**For production (later):**
→ Migrate to PostgreSQL on Railway/Supabase
→ Or use AWS S3 with CloudFront CDN

**For maximum performance:**
→ PostgreSQL database + Redis cache
→ Pre-aggregate data for common queries
→ Use Vercel Edge Functions for caching

---

**Need help?** Check QUICK_START.md for step-by-step deployment guide!
