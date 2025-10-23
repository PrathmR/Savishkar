# 🚀 Fix Email on Render - Use SendGrid

## Problem: Gmail SMTP Blocked on Render

Render's infrastructure sometimes blocks or throttles outbound SMTP connections to Gmail (port 587). This is why email works locally but not on Render.

## ✅ Solution: Use SendGrid (Free & Reliable)

SendGrid is designed for production email sending and works perfectly on Render.

---

## 📋 Step-by-Step Setup

### **Step 1: Create SendGrid Account**

1. Go to: https://signup.sendgrid.com/
2. Sign up for **FREE** account (100 emails/day)
3. Verify your email address
4. Complete the account setup

### **Step 2: Create API Key**

1. Log into SendGrid Dashboard
2. Go to **Settings** → **API Keys** (left sidebar)
3. Click **"Create API Key"**
4. Name it: `Savishkar-Render`
5. Select **"Full Access"** or **"Mail Send"** permission
6. Click **"Create & View"**
7. **COPY THE API KEY** (starts with `SG.`)
   - ⚠️ You can only see it once! Save it somewhere safe

### **Step 3: Verify Sender Email**

1. Go to **Settings** → **Sender Authentication**
2. Click **"Verify a Single Sender"**
3. Fill in your details:
   - From Name: `Savishkar 2025`
   - From Email: Your email address (the one you want to send from)
   - Reply To: Same email
   - Company details (can be your college)
4. Click **"Create"**
5. Check your email and click the verification link
6. Wait for verification to complete (usually instant)

### **Step 4: Update Environment Variables on Render**

1. Go to your Render Dashboard
2. Click on your **SERVER** service (backend)
3. Go to **Environment** tab (left sidebar)
4. **Update** these variables:

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_actual_sendgrid_api_key_here
```

**IMPORTANT:**
- `EMAIL_USER` must be exactly `apikey` (not your email!)
- `EMAIL_PASS` is your SendGrid API key (starts with `SG.`)
- Copy the FULL API key (it's long, around 69 characters)

### **Step 5: Save & Redeploy**

1. Click **"Save Changes"** at the bottom
2. Render will automatically redeploy
3. Wait for deployment to complete (2-3 minutes)

### **Step 6: Check Logs**

After deployment, check your Render logs:

**Success:**
```
✅ Email: CONFIGURED
   Host: smtp.sendgrid.net
   User: apikey
```

**When someone signs up:**
```
🔐 OTP for user@example.com : 123456
📤 Starting email send process for: user@example.com
📧 Attempting to send email to: user@example.com
📧 Using email host: smtp.sendgrid.net
📧 Using email user: apikey
✅ OTP Email sent successfully to user@example.com
```

---

## 🎯 Why SendGrid Works Better on Render

| Feature | Gmail SMTP | SendGrid |
|---------|-----------|----------|
| Works on Render | ❌ Often blocked | ✅ Always works |
| Setup complexity | 🟡 App Password needed | 🟢 Simple API key |
| Rate limits | 🟡 500/day | 🟢 100/day (free) |
| Deliverability | 🟡 May go to spam | 🟢 Better inbox rate |
| Production ready | 🟡 Not recommended | 🟢 Designed for it |
| Free tier | ✅ Yes | ✅ Yes |

---

## 🔧 Alternative: If You Must Use Gmail

If you really want to use Gmail on Render, try these:

### **Option A: Use Gmail with Port 465 (SSL)**

Update on Render:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-no-spaces
```

Then update `server/utils/sendEmail.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000
});
```

### **Option B: Use Gmail OAuth2 (Complex)**

This is more complex but more reliable. Let me know if you want to try this.

---

## 🆘 Troubleshooting SendGrid

### **Issue: "Email configuration is incomplete"**
- Check that `EMAIL_USER=apikey` (exactly that word)
- Check that `EMAIL_PASS` has your full API key

### **Issue: "Invalid login"**
- API key might be wrong or expired
- Generate a new API key and update `EMAIL_PASS`

### **Issue: "Sender not verified"**
- Go to SendGrid → Settings → Sender Authentication
- Make sure your sender email is verified (green checkmark)

### **Issue: Emails go to spam**
- This is normal for new SendGrid accounts
- After sending a few emails, deliverability improves
- Users should check spam folder initially

---

## 📊 SendGrid Free Tier Limits

- **100 emails per day** (enough for most college events)
- Unlimited contacts
- Email validation
- Basic analytics

If you need more:
- **Essentials Plan**: $19.95/month for 50,000 emails
- But 100/day should be plenty for testing and small events

---

## ✅ Quick Setup Summary

1. **Sign up**: https://signup.sendgrid.com/
2. **Create API Key**: Settings → API Keys → Create
3. **Verify Sender**: Settings → Sender Authentication → Verify Single Sender
4. **Update Render Variables**:
   - `EMAIL_HOST=smtp.sendgrid.net`
   - `EMAIL_PORT=587`
   - `EMAIL_USER=apikey`
   - `EMAIL_PASS=SG.your_api_key`
5. **Save & Redeploy**
6. **Test signup** and check logs

---

## 🎉 Expected Result

After setup, emails will:
- ✅ Send instantly from Render
- ✅ Arrive in inbox (not spam after a few sends)
- ✅ Show proper sender name "Savishkar 2025"
- ✅ Work reliably in production

---

**Time to complete:** 10-15 minutes  
**Difficulty:** Easy  
**Recommended:** ✅ Yes, this is the best solution for Render
