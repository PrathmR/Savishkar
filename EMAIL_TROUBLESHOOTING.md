# 🔧 Email Troubleshooting Guide - Render Deployment

## You've added environment variables but emails still aren't working?

This guide will help you diagnose and fix the issue.

---

## 🧪 Step 1: Test Your Email Configuration

I've created a diagnostic tool to test your email setup.

### On Your Local Machine:

```bash
cd server
npm run test-email
```

This will:
- ✅ Check if all environment variables are set
- ✅ Test connection to email server
- ✅ Send a test email to yourself
- ✅ Show detailed error messages if something fails

### On Render (Check Logs):

1. Go to your Render Dashboard
2. Click on your **server** service
3. Click **"Logs"** tab
4. Look for these messages when the app starts:

**If email is configured correctly:**
```
✅ Email server connection verified
📧 Using email host: smtp.gmail.com
📧 Using email user: your-email@gmail.com
```

**If email is NOT configured:**
```
❌ Email configuration missing in .env file
Required variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
```

---

## 🔍 Common Issues & Solutions

### Issue 1: Environment Variables Not Loading on Render

**Symptoms:**
- Logs show "Email configuration missing"
- Variables are set in Render but not being read

**Solutions:**

✅ **Check Variable Names (Case Sensitive!)**
```
Correct:
EMAIL_HOST
EMAIL_PORT
EMAIL_USER
EMAIL_PASS

Wrong:
email_host  ❌
Email_Host  ❌
EMAILHOST   ❌
```

✅ **Verify Variables Are Set:**
1. Go to Render Dashboard → Your Service → **Environment** tab
2. Make sure you see all 4 variables listed
3. Click "Save Changes" if you just added them
4. Wait for automatic redeploy to complete

✅ **Manual Redeploy:**
Sometimes Render doesn't pick up new variables immediately:
1. Go to **Manual Deploy** tab
2. Click **"Deploy latest commit"**
3. Wait for deployment to complete
4. Check logs again

---

### Issue 2: Gmail "Invalid Login" Error

**Symptoms:**
- Logs show "Invalid login" or "Username and Password not accepted"
- Using Gmail for email

**Solutions:**

✅ **Use App Password, NOT Regular Password:**

1. **Enable 2-Factor Authentication:**
   - Go to: https://myaccount.google.com/security
   - Turn on "2-Step Verification"

2. **Generate App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Savishkar Render"
   - Copy the 16-character password
   - **Remove all spaces!** (e.g., `abcd efgh ijkl mnop` → `abcdefghijklmnop`)

3. **Update on Render:**
   - Go to Environment tab
   - Find `EMAIL_PASS` variable
   - Click edit (pencil icon)
   - Paste the App Password (no spaces)
   - Save and redeploy

✅ **Verify Email Address:**
- Make sure `EMAIL_USER` is your full Gmail address
- Example: `your-email@gmail.com` (not just `your-email`)

---

### Issue 3: Connection Timeout

**Symptoms:**
- Logs show "Connection timeout" or "ECONNECTION"
- Email never gets sent

**Solutions:**

✅ **Check SMTP Host:**
```
Correct for Gmail: smtp.gmail.com
Wrong: smtp.google.com ❌
Wrong: mail.google.com ❌
```

✅ **Check Port:**
```
Correct: 587
Wrong: 465 (might work but not recommended)
Wrong: 25 (usually blocked)
```

✅ **Verify on Render:**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

---

### Issue 4: Variables Set But Still Not Working

**Symptoms:**
- Variables are definitely set on Render
- Logs still show "Email configuration missing"

**Solutions:**

✅ **Check Service Type:**
- Make sure you added variables to the **SERVER** service (backend)
- NOT the client service (frontend)

✅ **Restart Service:**
1. Go to your server service on Render
2. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
3. This forces a fresh deployment

✅ **Check for Typos:**
- Variable names must be EXACT
- No extra spaces in values
- No quotes around values (Render adds them automatically)

---

### Issue 5: Using SendGrid But Still Failing

**Symptoms:**
- Switched to SendGrid but emails not working
- Getting authentication errors

**Solutions:**

✅ **Verify SendGrid Configuration:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey          ← Must be exactly "apikey"
EMAIL_PASS=your_actual_api_key_here
```

✅ **Check API Key:**
- Make sure you copied the FULL API key
- It should start with `SG.`
- Example: `SG.abc123def456...`

✅ **Verify SendGrid Account:**
- Log into SendGrid dashboard
- Check if API key is active
- Verify sender email is verified

---

## 📋 Checklist: What to Verify on Render

Go through this checklist step by step:

### Environment Variables:
- [ ] Variables are added to **SERVER** service (not client)
- [ ] All 4 variables are present: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
- [ ] Variable names are EXACTLY as shown (case-sensitive)
- [ ] No typos in variable names
- [ ] No extra spaces in values
- [ ] Values don't have quotes (Render adds them)

### Gmail Specific:
- [ ] 2-Factor Authentication is enabled
- [ ] App Password is generated (not regular password)
- [ ] App Password has no spaces
- [ ] EMAIL_HOST is `smtp.gmail.com`
- [ ] EMAIL_PORT is `587`
- [ ] EMAIL_USER is full email address

### Deployment:
- [ ] Clicked "Save Changes" after adding variables
- [ ] Service has redeployed after saving
- [ ] Checked logs after redeploy
- [ ] No error messages in logs

---

## 🧪 Testing After Fix

### Test 1: Check Server Logs
1. Go to Render → Your Service → **Logs**
2. Look for startup messages:
   ```
   ✅ Email server connection verified
   ```

### Test 2: Trigger an Email
Try one of these actions on your live site:
- Register a new user (should send OTP)
- Request password reset (should send reset link)
- Register for an event (should send confirmation)

### Test 3: Check for Errors
If email fails, logs will show:
```
❌ Email sending failed: [specific error message]
```

---

## 🆘 Still Not Working?

If you've tried everything above and emails still don't work:

### 1. **Share Your Logs**
Copy the relevant error messages from Render logs, especially:
- Any lines with ❌ or error
- Lines starting with "Email" or "📧"
- The full error stack trace

### 2. **Verify Environment Variables**
Take a screenshot of your Environment tab on Render (hide sensitive values)

### 3. **Try Alternative Email Provider**
If Gmail isn't working, try SendGrid:
- Free tier: 100 emails/day
- More reliable for production
- Easier authentication

**SendGrid Setup:**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key
```

### 4. **Test Locally First**
Before deploying to Render:
```bash
cd server
npm run test-email
```

If it works locally but not on Render, it's definitely an environment variable issue.

---

## 💡 Pro Tips

1. **Always check logs first** - They tell you exactly what's wrong
2. **Use App Passwords** - Never use regular Gmail password
3. **Remove spaces** - App Passwords have spaces, remove them!
4. **Case matters** - Variable names are case-sensitive
5. **Redeploy after changes** - Variables need a redeploy to take effect
6. **Test locally** - Use `npm run test-email` before deploying

---

## 📞 Quick Reference

### Gmail Configuration:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password-no-spaces
```

### SendGrid Configuration:
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_sendgrid_api_key
```

### Where to Add on Render:
1. Dashboard → Your **Server** Service
2. **Environment** tab (left sidebar)
3. Click **"Add Environment Variable"**
4. Add each variable
5. Click **"Save Changes"**
6. Wait for automatic redeploy

---

**Last Updated:** October 2025  
**Tested On:** Render.com Free Tier  
**Status:** ✅ Working with proper configuration
