# Environment Setup Instructions

## 📝 Add Fallback Email to .env

To enable the fallback email system, add these lines to your `server/.env` file:

```bash
# Fallback Email Configuration
FALLBACK_EMAIL_HOST=smtp.gmail.com
FALLBACK_EMAIL_PORT=587
FALLBACK_EMAIL_USER=savishkarjcer2k25@gmail.com
FALLBACK_EMAIL_PASS=ohdvmfdxzpwxytjw
```

## 📋 Complete .env Example

Your `server/.env` should look like this:

```bash
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# Primary Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=savishkarjcer@gmail.com
EMAIL_PASS=your_primary_app_password

# Fallback Email (NEW!)
FALLBACK_EMAIL_HOST=smtp.gmail.com
FALLBACK_EMAIL_PORT=587
FALLBACK_EMAIL_USER=savishkarjcer2k25@gmail.com
FALLBACK_EMAIL_PASS=ohdvmfdxzpwxytjw

# Cloudinary
CLOUDINARY_CLOUD_NAME=dpcypbj7a
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Client URL
CLIENT_URL=http://localhost:5173
```

## 🧪 Test the Setup

After adding the fallback credentials, run:

```bash
cd server
npm run test-fallback-email
```

This will:
1. ✅ Test primary email (should work)
2. ✅ Test fallback email (should work when primary fails)

## 🚀 For Render Deployment

Add these environment variables in Render Dashboard:

```
FALLBACK_EMAIL_HOST=smtp.gmail.com
FALLBACK_EMAIL_PORT=587
FALLBACK_EMAIL_USER=savishkarjcer2k25@gmail.com
FALLBACK_EMAIL_PASS=ohdvmfdxzpwxytjw
```

## ✅ Verification

After setup, you should see:
- ✅ Test 1 (Normal Send): PASSED
- ✅ Test 2 (Fallback Send): PASSED

Both test emails will be sent to the configured email address.
