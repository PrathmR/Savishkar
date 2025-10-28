# Simple SMTP Email Setup Guide

## ✅ Simplified Email Configuration

The email system has been updated to use **simple SMTP** instead of OAuth. This is much easier to set up!

## 📝 Required Environment Variables

Add these to your `.env` file:

```env
# Email Configuration (Simple SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

## 🔑 How to Get Gmail App Password

### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Click on "2-Step Verification"
3. Follow the steps to enable 2FA

### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as the device
4. Enter "Savishkar Server" as the name
5. Click "Generate"
6. Copy the 16-character password (remove spaces)

### Step 3: Update .env File
```env
EMAIL_USER=savishkarjcer@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # Remove spaces: abcdefghijklmnop
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

## 🚀 Quick Setup (2 minutes)

### For Gmail (Recommended)
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### For Other Email Providers

#### Outlook/Hotmail
```env
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
```

#### Yahoo
```env
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
```

#### Custom SMTP Server
```env
EMAIL_USER=your-email@yourdomain.com
EMAIL_PASS=your-password
EMAIL_HOST=smtp.yourdomain.com
EMAIL_PORT=587  # or 465 for SSL
```

## ✅ Test Email Configuration

### Method 1: Run Test Script
```bash
npm run test-email
```

### Method 2: Check Server Logs
Start the server and check the logs:
```bash
npm run dev
```

Look for:
```
✅ Email Server Connected Successfully!
📧 SMTP Host: smtp.gmail.com:587
👤 Sender: your-email@gmail.com
```

## 🔧 Troubleshooting

### Error: "Invalid login"
**Solution:**
- Use App Password, NOT your regular Gmail password
- Generate App Password: https://myaccount.google.com/apppasswords
- Remove all spaces from the App Password
- Make sure 2FA is enabled

### Error: "Connection timeout"
**Solution:**
- Check EMAIL_HOST is correct (smtp.gmail.com for Gmail)
- Check EMAIL_PORT is 587 (or 465 for SSL)
- Check firewall settings
- Verify internet connection

### Error: "EMAIL_USER and EMAIL_PASS are required"
**Solution:**
- Add EMAIL_USER and EMAIL_PASS to your .env file
- Make sure there are no typos
- Restart the server after updating .env

### Error: "EAUTH"
**Solution:**
- Verify EMAIL_USER is your full email address
- Verify EMAIL_PASS is correct (App Password for Gmail)
- Check for extra spaces or typos

## 📋 What Changed?

### ❌ Removed (OAuth - Complex)
- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- `GMAIL_USER`
- `googleapis` package dependency

### ✅ Added (SMTP - Simple)
- `EMAIL_USER` - Your email address
- `EMAIL_PASS` - Your App Password
- `EMAIL_HOST` - SMTP server (default: smtp.gmail.com)
- `EMAIL_PORT` - SMTP port (default: 587)

## 🎯 Benefits of Simple SMTP

1. **Easier Setup**: Just email and App Password
2. **No OAuth Tokens**: No need to manage refresh tokens
3. **More Reliable**: Direct SMTP connection
4. **Works Everywhere**: Compatible with all email providers
5. **No External Dependencies**: Removed googleapis package

## 📝 Example .env File

```env
# Database
MONGODB_URI=mongodb://localhost:27017/savishkar

# JWT
JWT_SECRET=your_jwt_secret_key_here

# Email (Simple SMTP)
EMAIL_USER=savishkarjcer@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Cloudinary
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Keep-Alive (Optional)
SERVER_URL=https://your-server.com
ENABLE_KEEP_ALIVE=true
KEEP_ALIVE_INTERVAL=30000
```

## ✨ You're Done!

Email is now configured with simple SMTP. Just:
1. Add EMAIL_USER and EMAIL_PASS to .env
2. Restart server
3. Emails will work! 🎉

## 🆘 Still Having Issues?

Run the diagnostic script:
```bash
npm run diagnose-email
```

Or check server logs when starting:
```bash
npm run dev
```

Look for email configuration status in the startup logs.
