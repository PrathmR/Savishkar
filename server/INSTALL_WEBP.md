# WebP Conversion - Installation Instructions

## ⚡ Quick Install (30 seconds)

```bash
cd server
npm install sharp streamifier
```

That's it! You're ready to convert images to WebP.

## ✅ Verify Installation

```bash
npm list sharp streamifier
```

Expected output:
```
├── sharp@0.33.0
└── streamifier@0.1.1
```

## 🧪 Test Installation

### Test 1: Simple conversion
```bash
npm run convert-upload ./test-image.jpg
```

### Test 2: With options
```bash
npm run convert-upload ./test-image.jpg -- --folder savishkar/test --type general
```

If you see:
```
📸 Converting jpeg image...
✅ Conversion complete! Size: XXX KB → YYY KB
☁️  Uploading to Cloudinary...
✅ Success! URL: https://...
```

**You're all set!** 🎉

## 📋 What Was Installed

### 1. sharp (v0.33.0)
- High-performance image processing library
- Converts images to WebP format
- Handles resizing, cropping, optimization
- **Size:** ~30MB (includes native binaries)

### 2. streamifier (v0.1.1)
- Converts buffers to streams
- Required for Cloudinary upload
- **Size:** ~5KB

**Total additional size:** ~30MB

## 🔧 Troubleshooting Installation

### Issue: sharp installation fails

**Solution 1: Clear cache and reinstall**
```bash
npm cache clean --force
npm install sharp
```

**Solution 2: Install with specific version**
```bash
npm install sharp@0.33.0
```

**Solution 3: Install with rebuild**
```bash
npm install --build-from-source sharp
```

### Issue: streamifier not found

```bash
npm install streamifier
```

### Issue: Permission errors (Linux/Mac)

```bash
sudo npm install sharp streamifier
```

Or use without sudo:
```bash
npm install --prefix ~/.npm-global sharp streamifier
```

### Issue: Windows build errors

1. Install Windows Build Tools:
```bash
npm install --global windows-build-tools
```

2. Then install sharp:
```bash
npm install sharp
```

## 🌍 Platform-Specific Notes

### Windows
- Works out of the box
- No additional setup needed
- Pre-built binaries included

### macOS
- Works out of the box
- May require Xcode Command Line Tools
- Install if needed: `xcode-select --install`

### Linux
- May require additional libraries
- Ubuntu/Debian:
  ```bash
  sudo apt-get install -y libvips-dev
  ```
- CentOS/RHEL:
  ```bash
  sudo yum install -y vips-devel
  ```

## 📦 Dependencies Tree

```
server/
├── sharp@0.33.0
│   ├── color@4.2.3
│   ├── detect-libc@2.0.2
│   ├── semver@7.5.4
│   └── [native binaries]
└── streamifier@0.1.1
```

## 🎯 Next Steps

1. ✅ Dependencies installed
2. 📸 Test with sample image: `npm run convert-upload ./test.jpg`
3. 📚 Read documentation: `WEBP_QUICK_START.md`
4. 🚀 Start converting images!

## 💡 Quick Commands

```bash
# Convert single image
npm run convert-upload ./image.jpg

# Convert with folder
npm run convert-upload ./image.jpg -- --folder savishkar/events

# Convert with type preset
npm run convert-upload ./avatar.jpg -- --type avatar

# Convert directory
npm run convert-upload ./images -- --folder savishkar/gallery

# Show help
npm run convert-upload
```

## 📖 Documentation

- **Quick Start:** `WEBP_QUICK_START.md`
- **Full Guide:** `WEBP_CONVERSION_GUIDE.md`
- **Examples:** `scripts/exampleWebPConversion.js`

## ✨ You're Ready!

Start converting images to WebP now:

```bash
npm run convert-upload ./your-image.jpg
```

Enjoy 25-35% smaller file sizes! 🎉
