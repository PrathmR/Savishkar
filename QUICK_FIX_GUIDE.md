# ⚡ Quick Fix Guide - Email Not Working on Render

## 🚨 Most Likely Issue: Variables Not Applied

### Fix in 3 Steps:

**1. Verify Variables (30 seconds)**
- Go to Render Dashboard → Your Service → **Environment**
- Check these 4 variables exist EXACTLY as shown:
  ```
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASS=your16digitapppassword
  ```

**2. Redeploy (5 minutes)**
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Wait for deployment to complete

**3. Check Logs (1 minute)**
- Click **"Logs"** tab
- Look for: `✅ Email: CONFIGURED`
- If you see: `⚠️ Email: NOT CONFIGURED` → Variables not loaded, try again

---

## ✅ If Email Still Doesn't Work

### Check Gmail App Password

**Problem:** Using regular password instead of App Password

**Fix:**
1. Go to: https://myaccount.google.com/apppasswords
2. Generate new App Password
3. **Remove ALL spaces** from the password
4. Update `EMAIL_PASS` on Render
5. Redeploy

**Example:**
- ❌ Wrong: `abcd efgh ijkl mnop` (has spaces)
- ✅ Correct: `abcdefghijklmnop` (no spaces)

---

## 🔄 Switch to SendGrid (Recommended)

If Gmail keeps failing, use SendGrid (more reliable):

**1. Get SendGrid API Key**
- Sign up: https://sendgrid.com/
- Settings → API Keys → Create API Key
- Copy the key (starts with `SG.`)

**2. Update Render Variables**
```
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.your_actual_api_key_here
```

**3. Redeploy**
- Manual Deploy → Deploy latest commit

---

## 📊 How to Check Logs

**What to look for:**

✅ **Working:**
```
✅ Email: CONFIGURED
   Host: smtp.gmail.com
   User: your-email@gmail.com
```

❌ **Not Working:**
```
⚠️ Email: NOT CONFIGURED
   Missing environment variables
```

❌ **Authentication Failed:**
```
❌ Email: CONNECTION FAILED
   Error: Invalid login
```

---

## 🎯 Testing Checklist

After fixing:
- [ ] Redeploy completed
- [ ] Logs show "Email: CONFIGURED"
- [ ] Register new user on live site
- [ ] Check email inbox (and spam)
- [ ] Check Render logs for "Email sent successfully"

---

## 🌐 Moving to Proper Domain (When Ready)

### Current (Testing):
```
https://your-app.onrender.com
```

### Future (Production):
```
https://yourdomain.com (Frontend on Vercel)
https://api.yourdomain.com (Backend on Render)
```

### What You Need:
1. **Domain name** ($10-15/year) - Namecheap, GoDaddy
2. **Vercel account** (Free) - For frontend
3. **Update environment variables** - Point to new domains

### Cost:
- Testing: **$0/month** (Render free tier)
- Production: **~$8/month** (Render $7 + Domain $1)

---

## 💡 Quick Tips

1. **Always redeploy after changing variables**
2. **Check logs first** - They show exactly what's wrong
3. **Use App Password for Gmail** - Not regular password
4. **Remove spaces from App Password**
5. **SendGrid is more reliable** - Consider switching

---

## 📞 Need Help?

Share these from Render:
1. Logs (after deployment)
2. Environment variables (hide passwords)
3. Error messages you see

---

**Read full guide:** `RENDER_EMAIL_DIAGNOSIS.md`
