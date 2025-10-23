# 🔧 Gmail on Render - Complete Fix Guide

## The Problem

Your email is not working on Render even though you've added all environment variables. This is almost always one of these issues:

1. **Variables not applied** (needs redeploy)
2. **Gmail App Password issues** (spaces, wrong password, 2FA not enabled)
3. **Variable name typos** (case-sensitive)
4. **Render free tier cold start timeouts**

---

## ✅ Step-by-Step Fix (Gmail Only)

### Step 1: Get Gmail App Password (5 minutes)

**Why App Password?**
- Gmail blocks "less secure apps" (regular passwords)
- App Passwords are 16-character codes for third-party apps
- Required for Gmail SMTP access

**How to Generate:**

1. **Enable 2-Factor Authentication First**
   - Go to: https://myaccount.google.com/security
   - Find "2-Step Verification"
   - Click "Get Started" and follow steps
   - **You MUST enable 2FA before you can create App Passwords**

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - If you don't see this option, 2FA isn't enabled yet
   - Select "Mail" from first dropdown
   - Select "Other (Custom name)" from second dropdown
   - Type: "Savishkar Render"
   - Click "Generate"
   - **Copy the 16-character password shown**

3. **Important: Remove Spaces!**
   - Google shows: `abcd efgh ijkl mnop`
   - You need: `abcdefghijklmnop`
   - **Remove ALL spaces before using it**

---

### Step 2: Configure Render Environment Variables (3 minutes)

1. **Go to Render Dashboard**
   - Login to render.com
   - Click on your **server** service (backend, not frontend)

2. **Go to Environment Tab**
   - Click "Environment" in left sidebar
   - You should see a list of environment variables

3. **Add/Update These 4 Variables**

Click "Add Environment Variable" for each:

```
Key: EMAIL_HOST
Value: smtp.gmail.com
```

```
Key: EMAIL_PORT
Value: 587
```

```
Key: EMAIL_USER
Value: your-email@gmail.com
```
*Replace with your actual Gmail address*

```
Key: EMAIL_PASS
Value: abcdefghijklmnop
```
*Replace with your 16-character App Password (NO SPACES!)*

4. **Critical Checks:**
   - [ ] Variable names are EXACTLY as shown (all caps, underscores)
   - [ ] EMAIL_HOST is `smtp.gmail.com` (not smtp.google.com)
   - [ ] EMAIL_PORT is `587` (not 465 or 25)
   - [ ] EMAIL_USER has full email address (with @gmail.com)
   - [ ] EMAIL_PASS has NO spaces
   - [ ] No quotes around values (Render adds them automatically)

5. **Save Changes**
   - Click "Save Changes" button at bottom

---

### Step 3: Redeploy Service (5 minutes)

**CRITICAL:** Environment variable changes don't apply automatically!

1. **Manual Deploy**
   - Stay in your Render dashboard
   - Click "Manual Deploy" in left sidebar
   - Click "Deploy latest commit" button
   - Wait for deployment to complete (5-10 minutes)

2. **Watch the Deployment**
   - You'll see build logs
   - Wait until it says "Live" with a green checkmark
   - Don't close the page until deployment completes

---

### Step 4: Check Logs (2 minutes)

1. **Go to Logs Tab**
   - Click "Logs" in left sidebar
   - Scroll to the bottom (most recent logs)

2. **Look for Email Configuration Messages**

**✅ SUCCESS - You should see:**
```
✅ Email: CONFIGURED
   Host: smtp.gmail.com
   User: your-email@gmail.com
```

**❌ FAILURE - If you see this:**
```
⚠️  Email: NOT CONFIGURED
   Missing environment variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS
```
**Fix:** Variables weren't loaded. Go back to Step 2, verify variable names, save, and redeploy again.

**❌ AUTHENTICATION FAILED - If you see this:**
```
❌ Email: CONNECTION FAILED
   Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Fix:** App Password is wrong. Go back to Step 1, generate new App Password, remove spaces, update on Render, redeploy.

---

### Step 5: Test Email Sending (3 minutes)

1. **Go to Your Live Site**
   - Open your Render URL: `https://your-app.onrender.com`

2. **Trigger an Email**
   - Try to register a new user (will send OTP)
   - Or try "Forgot Password" (will send reset link)

3. **Check Render Logs Immediately**
   - Go back to Render Dashboard → Logs
   - Scroll to bottom
   - Look for email sending messages

**✅ SUCCESS - You should see:**
```
📧 Attempting to send email to: test@example.com
📧 Using email host: smtp.gmail.com
📧 Using email user: your-email@gmail.com
✅ Email sent successfully: <message-id>
✅ Email sent to: test@example.com
```

**❌ FAILURE - If you see:**
```
❌ Email sending failed: [error message]
```
Read the error message carefully and see troubleshooting section below.

4. **Check Your Email Inbox**
   - Check the email address you used for registration
   - Check spam folder too
   - Email should arrive within 1-2 minutes

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid login" or "Username and Password not accepted"

**Cause:** Wrong App Password or 2FA not enabled

**Fix:**
1. Verify 2FA is enabled: https://myaccount.google.com/security
2. Generate NEW App Password: https://myaccount.google.com/apppasswords
3. Copy password and **remove all spaces**
4. Update EMAIL_PASS on Render
5. Redeploy

**Test your App Password locally first:**
```bash
cd server
# Make sure your local .env has the same credentials
npm run test-email
```

---

### Issue 2: "Connection timeout" or "ECONNECTION"

**Cause:** Wrong SMTP host or port, or Render cold start timeout

**Fix:**
1. Verify EMAIL_HOST is exactly: `smtp.gmail.com`
2. Verify EMAIL_PORT is exactly: `587`
3. Update on Render if wrong
4. Redeploy

**If still timing out:**
- This happens on Render Free tier during cold starts
- Service takes 30-60 seconds to wake up
- Email timeout is only 10 seconds
- **Solutions:**
  - Upgrade to Render paid tier ($7/month) - service stays awake
  - Use uptime monitoring to keep service active (ping every 5 min)
  - Accept that first email after sleep may fail
  - Increase timeout in code (see below)

---

### Issue 3: Variables Not Loading

**Cause:** Didn't redeploy after adding variables

**Fix:**
1. Go to Render Dashboard
2. Click "Manual Deploy" → "Deploy latest commit"
3. Wait for deployment to complete
4. Check logs for "Email: CONFIGURED"

**Still not working?**
- Try "Clear build cache & deploy" instead
- This forces a completely fresh deployment

---

### Issue 4: First Email After Sleep Fails

**Cause:** Render Free tier spins down after 15 minutes of inactivity

**What happens:**
1. Service is asleep
2. User tries to register
3. Service wakes up (30-60 seconds)
4. Email connection times out (only waits 10 seconds)
5. Email fails

**Solutions:**

**Option A: Keep Service Active (Free)**
- Use UptimeRobot or similar
- Ping your API every 5 minutes
- Keeps service awake
- Free tier: https://uptimerobot.com/

**Option B: Increase Timeout (Code Change)**
I can modify your email timeout settings:
```javascript
// In sendEmail.js
connectionTimeout: 30000,  // 30 seconds instead of 10
greetingTimeout: 30000,    // 30 seconds instead of 10
socketTimeout: 45000       // 45 seconds instead of 15
```

**Option C: Upgrade to Paid ($7/month)**
- Service never sleeps
- Instant response
- No timeout issues
- More reliable

---

### Issue 5: Email Goes to Spam

**Cause:** Gmail's spam filters

**Fix:**
1. Check spam folder
2. Mark as "Not Spam"
3. Add sender to contacts
4. For production, use a custom domain email
5. Or switch to SendGrid (better deliverability)

---

## 🔍 Debugging Checklist

Go through this list in order:

### Environment Variables
- [ ] Logged into Render dashboard
- [ ] Selected correct service (backend/server)
- [ ] In "Environment" tab
- [ ] EMAIL_HOST = `smtp.gmail.com` (exact)
- [ ] EMAIL_PORT = `587` (exact)
- [ ] EMAIL_USER = `your-email@gmail.com` (your actual email)
- [ ] EMAIL_PASS = 16 characters, no spaces
- [ ] Clicked "Save Changes"

### Gmail Setup
- [ ] 2-Factor Authentication is enabled
- [ ] App Password generated (not regular password)
- [ ] App Password copied correctly
- [ ] All spaces removed from App Password
- [ ] Can access https://myaccount.google.com/apppasswords

### Deployment
- [ ] Clicked "Manual Deploy"
- [ ] Deployment completed successfully
- [ ] Service shows "Live" status
- [ ] Checked logs after deployment

### Logs Verification
- [ ] Logs show "✅ Email: CONFIGURED"
- [ ] Logs show correct host: smtp.gmail.com
- [ ] Logs show correct user: your-email@gmail.com
- [ ] No error messages about missing variables

### Testing
- [ ] Visited live Render URL
- [ ] Tried to register new user
- [ ] Checked Render logs immediately
- [ ] Logs show "Email sent successfully"
- [ ] Checked email inbox (and spam)

---

## 💻 Optional: Increase Email Timeouts

If you're experiencing timeout issues on Render Free tier, I can increase the timeout values in your code.

**Current timeouts:**
- Connection: 10 seconds
- Greeting: 10 seconds
- Socket: 15 seconds

**Recommended for Render Free:**
- Connection: 30 seconds
- Greeting: 30 seconds
- Socket: 45 seconds

**Would you like me to make this change?** Just let me know and I'll update `server/utils/sendEmail.js`.

---

## 🧪 Test Email Script

You can test email locally before deploying:

1. **Update your local `.env` file** with same credentials as Render
2. **Run test script:**
```bash
cd server
npm run test-email
```

3. **Check output:**
   - Should show all 4 variables are set
   - Should connect to Gmail
   - Should send test email to yourself

If this works locally but not on Render, it's definitely an environment variable issue on Render.

---

## 📋 Quick Reference

### Correct Gmail Configuration
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your16charapppassword
```

### Where to Get App Password
https://myaccount.google.com/apppasswords

### Where to Add Variables on Render
Dashboard → Your Service → Environment → Add Environment Variable

### How to Apply Changes
Manual Deploy → Deploy latest commit

### How to Check Status
Logs tab → Look for "Email: CONFIGURED"

---

## 🎯 Summary

**The fix is usually this simple:**

1. ✅ Generate Gmail App Password (remove spaces)
2. ✅ Add 4 environment variables on Render (exact names)
3. ✅ Manual Deploy (must redeploy!)
4. ✅ Check logs for "Email: CONFIGURED"
5. ✅ Test by registering a user

**If it still doesn't work:**
- Share your Render logs (hide sensitive info)
- Tell me what error messages you see
- I'll help you debug further

---

## 🆘 Need More Help?

**Share these details:**
1. What do your Render logs show after deployment?
2. Do you see "Email: CONFIGURED" or "Email: NOT CONFIGURED"?
3. What error message appears when you try to send email?
4. Have you enabled 2FA on Gmail?
5. Did you remove spaces from App Password?

**I can help with:**
- Increasing timeout values for Render Free tier
- Setting up uptime monitoring
- Debugging specific error messages
- Alternative Gmail configurations

---

**Remember:** The most common issue is forgetting to redeploy after adding environment variables. Always click "Manual Deploy" after any changes!
