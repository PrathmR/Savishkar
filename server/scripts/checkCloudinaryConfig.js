#!/usr/bin/env node

/**
 * Check Cloudinary Configuration
 * Quick script to verify Cloudinary is properly configured
 * Usage: node scripts/checkCloudinaryConfig.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n🔍 Cloudinary Configuration Check');
console.log('═'.repeat(60));

const checks = {
  USE_CLOUDINARY: process.env.USE_CLOUDINARY,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET
};

let allGood = true;

console.log('\n📋 Environment Variables:\n');

// Check USE_CLOUDINARY
if (checks.USE_CLOUDINARY === 'true') {
  console.log('✅ USE_CLOUDINARY: true');
} else if (checks.USE_CLOUDINARY) {
  console.log(`⚠️  USE_CLOUDINARY: ${checks.USE_CLOUDINARY} (should be "true")`);
  allGood = false;
} else {
  console.log('❌ USE_CLOUDINARY: Not set');
  allGood = false;
}

// Check CLOUDINARY_CLOUD_NAME
if (checks.CLOUDINARY_CLOUD_NAME) {
  console.log(`✅ CLOUDINARY_CLOUD_NAME: ${checks.CLOUDINARY_CLOUD_NAME}`);
} else {
  console.log('❌ CLOUDINARY_CLOUD_NAME: Not set');
  allGood = false;
}

// Check CLOUDINARY_API_KEY
if (checks.CLOUDINARY_API_KEY) {
  console.log(`✅ CLOUDINARY_API_KEY: ${checks.CLOUDINARY_API_KEY.substring(0, 4)}...${checks.CLOUDINARY_API_KEY.substring(checks.CLOUDINARY_API_KEY.length - 4)}`);
} else {
  console.log('❌ CLOUDINARY_API_KEY: Not set');
  allGood = false;
}

// Check CLOUDINARY_API_SECRET
if (checks.CLOUDINARY_API_SECRET) {
  console.log(`✅ CLOUDINARY_API_SECRET: ${checks.CLOUDINARY_API_SECRET.substring(0, 4)}...${checks.CLOUDINARY_API_SECRET.substring(checks.CLOUDINARY_API_SECRET.length - 4)}`);
} else {
  console.log('❌ CLOUDINARY_API_SECRET: Not set');
  allGood = false;
}

console.log('\n' + '─'.repeat(60));

// Final verdict
const isCloudinaryEnabled = checks.USE_CLOUDINARY === 'true' && 
                            checks.CLOUDINARY_CLOUD_NAME && 
                            checks.CLOUDINARY_API_KEY && 
                            checks.CLOUDINARY_API_SECRET;

if (isCloudinaryEnabled) {
  console.log('\n✅ Cloudinary is ENABLED and properly configured!');
  console.log('\n📤 Images will be uploaded to Cloudinary CDN');
  console.log('🚀 Fast loading from global CDN');
  console.log('💾 No local storage used');
} else {
  console.log('\n❌ Cloudinary is NOT properly configured');
  console.log('\n⚠️  Images will use LOCAL storage');
  console.log('🐌 Slower loading (no CDN)');
  console.log('💾 Uses server disk space');
}

console.log('\n' + '═'.repeat(60));

if (!allGood) {
  console.log('\n💡 To fix this:\n');
  console.log('1. Get your Cloudinary credentials from:');
  console.log('   https://cloudinary.com/console\n');
  console.log('2. Add to your .env file:');
  console.log('   USE_CLOUDINARY=true');
  console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('   CLOUDINARY_API_KEY=your_api_key');
  console.log('   CLOUDINARY_API_SECRET=your_api_secret\n');
  console.log('3. Restart your server:');
  console.log('   pm2 restart all  # or your restart command\n');
  console.log('4. Run this script again to verify\n');
  console.log('📚 See FIX_IMAGE_UPLOAD_ISSUES.md for detailed guide');
  console.log('═'.repeat(60) + '\n');
  process.exit(1);
} else {
  console.log('\n🎉 Everything looks good!');
  console.log('\n📝 Next steps:');
  console.log('   • Test image upload in admin dashboard');
  console.log('   • Verify images load from Cloudinary');
  console.log('   • Check console logs for upload confirmations');
  console.log('\n💡 Test endpoint: GET /api/events/test-cloudinary');
  console.log('═'.repeat(60) + '\n');
}
