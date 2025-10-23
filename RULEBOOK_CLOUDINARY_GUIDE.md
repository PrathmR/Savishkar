# ☁️ Rulebook on Cloudinary - Complete Guide

## 🎯 Why Use Cloudinary for Rulebook?

### Benefits:
- ✅ **No Git Storage** - Don't bloat your repository with large PDFs
- ✅ **Fast CDN Delivery** - Cloudinary's global CDN for fast downloads
- ✅ **No Server Storage** - Saves space on Render
- ✅ **Easy Updates** - Upload new version anytime without redeploying
- ✅ **Reliable** - 99.9% uptime guarantee
- ✅ **Free Tier** - 25GB storage, 25GB bandwidth/month

### Comparison:

| Feature | Local Storage | Cloudinary |
|---------|--------------|------------|
| Git Repository Size | ❌ Increases | ✅ No impact |
| Server Storage | ❌ Uses space | ✅ No space used |
| CDN Delivery | ❌ No | ✅ Yes (fast) |
| Update Process | ❌ Redeploy needed | ✅ Just re-upload |
| Reliability | ⚠️ Depends on server | ✅ 99.9% uptime |
| Free | ✅ Yes | ✅ Yes (25GB) |

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Upload Rulebook to Cloudinary

```bash
cd server

# Upload the rulebook
npm run upload-rulebook
```

**Output:**
```
📤 Cloudinary Rulebook Upload
═══════════════════════════════════════════════════════════

🔍 Checking Cloudinary Configuration...

✅ CLOUDINARY_CLOUD_NAME: Set
✅ CLOUDINARY_API_KEY: Set
✅ CLOUDINARY_API_SECRET: Set

✅ Cloudinary configuration complete!

📖 Rulebook File Found:
   Path: /path/to/server/uploads/rulebook.pdf
   Size: 0.21 MB
   Modified: 2025-01-22T12:00:00.000Z

📤 Uploading to Cloudinary...
⏳ This may take a moment for large files...

✅ Upload Successful!

📊 Upload Details:
────────────────────────────────────────────────────────────
   Public ID: savishkar/documents/rulebook
   Format: pdf
   Size: 0.21 MB
   URL: https://res.cloudinary.com/YOUR_CLOUD/raw/upload/v123/savishkar/documents/rulebook.pdf
   Created: 2025-01-22T12:00:00Z
────────────────────────────────────────────────────────────

💡 Next Steps:

1. Add this to your Render environment variables:
   RULEBOOK_URL=https://res.cloudinary.com/YOUR_CLOUD/raw/upload/v123/savishkar/documents/rulebook.pdf

2. Or update your .env file:
   RULEBOOK_URL=https://res.cloudinary.com/YOUR_CLOUD/raw/upload/v123/savishkar/documents/rulebook.pdf
```

### Step 2: Add Environment Variable

**On Render:**
1. Go to Render Dashboard
2. Click your service
3. Go to "Environment" tab
4. Click "Add Environment Variable"
5. Add:
   - Key: `RULEBOOK_URL`
   - Value: (the URL from upload output)
6. Click "Save Changes"
7. Deploy (auto-deploys or manual)

**Locally (for testing):**
Add to `server/.env`:
```
RULEBOOK_URL=https://res.cloudinary.com/YOUR_CLOUD/raw/upload/v123/savishkar/documents/rulebook.pdf
```

### Step 3: Test

```bash
# Test locally
curl http://localhost:5000/api/rulebook/info

# Test on Render
curl https://your-app.onrender.com/api/rulebook/info
```

**Expected Response:**
```json
{
  "success": true,
  "available": true,
  "filename": "Savishkar_2025_Rulebook.pdf",
  "storage": "cloudinary",
  "url": "https://res.cloudinary.com/...",
  "downloadUrl": "/api/rulebook/download",
  "viewUrl": "/api/rulebook/view",
  "message": "Rulebook hosted on Cloudinary CDN"
}
```

---

## 📋 Detailed Setup

### Prerequisites

1. **Cloudinary Account**
   - Sign up: https://cloudinary.com/users/register/free
   - Free tier: 25GB storage, 25GB bandwidth/month

2. **Cloudinary Credentials**
   - Get from: https://cloudinary.com/console
   - You need:
     - Cloud Name
     - API Key
     - API Secret

3. **Environment Variables Set**
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

### Upload Process

#### Option 1: Using Script (Recommended)

```bash
cd server
npm run upload-rulebook
```

The script will:
1. Check Cloudinary configuration
2. Verify rulebook.pdf exists
3. Upload to Cloudinary folder: `savishkar/documents/`
4. Set public_id: `rulebook`
5. Enable public access
6. Display the URL
7. Save URL to `uploads/rulebook-cloudinary-url.txt`

#### Option 2: Manual Upload via Dashboard

1. Go to https://cloudinary.com/console/media_library
2. Click "Upload" button
3. Select `server/uploads/rulebook.pdf`
4. Upload to folder: `savishkar/documents/`
5. Set filename: `rulebook`
6. Copy the URL
7. Add to environment variables

---

## 🔄 How It Works

### Automatic Fallback System

The rulebook route automatically detects which storage to use:

```javascript
// In server/routes/rulebook.js

// Check if Cloudinary URL is configured
const RULEBOOK_URL = process.env.RULEBOOK_URL;
const USE_CLOUDINARY = !!RULEBOOK_URL;

// If Cloudinary URL exists, use it
if (USE_CLOUDINARY) {
  return res.redirect(RULEBOOK_URL);
}

// Otherwise, serve from local storage
// ... local file serving code
```

### Flow Diagram

```
User clicks "Download Rulebook"
           ↓
    /api/rulebook/download
           ↓
    Check RULEBOOK_URL env var
           ↓
    ┌──────────────┐
    │ Is it set?   │
    └──────────────┘
           ↓
    Yes ─────────→ Redirect to Cloudinary URL
                   (Fast CDN delivery)
           ↓
    No ──────────→ Serve from local file
                   (Fallback)
```

### Benefits of This Approach

1. **Flexible**: Works with or without Cloudinary
2. **No Code Changes**: Just set environment variable
3. **Easy Testing**: Test locally without Cloudinary
4. **Production Ready**: Use Cloudinary in production
5. **Backward Compatible**: Existing local file still works

---

## 🔄 Updating the Rulebook

### When You Need to Update:

1. **New Version**: Event rules changed
2. **Corrections**: Fix typos or errors
3. **Additional Info**: Add new sections

### Update Process:

#### Step 1: Update Local File
```bash
# Replace the file
cp /path/to/new/rulebook.pdf server/uploads/rulebook.pdf
```

#### Step 2: Re-upload to Cloudinary
```bash
cd server
npm run upload-rulebook
```

The script will:
- Detect existing file
- Overwrite with new version
- Keep the same URL (no need to update env vars!)
- New version available immediately

#### Step 3: Verify
```bash
# Check info
curl https://your-app.onrender.com/api/rulebook/info

# Download and verify
curl https://your-app.onrender.com/api/rulebook/download -o test.pdf
```

**No Deployment Needed!** The new version is live immediately.

---

## 🧪 Testing

### Test Upload Script

```bash
cd server

# Dry run (check configuration)
npm run upload-rulebook
```

### Test API Endpoints

**Info Endpoint:**
```bash
# Local
curl http://localhost:5000/api/rulebook/info

# Production
curl https://your-app.onrender.com/api/rulebook/info
```

**Download Endpoint:**
```bash
# Local
curl http://localhost:5000/api/rulebook/download -o test.pdf

# Production
curl https://your-app.onrender.com/api/rulebook/download -o test.pdf
```

**View in Browser:**
```
http://localhost:5000/api/rulebook/view
https://your-app.onrender.com/api/rulebook/view
```

### Verify Storage Type

Check the `/api/rulebook/info` response:

**Using Cloudinary:**
```json
{
  "storage": "cloudinary",
  "url": "https://res.cloudinary.com/...",
  "message": "Rulebook hosted on Cloudinary CDN"
}
```

**Using Local:**
```json
{
  "storage": "local",
  "size": 219843,
  "sizeFormatted": "0.21 MB"
}
```

---

## 🚨 Troubleshooting

### Issue 1: "Cloudinary configuration incomplete"

**Symptoms:**
```
❌ CLOUDINARY_CLOUD_NAME: Missing
❌ CLOUDINARY_API_KEY: Missing
❌ CLOUDINARY_API_SECRET: Missing
```

**Solution:**
1. Get credentials from: https://cloudinary.com/console
2. Add to `server/.env`:
   ```
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
3. Restart server
4. Try upload again

### Issue 2: "Rulebook file not found"

**Symptoms:**
```
❌ Rulebook file not found!
📁 Expected location: /path/to/server/uploads/rulebook.pdf
```

**Solution:**
1. Check if file exists:
   ```bash
   ls -la server/uploads/rulebook.pdf
   ```
2. If missing, add your rulebook PDF to that location
3. Try upload again

### Issue 3: "Invalid cloud_name"

**Symptoms:**
```
❌ Upload Failed!
Error: Invalid cloud_name
```

**Solution:**
1. Check `CLOUDINARY_CLOUD_NAME` in `.env`
2. It should be your Cloudinary account name (not email)
3. Get correct value from: https://cloudinary.com/console
4. Update `.env` and try again

### Issue 4: "File size too large"

**Symptoms:**
```
❌ Upload Failed!
Error: File size too large
```

**Solution:**
1. Check your Cloudinary plan limits
2. Free tier: 10MB per file
3. Compress your PDF:
   - Use online tools like: https://www.ilovepdf.com/compress_pdf
   - Or upgrade Cloudinary plan
4. Try upload again

### Issue 5: Rulebook Still Serving from Local

**Symptoms:**
- Upload successful
- But `/api/rulebook/info` shows `"storage": "local"`

**Solution:**
1. Check if `RULEBOOK_URL` is set:
   ```bash
   # On Render
   Check Environment tab
   
   # Locally
   cat server/.env | grep RULEBOOK_URL
   ```
2. If missing, add it:
   - Get URL from upload output
   - Add to Render environment variables
   - Or add to local `.env`
3. Restart server
4. Test again

---

## 📊 Monitoring

### Check Storage Type

```bash
# Check which storage is being used
curl https://your-app.onrender.com/api/rulebook/info | jq '.storage'
```

### Check Cloudinary Usage

1. Go to: https://cloudinary.com/console
2. Check "Usage" section
3. Monitor:
   - Storage used
   - Bandwidth used
   - Number of requests

### Logs

**On Render:**
Look for these log messages:

**Using Cloudinary:**
```
📖 Redirecting to Cloudinary rulebook: https://res.cloudinary.com/...
```

**Using Local:**
```
📖 Serving local rulebook: 219843 bytes
```

---

## 🎯 Best Practices

### 1. Use Cloudinary in Production

**Render Environment:**
```
RULEBOOK_URL=https://res.cloudinary.com/YOUR_CLOUD/...
```

**Benefits:**
- No server storage used
- Fast CDN delivery
- Easy updates

### 2. Keep Local File for Development

**Local `.env`:**
```
# Don't set RULEBOOK_URL locally
# This will use local file for development
```

**Benefits:**
- Test without internet
- Faster local development
- No Cloudinary API calls

### 3. Version Your Rulebook

**Naming Convention:**
```
rulebook-v1.pdf
rulebook-v2.pdf
rulebook-2025.pdf
```

**In Cloudinary:**
- Upload with version in public_id
- Update `RULEBOOK_URL` when changing versions
- Keep old versions for reference

### 4. Compress PDFs

**Before Upload:**
- Compress to reduce size
- Target: < 5MB for fast downloads
- Tools: iLovePDF, Adobe Acrobat, etc.

### 5. Monitor Usage

**Monthly Check:**
- Check Cloudinary usage dashboard
- Ensure within free tier limits
- Plan for upgrades if needed

---

## 📈 Cloudinary Free Tier Limits

| Resource | Free Tier | Notes |
|----------|-----------|-------|
| Storage | 25 GB | Total storage |
| Bandwidth | 25 GB/month | Monthly transfer |
| Transformations | 25,000/month | Not used for PDFs |
| Max File Size | 10 MB | Per file |
| API Calls | Unlimited | No limit |

**For Rulebook:**
- Typical PDF: 0.2 - 2 MB
- Can store: 12,500+ rulebooks
- Monthly downloads: 12,500+ (at 2MB each)
- **More than enough for most events!**

---

## ✅ Deployment Checklist

### Initial Setup:
- [ ] Cloudinary account created
- [ ] Credentials added to `.env`
- [ ] Rulebook uploaded to Cloudinary
- [ ] `RULEBOOK_URL` added to Render environment
- [ ] Deployed to Render
- [ ] Tested download endpoint
- [ ] Verified storage type is "cloudinary"

### For Updates:
- [ ] New rulebook PDF ready
- [ ] Uploaded to Cloudinary (overwrites old)
- [ ] Tested download
- [ ] Verified new version

---

## 🎉 Summary

**What You Did:**
1. ✅ Uploaded rulebook to Cloudinary
2. ✅ Added `RULEBOOK_URL` environment variable
3. ✅ Deployed to Render
4. ✅ Verified it works

**Benefits:**
- ✅ Fast CDN delivery worldwide
- ✅ No server storage used
- ✅ Easy updates (no redeploy needed)
- ✅ Reliable 99.9% uptime
- ✅ Free for your use case

**To Update Rulebook:**
```bash
cd server
npm run upload-rulebook
# Done! New version live immediately
```

---

**Time to Setup:** 5 minutes  
**Time to Update:** 1 minute  
**Cost:** Free (within limits)  
**Recommended:** ✅ Yes, best solution for production!
