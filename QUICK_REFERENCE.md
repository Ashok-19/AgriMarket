# ⚡ Quick Reference - Deployment

## 🚀 Deploy Now

```bash
cd /home/nnmax/Desktop/eda-final/deployment
vercel --prod
```

---

## 🔑 Environment Variables (Vercel Dashboard)

```
DATA_DB_URL=https://www.dropbox.com/s/xxxxx/data.db?dl=0
PREDICTIONS_DB_URL=https://www.dropbox.com/s/xxxxx/predictions.db?dl=0
```

---

## 🧪 Test Deployment

1. Visit: https://agri-market-visualisation.vercel.app/
2. Check all charts load
3. Test in incognito mode
4. Share with friend

---

## 📊 How It Works

```
User → Vercel Frontend → /api → Vercel Backend → Dropbox → Data
```

---

## 🔄 Update Data

1. Upload new DB to Dropbox
2. Update env var (if URL changed)
3. Redeploy or wait for cold start

---

## 🐛 Troubleshooting

**No data?**
→ Check env vars in Vercel

**Slow?**
→ Cold start (normal)

**Works for you only?**
→ Stop local backend

---

## 📁 Key Files

- `api/app.py` - Backend (fetches from Dropbox)
- `frontend/app.js` - Frontend (auto-detects env)
- `vercel.json` - Routing config
- `requirements.txt` - Python deps

---

## 📞 Quick Help

**Logs:** `vercel logs --follow`  
**Status:** `vercel ls`  
**Redeploy:** `vercel --prod`

---

## ✅ Checklist

- [ ] Env vars set
- [ ] Deployed
- [ ] Tested
- [ ] Shared

---

**URL:** https://agri-market-visualisation.vercel.app/
