# Cloudinary Setup Guide

This guide will help you set up Cloudinary for cloud image storage in your Savishkar Techfest application.

## Why Cloudinary?

- **Automatic Backup**: All uploaded images are stored in the cloud
- **CDN Delivery**: Fast image loading from global CDN
- **Image Optimization**: Automatic compression and format conversion
- **Scalability**: No server storage limits
- **Reliability**: 99.9% uptime guarantee

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a **FREE account** (includes 25GB storage and 25GB bandwidth/month)
3. Verify your email address

## Step 2: Get Your Credentials

1. After logging in, you'll be on the **Dashboard**
2. You'll see a section called **Account Details** with:
   - **Cloud Name**
   - **API Key**
   - **API Secret** (click the eye icon to reveal it)

3. Copy these three values

## Step 3: Add Credentials to Your .env File

Open your `server/.env` file and add these lines:

```env
# Cloudinary Configuration
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace the placeholder values with your actual credentials from Step 2.

## Step 4: Restart Your Server

After adding the credentials, restart your development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Step 5: Test the Upload

1. Go to your application
2. Register for an event
3. Upload a payment screenshot
4. The image will now be uploaded to Cloudinary!

## Verify It's Working

### Check in Cloudinary Dashboard:
1. Go to [https://cloudinary.com/console/media_library](https://cloudinary.com/console/media_library)
2. Navigate to the `savishkar` folder
3. You should see subfolders:
   - `payments/` - Payment screenshots
   - `events/` - Event images
   - `avatars/` - User profile pictures

### Check in Database:
The `screenshotUrl` field in the Payment model will contain a Cloudinary URL like:
```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/savishkar/payments/payment-1234567890.jpg
```

Instead of a local path like:
```
/uploads/payments/payment-1234567890.jpg
```

## Fallback to Local Storage

If Cloudinary credentials are not configured or `USE_CLOUDINARY=false`, the system will automatically fall back to local storage in the `server/uploads/` directory.

## Free Tier Limits

Cloudinary's free tier includes:
- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25,000/month
- **Images**: Unlimited

This is more than enough for most college techfests!

## Folder Structure in Cloudinary

```
savishkar/
├── payments/          # Payment screenshots
│   └── payment-*.jpg
├── events/            # Event images
│   └── event-*.jpg
└── avatars/           # User profile pictures
    └── avatar-*.jpg
```

## Image Transformations

The system automatically applies optimizations:

- **Payment Screenshots**: Max 1000x1000px
- **Event Images**: Max 1200x800px
- **Avatars**: 500x500px, cropped to face

## Troubleshooting

### Error: "Invalid cloud_name"
- Check that `CLOUDINARY_CLOUD_NAME` is correct (no spaces)

### Error: "Invalid API credentials"
- Verify `CLOUDINARY_API_KEY` and `CLOUDINARY_API_SECRET`
- Make sure there are no extra spaces

### Images still saving locally
- Ensure `USE_CLOUDINARY=true` in your .env file
- Restart the server after changing .env

### Can't see images in Cloudinary
- Check the Media Library at: https://cloudinary.com/console/media_library
- Look in the `savishkar` folder

## Security Notes

⚠️ **IMPORTANT**: Never commit your `.env` file to Git!

- The `.env` file is already in `.gitignore`
- Never share your API Secret publicly
- For production, use environment variables in your hosting platform

## Production Deployment

When deploying to production (Render, Heroku, etc.):

1. Add the Cloudinary environment variables in your hosting platform's dashboard
2. Set `USE_CLOUDINARY=true`
3. The system will automatically use Cloudinary for all uploads

## Need Help?

- Cloudinary Documentation: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com

---

**That's it!** Your images are now safely backed up in the cloud! 🎉
