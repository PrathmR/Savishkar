# 📸 File Upload System - Complete Guide

## 🔴 Current Issue
**Local uploads don't work on hosting platforms** because:
- Files are stored in ephemeral file systems
- Deleted on server restart
- Not shared between multiple server instances

## ✅ Solution: Cloudinary (Already Integrated!)

Your code already supports Cloudinary. Just enable it with environment variables!

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get Cloudinary Account
```
1. Visit: https://cloudinary.com/users/register_free
2. Sign up (free tier: 25GB storage + bandwidth)
3. Copy credentials from dashboard
```

### Step 2: Add Environment Variables
```env
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Deploy
```bash
# Add env vars to your hosting platform (Render/Heroku/Railway)
# Redeploy your application
# Done! ✅
```

---

## 📁 What Gets Uploaded

| Upload Type | API Endpoint | Database Field | Cloudinary Folder |
|------------|--------------|----------------|-------------------|
| **User Avatar** | `POST /api/users/upload-avatar` | `User.avatar` | `savishkar/avatars/` |
| **Event Image** | `POST /api/events/upload-image` | `Event.image` | `savishkar/events/` |
| **Payment Screenshot** | `POST /api/payments/offline` | `Payment.screenshotUrl` | `savishkar/payments/` |

---

## 🔄 How It Works

### With Cloudinary Enabled (`USE_CLOUDINARY=true`):
```
User uploads file
    ↓
Multer middleware
    ↓
Cloudinary Storage
    ↓
File uploaded to Cloudinary
    ↓
Returns: https://res.cloudinary.com/.../image.jpg
    ↓
URL saved to MongoDB
    ↓
✅ Accessible from anywhere!
```

### Without Cloudinary (`USE_CLOUDINARY=false`):
```
User uploads file
    ↓
Multer middleware
    ↓
Local Disk Storage
    ↓
File saved to server/uploads/
    ↓
Returns: http://yourserver.com/uploads/image.jpg
    ↓
❌ Deleted on restart (hosting platforms)
```

---

## 🧪 Testing

### Verify Configuration
```bash
npm run verify-cloudinary
```

### Test Locally
```bash
npm run dev
# Try uploading an avatar or event image
```

### Check Cloudinary Dashboard
```
Visit: https://cloudinary.com/console/media_library
Look for folders: savishkar/avatars, savishkar/events, savishkar/payments
```

---

## 📊 File Specifications

### Avatar Upload
- **Max Size:** 5 MB
- **Formats:** JPG, JPEG, PNG, GIF, WebP
- **Transformation:** 500x500px, face-focused crop
- **Endpoint:** `POST /api/users/upload-avatar`

### Event Image Upload
- **Max Size:** 10 MB
- **Formats:** JPG, JPEG, PNG, GIF, WebP
- **Transformation:** 1200x800px, limited size
- **Endpoint:** `POST /api/events/upload-image`

### Payment Screenshot Upload
- **Max Size:** 5 MB
- **Formats:** JPG, JPEG, PNG, WebP
- **Transformation:** 1000x1000px, limited size
- **Endpoint:** `POST /api/payments/offline`

---

## 🔐 Security

### Current Implementation:
- ✅ File type validation (images only)
- ✅ File size limits
- ✅ Unique filenames (timestamp + random)
- ✅ Credentials in environment variables
- ✅ Protected endpoints (authentication required)

### Best Practices:
- Never commit `.env` file
- Use different Cloudinary accounts for dev/prod
- Regularly monitor usage
- Rotate API secrets periodically

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `QUICK_START.md` | 5-minute setup guide |
| `CLOUDINARY_SETUP_GUIDE.md` | Detailed step-by-step instructions |
| `CLOUDINARY_DATABASE_FLOW.md` | Technical details of URL storage |
| `UPLOAD_SOLUTIONS.md` | Alternative solutions (AWS S3, Supabase, etc.) |

---

## 🆘 Troubleshooting

### Issue: Uploads still saving locally
**Solution:**
```bash
# Check environment variables
npm run verify-cloudinary

# Ensure USE_CLOUDINARY=true (not 'True' or '1')
# Restart server after adding env variables
```

### Issue: "Invalid credentials" error
**Solution:**
```
1. Double-check credentials from Cloudinary dashboard
2. Ensure no extra spaces in .env file
3. Verify you're using the correct Cloudinary account
```

### Issue: Images not displaying
**Solution:**
```
1. Check Cloudinary Media Library to confirm upload
2. Verify CORS settings
3. Check browser console for errors
4. Ensure database contains full Cloudinary URL
```

---

## 💰 Cloudinary Free Tier

### Includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth per month
- ✅ 25,000 transformations per month
- ✅ Unlimited uploads
- ✅ CDN delivery
- ✅ Image optimization

### Sufficient For:
- Small to medium applications
- Up to ~10,000 users
- Moderate image uploads

### Upgrade When:
- You exceed free tier limits
- Need advanced features
- Require higher bandwidth

---

## 🔧 Commands

```bash
# Verify Cloudinary configuration
npm run verify-cloudinary

# Start development server
npm run dev

# Start production server
npm start

# Create admin user
npm run create-admin
```

---

## 📞 Support

### Cloudinary:
- Documentation: https://cloudinary.com/documentation
- Node.js Guide: https://cloudinary.com/documentation/node_integration
- Support: https://support.cloudinary.com

### Your Application:
- Check the documentation files listed above
- Review server logs for error messages
- Test with `npm run verify-cloudinary`

---

## ✅ Deployment Checklist

Before deploying to production:

- [ ] Cloudinary account created
- [ ] Credentials obtained from dashboard
- [ ] `.env` file updated locally
- [ ] Tested locally with `npm run verify-cloudinary`
- [ ] Environment variables added to hosting platform:
  - [ ] `USE_CLOUDINARY=true`
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Application deployed
- [ ] Avatar upload tested
- [ ] Event image upload tested
- [ ] Payment screenshot upload tested
- [ ] Images visible in Cloudinary dashboard
- [ ] Database contains Cloudinary URLs
- [ ] Images load on frontend

---

## 🎉 Success!

Once configured, your uploads will:
- ✅ Work on any hosting platform
- ✅ Persist across deployments
- ✅ Be delivered via CDN (fast worldwide)
- ✅ Be automatically optimized
- ✅ Be backed up by Cloudinary

**No more upload issues! 🚀**
