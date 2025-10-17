# Email Setup Guide for Savishkar 2025

## 📧 Email Configuration Required

For the admin registration system to send emails automatically, you need to configure email settings in your `.env` file.

## 🔧 Setup Instructions

### Option 1: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Savishkar 2025"
   - Copy the 16-character password

3. **Update your `.env` file:**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

### Option 2: Other Email Providers

#### **Outlook/Hotmail**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASS=your-password
```

#### **Yahoo Mail**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASS=your-app-password
```

#### **Custom SMTP Server**
```env
EMAIL_HOST=your-smtp-server.com
EMAIL_PORT=587
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-password
```

## ✅ Testing Email Configuration

After setting up, restart your server and check the console logs:

```bash
cd server
npm run dev
```

When you register a user through admin panel, you should see:
```
📧 Attempting to send email to: user@example.com
📧 Using email host: smtp.gmail.com
📧 Using email user: your-email@gmail.com
✅ Email server connection verified
✅ Email sent successfully: <message-id>
✅ Email sent to: user@example.com
```

## ❌ Common Issues

### Issue 1: "Email configuration missing"
**Solution:** Make sure all 4 variables are set in `.env`:
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_USER
- EMAIL_PASS

### Issue 2: "Invalid login"
**Solution:** 
- For Gmail: Use App Password, not your regular password
- Enable 2FA first, then generate App Password

### Issue 3: "Connection timeout"
**Solution:**
- Check your firewall settings
- Ensure port 587 is not blocked
- Try port 465 with `secure: true`

### Issue 4: "Self-signed certificate"
**Solution:** Already handled in code with `rejectUnauthorized: false`

## 📝 Email Features

When admin registers a new user, the system automatically sends:

1. **Welcome Email** with:
   - Login credentials (email + temporary password)
   - Unique participant code
   - Login link

2. **Registration Confirmation Email** with:
   - Event details
   - Registration number
   - Team information (if applicable)
   - Payment status

## 🔒 Security Notes

- Never commit `.env` file to git
- Use App Passwords for Gmail (more secure)
- Change default passwords in production
- Use environment-specific configurations

## 🚀 Production Recommendations

For production, consider using:
- **SendGrid** (Free tier: 100 emails/day)
- **Mailgun** (Free tier: 5,000 emails/month)
- **AWS SES** (Very cheap, reliable)
- **Postmark** (Great deliverability)

These services provide better deliverability and analytics.
