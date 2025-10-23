# 🚀 Fix Email on Render - Switch to SendGrid

## Problem: Gmail Doesn't Work on Render

Gmail SMTP is often blocked on Render's infrastructure. This is why email works on localhost but fails on Render.

## ✅ Solution: Use SendGrid (10 minutes setup)

SendGrid is free, reliable, and designed for production email sending.

---

## Step-by-Step Setup

### 1. Create SendGrid Account (2 min)
- Go to: https://signup.sendgrid.com/
- Sign up for FREE account
- Verify your email

### 2. Create API Key (2 min)
- Log into SendGrid Dashboard
- Go to **Settings** → **API Keys**
- Click **Create API Key**
- Name: `Savishkar-Render`
- Permission: **Full Access** or **Mail Send**
- Click **Create & View**
- **COPY THE KEY** (starts with `SG.`)
- Save it somewhere (you can only see it once!)

### 3. Verify Sender Email (3 min)
- Go to **Settings** → **Sender Authentication**
- Click **Verify a Single Sender**
- Fill in:
  - From Name: `Savishkar 2025`
  - From Email: your email address
  - Reply To: same email
  - Company: your college name
- Click **Create**
- Check your email and click verification link
- Wait for verification (usually instant)

### 4. Update Render Environment Variables (3 min)
- Go to Render Dashboard
- Click your **SERVER** service
- Go to **Environment** tab
- Update these variables:

```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_actual_api_key_here
```

**IMPORTANT:**
- `EMAIL_USER` must be exactly `apikey`
- `EMAIL_PASS` is your SendGrid API key

### 5. Save & Deploy
- Click **Save Changes**
- Wait for automatic redeploy (2-3 min)

### 6. Test
- Check Render logs for: `✅ Email: CONFIGURED`
- Create test account
- Check logs for: `✅ OTP Email sent successfully`
- Check your inbox for the email

---

## Why SendGrid Works on Render

- ✅ Designed for cloud hosting
- ✅ Not blocked by Render
- ✅ Free tier: 100 emails/day
- ✅ Better deliverability
- ✅ Simple API key setup

---

## Troubleshooting

**"Invalid login"**
- Regenerate API key in SendGrid
- Make sure you copied the full key

**"Sender not verified"**
- Check SendGrid → Sender Authentication
- Make sure email has green checkmark

**"Configuration incomplete"**
- Check all 4 variables are set
- Check `EMAIL_USER=apikey` exactly

---

**Total Time:** 10 minutes
**Cost:** FREE (100 emails/day)
**Reliability:** 99%+ on Render
