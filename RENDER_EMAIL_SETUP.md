# 📧 Email Setup Guide for Render Deployment

## Issue: Emails Not Sending on Render

Your application is hosted on Render but emails aren't being sent because the email environment variables are missing.

---

## ✅ Quick Fix - Add Email Environment Variables on Render

### Step 1: Access Your Server Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your **server** service (backend)
3. Click on **"Environment"** tab in the left sidebar

### Step 2: Add Email Configuration Variables

Click **"Add Environment Variable"** and add these 4 variables:

#### Option A: Using Gmail (Quick Setup)

| Key | Value |
|-----|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `your-email@gmail.com` |
| `EMAIL_PASS` | `your-16-char-app-password` |

**How to get Gmail App Password:**
1. Enable 2-Factor Authentication: https://myaccount.google.com/security
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Select "Mail" and "Other (Custom name)"
4. Name it "Savishkar Render"
5. Copy the 16-character password (remove spaces)
6. Use this password in `EMAIL_PASS`

⚠️ **Important:** Use the App Password, NOT your regular Gmail password!

#### Option B: Using SendGrid (Recommended for Production)

SendGrid is more reliable for production and offers 100 free emails/day.

1. **Sign up for SendGrid:** https://signup.sendgrid.com/
2. **Create an API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it "Savishkar Render"
   - Select "Full Access"
   - Copy the API key (you'll only see it once!)

3. **Add to Render:**

| Key | Value |
|-----|-------|
| `EMAIL_HOST` | `smtp.sendgrid.net` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `apikey` |
| `EMAIL_PASS` | `your_sendgrid_api_key` |

### Step 3: Save and Redeploy

1. After adding all 4 variables, click **"Save Changes"**
2. Render will automatically redeploy your service
3. Wait for the deployment to complete (check the "Logs" tab)

---

## 🔍 Verify Email Configuration

### Check Server Logs

1. Go to your server service on Render
2. Click **"Logs"** tab
3. Look for these messages after deployment:

```
✅ Email server connection verified
📧 Using email host: smtp.gmail.com
📧 Using email user: your-email@gmail.com
```

### Test Email Sending

1. Go to your deployed website
2. Try to register a new user
3. Check if you receive the OTP email
4. Check server logs for:
   ```
   ✅ Email sent successfully
   ✅ Email sent to: user@example.com
   ```

---

## ❌ Common Issues & Solutions

### Issue 1: "Email configuration missing"
**Solution:** Make sure ALL 4 variables are added:
- EMAIL_HOST
- EMAIL_PORT  
- EMAIL_USER
- EMAIL_PASS

### Issue 2: "Invalid login" (Gmail)
**Solution:**
- ✅ Enable 2-Factor Authentication first
- ✅ Use App Password, not your regular password
- ✅ Remove any spaces from the App Password
- ✅ Make sure the email account is active

### Issue 3: "Connection timeout"
**Solution:**
- Check if you typed the SMTP host correctly
- For Gmail: `smtp.gmail.com` (not `smtp.google.com`)
- For SendGrid: `smtp.sendgrid.net`
- Port should be `587` (not 465 or 25)

### Issue 4: Still not working?
**Check these:**
1. Did you save the environment variables?
2. Did Render redeploy after saving?
3. Check the "Events" tab for deployment status
4. Look at "Logs" for error messages
5. Try manual redeploy: Click "Manual Deploy" → "Deploy latest commit"

---

## 📊 Current Email Features

Your app sends emails for:

✉️ **User Registration:**
- OTP verification code
- Welcome email with unique user code

✉️ **Event Registration:**
- Registration confirmation
- Event details and registration number

✉️ **Payment:**
- Payment confirmation
- Payment approval/rejection notifications

✉️ **Account Management:**
- Password reset links
- Admin-created user credentials

---

## 🎯 Recommended Setup for Production

For the best reliability and deliverability, I recommend:

### 1. **SendGrid** (Best for most cases)
- ✅ Free tier: 100 emails/day
- ✅ Excellent deliverability
- ✅ Easy setup
- ✅ Good analytics

### 2. **Mailgun** (Alternative)
- ✅ Free tier: 5,000 emails/month
- ✅ Very reliable
- ✅ Good for high volume

### 3. **AWS SES** (For scale)
- ✅ Very cheap ($0.10 per 1,000 emails)
- ✅ Highly reliable
- ✅ Best for large scale

---

## 📝 Environment Variables Checklist

Before going live, ensure these are set on Render:

### Server Environment Variables:
- [ ] `EMAIL_HOST`
- [ ] `EMAIL_PORT`
- [ ] `EMAIL_USER`
- [ ] `EMAIL_PASS`
- [ ] `MONGODB_URI`
- [ ] `JWT_SECRET`
- [ ] `CLIENT_URL` (your frontend URL)
- [ ] `SERVER_URL` (your backend URL)
- [ ] `USE_CLOUDINARY=true`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

### Client Environment Variables:
- [ ] `VITE_API_URL` (your backend URL + /api)

---

## 🚀 Quick Start Commands

### View Current Environment Variables:
```bash
# In Render Dashboard → Your Service → Environment tab
```

### Check Logs:
```bash
# In Render Dashboard → Your Service → Logs tab
```

### Manual Redeploy:
```bash
# In Render Dashboard → Your Service → Manual Deploy → Deploy latest commit
```

---

## 💡 Pro Tips

1. **Use SendGrid for production** - More reliable than Gmail
2. **Keep App Passwords secure** - Never commit them to git
3. **Test emails in development** - Use Gmail for testing locally
4. **Monitor email sending** - Check Render logs regularly
5. **Set up email alerts** - Configure SendGrid webhooks for delivery tracking

---

## 🆘 Still Having Issues?

If emails still aren't working after following this guide:

1. **Check Render Logs** for specific error messages
2. **Verify all 4 variables** are set correctly (no typos)
3. **Try Gmail first** - It's easier to set up for testing
4. **Check your email provider** - Make sure the account is active
5. **Contact Render Support** - They can help with connectivity issues

---

## 📞 Need Help?

Common error messages and what they mean:

- `"Email configuration missing"` → Add all 4 environment variables
- `"Invalid login"` → Wrong email/password (use App Password for Gmail)
- `"Connection timeout"` → Check EMAIL_HOST and EMAIL_PORT
- `"Self-signed certificate"` → Already handled in code, shouldn't happen

---

**Last Updated:** October 2025  
**Tested On:** Render.com Free Tier  
**Status:** ✅ Working with Gmail and SendGrid
