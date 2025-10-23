# Secondary Email Configuration Guide

## Overview
Your email system now supports **automatic fallback** to a secondary email account if the primary fails.

## How It Works
1. **Primary email** is attempted first (with 2 retry attempts)
2. If primary fails, **secondary email** is automatically used (with 2 retry attempts)
3. Detailed logging shows which email account was used

## Configuration Steps

### 1. Update Your `.env` File
Add these variables to your `.env` file (copy from `.env.example`):

```env
# Email Configuration (Primary) - SendGrid
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your_sendgrid_api_key_here

# Email Configuration (Secondary - Fallback) - SendGrid
EMAIL_HOST_SECONDARY=smtp.sendgrid.net
EMAIL_PORT_SECONDARY=587
EMAIL_USER_SECONDARY=apikey
EMAIL_PASS_SECONDARY=your_secondary_sendgrid_api_key_here
```

### 2. Get SendGrid API Keys

#### For Primary Email:
1. Sign up at https://sendgrid.com (Free tier: 100 emails/day)
2. Go to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name it (e.g., "Savishkar Primary")
5. Select **Full Access** or **Mail Send** permission
6. Copy the API key and use it as `EMAIL_PASS`
7. **Important**: `EMAIL_USER` must be exactly `apikey` (lowercase)

#### For Secondary Email (Fallback):
1. Create a second SendGrid account (use different email) OR
2. Create another API key in the same account
3. Name it (e.g., "Savishkar Secondary")
4. Copy the API key and use it as `EMAIL_PASS_SECONDARY`

### 3. Verify Sender Identity
SendGrid requires sender verification:

1. Go to **Settings** → **Sender Authentication**
2. Choose **Single Sender Verification** (easiest for testing)
3. Add your email address
4. Verify via email confirmation
5. Use this verified email in your application

### 4. Alternative: Mix Providers for Maximum Reliability

**Primary: SendGrid**
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=your-sendgrid-api-key
```

**Secondary: Gmail (Fallback)**
```env
EMAIL_HOST_SECONDARY=smtp.gmail.com
EMAIL_PORT_SECONDARY=587
EMAIL_USER_SECONDARY=your-email@gmail.com
EMAIL_PASS_SECONDARY=your-gmail-app-password
```

**Secondary: Outlook (Fallback)**
```env
EMAIL_HOST_SECONDARY=smtp-mail.outlook.com
EMAIL_PORT_SECONDARY=587
EMAIL_USER_SECONDARY=your-email@outlook.com
EMAIL_PASS_SECONDARY=your-outlook-password
```

## Benefits

✅ **Automatic Failover**: No manual intervention needed
✅ **Higher Reliability**: If one email service is down, the other takes over
✅ **Detailed Logging**: Know exactly which email account sent each message
✅ **Retry Logic**: Each email account gets 2 retry attempts before switching

## Testing

Test your email configuration:
```bash
npm run test:email
```

## Console Output Examples

### When Primary Works:
```
📧 Email Send Request
🔄 Fallback Available: ✅ Yes
🔵 Attempting with PRIMARY email...
✅ Email sent successfully via PRIMARY!
```

### When Primary Fails, Secondary Works:
```
📧 Email Send Request
🔄 Fallback Available: ✅ Yes
🔵 Attempting with PRIMARY email...
❌ Primary email failed: Connection timeout
🟡 Attempting with SECONDARY email (fallback)...
✅ Email sent successfully via SECONDARY!
```

## Notes

- Secondary email is **optional** - system works without it
- If secondary is not configured, only primary will be used
- Both emails should be from reliable providers
- Consider using SendGrid as secondary for production reliability
