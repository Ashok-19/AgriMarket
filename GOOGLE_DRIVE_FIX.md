# 🔧 Google Drive Database Loading Fix

## Problem Identified

Your databases are **NOT loading** on Vercel because Google Drive has special requirements for files > 25MB:

1. **Virus scan confirmation required** - Google shows a warning page instead of direct download
2. **URL format issues** - Standard download URLs don't work with `urllib.request`

## ✅ Solution: Updated Download Function

### Option 1: Fix the Download Code (Recommended)

Replace the `download_database` function in `api/app.py` with this improved version:

```python
def download_database(url, local_path):
    """Download database from URL with Google Drive support"""
    if not url:
        return False
    
    try:
        import urllib.request
        import urllib.parse
        import re
        
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        print(f"Downloading database from {url}...")
        
        # Handle Google Drive URLs specially
        if 'drive.google.com' in url:
            # Extract file ID from URL
            file_id = None
            
            # Pattern 1: uc?export=download&id=FILE_ID
            match = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', url)
            if match:
                file_id = match.group(1)
            
            # Pattern 2: /file/d/FILE_ID/
            if not file_id:
                match = re.search(r'/file/d/([a-zA-Z0-9_-]+)/', url)
                if match:
                    file_id = match.group(1)
            
            if file_id:
                # Use the direct download endpoint that bypasses virus scan
                download_url = f"https://drive.google.com/uc?export=download&id={file_id}&confirm=t"
                print(f"Detected Google Drive file ID: {file_id}")
            else:
                print("Could not extract Google Drive file ID, trying URL as-is")
                download_url = url
        else:
            download_url = url
        
        # Download with proper headers
        opener = urllib.request.build_opener()
        opener.addheaders = [
            ('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        ]
        urllib.request.install_opener(opener)
        
        urllib.request.urlretrieve(download_url, local_path)
        
        # Verify the file was downloaded correctly
        if os.path.exists(local_path):
            file_size = os.path.getsize(local_path)
            print(f"✓ Database downloaded to {local_path} ({file_size / 1024 / 1024:.2f} MB)")
            
            # Quick SQLite validation
            import sqlite3
            try:
                conn = sqlite3.connect(local_path)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table' LIMIT 1;")
                conn.close()
                print(f"✓ Database file is valid SQLite")
                return True
            except sqlite3.DatabaseError as e:
                print(f"✗ Downloaded file is not a valid SQLite database: {e}")
                os.remove(local_path)
                return False
        else:
            print(f"✗ File was not created at {local_path}")
            return False
            
    except Exception as e:
        print(f"✗ Error downloading database: {e}")
        import traceback
        traceback.print_exc()
        return False
```

### Option 2: Use Alternative Cloud Storage (Faster Setup)

If you want a quicker solution, use **Dropbox** instead:

#### Dropbox Setup (5 minutes):
1. Go to [dropbox.com](https://www.dropbox.com)
2. Upload `data.db` and `predictions.db`
3. Click "Share" → "Create link" for each file
4. Change `?dl=0` to `?dl=1` in the URL

**Example:**
```
Original: https://www.dropbox.com/s/abc123xyz/data.db?dl=0
Fixed:    https://www.dropbox.com/s/abc123xyz/data.db?dl=1
```

5. Use these URLs in Vercel environment variables

---

## 🔍 How to Test Google Drive URLs Locally

Before deploying to Vercel, test your URLs:

```bash
# Test 1: Try downloading with curl
curl -L "YOUR_GOOGLE_DRIVE_URL" -o test_download.db

# Test 2: Check if it's a valid database
sqlite3 test_download.db "SELECT name FROM sqlite_master WHERE type='table' LIMIT 5;"

# Test 3: Check file size (should be ~44MB or ~46MB)
ls -lh test_download.db
```

If any test fails, your URL format is incorrect.

---

## 📋 Correct Google Drive URL Format

### ❌ WRONG (won't work for files > 25MB):
```
https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
```

### ✅ CORRECT (with virus scan bypass):
```
https://drive.google.com/uc?export=download&id=1A2B3C4D5E6F7G8H9I0J&confirm=t
```

**The key additions:**
- Use `uc?export=download` endpoint
- Add `&confirm=t` to bypass virus scan warning

---

## 🚀 Step-by-Step Fix for Your Deployment

### Step 1: Update Your Code

I've already updated the `download_database` function in `api/app.py` with the fix.

### Step 2: Get Your Google Drive URLs

1. Make sure your files are shared publicly (Anyone with the link)
2. Get the share link for each database file
3. Extract the FILE_ID from the URL

**Example:**
If your share link is:
```
https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9I0J/view?usp=sharing
```

The FILE_ID is: `1A2B3C4D5E6F7G8H9I0J`

### Step 3: Format Your Environment Variables

Use EITHER format (both will work with the updated code):

**Format A (Simple):**
```bash
DATABASE_URL=https://drive.google.com/uc?export=download&id=YOUR_DATA_DB_FILE_ID&confirm=t
PREDICTIONS_DATABASE_URL=https://drive.google.com/uc?export=download&id=YOUR_PREDICTIONS_DB_FILE_ID&confirm=t
```

**Format B (Share link - will be auto-converted):**
```bash
DATABASE_URL=https://drive.google.com/file/d/YOUR_DATA_DB_FILE_ID/view?usp=sharing
PREDICTIONS_DATABASE_URL=https://drive.google.com/file/d/YOUR_PREDICTIONS_DB_FILE_ID/view?usp=sharing
```

### Step 4: Push to GitHub and Deploy

```bash
cd /home/nnmax/Desktop/eda-final/deployment
git add .
git commit -m "Fix Google Drive database download for files > 25MB"
git push
```

### Step 5: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Update or add:
   - `DATABASE_URL` = (your Google Drive URL)
   - `PREDICTIONS_DATABASE_URL` = (your Google Drive URL)
4. Click "Save"

### Step 6: Redeploy

1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. OR push a new commit to trigger auto-deployment

### Step 7: Verify

After deployment completes (2-3 minutes):

1. Visit: `https://your-app.vercel.app/api/health`
2. Check the response:
   ```json
   {
     "status": "healthy",
     "data_loaded": true,
     "predictions_loaded": true,
     "timestamp": "..."
   }
   ```

If both are `true`, you're good! 🎉

---

## 🔍 Troubleshooting

### Issue: Still shows `data_loaded: false`

**Check Vercel Logs:**
```bash
vercel logs --follow
```

Look for error messages related to database download.

**Common fixes:**
1. Make sure files are publicly shared (Anyone with the link)
2. Verify FILE_ID is correct (no extra characters)
3. Try the alternative URL format
4. Test the URL manually with curl

### Issue: Database validation fails

This means the file downloaded but it's not a valid SQLite database.

**Possible causes:**
- Google Drive served an error page instead of the file
- File got corrupted during upload
- Wrong file was uploaded

**Fix:**
1. Download the file from Drive manually
2. Open with SQLite browser to verify
3. Re-upload if needed
4. Get a fresh share link

### Issue: Download timeout

Vercel serverless functions have a 10-second execution limit on free tier.

**Solutions:**
1. **Use smaller databases** (compress with gzip)
2. **Use faster storage** (Dropbox, AWS S3)
3. **Upgrade Vercel plan** (60-second timeout)
4. **Migrate to PostgreSQL** (Railway, Supabase)

---

## 🎯 Alternative: Use gdown Library

For even better Google Drive support, you can use the `gdown` library:

### Update `requirements.txt`

Add this line:
```
gdown==4.7.1
```

### Update download function

```python
def download_database(url, local_path):
    """Download database from URL with gdown for Google Drive"""
    if not url:
        return False
    
    try:
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        if 'drive.google.com' in url:
            import gdown
            import re
            
            # Extract file ID
            file_id = None
            match = re.search(r'[?&]id=([a-zA-Z0-9_-]+)', url)
            if match:
                file_id = match.group(1)
            else:
                match = re.search(r'/file/d/([a-zA-Z0-9_-]+)/', url)
                if match:
                    file_id = match.group(1)
            
            if file_id:
                download_url = f"https://drive.google.com/uc?id={file_id}"
                gdown.download(download_url, local_path, quiet=False, fuzzy=True)
            else:
                gdown.download(url, local_path, quiet=False, fuzzy=True)
        else:
            import urllib.request
            urllib.request.urlretrieve(url, local_path)
        
        # Validate
        if os.path.exists(local_path):
            file_size = os.path.getsize(local_path)
            print(f"✓ Database downloaded ({file_size / 1024 / 1024:.2f} MB)")
            return True
        return False
        
    except Exception as e:
        print(f"✗ Error downloading: {e}")
        return False
```

---

## ✅ Recommended Final Solution

Based on your setup, I recommend:

1. **Immediate fix:** Use the updated code I provided (already done)
2. **Set proper environment variables** with the `&confirm=t` parameter
3. **Test locally first** before deploying to Vercel
4. **If still issues:** Switch to Dropbox (simpler for large files)

---

**Next Steps:** Try redeploying with the updated code and correct URL format!
