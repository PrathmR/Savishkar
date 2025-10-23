# ⚡ Rulebook on Cloudinary - Quick Guide

## 🎯 Why Cloudinary?

- ✅ **No Git bloat** - Don't commit large PDFs
- ✅ **Fast CDN** - Global delivery
- ✅ **Easy updates** - No redeploy needed
- ✅ **Free** - 25GB storage/bandwidth per month

---

## 🚀 Setup (5 Minutes)

### Step 1: Upload to Cloudinary

```bash
cd server
npm run upload-rulebook
```

**Copy the URL from output:**
```
URL: https://res.cloudinary.com/YOUR_CLOUD/raw/upload/v123/savishkar/documents/rulebook.pdf
```

### Step 2: Add to Render

1. Go to Render Dashboard → Environment
2. Add variable:
   - Key: `RULEBOOK_URL`
   - Value: (paste the URL)
3. Save & Deploy

### Step 3: Test

```bash
curl https://your-app.onrender.com/api/rulebook/info
```

Should show: `"storage": "cloudinary"`

---

## 🔄 Update Rulebook

```bash
# 1. Replace file
cp /path/to/new/rulebook.pdf server/uploads/rulebook.pdf

# 2. Re-upload
cd server
npm run upload-rulebook

# 3. Done! (No redeploy needed)
```

---

## 🧪 Quick Test

```bash
# Check storage type
curl http://localhost:5000/api/rulebook/info

# Download
curl http://localhost:5000/api/rulebook/download -o test.pdf

# View in browser
open http://localhost:5000/api/rulebook/view
```

---

## 📊 How It Works

```
RULEBOOK_URL set? 
    ↓
  Yes → Redirect to Cloudinary (fast CDN)
    ↓
   No → Serve from local file (fallback)
```

**Production:** Set `RULEBOOK_URL` (use Cloudinary)  
**Development:** Don't set it (use local file)

---

## 🚨 Troubleshooting

### "Cloudinary configuration incomplete"
→ Add credentials to `.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### "Rulebook file not found"
→ Ensure `server/uploads/rulebook.pdf` exists

### Still serving from local
→ Check `RULEBOOK_URL` is set on Render

---

## ✅ Checklist

- [ ] Run `npm run upload-rulebook`
- [ ] Copy URL from output
- [ ] Add `RULEBOOK_URL` to Render environment
- [ ] Save & Deploy
- [ ] Test: `/api/rulebook/info` shows "cloudinary"

---

## 📚 Full Documentation

See `RULEBOOK_CLOUDINARY_GUIDE.md` for complete details.

---

**TL;DR:**
1. `npm run upload-rulebook`
2. Copy URL
3. Add to Render as `RULEBOOK_URL`
4. Deploy

**Time:** 5 minutes | **Cost:** Free | **Recommended:** ✅ Yes!
