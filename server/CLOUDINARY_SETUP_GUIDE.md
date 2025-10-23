# 🚀 Cloudinary Setup Guide - Step by Step

## 📋 Prerequisites
- Your application is ready to deploy
- You have access to your hosting platform (Render/Heroku/Railway)

---

## Step 1: Create Cloudinary Account (5 minutes)

### 1.1 Sign Up
1. Go to: **https://cloudinary.com/users/register_free**
2. Fill in your details:
   - Email
   - Password
   - Choose "Developer" as your role
3. Click **"Create Account"**
4. Verify your email

### 1.2 Free Tier Includes:
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ 25,000 transformations/month
- ✅ Unlimited image uploads
- ✅ CDN delivery worldwide

---

## Step 2: Get Your Credentials (2 minutes)

### 2.1 Access Dashboard
1. Log in to Cloudinary
2. You'll land on the **Dashboard** page
3. Look for the **"Account Details"** section at the top

### 2.2 Copy These Values:
You'll see something like this:

```
Cloud name:    demo-cloud-123
API Key:       123456789012345
API Secret:    abcdefghijklmnopqrstuvwxyz123456
```

**Copy these three values** - you'll need them in the next step.

---

## Step 3: Update Local Environment (1 minute)

### 3.1 Edit Your `.env` File
Open `server/.env` and update these lines:

```env
# Change from false to true
USE_CLOUDINARY=true

# Replace with your actual credentials
CLOUDINARY_CLOUD_NAME=demo-cloud-123
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

### 3.2 Test Locally (Optional)
```bash
cd server
npm run dev
```

Try uploading an image - it should now go to Cloudinary!

---

## Step 4: Configure Hosting Platform

Choose your hosting platform:

### Option A: Render.com

1. **Go to your service** on Render dashboard
2. Click **"Environment"** tab in the left sidebar
3. Click **"Add Environment Variable"** button
4. Add these **4 variables** one by one:

| Key | Value |
|-----|-------|
| `USE_CLOUDINARY` | `true` |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | `your_api_key` |
| `CLOUDINARY_API_SECRET` | `your_api_secret` |

5. Click **"Save Changes"**
6. Your service will automatically redeploy

---

### Option B: Heroku

1. **Go to your app** on Heroku dashboard
2. Click **"Settings"** tab
3. Scroll to **"Config Vars"** section
4. Click **"Reveal Config Vars"**
5. Add these **4 variables**:

| KEY | VALUE |
|-----|-------|
| `USE_CLOUDINARY` | `true` |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | `your_api_key` |
| `CLOUDINARY_API_SECRET` | `your_api_secret` |

6. Click **"Add"** for each variable
7. Redeploy your app:
   ```bash
   git push heroku main
   ```

---

### Option C: Railway.app

1. **Go to your project** on Railway dashboard
2. Click on your **service**
3. Go to **"Variables"** tab
4. Click **"New Variable"** button
5. Add these **4 variables**:

```
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

6. Railway will automatically redeploy

---

### Option D: Vercel (Serverless)

1. **Go to your project** on Vercel dashboard
2. Click **"Settings"**
3. Click **"Environment Variables"**
4. Add these **4 variables** for all environments (Production, Preview, Development):

```
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. Redeploy:
   ```bash
   vercel --prod
   ```

---

## Step 5: Verify Setup (3 minutes)

### 5.1 Check Server Logs
After deployment, check your server logs for successful startup

### 5.2 Test Upload
1. Go to your deployed application
2. Try uploading:
   - User avatar (signup or profile page)
   - Event image (admin panel)
   - Payment screenshot

### 5.3 Verify in Cloudinary Dashboard
1. Go to: **https://cloudinary.com/console/media_library**
2. You should see folders:
   - `savishkar/avatars/`
   - `savishkar/events/`
   - `savishkar/payments/`
3. Your uploaded images should appear here!

### 5.4 Check Database
Your database documents should now contain Cloudinary URLs like:
```
https://res.cloudinary.com/your-cloud/image/upload/v123/savishkar/avatars/avatar-456.jpg
```

---

## 🎯 Quick Reference

### Environment Variables Needed:
```env
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Where to Get Credentials:
**https://cloudinary.com/console**

### Cloudinary Folders Created:
- `savishkar/avatars/` - User profile pictures
- `savishkar/events/` - Event images
- `savishkar/payments/` - Payment screenshots

---

## 🆘 Troubleshooting

### Problem: Uploads still saving locally
**Solution:** 
- Verify `USE_CLOUDINARY=true` (not 'True' or '1')
- Check all 4 environment variables are set
- Restart your server

### Problem: "Invalid credentials" error
**Solution:**
- Double-check your Cloudinary credentials
- Make sure there are no extra spaces
- Verify you copied from the correct Cloudinary account

### Problem: Images not appearing
**Solution:**
- Check Cloudinary Media Library to confirm upload
- Verify CORS settings if accessing from different domain
- Check browser console for errors

### Problem: "Folder not found" error
**Solution:**
- Folders are created automatically on first upload
- No need to manually create folders in Cloudinary

---

## 📊 Monitoring Usage

### Check Your Usage:
1. Go to: **https://cloudinary.com/console/usage**
2. Monitor:
   - Storage used
   - Bandwidth consumed
   - Transformations used

### Free Tier Limits:
- Storage: 25 GB
- Bandwidth: 25 GB/month
- Transformations: 25,000/month

**Tip:** These limits are very generous for most applications!

---

## 🔐 Security Best Practices

### ✅ DO:
- Keep API credentials in environment variables
- Never commit `.env` file to Git
- Use different Cloudinary accounts for dev/prod (optional)
- Regularly rotate API secrets

### ❌ DON'T:
- Hardcode credentials in source code
- Share credentials publicly
- Commit `.env` to version control
- Use same credentials across multiple projects

---

## 🚀 Next Steps

After setup is complete:

1. ✅ Test all upload endpoints
2. ✅ Verify images appear in Cloudinary dashboard
3. ✅ Check database contains Cloudinary URLs
4. ✅ Test image loading on frontend
5. ✅ Monitor usage in Cloudinary console

---

## 💡 Pro Tips

### Optimize Images:
Cloudinary automatically optimizes images. Your current config includes:
- Avatars: 500x500px, face-focused cropping
- Events: 1200x800px, limited size
- Payments: 1000x1000px, limited size

### Backup Strategy:
- Cloudinary stores your images reliably
- Consider periodic exports for critical data
- Database contains URLs, so you can always access images

### Cost Management:
- Free tier is usually sufficient for small-medium apps
- Monitor usage monthly
- Upgrade only when needed (starts at $89/month for Pro)

---

## ✅ Checklist

Before going live, ensure:

- [ ] Cloudinary account created
- [ ] Credentials copied from dashboard
- [ ] Environment variables set on hosting platform
- [ ] Application redeployed
- [ ] Avatar upload tested
- [ ] Event image upload tested
- [ ] Payment screenshot upload tested
- [ ] Images visible in Cloudinary Media Library
- [ ] Database contains Cloudinary URLs
- [ ] Images load correctly on frontend

---

## 📞 Support

### Cloudinary Documentation:
- **Getting Started:** https://cloudinary.com/documentation
- **Node.js SDK:** https://cloudinary.com/documentation/node_integration
- **Support:** https://support.cloudinary.com

### Your Application:
- Check `UPLOAD_SOLUTIONS.md` for alternatives
- Check `CLOUDINARY_DATABASE_FLOW.md` for technical details

---

**🎉 That's it! Your uploads should now work perfectly on your hosted application!**
