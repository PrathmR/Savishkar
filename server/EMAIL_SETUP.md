# Email Service Configuration

This application uses **Gmail API with OAuth2** for sending emails.

## Why Gmail API with OAuth2?

- ✅ **Secure**: No passwords stored, uses OAuth2 tokens
- ✅ **High Limits**: ~10,000+ emails/day (vs ~500 with SMTP)
- ✅ **Fast**: Direct API access, no SMTP delays
- ✅ **Reliable**: No connection timeouts or authentication issues
- ✅ **Free**: Generous quota with Google Cloud

## How It Works

```
Email Request → Gmail API (OAuth2) → Success ✅
                     ↓ (if fails)
                   Error ❌
```

## Installation

Install the required package:

```bash
cd server
npm install googleapis
```

## Environment Variables

Add these variables to your `.env` file:

### Gmail API OAuth2 Configuration

```env
# Gmail API OAuth2 Configuration
GMAIL_CLIENT_ID=your_client_id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REFRESH_TOKEN=your_refresh_token
GMAIL_USER=your_gmail@gmail.com
```

**How to get Gmail OAuth2 credentials:**

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console]()
2. Create a new project or select existing one
3. Enable **Gmail API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Gmail API"
   - Click "Enable"

#### Step 2: Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Configure consent screen if prompted:
   - User Type: External
   - Add your email as test user
4. Application type: **Web application**
5. Add authorized redirect URI: `https://developers.google.com/oauthplayground`
6. Copy the **Client ID** and **Client Secret**

#### Step 3: Get Refresh Token
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Click the gear icon (⚙️) in top right
3. Check "Use your own OAuth credentials"
4. Enter your **Client ID** and **Client Secret**
5. In Step 1, select **Gmail API v1** → `https://mail.google.com/`
6. Click "Authorize APIs"
7. Sign in with your Gmail account
8. Click "Exchange authorization code for tokens"
9. Copy the **Refresh token**

#### Step 4: Add to .env
```env
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_USER=your-email@gmail.com
```

## Complete .env Example

```env
# Gmail API OAuth2
GMAIL_CLIENT_ID=your-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token
GMAIL_USER=your-email@gmail.com
```

## Testing

Test the email service:

```bash
npm run test-email
```

## Behavior

### Success Scenario
```
📧 Email Send Request
─────────────────────────────────────────────────
🕐 Time: 2025-10-25T01:00:00.000Z

📧 Attempting Gmail API (OAuth2)
─────────────────────────────────────────────────
📬 To: user@example.com
📝 Subject: Welcome to Savishkar 2025
👤 From: savishkar2025@gmail.com
✅ Email sent via Gmail API (OAuth2)!
📨 Message ID: <abc123@mail.gmail.com>
📬 Delivered to: user@example.com
─────────────────────────────────────────────────
⏱️  Total Duration: 1500ms
```

### Failure Scenario
```
📧 Email Send Request
─────────────────────────────────────────────────
❌ Gmail API failed: Token has been expired or revoked

💡 OAUTH2 TOKEN ERROR:
   • Refresh token has expired or been revoked
   • Generate a new refresh token from OAuth Playground
   • Visit: https://developers.google.com/oauthplayground
```

## Advantages

- **Security**: OAuth2 tokens instead of passwords
- **High Limits**: ~10,000+ emails/day
- **Fast**: Direct API access, no SMTP overhead
- **Reliable**: No connection timeouts
- **Free**: Generous Google Cloud quota
- **Auto Refresh**: Tokens refresh automatically
- **Better Logging**: Detailed success/error messages

## Troubleshooting

### Gmail OAuth2 Issues
- **Token expired/revoked**: Refresh token expired - generate new one from OAuth Playground
- **Invalid client**: Check `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET` in Google Cloud Console
- **Invalid grant**: Token might be expired or credentials don't match
- **API not enabled**: Enable Gmail API in Google Cloud Console
- **Quota exceeded**: Check API quota in Google Cloud Console (very rare with Gmail API)

## Production Recommendations

1. **Monitor quota usage** - Check Google Cloud Console for API usage
2. **Set up error alerts** - Get notified if emails fail
3. **Keep refresh token secure** - Store in environment variables, never commit to git
4. **Test regularly** - Run `npm run test-email` to verify configuration
5. **Backup credentials** - Keep a copy of your OAuth2 credentials in a secure location
6. **Use service account** - For production, consider using a Google Workspace service account

## Cost

- **Gmail API**: **100% FREE** with generous quota
  - 1 billion quota units/day
  - ~10,000+ emails/day
  - No credit card required
  - Perfect for small to medium applications

## Support & Resources

For help and documentation:
- **Gmail API Guide**: [https://developers.google.com/gmail/api/guides](https://developers.google.com/gmail/api/guides)
- **Gmail API Reference**: [https://developers.google.com/gmail/api/reference/rest](https://developers.google.com/gmail/api/reference/rest)
- **OAuth 2.0 Playground**: [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
- **Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/)
- **OAuth2 Setup Video**: [https://www.youtube.com/results?search_query=gmail+api+oauth2+nodejs](https://www.youtube.com/results?search_query=gmail+api+oauth2+nodejs)

## Quick Start Summary

1. **Install package**: `npm install googleapis`
2. **Create Google Cloud project** and enable Gmail API
3. **Create OAuth2 credentials** (Web application)
4. **Get refresh token** from OAuth Playground
5. **Add to .env**: `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`, `GMAIL_USER`
6. **Test**: `npm run test-email`

That's it! Your email service is ready. 🚀
