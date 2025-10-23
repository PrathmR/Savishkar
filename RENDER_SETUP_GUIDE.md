# Complete Render Deployment Guide

## 🚀 Quick Setup

### Step 1: Render Configuration

**Service Type:** Web Service (NOT Static Site)

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

**Root Directory:** Leave empty (use root)

---

## 📋 Environment Variables (CRITICAL!)

Add these in Render Dashboard → Environment tab:

### Required Variables:

```bash
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=https://your-app-name.onrender.com
PORT=5000
```

### Email Configuration (REQUIRED for emails to work):

**Option 1: Gmail (Simple but less reliable)**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password
```

**Option 2: SendGrid (RECOMMENDED for production)**
```bash
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

### Payment (if using Razorpay):
```bash
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Cloudinary (for image uploads):
```bash
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🔧 How the Fixes Work

### Fix 1: SPA Routing (404 on Refresh)

**What was wrong:**
- Render server didn't know about React Router routes
- Refreshing `/admin` tried to find a server route called `/admin`
- Server returned 404

**How it's fixed:**
- Server now serves React app in production mode
- All non-API routes (`/*`) are sent to `index.html`
- React Router handles the routing client-side
- API routes (`/api/*`) still work normally

**Code in `server.js`:**
```javascript
if (process.env.NODE_ENV === 'production') {
  // Serve React build
  app.use(express.static('../client/dist'));
  
  // Send all non-API routes to React
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api/')) {
      res.sendFile('index.html');
    }
  });
}
```

### Fix 2: Email Sending (Non-blocking)

**What was wrong:**
- Admin registration sent 4+ emails synchronously
- Each email took 5-30 seconds
- Total time: 30-60+ seconds → Request timeout
- Loader stuck waiting for response

**How it's fixed:**
- All emails now sent asynchronously (non-blocking)
- API responds immediately after database operations
- Emails sent in background
- User sees success message instantly

**Code pattern:**
```javascript
// ❌ BEFORE (Blocking)
await sendEmail({ ... });
res.json({ success: true });

// ✅ AFTER (Non-blocking)
sendEmail({ ... })
  .then(() => console.log('Email sent'))
  .catch(err => console.error('Email failed'));
res.json({ success: true });
```

---

## 🔍 Troubleshooting

### Issue: Emails Not Sending

**Check Render Logs:**
```
Render Dashboard → Your Service → Logs
```

**Look for:**
```
❌ Email configuration missing
❌ Invalid login
❌ Connection timeout
```

**Solutions:**

1. **Missing Configuration:**
   - Add all EMAIL_* variables in Render Environment
   - Redeploy after adding variables

2. **Invalid Login (Gmail):**
   ```
   ✅ Enable 2FA: https://myaccount.google.com/security
   ✅ Generate App Password: https://myaccount.google.com/apppasswords
   ✅ Use App Password (NOT regular password)
   ✅ Remove ALL spaces from App Password
   ```

3. **Connection Timeout:**
   - Gmail may be blocked on Render
   - **Switch to SendGrid** (recommended)
   - SendGrid free tier: 100 emails/day

4. **SendGrid Setup:**
   ```bash
   # Sign up: https://sendgrid.com
   # Create API Key: Settings → API Keys → Create API Key
   # Set permissions: Full Access
   
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxx
   ```

### Issue: 404 on Page Refresh

**Check:**
1. Is `NODE_ENV=production` set in Render?
2. Did the build complete successfully?
3. Is the client build in `client/dist` folder?

**Verify in Render Logs:**
```
✅ Building client...
✅ Client build successful
✅ Installing server dependencies...
```

### Issue: Build Fails

**Common causes:**
1. Missing dependencies
2. Build script errors
3. Out of memory

**Solution:**
```bash
# In Render Dashboard:
# Instance Type: Free (512 MB) → Upgrade to Starter (2 GB)
```

---

## 📊 Deployment Checklist

### Before Deploying:

- [ ] All environment variables added in Render
- [ ] `NODE_ENV=production` is set
- [ ] Email credentials are correct (test locally first)
- [ ] MongoDB connection string is correct
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`

### After Deploying:

- [ ] Check build logs for errors
- [ ] Visit your app URL
- [ ] Test homepage loads
- [ ] Navigate to `/admin`, `/events`, `/dashboard`
- [ ] Refresh on each page (should NOT get 404)
- [ ] Register a test user via admin dashboard
- [ ] Check if loader stops immediately
- [ ] Check Render logs for email status
- [ ] Verify email received (check spam folder)

---

## 🎯 Expected Behavior

### Admin Registration Flow:

1. **Admin fills form** → Click "Create Participant"
2. **Loader appears** → Shows for ~1 second
3. **Success message** → "User created and registered successfully!"
4. **Loader disappears** → Form resets
5. **Emails sent** → In background (2-10 seconds)
6. **Check logs** → See email status messages

### Page Refresh:

1. **Navigate to `/admin`** → Page loads
2. **Refresh page (F5)** → Page reloads correctly
3. **No 404 error** → React Router handles it
4. **Same for all routes** → `/events`, `/dashboard`, etc.

---

## 🔐 Security Notes

1. **Never commit `.env` file** to Git
2. **Use strong JWT_SECRET** (32+ random characters)
3. **Use App Passwords** for Gmail (not regular password)
4. **Rotate secrets** regularly
5. **Enable CORS** only for your domain in production

---

## 📞 Support

If issues persist:

1. **Check Render Logs:**
   - Render Dashboard → Your Service → Logs
   - Look for error messages

2. **Test Email Locally:**
   ```bash
   cd server
   npm run test-email
   ```

3. **Verify Environment Variables:**
   - Render Dashboard → Environment
   - Ensure all variables are set
   - No typos in variable names

4. **Common Mistakes:**
   - Using regular Gmail password instead of App Password
   - Spaces in App Password
   - Wrong EMAIL_HOST or EMAIL_PORT
   - Missing NODE_ENV=production
   - Build command not running

---

## 📝 Quick Commands

**Local Development:**
```bash
npm run dev
```

**Build for Production:**
```bash
npm run build
```

**Start Production Server:**
```bash
npm start
```

**Test Email Configuration:**
```bash
cd server && npm run test-email
```

---

## 🎉 Success Indicators

**In Render Logs:**
```
✅ Server running on port 5000
✅ MongoDB Connected
✅ Email Server Connected Successfully!
📧 SMTP Host: smtp.gmail.com:587
🔒 Authentication: Verified
```

**In Browser:**
```
✅ Homepage loads
✅ Can navigate to all pages
✅ Can refresh on any page
✅ Admin dashboard works
✅ Registration completes instantly
✅ Emails received
```

---

**Last Updated:** October 23, 2025
**Version:** 2.0 (Full-Stack Deployment)
