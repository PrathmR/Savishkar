import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { convertToWebP, getOptimizedOptions, isImageFile } from '../utils/imageConverter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload WebP buffer to Cloudinary
 * @param {Buffer} webpBuffer - WebP image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} - Cloudinary response
 */
const uploadWebPToCloudinary = async (webpBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'savishkar',
        format: 'webp',
        resource_type: 'image',
        public_id: options.public_id,
        overwrite: options.overwrite || false,
        ...options
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Write buffer to stream
    uploadStream.end(webpBuffer);
  });
};

/**
 * Convert and upload a single image to Cloudinary
 * @param {string} imagePath - Path to image file
 * @param {Object} options - Conversion and upload options
 * @returns {Promise<Object>} - Upload result
 */
export const convertAndUploadImage = async (imagePath, options = {}) => {
  try {
    const {
      folder = 'savishkar/uploads',
      imageType = 'general',
      customOptions = null,
      publicId = null
    } = options;

    console.log(`\n📸 Processing: ${path.basename(imagePath)}`);

    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File not found: ${imagePath}`);
    }

    // Check if it's an image
    if (!isImageFile(imagePath)) {
      throw new Error(`Not an image file: ${imagePath}`);
    }

    // Get conversion options
    const conversionOptions = customOptions || getOptimizedOptions(imageType);

    // Convert to WebP
    const webpBuffer = await convertToWebP(imagePath, conversionOptions);

    // Generate public_id if not provided
    const fileName = path.parse(imagePath).name;
    const finalPublicId = publicId || `${fileName}-${Date.now()}`;

    // Upload to Cloudinary
    console.log(`☁️  Uploading to Cloudinary...`);
    const result = await uploadWebPToCloudinary(webpBuffer, {
      folder: folder,
      public_id: finalPublicId
    });

    console.log(`✅ Success! URL: ${result.secure_url}`);
    console.log(`   Size: ${(result.bytes / 1024).toFixed(2)}KB`);
    console.log(`   Dimensions: ${result.width}x${result.height}`);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      size: result.bytes,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error(`❌ Error processing ${imagePath}:`, error.message);
    return {
      success: false,
      error: error.message,
      file: imagePath
    };
  }
};

/**
 * Convert and upload multiple images to Cloudinary
 * @param {Array<string>} imagePaths - Array of image paths
 * @param {Object} options - Conversion and upload options
 * @returns {Promise<Array<Object>>} - Array of upload results
 */
export const convertAndUploadBatch = async (imagePaths, options = {}) => {
  console.log(`\n🚀 Starting batch upload of ${imagePaths.length} images...\n`);
  console.log('='.repeat(60));

  const results = [];

  for (let i = 0; i < imagePaths.length; i++) {
    console.log(`\n[${i + 1}/${imagePaths.length}]`);
    const result = await convertAndUploadImage(imagePaths[i], options);
    results.push(result);
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 BATCH UPLOAD SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);

  console.log(`✅ Successful: ${successful.length}`);
  console.log(`❌ Failed: ${failed.length}`);
  console.log(`📁 Total: ${results.length}`);

  if (failed.length > 0) {
    console.log('\n❌ Failed uploads:');
    failed.forEach(f => {
      console.log(`   - ${path.basename(f.file)}: ${f.error}`);
    });
  }

  if (successful.length > 0) {
    const totalSize = successful.reduce((sum, r) => sum + r.size, 0);
    console.log(`\n💾 Total uploaded size: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
  }

  return results;
};

/**
 * Convert and upload all images from a directory
 * @param {string} directoryPath - Path to directory
 * @param {Object} options - Conversion and upload options
 * @returns {Promise<Array<Object>>} - Array of upload results
 */
export const convertAndUploadDirectory = async (directoryPath, options = {}) => {
  try {
    console.log(`📁 Scanning directory: ${directoryPath}`);

    if (!fs.existsSync(directoryPath)) {
      throw new Error(`Directory not found: ${directoryPath}`);
    }

    const files = fs.readdirSync(directoryPath);
    const imagePaths = files
      .map(file => path.join(directoryPath, file))
      .filter(filePath => fs.statSync(filePath).isFile() && isImageFile(filePath));

    console.log(`📸 Found ${imagePaths.length} images`);

    if (imagePaths.length === 0) {
      console.log('⚠️  No images found in directory');
      return [];
    }

    return await convertAndUploadBatch(imagePaths, options);
  } catch (error) {
    console.error('❌ Error processing directory:', error.message);
    throw error;
  }
};

// CLI Usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║   Convert & Upload Images to Cloudinary (WebP Format)         ║
╚════════════════════════════════════════════════════════════════╝

Usage:
  node convertAndUploadToCloudinary.js <path> [options]

Arguments:
  <path>              Path to image file or directory

Options:
  --folder <name>     Cloudinary folder (default: savishkar/uploads)
  --type <type>       Image type: avatar, event, payment, qrcode, general
  --quality <0-100>   WebP quality (default: 80)
  --width <pixels>    Resize width (optional)
  --height <pixels>   Resize height (optional)

Examples:
  # Upload single image
  node convertAndUploadToCloudinary.js ./image.jpg

  # Upload with custom folder
  node convertAndUploadToCloudinary.js ./image.png --folder savishkar/events

  # Upload with image type preset
  node convertAndUploadToCloudinary.js ./avatar.jpg --type avatar

  # Upload directory
  node convertAndUploadToCloudinary.js ./images --folder savishkar/gallery

  # Custom quality and size
  node convertAndUploadToCloudinary.js ./photo.jpg --quality 90 --width 1920
    `);
    process.exit(0);
  }

  const inputPath = args[0];
  const options = {
    folder: 'savishkar/uploads',
    imageType: 'general',
    customOptions: {}
  };

  // Parse command line arguments
  for (let i = 1; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    switch (flag) {
      case '--folder':
        options.folder = value;
        break;
      case '--type':
        options.imageType = value;
        break;
      case '--quality':
        options.customOptions.quality = parseInt(value);
        break;
      case '--width':
        options.customOptions.width = parseInt(value);
        break;
      case '--height':
        options.customOptions.height = parseInt(value);
        break;
    }
  }

  // Check if input is file or directory
  (async () => {
    try {
      const stats = fs.statSync(inputPath);

      if (stats.isDirectory()) {
        await convertAndUploadDirectory(inputPath, options);
      } else if (stats.isFile()) {
        await convertAndUploadImage(inputPath, options);
      } else {
        console.error('❌ Invalid input path');
        process.exit(1);
      }

      console.log('\n✨ All done!\n');
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      process.exit(1);
    }
  })();
}

export default {
  convertAndUploadImage,
  convertAndUploadBatch,
  convertAndUploadDirectory
};
