import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Convert any image format to WebP
 * @param {Buffer|string} input - Image buffer or file path
 * @param {Object} options - Conversion options
 * @returns {Promise<Buffer>} - WebP image buffer
 */
export const convertToWebP = async (input, options = {}) => {
  try {
    const {
      quality = 80,        // WebP quality (0-100)
      width = null,        // Resize width (null = keep original)
      height = null,       // Resize height (null = keep original)
      fit = 'inside',      // Resize fit mode: 'cover', 'contain', 'fill', 'inside', 'outside'
      lossless = false     // Use lossless compression
    } = options;

    let sharpInstance = sharp(input);

    // Get image metadata
    const metadata = await sharpInstance.metadata();
    console.log(`📸 Converting ${metadata.format} image (${metadata.width}x${metadata.height}) to WebP...`);

    // Resize if dimensions provided
    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: fit,
        withoutEnlargement: true
      });
    }

    // Convert to WebP
    const webpBuffer = await sharpInstance
      .webp({
        quality: quality,
        lossless: lossless,
        effort: 6  // Compression effort (0-6, higher = better compression but slower)
      })
      .toBuffer();

    const originalSize = Buffer.isBuffer(input) ? input.length : fs.statSync(input).size;
    const webpSize = webpBuffer.length;
    const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(2);

    console.log(`✅ Conversion complete! Size: ${(originalSize / 1024).toFixed(2)}KB → ${(webpSize / 1024).toFixed(2)}KB (${savings}% smaller)`);

    return webpBuffer;
  } catch (error) {
    console.error('❌ Error converting image to WebP:', error);
    throw new Error(`Image conversion failed: ${error.message}`);
  }
};

/**
 * Convert image file to WebP and save to disk
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save WebP image (optional)
 * @param {Object} options - Conversion options
 * @returns {Promise<string>} - Path to saved WebP file
 */
export const convertFileToWebP = async (inputPath, outputPath = null, options = {}) => {
  try {
    // Generate output path if not provided
    if (!outputPath) {
      const parsedPath = path.parse(inputPath);
      outputPath = path.join(parsedPath.dir, `${parsedPath.name}.webp`);
    }

    // Convert to WebP
    const webpBuffer = await convertToWebP(inputPath, options);

    // Save to disk
    fs.writeFileSync(outputPath, webpBuffer);
    console.log(`💾 WebP image saved to: ${outputPath}`);

    return outputPath;
  } catch (error) {
    console.error('❌ Error converting file to WebP:', error);
    throw error;
  }
};

/**
 * Convert multiple images to WebP
 * @param {Array<string>} inputPaths - Array of input image paths
 * @param {string} outputDir - Directory to save WebP images
 * @param {Object} options - Conversion options
 * @returns {Promise<Array<string>>} - Array of output paths
 */
export const convertBatchToWebP = async (inputPaths, outputDir = null, options = {}) => {
  try {
    console.log(`🔄 Converting ${inputPaths.length} images to WebP...`);
    
    const results = [];
    
    for (const inputPath of inputPaths) {
      try {
        const parsedPath = path.parse(inputPath);
        const outputPath = outputDir 
          ? path.join(outputDir, `${parsedPath.name}.webp`)
          : null;
        
        const savedPath = await convertFileToWebP(inputPath, outputPath, options);
        results.push(savedPath);
      } catch (error) {
        console.error(`❌ Failed to convert ${inputPath}:`, error.message);
        results.push(null);
      }
    }
    
    const successCount = results.filter(r => r !== null).length;
    console.log(`✅ Batch conversion complete! ${successCount}/${inputPaths.length} images converted`);
    
    return results;
  } catch (error) {
    console.error('❌ Error in batch conversion:', error);
    throw error;
  }
};

/**
 * Check if file is an image
 * @param {string} filePath - Path to file
 * @returns {boolean} - True if file is an image
 */
export const isImageFile = (filePath) => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.tif', '.webp', '.svg', '.ico', '.heic', '.heif'];
  const ext = path.extname(filePath).toLowerCase();
  return imageExtensions.includes(ext);
};

/**
 * Get optimized WebP options based on image type
 * @param {string} imageType - Type of image ('avatar', 'event', 'payment', 'general')
 * @returns {Object} - Optimized options
 */
export const getOptimizedOptions = (imageType = 'general') => {
  const presets = {
    avatar: {
      quality: 85,
      width: 500,
      height: 500,
      fit: 'cover',
      lossless: false
    },
    event: {
      quality: 80,
      width: 1200,
      height: 800,
      fit: 'inside',
      lossless: false
    },
    payment: {
      quality: 90,  // Higher quality for payment screenshots
      width: 1000,
      height: 1000,
      fit: 'inside',
      lossless: false
    },
    qrcode: {
      quality: 95,  // Very high quality for QR codes
      width: 800,
      height: 800,
      fit: 'inside',
      lossless: true  // Lossless for QR codes to maintain scannability
    },
    general: {
      quality: 80,
      width: null,
      height: null,
      fit: 'inside',
      lossless: false
    }
  };

  return presets[imageType] || presets.general;
};

export default {
  convertToWebP,
  convertFileToWebP,
  convertBatchToWebP,
  isImageFile,
  getOptimizedOptions
};
