# 🚀 RENDER EMAIL - QUICK FIX CARD

## 🎯 Your Problem
**Emails work locally but NOT on Render**

## ⚡ Root Cause
**Environment variables are missing on Render**

---

## ✅ SOLUTION (Choose One)

### Option 1: SendGrid (Recommended)
```
1. Sign up: https://signup.sendgrid.com/
2. Create API Key → Copy it (starts with SG.)
3. Verify sender email (check email for link)
4. Add to Render Environment:
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_USER=apikey
   EMAIL_PASS=SG.your_api_key_here
5. Save Changes → Deploy
```

### Option 2: Gmail
```
1. Enable 2FA: https://myaccount.google.com/security
2. App Password: https://myaccount.google.com/apppasswords
3. Copy 16-char password (remove spaces!)
4. Add to Render Environment:
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your16charpassword
5. Save Changes → Deploy
```

---

## 📍 Where to Add Variables

```
1. Login: https://dashboard.render.com/
2. Select your web service
3. Click "Environment" in left sidebar
4. Click "Add Environment Variable"
5. Add all 4 variables
6. Click "Save Changes"
7. Go to "Manual Deploy" → "Deploy latest commit"
```

---

## ✅ Variable Names (EXACT)

```
EMAIL_HOST  (not SMTP_HOST or EMAIL_HOSTNAME)
EMAIL_PORT  (not SMTP_PORT)
EMAIL_USER  (not EMAIL_USERNAME or SMTP_USER)
EMAIL_PASS  (not EMAIL_PASSWORD or SMTP_PASS)
```

---

## 🔍 Verify Success

**In Render Logs:**
```
✅ Email Server Connected Successfully!
📧 SMTP Host: smtp.sendgrid.net:587
👤 Sender: apikey
🔒 Authentication: Verified
```

---

## 🚨 Common Mistakes

| ❌ Wrong | ✅ Correct |
|----------|-----------|
| Variables not added | Add all 4 variables |
| Regular Gmail password | Use App Password |
| `EMAIL_USER=your@email.com` (SendGrid) | `EMAIL_USER=apikey` |
| App Password with spaces | Remove ALL spaces |
| Forgot to deploy | Deploy after adding variables |
| Sender not verified (SendGrid) | Click verification link |

---

## 📋 Checklist

- [ ] All 4 variables added
- [ ] Variable names EXACTLY correct
- [ ] No typos in values
- [ ] SendGrid: sender verified OR Gmail: 2FA enabled
- [ ] Clicked "Save Changes"
- [ ] Deployed latest commit
- [ ] Checked logs for success message

---

## 🆘 Still Not Working?

Check Render logs for:
- `❌ Email: NOT CONFIGURED` → Variables missing
- `❌ Invalid login` → Wrong credentials
- `❌ Connection timeout` → Use SendGrid instead

---

## ⏱️ Time: 10-15 minutes
## 💰 Cost: FREE
## ✅ Works: Render Free & Paid Tiers

---

**Full Guide:** See `RENDER_EMAIL_NOT_SENDING_FIX.md`
