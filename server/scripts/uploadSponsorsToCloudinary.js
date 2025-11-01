#!/usr/bin/env node

/**
 * Upload Sponsor Logos to Cloudinary
 * This script uploads all sponsor logos to Cloudinary for reliable cloud storage
 * Usage: node scripts/uploadSponsorsToCloudinary.js
 */

import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n📤 Cloudinary Sponsor Logos Upload');
console.log('═'.repeat(60));

// Check Cloudinary configuration
const checkCloudinaryConfig = () => {
  console.log('\n🔍 Checking Cloudinary Configuration...\n');
  
  const requiredVars = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
  const missing = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      missing.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.log('\n❌ Cloudinary configuration incomplete!');
    console.log('\n💡 Please set these environment variables in .env:');
    missing.forEach(varName => {
      console.log(`   ${varName}=your_value`);
    });
    console.log('\n📚 See RULEBOOK_CLOUDINARY_GUIDE.md for setup instructions');
    return false;
  }
  
  console.log('\n✅ Cloudinary configuration complete!');
  return true;
};

// Upload sponsor logos to Cloudinary
const uploadSponsors = async () => {
  try {
    const sponsorsDir = path.join(__dirname, '../../client/public/sponsors');
    
    // Check if directory exists
    if (!fs.existsSync(sponsorsDir)) {
      console.log('\n❌ Sponsors directory not found!');
      console.log(`📁 Expected location: ${sponsorsDir}`);
      console.log('\n💡 Please ensure sponsors directory exists in client/public/');
      return;
    }
    
    // Get all files in sponsors directory
    const files = fs.readdirSync(sponsorsDir).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    if (files.length === 0) {
      console.log('\n❌ No sponsor logo images found!');
      console.log(`📁 Directory: ${sponsorsDir}`);
      console.log('\n💡 Please add sponsor logos (jpg, png, webp, gif) to the directory');
      return;
    }
    
    console.log(`\n📸 Found ${files.length} sponsor logo(s) to upload\n`);
    
    const uploadedUrls = [];
    
    // Upload each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(sponsorsDir, file);
      const stats = fs.statSync(filePath);
      const fileSizeKB = (stats.size / 1024).toFixed(2);
      
      console.log(`📤 [${i + 1}/${files.length}] Uploading: ${file} (${fileSizeKB} KB)`);
      
      try {
        // Create a clean public_id from filename
        const publicId = path.parse(file).name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'savishkar/sponsors',
          resource_type: 'image',
          public_id: publicId,
          overwrite: true,
          type: 'upload',
          access_mode: 'public',
          transformation: [
            { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
          ]
        });
        
        uploadedUrls.push({
          filename: file,
          publicId: result.public_id,
          url: result.secure_url,
          size: (result.bytes / 1024).toFixed(2) + ' KB'
        });
        
        console.log(`   ✅ Uploaded: ${result.secure_url}\n`);
        
      } catch (uploadError) {
        console.error(`   ❌ Failed to upload ${file}: ${uploadError.message}\n`);
      }
    }
    
    console.log('═'.repeat(60));
    console.log('\n✅ Upload Complete!\n');
    console.log('📊 Upload Summary:');
    console.log('─'.repeat(60));
    console.log(`   Total Files: ${files.length}`);
    console.log(`   Successful: ${uploadedUrls.length}`);
    console.log(`   Failed: ${files.length - uploadedUrls.length}`);
    console.log('─'.repeat(60));
    
    if (uploadedUrls.length > 0) {
      console.log('\n📋 Uploaded Sponsor Logos:\n');
      uploadedUrls.forEach((item, index) => {
        console.log(`${index + 1}. ${item.filename}`);
        console.log(`   URL: ${item.url}`);
        console.log(`   Size: ${item.size}\n`);
      });
      
      // Save URLs to a JSON file for easy reference
      const outputFile = path.join(__dirname, '../uploads/sponsor-cloudinary-urls.json');
      fs.writeFileSync(outputFile, JSON.stringify(uploadedUrls, null, 2));
      console.log(`📝 URLs saved to: ${outputFile}\n`);
      
      // Generate code snippet for Home.jsx
      console.log('📋 Code for Home.jsx:\n');
      console.log('const sponsors = [');
      uploadedUrls.forEach((item, index) => {
        const name = item.filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        console.log(`  { id: ${index + 1}, name: '${name}', logo: '${item.url}' },`);
      });
      console.log('];\n');
      
      console.log('✅ Sponsor logos are now stored on Cloudinary!');
      console.log('🌐 Accessible from anywhere');
      console.log('⚡ Fast CDN delivery');
      console.log('💾 Works on any hosting (Hostinger VPS, Render, etc.)\n');
    }
    
    console.log('═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Upload Failed!');
    console.error('─'.repeat(60));
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('Invalid cloud_name')) {
      console.error('\n💡 SOLUTION:');
      console.error('   Check CLOUDINARY_CLOUD_NAME in .env');
      console.error('   It should be your Cloudinary account name');
    } else if (error.message.includes('Invalid API key')) {
      console.error('\n💡 SOLUTION:');
      console.error('   Check CLOUDINARY_API_KEY in .env');
      console.error('   Get it from: https://cloudinary.com/console');
    } else if (error.message.includes('Invalid signature')) {
      console.error('\n💡 SOLUTION:');
      console.error('   Check CLOUDINARY_API_SECRET in .env');
      console.error('   Get it from: https://cloudinary.com/console');
    }
    
    console.error('\n📚 For help, see: RULEBOOK_CLOUDINARY_GUIDE.md');
    console.error('═'.repeat(60));
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  if (!checkCloudinaryConfig()) {
    process.exit(1);
  }
  
  await uploadSponsors();
};

main();
