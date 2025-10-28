/**
 * Example script demonstrating WebP conversion and Cloudinary upload
 * 
 * This script shows various ways to use the WebP conversion utilities
 */

import { convertAndUploadImage, convertAndUploadBatch, convertAndUploadDirectory } from './convertAndUploadToCloudinary.js';
import { convertToWebP, convertFileToWebP, getOptimizedOptions } from '../utils/imageConverter.js';
import fs from 'fs';

console.log(`
╔════════════════════════════════════════════════════════════════╗
║          WebP Conversion Examples                              ║
╚════════════════════════════════════════════════════════════════╝
`);

// Example 1: Convert single image to WebP (save locally)
async function example1() {
  console.log('\n📝 Example 1: Convert image to WebP (local save)');
  console.log('─'.repeat(60));
  
  try {
    // This will convert image.jpg to image.webp in the same directory
    const webpPath = await convertFileToWebP('./test-image.jpg', null, {
      quality: 85,
      width: 1200
    });
    
    console.log(`✅ Saved to: ${webpPath}`);
  } catch (error) {
    console.log(`⚠️  Skipped: ${error.message}`);
  }
}

// Example 2: Convert and upload single image to Cloudinary
async function example2() {
  console.log('\n📝 Example 2: Convert and upload to Cloudinary');
  console.log('─'.repeat(60));
  
  try {
    const result = await convertAndUploadImage('./test-image.jpg', {
      folder: 'savishkar/examples',
      imageType: 'general'
    });
    
    if (result.success) {
      console.log(`✅ Uploaded: ${result.url}`);
    }
  } catch (error) {
    console.log(`⚠️  Skipped: ${error.message}`);
  }
}

// Example 3: Upload with avatar preset
async function example3() {
  console.log('\n📝 Example 3: Upload with avatar preset (500x500, 85% quality)');
  console.log('─'.repeat(60));
  
  try {
    const result = await convertAndUploadImage('./avatar.jpg', {
      folder: 'savishkar/avatars',
      imageType: 'avatar'  // Uses 500x500, 85% quality, cover fit
    });
    
    if (result.success) {
      console.log(`✅ Avatar uploaded: ${result.url}`);
      console.log(`   Dimensions: ${result.width}x${result.height}`);
    }
  } catch (error) {
    console.log(`⚠️  Skipped: ${error.message}`);
  }
}

// Example 4: Upload with event preset
async function example4() {
  console.log('\n📝 Example 4: Upload with event preset (1200x800, 80% quality)');
  console.log('─'.repeat(60));
  
  try {
    const result = await convertAndUploadImage('./event-banner.jpg', {
      folder: 'savishkar/events',
      imageType: 'event'  // Uses 1200x800, 80% quality
    });
    
    if (result.success) {
      console.log(`✅ Event image uploaded: ${result.url}`);
    }
  } catch (error) {
    console.log(`⚠️  Skipped: ${error.message}`);
  }
}

// Example 5: Upload QR code with lossless compression
async function example5() {
  console.log('\n📝 Example 5: Upload QR code (lossless, 95% quality)');
  console.log('─'.repeat(60));
  
  try {
    const result = await convertAndUploadImage('./qrcode.png', {
      folder: 'savishkar/qrcodes',
      imageType: 'qrcode'  // Uses lossless compression for scannability
    });
    
    if (result.success) {
      console.log(`✅ QR code uploaded: ${result.url}`);
    }
  } catch (error) {
    console.log(`⚠️  Skipped: ${error.message}`);
  }
}

// Example 6: Custom conversion options
async function example6() {
  console.log('\n📝 Example 6: Custom conversion options');
  console.log('─'.repeat(60));
  
  try {
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
    
    if (result.success) {
      console.log(`✅ Custom upload: ${result.url}`);
      console.log(`   Size: ${(result.size / 1024).toFixed(2)}KB`);
    }
  } catch (error) {
    console.log(`⚠️  Skipped: ${error.message}`);
  }
}

// Example 7: Batch upload multiple images
async function example7() {
  console.log('\n📝 Example 7: Batch upload multiple images');
  console.log('─'.repeat(60));
  
  try {
    const imagePaths = [
      './image1.jpg',
      './image2.png',
      './image3.gif'
    ];
    
    const results = await convertAndUploadBatch(imagePaths, {
      folder: 'savishkar/batch',
      imageType: 'general'
    });
    
    const successful = results.filter(r => r.success);
    console.log(`✅ Uploaded ${successful.length}/${results.length} images`);
  } catch (error) {
    console.log(`⚠️  Skipped: ${error.message}`);
  }
}

// Example 8: Upload entire directory
async function example8() {
  console.log('\n📝 Example 8: Upload entire directory');
  console.log('─'.repeat(60));
  
  try {
    const results = await convertAndUploadDirectory('./images', {
      folder: 'savishkar/gallery',
      imageType: 'general'
    });
    
    console.log(`✅ Processed ${results.length} images from directory`);
  } catch (error) {
    console.log(`⚠️  Skipped: ${error.message}`);
  }
}

// Example 9: Get optimized options for different types
async function example9() {
  console.log('\n📝 Example 9: View optimized presets');
  console.log('─'.repeat(60));
  
  const types = ['avatar', 'event', 'payment', 'qrcode', 'general'];
  
  types.forEach(type => {
    const options = getOptimizedOptions(type);
    console.log(`\n${type.toUpperCase()}:`);
    console.log(`  Quality: ${options.quality}%`);
    console.log(`  Size: ${options.width || 'original'}x${options.height || 'original'}`);
    console.log(`  Fit: ${options.fit}`);
    console.log(`  Lossless: ${options.lossless ? 'Yes' : 'No'}`);
  });
}

// Example 10: Convert to buffer (for programmatic use)
async function example10() {
  console.log('\n📝 Example 10: Convert to buffer (programmatic)');
  console.log('─'.repeat(60));
  
  try {
    // Read image file
    if (fs.existsSync('./test-image.jpg')) {
      const imageBuffer = fs.readFileSync('./test-image.jpg');
      
      // Convert to WebP
      const webpBuffer = await convertToWebP(imageBuffer, {
        quality: 85,
        width: 800
      });
      
      console.log(`✅ Converted to WebP buffer`);
      console.log(`   Original: ${(imageBuffer.length / 1024).toFixed(2)}KB`);
      console.log(`   WebP: ${(webpBuffer.length / 1024).toFixed(2)}KB`);
      console.log(`   Savings: ${((imageBuffer.length - webpBuffer.length) / imageBuffer.length * 100).toFixed(2)}%`);
      
      // You can now use webpBuffer for further processing
      // e.g., upload to Cloudinary, save to database, etc.
    } else {
      console.log('⚠️  test-image.jpg not found');
    }
  } catch (error) {
    console.log(`⚠️  Error: ${error.message}`);
  }
}

// Run all examples
async function runExamples() {
  console.log('\n🚀 Running examples...\n');
  
  // Note: Most examples will be skipped if test images don't exist
  // This is just to demonstrate the API usage
  
  await example1();
  await example2();
  await example3();
  await example4();
  await example5();
  await example6();
  await example7();
  await example8();
  await example9();
  await example10();
  
  console.log('\n' + '═'.repeat(60));
  console.log('✨ Examples complete!');
  console.log('═'.repeat(60));
  console.log(`
💡 Tips:
  - Replace test image paths with your actual images
  - Check WEBP_CONVERSION_GUIDE.md for detailed documentation
  - Use 'npm run convert-upload' for CLI usage
  - Adjust quality/size based on your needs
  
🔧 Quick Start:
  1. npm install sharp streamifier
  2. npm run convert-upload ./your-image.jpg
  3. Check Cloudinary dashboard for uploaded WebP image
  `);
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runExamples().catch(console.error);
}

export { runExamples };
