# Fallback Email System

## 🎯 Overview

The application now includes an **automatic fallback email system** that ensures email delivery even if the primary email credentials fail.

### How It Works:
1. **Primary email** is attempted first
2. If primary fails → **Fallback email** is automatically used
3. If both fail → Error is thrown with details from both attempts

---

## 📧 Configuration

### Environment Variables

Add these to your `.env` file or Render environment variables:

```bash
# Primary Email (Tried First)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=savishkarjcer@gmail.com
EMAIL_PASS=your_primary_app_password

# Fallback Email (Used if Primary Fails)
FALLBACK_EMAIL_HOST=smtp.gmail.com
FALLBACK_EMAIL_PORT=587
FALLBACK_EMAIL_USER=savishkarjcer2k25@gmail.com
FALLBACK_EMAIL_PASS=ohdvmfdxzpwxytjw
```

### Optional: Different SMTP Servers

You can use different SMTP servers for fallback:

```bash
# Primary: Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=primary@gmail.com
EMAIL_PASS=primary_app_password

# Fallback: Outlook
FALLBACK_EMAIL_HOST=smtp-mail.outlook.com
FALLBACK_EMAIL_PORT=587
FALLBACK_EMAIL_USER=fallback@outlook.com
FALLBACK_EMAIL_PASS=fallback_password
```

---

## 🔄 Automatic Fallback Flow

```
User Registration
      ↓
Try sending email with PRIMARY credentials
      ↓
   Success? ──YES──> ✅ Email sent (Primary)
      ↓
     NO
      ↓
Check if FALLBACK credentials exist
      ↓
   Exist? ──NO──> ❌ Error: Primary failed
      ↓
    YES
      ↓
Try sending email with FALLBACK credentials
      ↓
   Success? ──YES──> ✅ Email sent (Fallback)
      ↓
     NO
      ↓
❌ Error: Both Primary and Fallback failed
```

---

## 📊 Log Examples

### Success with Primary:
```
📧 Email Send Request (PRIMARY)
──────────────────────────────────────────────────
🕐 Time: 2025-10-30T15:30:00.000Z
📬 To: user@example.com
📝 Subject: Welcome to Savishkar 2025
👤 From: savishkarjcer@gmail.com
🌐 SMTP Host: smtp.gmail.com
🔌 Port: 587
✅ Email sent successfully!
📨 Message ID: <abc123@gmail.com>
📬 Delivered to: user@example.com
⏱️  Duration: 2340ms
──────────────────────────────────────────────────
```

### Fallback Used:
```
📧 Email Send Request (PRIMARY)
──────────────────────────────────────────────────
👤 From: savishkarjcer@gmail.com
❌ Primary email failed: Email operation timed out

🔄 Attempting to send with FALLBACK email credentials...

📧 Email Send Request (FALLBACK)
──────────────────────────────────────────────────
👤 From: savishkarjcer2k25@gmail.com
📧 Using FALLBACK email credentials
✅ Email sent successfully!
✅ Email sent successfully using FALLBACK credentials!
📨 Message ID: <xyz789@gmail.com>
⏱️  Duration: 3120ms
──────────────────────────────────────────────────
```

### Both Failed:
```
❌ Primary email failed: Invalid login
🔄 Attempting to send with FALLBACK email credentials...
❌ Fallback email also failed: Email operation timed out
❌ Error: Both primary and fallback email failed. 
   Primary: Invalid login, 
   Fallback: Email operation timed out
```

---

## 🚀 Deployment

### Local Development

Add to `server/.env`:
```bash
# Primary
EMAIL_USER=savishkarjcer@gmail.com
EMAIL_PASS=your_primary_password

# Fallback
FALLBACK_EMAIL_USER=savishkarjcer2k25@gmail.com
FALLBACK_EMAIL_PASS=ohdvmfdxzpwxytjw
```

### Render Deployment

Add to Render Environment Variables:

1. Go to Render Dashboard → Your Service → Environment
2. Add these variables:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=savishkarjcer@gmail.com
EMAIL_PASS=your_primary_app_password

FALLBACK_EMAIL_HOST=smtp.gmail.com
FALLBACK_EMAIL_PORT=587
FALLBACK_EMAIL_USER=savishkarjcer2k25@gmail.com
FALLBACK_EMAIL_PASS=ohdvmfdxzpwxytjw
```

3. Click "Save Changes" (auto-redeploys)

---

## ✅ Testing

### Test Locally:
```bash
cd server
node scripts/testEmail.js
```

### Test on Render:
1. Register a new user
2. Check Render logs
3. Look for "PRIMARY" or "FALLBACK" in logs
4. Verify email received

---

## 🔧 Troubleshooting

### Primary Always Fails
- Check `EMAIL_USER` and `EMAIL_PASS` are correct
- Verify Gmail App Password (no spaces!)
- Ensure 2FA is enabled on Gmail account

### Fallback Not Triggered
- Verify `FALLBACK_EMAIL_USER` and `FALLBACK_EMAIL_PASS` are set
- Check logs for "No fallback email credentials configured"

### Both Fail
- Check both Gmail accounts have 2FA enabled
- Verify both App Passwords are correct
- Check Render's network isn't blocking Gmail SMTP
- Consider using SendGrid/Mailgun instead

---

## 💡 Best Practices

### 1. Use Different Gmail Accounts
```bash
PRIMARY: savishkarjcer@gmail.com
FALLBACK: savishkarjcer2k25@gmail.com  ✅ Good
```

### 2. Keep Fallback Credentials Secure
- Don't commit `.env` file to Git
- Use Render's environment variables
- Rotate passwords periodically

### 3. Monitor Fallback Usage
- Check logs regularly
- If fallback is used often → Fix primary email
- Set up alerts for email failures

### 4. Test Both Accounts
```bash
# Test primary
EMAIL_USER=primary@gmail.com npm run test-email

# Test fallback
EMAIL_USER=fallback@gmail.com npm run test-email
```

---

## 📈 Response Format

The `sendEmail` function now returns:

```javascript
{
  messageId: '<abc123@gmail.com>',
  service: 'smtp-primary',  // or 'smtp-fallback'
  duration: 2340,
  usedFallback: false  // true if fallback was used
}
```

You can check `usedFallback` to track when fallback is being used.

---

## 🎯 When to Use Fallback

**Good Use Cases:**
- ✅ Primary email rate limited
- ✅ Primary account temporarily blocked
- ✅ Primary credentials expired
- ✅ Network issues with primary SMTP

**Not Recommended:**
- ❌ As permanent solution (fix primary instead)
- ❌ For load balancing (use proper email service)
- ❌ To avoid fixing configuration issues

---

## 🔄 Disabling Fallback

To disable fallback, simply don't set the fallback environment variables:

```bash
# Only set primary
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Don't set FALLBACK_EMAIL_USER or FALLBACK_EMAIL_PASS
```

The system will work normally with just primary credentials.

---

## 📞 Support

If you need help:
1. Check Render logs for detailed error messages
2. Verify both Gmail accounts have 2FA + App Passwords
3. Test both accounts individually
4. Consider switching to SendGrid for production

---

**Feature Added:** October 30, 2025
**Status:** Production Ready ✅
