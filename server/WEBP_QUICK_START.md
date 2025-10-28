# WebP Conversion - Quick Start Guide

## 🚀 Installation (2 minutes)

```bash
cd server
npm install sharp streamifier
```

## 📸 Usage

### Upload Single Image
```bash
npm run convert-upload ./image.jpg
```

### Upload with Folder
```bash
npm run convert-upload ./image.jpg -- --folder savishkar/events
```

### Upload Directory
```bash
npm run convert-upload ./images -- --folder savishkar/gallery
```

### Upload with Type Preset
```bash
# Avatar (500x500, 85% quality)
npm run convert-upload ./avatar.jpg -- --type avatar

# Event (1200x800, 80% quality)
npm run convert-upload ./banner.jpg -- --type event

# QR Code (lossless, 95% quality)
npm run convert-upload ./qrcode.png -- --type qrcode

# Payment (1000x1000, 90% quality)
npm run convert-upload ./payment.jpg -- --type payment
```

### Custom Options
```bash
npm run convert-upload ./photo.jpg -- --quality 90 --width 1920 --height 1080
```

## 📝 Programmatic Usage

```javascript
import { convertAndUploadImage } from './scripts/convertAndUploadToCloudinary.js';

// Simple upload
const result = await convertAndUploadImage('./image.jpg', {
  folder: 'savishkar/events',
  imageType: 'event'
});

console.log(result.url); // Cloudinary URL
```

## 🎯 Image Type Presets

| Type | Quality | Size | Use For |
|------|---------|------|---------|
| `avatar` | 85% | 500x500 | Profile pictures |
| `event` | 80% | 1200x800 | Event banners |
| `payment` | 90% | 1000x1000 | Payment screenshots |
| `qrcode` | 95% | 800x800 | QR codes (lossless) |
| `general` | 80% | Original | General images |

## 💡 Benefits

- **25-35% smaller** file sizes
- **Faster loading** times
- **Better quality** than JPEG/PNG
- **Automatic optimization** per image type
- **Supports all formats**: JPG, PNG, GIF, BMP, TIFF, etc.

## 📚 Full Documentation

See `WEBP_CONVERSION_GUIDE.md` for complete documentation.

## 🔧 Environment Setup

Make sure `.env` has:
```env
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## ✅ Test It

```bash
# 1. Create test image or use existing one
# 2. Run conversion
npm run convert-upload ./test-image.jpg -- --folder savishkar/test

# 3. Check Cloudinary dashboard for uploaded WebP image
```

## 🆘 Troubleshooting

**Error: sharp not found**
```bash
npm install sharp
```

**Error: Cloudinary upload failed**
- Check `.env` credentials
- Verify internet connection
- Check Cloudinary dashboard quota

## 📖 Examples

Run example script:
```bash
node scripts/exampleWebPConversion.js
```

That's it! Start converting images to WebP now! 🎉
