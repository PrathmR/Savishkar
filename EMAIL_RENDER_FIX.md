# Email Timeout Fix for Render

## Issue
Email sending times out on Render with error: `Email operation timed out after 45000ms`

## Root Causes
1. **Gmail blocking Render's IP addresses**
2. **Network/firewall restrictions on Render**
3. **Incorrect Gmail App Password**
4. **2FA not enabled on Gmail**

---

## ✅ Solution 1: Verify Gmail Configuration (Most Common)

### Step 1: Enable 2-Factor Authentication
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Complete the setup process

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **App**: Mail
3. Select **Device**: Other (Custom name) → Enter "Savishkar Render"
4. Click **Generate**
5. **Copy the 16-character password** (remove all spaces!)

### Step 3: Update Render Environment Variables
1. Go to Render Dashboard → Your Service → Environment
2. Find `GMAIL_APP_PASSWORD` (or `EMAIL_PASS`)
3. Update with the new App Password (NO SPACES!)
4. Click **Save Changes**
5. Service will auto-redeploy

### Step 4: Verify Other Email Variables
Make sure these are set correctly:
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=savishkarjcer@gmail.com
GMAIL_USER=savishkarjcer@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password_no_spaces
```

---

## ✅ Solution 2: Use Alternative Email Service (Recommended for Production)

Gmail has strict rate limits and may block cloud IPs. Consider using:

### Option A: SendGrid (Free 100 emails/day)
```bash
# Add to Render Environment Variables
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=savishkarjcer@gmail.com
```

### Option B: Mailgun (Free 5000 emails/month)
```bash
# Add to Render Environment Variables
EMAIL_SERVICE=mailgun
MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=your_domain.mailgun.org
EMAIL_FROM=savishkarjcer@gmail.com
```

### Option C: AWS SES (Very cheap, reliable)
```bash
# Add to Render Environment Variables
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_REGION=us-east-1
EMAIL_FROM=savishkarjcer@gmail.com
```

---

## ✅ Solution 3: Test Email Locally First

Before deploying, test email locally:

```bash
cd server
node scripts/testEmail.js
```

If it works locally but not on Render, it's likely a Gmail/IP blocking issue.

---

## 🔍 Debugging Steps

### 1. Check Render Logs
```bash
# Look for these errors:
- "Invalid login"           → Wrong App Password
- "Username and Password"   → Wrong credentials
- "ETIMEDOUT"              → Network/firewall issue
- "ECONNREFUSED"           → Wrong host/port
```

### 2. Test with curl (from Render Shell)
```bash
# In Render Dashboard → Shell
curl -v telnet://smtp.gmail.com:587
```

If this fails, Render's network is blocking Gmail SMTP.

### 3. Verify Gmail Settings
- 2FA enabled? ✓
- App Password generated? ✓
- "Less secure app access" OFF (use App Password instead) ✓
- No spaces in App Password? ✓

---

## 🚀 Quick Fix Checklist

- [ ] 2FA enabled on Gmail account
- [ ] App Password generated (16 characters)
- [ ] App Password has NO spaces
- [ ] `GMAIL_APP_PASSWORD` updated on Render
- [ ] `EMAIL_USER` = full email address
- [ ] `EMAIL_HOST` = smtp.gmail.com
- [ ] `EMAIL_PORT` = 587
- [ ] Service redeployed after changes
- [ ] Tested with a real registration

---

## 💡 Why Gmail Might Block Render

1. **Cloud IP reputation** - Gmail may flag Render's IPs as suspicious
2. **Rate limiting** - Too many emails in short time
3. **Authentication issues** - Wrong credentials
4. **Security policies** - Gmail blocking automated access

**Best Practice:** Use a dedicated email service (SendGrid/Mailgun/SES) for production instead of Gmail.

---

## 📊 Current Configuration

Your current setup:
```javascript
Host: smtp.gmail.com
Port: 587
Secure: false (TLS)
Timeout: 30s (optimized for cloud)
Retries: 2
Pool: disabled (better for cloud)
```

---

## 🔄 After Fixing

1. **Redeploy on Render**
2. **Test user registration**
3. **Check Render logs** for success message
4. **Verify email received**

---

## 📞 Still Not Working?

If Gmail continues to timeout:

1. **Switch to SendGrid** (easiest, free tier available)
2. **Use Mailgun** (good free tier)
3. **Contact Render support** about SMTP restrictions
4. **Check Gmail account** for security alerts

---

**Last Updated:** October 30, 2025
