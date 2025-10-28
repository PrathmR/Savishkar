# WebP Image Conversion & Cloudinary Upload Guide

## Overview
This system automatically converts any image format (JPG, PNG, GIF, BMP, TIFF, etc.) to WebP format before uploading to Cloudinary. WebP provides superior compression, reducing file sizes by 25-35% compared to JPEG/PNG while maintaining quality.

## Benefits
- **Smaller file sizes**: 25-35% smaller than JPEG/PNG
- **Faster loading**: Reduced bandwidth usage
- **Better quality**: Superior compression algorithm
- **Universal support**: Supported by all modern browsers
- **Automatic optimization**: Different presets for different image types

## Installation

### 1. Install Dependencies
```bash
cd server
npm install sharp streamifier
```

### 2. Verify Installation
```bash
npm list sharp streamifier
```

## Features

### 1. **Automatic WebP Conversion**
- Converts any image format to WebP
- Maintains aspect ratio
- Optimizes quality based on image type
- Shows compression statistics

### 2. **Image Type Presets**
Pre-configured optimization settings for different use cases:

| Type | Quality | Max Size | Lossless | Use Case |
|------|---------|----------|----------|----------|
| **avatar** | 85% | 500x500 | No | User profile pictures |
| **event** | 80% | 1200x800 | No | Event banners/images |
| **payment** | 90% | 1000x1000 | No | Payment screenshots |
| **qrcode** | 95% | 800x800 | Yes | QR codes (must be scannable) |
| **general** | 80% | Original | No | General purpose |

### 3. **Batch Processing**
- Upload single image
- Upload multiple images
- Upload entire directory
- Progress tracking
- Error handling

## Usage

### Method 1: Command Line Script

#### Upload Single Image
```bash
npm run convert-upload ./path/to/image.jpg
```

#### Upload with Custom Folder
```bash
npm run convert-upload ./image.png -- --folder savishkar/events
```

#### Upload with Image Type Preset
```bash
npm run convert-upload ./avatar.jpg -- --type avatar
```

#### Upload Entire Directory
```bash
npm run convert-upload ./images -- --folder savishkar/gallery
```

#### Custom Quality and Size
```bash
npm run convert-upload ./photo.jpg -- --quality 90 --width 1920
```

#### All Options
```bash
npm run convert-upload <path> -- [options]

Options:
  --folder <name>     Cloudinary folder (default: savishkar/uploads)
  --type <type>       Image type: avatar, event, payment, qrcode, general
  --quality <0-100>   WebP quality (default: 80)
  --width <pixels>    Resize width (optional)
  --height <pixels>   Resize height (optional)
```

### Method 2: Programmatic Usage

#### Convert and Upload Single Image
```javascript
import { convertAndUploadImage } from './scripts/convertAndUploadToCloudinary.js';

const result = await convertAndUploadImage('./image.jpg', {
  folder: 'savishkar/events',
  imageType: 'event'
});

console.log(result.url); // Cloudinary URL
```

#### Convert and Upload Multiple Images
```javascript
import { convertAndUploadBatch } from './scripts/convertAndUploadToCloudinary.js';

const imagePaths = [
  './image1.jpg',
  './image2.png',
  './image3.gif'
];

const results = await convertAndUploadBatch(imagePaths, {
  folder: 'savishkar/gallery',
  imageType: 'general'
});
```

#### Convert and Upload Directory
```javascript
import { convertAndUploadDirectory } from './scripts/convertAndUploadToCloudinary.js';

const results = await convertAndUploadDirectory('./images', {
  folder: 'savishkar/events',
  imageType: 'event'
});
```

#### Custom Conversion Options
```javascript
import { convertAndUploadImage } from './scripts/convertAndUploadToCloudinary.js';

const result = await convertAndUploadImage('./photo.jpg', {
  folder: 'savishkar/custom',
  customOptions: {
    quality: 90,
    width: 1920,
    height: 1080,
    fit: 'cover',
    lossless: false
  }
});
```

### Method 3: Use in Multer Middleware

#### Update upload.js to use WebP conversion
```javascript
import { 
  paymentStorageWebP, 
  eventStorageWebP, 
  avatarStorageWebP,
  qrCodeStorageWebP 
} from '../config/cloudinaryWebP.js';

// Use WebP storage instead of regular storage
export const uploadEventImage = multer({
  storage: eventStorageWebP,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});
```

## API Functions

### imageConverter.js

#### `convertToWebP(input, options)`
Convert any image to WebP format.

**Parameters:**
- `input` (Buffer|string): Image buffer or file path
- `options` (Object):
  - `quality` (number): WebP quality 0-100 (default: 80)
  - `width` (number): Resize width (default: null)
  - `height` (number): Resize height (default: null)
  - `fit` (string): Resize fit mode (default: 'inside')
  - `lossless` (boolean): Use lossless compression (default: false)

**Returns:** Promise<Buffer> - WebP image buffer

**Example:**
```javascript
import { convertToWebP } from './utils/imageConverter.js';

const webpBuffer = await convertToWebP('./image.jpg', {
  quality: 85,
  width: 1200,
  height: 800
});
```

#### `convertFileToWebP(inputPath, outputPath, options)`
Convert image file to WebP and save to disk.

**Parameters:**
- `inputPath` (string): Path to input image
- `outputPath` (string): Path to save WebP (optional)
- `options` (Object): Conversion options

**Returns:** Promise<string> - Path to saved WebP file

**Example:**
```javascript
import { convertFileToWebP } from './utils/imageConverter.js';

const webpPath = await convertFileToWebP('./image.jpg', './image.webp', {
  quality: 80
});
```

#### `getOptimizedOptions(imageType)`
Get pre-configured options for different image types.

**Parameters:**
- `imageType` (string): 'avatar', 'event', 'payment', 'qrcode', or 'general'

**Returns:** Object - Optimized conversion options

**Example:**
```javascript
import { getOptimizedOptions } from './utils/imageConverter.js';

const options = getOptimizedOptions('avatar');
// { quality: 85, width: 500, height: 500, fit: 'cover', lossless: false }
```

## Examples

### Example 1: Upload Event Images
```bash
# Upload all images from events folder
npm run convert-upload ./uploads/events -- --folder savishkar/events --type event
```

### Example 2: Upload QR Codes (Lossless)
```bash
# Upload QR codes with lossless compression
npm run convert-upload ./qrcodes -- --folder savishkar/qrcodes --type qrcode
```

### Example 3: Upload User Avatars
```bash
# Upload avatars with avatar preset
npm run convert-upload ./avatars -- --folder savishkar/avatars --type avatar
```

### Example 4: Custom Processing
```javascript
import { convertToWebP } from './utils/imageConverter.js';
import { uploadBufferToCloudinary } from './config/cloudinaryWebP.js';

// Read image
const imageBuffer = fs.readFileSync('./image.jpg');

// Convert with custom options
const webpBuffer = await convertToWebP(imageBuffer, {
  quality: 95,
  width: 2000,
  lossless: false
});

// Upload to Cloudinary
const result = await uploadBufferToCloudinary(webpBuffer, {
  folder: 'savishkar/custom',
  public_id: 'my-custom-image'
});

console.log(result.secure_url);
```

## Output Examples

### Single Image Upload
```
📸 Processing: event-banner.jpg
📸 Converting jpeg image (1920x1080) to WebP...
✅ Conversion complete! Size: 245.32KB → 156.78KB (36.08% smaller)
☁️  Uploading to Cloudinary...
✅ Success! URL: https://res.cloudinary.com/xxx/image/upload/v123/savishkar/events/event-banner-123.webp
   Size: 156.78KB
   Dimensions: 1920x1080

✨ All done!
```

### Batch Upload
```
🚀 Starting batch upload of 5 images...
============================================================

[1/5]
📸 Processing: image1.jpg
✅ Success! URL: https://...

[2/5]
📸 Processing: image2.png
✅ Success! URL: https://...

...

============================================================

📊 BATCH UPLOAD SUMMARY
============================================================
✅ Successful: 5
❌ Failed: 0
📁 Total: 5

💾 Total uploaded size: 2.45MB

✨ All done!
```

## Integration with Existing Code

### Option 1: Replace Existing Storage (Recommended)
Update `middleware/upload.js`:

```javascript
import { 
  paymentStorageWebP, 
  eventStorageWebP, 
  avatarStorageWebP 
} from '../config/cloudinaryWebP.js';

// Replace existing storage
export const uploadEventImage = multer({
  storage: useCloudStorage ? eventStorageWebP : eventStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});
```

### Option 2: Add New Routes
Keep existing routes and add new WebP-specific routes:

```javascript
// routes/events.js
import { uploadEventImageWebP } from '../middleware/uploadWebP.js';

router.post('/upload-image-webp', 
  protect, 
  authorize('admin'), 
  uploadEventImageWebP.single('image'), 
  async (req, res) => {
    // Handle WebP upload
  }
);
```

## Troubleshooting

### Error: "sharp" module not found
```bash
npm install sharp
```

### Error: "streamifier" module not found
```bash
npm install streamifier
```

### Error: Image conversion failed
- Check if input file is a valid image
- Verify file permissions
- Check available disk space
- Try reducing quality or dimensions

### Error: Cloudinary upload failed
- Verify Cloudinary credentials in `.env`
- Check internet connection
- Verify folder permissions in Cloudinary dashboard
- Check Cloudinary storage quota

## Performance Tips

1. **Batch Processing**: Upload multiple images at once for better efficiency
2. **Quality Settings**: Use 80-85% quality for most images (barely noticeable difference)
3. **Lossless Only for QR Codes**: Use lossless compression only for QR codes and logos
4. **Resize Before Upload**: Resize large images to appropriate dimensions
5. **Monitor Cloudinary Usage**: Check your Cloudinary dashboard for storage/bandwidth usage

## File Structure

```
server/
├── config/
│   ├── cloudinary.js           # Original Cloudinary config
│   └── cloudinaryWebP.js       # WebP conversion config
├── utils/
│   └── imageConverter.js       # Image conversion utilities
├── scripts/
│   └── convertAndUploadToCloudinary.js  # CLI script
└── middleware/
    └── upload.js               # Multer upload middleware
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Supported Image Formats

**Input formats:**
- JPEG/JPG
- PNG
- GIF
- BMP
- TIFF/TIF
- WebP
- SVG
- ICO
- HEIC/HEIF

**Output format:**
- WebP (always)

## Browser Support

WebP is supported by:
- ✅ Chrome 23+
- ✅ Firefox 65+
- ✅ Safari 14+
- ✅ Edge 18+
- ✅ Opera 12.1+
- ✅ All modern mobile browsers

## Next Steps

1. **Install dependencies**: `npm install sharp streamifier`
2. **Test single upload**: `npm run convert-upload ./test-image.jpg`
3. **Test batch upload**: `npm run convert-upload ./images`
4. **Integrate with existing code**: Update `middleware/upload.js`
5. **Monitor results**: Check Cloudinary dashboard for uploaded WebP images

## Support

For issues or questions:
1. Check console logs for detailed error messages
2. Verify all dependencies are installed
3. Check Cloudinary credentials
4. Review file permissions
5. Test with a simple image first

## Additional Resources

- [Sharp Documentation](https://sharp.pixelplumbing.com/)
- [Cloudinary WebP Guide](https://cloudinary.com/documentation/image_transformations#webp_format)
- [WebP Browser Support](https://caniuse.com/webp)
