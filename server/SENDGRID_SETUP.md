# SendGrid Email Setup Guide

## Why SendGrid?
- ✅ **More Reliable** than Gmail SMTP
- ✅ **100 emails/day FREE** (no credit card required)
- ✅ **Better Deliverability** - emails less likely to go to spam
- ✅ **No 2FA hassle** - simple API key authentication
- ✅ **Production Ready** - used by major companies

## Quick Setup (5 minutes)

### Step 1: Create SendGrid Account
1. Go to https://sendgrid.com/free/
2. Click **Start for Free**
3. Fill in your details (use your real email)
4. Verify your email address

### Step 2: Create API Key
1. Login to SendGrid Dashboard
2. Go to **Settings** → **API Keys** (left sidebar)
3. Click **Create API Key** (blue button, top right)
4. Configure:
   - **API Key Name**: `Savishkar-Primary` (or any name you want)
   - **API Key Permissions**: Select **Full Access** (easiest) or **Mail Send** (more secure)
5. Click **Create & View**
6. **IMPORTANT**: Copy the API key NOW (you won't see it again!)
7. Save it somewhere safe

### Step 3: Verify Sender Email
SendGrid requires you to verify the email address you'll send FROM:

1. Go to **Settings** → **Sender Authentication**
2. Click **Verify a Single Sender** (easier than domain authentication)
3. Fill in the form:
   - **From Name**: `Savishkar 2025`
   - **From Email Address**: Your email (e.g., `your-email@gmail.com`)
   - **Reply To**: Same as From Email
   - **Company Address**: Your address (required by law)
4. Click **Create**
5. Check your email and click the verification link
6. Wait for "Verified" status

### Step 4: Update Your `.env` File
```env
# Email Configuration (Primary) - SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email Configuration (Secondary - Fallback) - SendGrid
EMAIL_HOST_SECONDARY=smtp.sendgrid.net
EMAIL_PORT_SECONDARY=587
EMAIL_USER_SECONDARY=apikey
EMAIL_PASS_SECONDARY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**CRITICAL NOTES:**
- `EMAIL_USER` must be exactly `apikey` (all lowercase)
- `EMAIL_PASS` is your SendGrid API key (starts with `SG.`)
- Don't add quotes around the API key
- Don't add spaces

### Step 5: Update Your Code (if needed)
Make sure your email sending code uses the verified sender email:

```javascript
// In your sendEmail function or wherever you send emails
const mailOptions = {
  from: 'Savishkar 2025 <your-verified-email@gmail.com>', // Use verified email
  to: recipientEmail,
  subject: 'Your Subject',
  html: emailContent
};
```

### Step 6: Test It
```bash
cd server
npm run test:email
```

## For Secondary Email (Two Options)

### Option A: Create Second API Key (Same Account)
1. Go to **Settings** → **API Keys**
2. Click **Create API Key**
3. Name it `Savishkar-Secondary`
4. Copy and use as `EMAIL_PASS_SECONDARY`

### Option B: Create Second SendGrid Account
1. Use a different email address
2. Repeat Steps 1-3 above
3. Use the new API key as `EMAIL_PASS_SECONDARY`

## Free Tier Limits
- **100 emails/day** forever (no credit card)
- **40,000 emails/month** for first 30 days
- After 30 days: 100/day limit applies

## Troubleshooting

### Error: "The from address does not match a verified Sender Identity"
**Solution**: Make sure you verified your sender email in Step 3

### Error: "Invalid API Key"
**Solution**: 
- Check `EMAIL_USER=apikey` (must be lowercase)
- Verify API key is correct (starts with `SG.`)
- Regenerate API key if needed

### Emails Going to Spam
**Solution**:
- Complete Domain Authentication (advanced)
- Use a professional email domain
- Avoid spam trigger words in subject/content

## SendGrid Dashboard
Monitor your emails:
- **Activity** → See all sent emails
- **Statistics** → View delivery rates
- **Suppressions** → Check bounces/spam reports

## Production Tips
1. **Domain Authentication**: For production, authenticate your domain (better deliverability)
2. **Templates**: Use SendGrid templates for consistent branding
3. **Webhooks**: Set up webhooks to track opens/clicks
4. **Upgrade**: If you need more than 100/day, upgrade to paid plan

## Support
- SendGrid Docs: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/
