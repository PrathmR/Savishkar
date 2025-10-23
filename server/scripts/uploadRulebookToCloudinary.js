#!/usr/bin/env node

/**
 * Upload Rulebook to Cloudinary
 * This script uploads the rulebook PDF to Cloudinary for reliable cloud storage
 * Usage: node scripts/uploadRulebookToCloudinary.js
 */

import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n📤 Cloudinary Rulebook Upload');
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
    console.log('\n📚 See CLOUDINARY_SETUP.md for setup instructions');
    return false;
  }
  
  console.log('\n✅ Cloudinary configuration complete!');
  return true;
};

// Upload rulebook to Cloudinary
const uploadRulebook = async () => {
  try {
    const rulebookPath = path.join(__dirname, '../uploads/rulebook.pdf');
    
    // Check if file exists
    if (!fs.existsSync(rulebookPath)) {
      console.log('\n❌ Rulebook file not found!');
      console.log(`📁 Expected location: ${rulebookPath}`);
      console.log('\n💡 Please ensure rulebook.pdf exists in server/uploads/');
      return;
    }
    
    // Get file stats
    const stats = fs.statSync(rulebookPath);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    console.log('\n📖 Rulebook File Found:');
    console.log(`   Path: ${rulebookPath}`);
    console.log(`   Size: ${fileSizeMB} MB`);
    console.log(`   Modified: ${stats.mtime.toISOString()}`);
    
    console.log('\n📤 Uploading to Cloudinary...');
    console.log('⏳ This may take a moment for large files...\n');
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(rulebookPath, {
      folder: 'savishkar/documents',
      resource_type: 'raw', // Important for PDFs
      public_id: 'rulebook',
      overwrite: true, // Replace existing file
      type: 'upload',
      access_mode: 'public'
    });
    
    console.log('✅ Upload Successful!\n');
    console.log('📊 Upload Details:');
    console.log('─'.repeat(60));
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Format: ${result.format}`);
    console.log(`   Size: ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Created: ${result.created_at}`);
    console.log('─'.repeat(60));
    
    // Connect to database and save URL
    console.log('\n💾 Saving URL to database...');
    
    try {
      // Connect to MongoDB
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ Connected to database');
      
      // Save URL to settings
      await Settings.set('rulebook_url', result.secure_url, {
        description: 'Cloudinary URL for the event rulebook PDF',
        category: 'documents',
        isPublic: true
      });
      
      console.log('✅ URL saved to database!');
      console.log(`   Key: rulebook_url`);
      console.log(`   Value: ${result.secure_url}`);
      
      // Close database connection
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
      
    } catch (dbError) {
      console.error('⚠️  Could not save to database:', dbError.message);
      console.log('💡 You can manually add it via admin panel or API');
    }
    
    console.log('\n✅ Rulebook is now stored on Cloudinary!');
    console.log('🌐 Accessible from anywhere');
    console.log('♾️  No storage limits on your server');
    console.log('⚡ Fast CDN delivery');
    console.log('💾 URL saved in database\n');
    
    console.log('📋 What Happened:');
    console.log('   1. ✅ Uploaded to Cloudinary');
    console.log('   2. ✅ Saved URL to database (key: rulebook_url)');
    console.log('   3. ✅ Server will automatically fetch from database\n');
    
    console.log('🧪 Test It:');
    console.log('   curl http://localhost:5000/api/rulebook/info');
    console.log('   curl http://localhost:5000/api/rulebook/download -o test.pdf\n');
    
    // Save URL to a file for easy reference
    const urlFile = path.join(__dirname, '../uploads/rulebook-cloudinary-url.txt');
    fs.writeFileSync(urlFile, result.secure_url);
    console.log(`📝 URL also saved to: ${urlFile}\n`);
    
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
    } else if (error.message.includes('File size too large')) {
      console.error('\n💡 SOLUTION:');
      console.error('   Your PDF file is too large for your Cloudinary plan');
      console.error('   Consider compressing the PDF or upgrading your plan');
    }
    
    console.error('\n📚 For help, see: CLOUDINARY_SETUP.md');
    console.error('═'.repeat(60));
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  if (!checkCloudinaryConfig()) {
    process.exit(1);
  }
  
  await uploadRulebook();
};

main();
