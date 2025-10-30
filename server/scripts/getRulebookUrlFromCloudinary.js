#!/usr/bin/env node

/**
 * Get Rulebook URL from Cloudinary
 * This script fetches the actual URL of the rulebook from Cloudinary
 * Usage: node scripts/getRulebookUrlFromCloudinary.js
 */

import cloudinary from '../config/cloudinary.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n🔍 Fetching Rulebook URL from Cloudinary');
console.log('═'.repeat(60));

const getRulebookFromCloudinary = async () => {
  try {
    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('\n❌ CLOUDINARY_CLOUD_NAME not found in .env');
      process.exit(1);
    }

    console.log('\n📡 Connecting to Cloudinary...');
    
    // Search for the rulebook in Cloudinary
    const result = await cloudinary.api.resource('savishkar/documents/rulebook', {
      resource_type: 'raw'
    });

    console.log('✅ Rulebook found in Cloudinary!\n');
    console.log('📊 Details:');
    console.log('─'.repeat(60));
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   Format: ${result.format}`);
    console.log(`   Size: ${(result.bytes / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Created: ${result.created_at}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log('─'.repeat(60));

    // Ask if user wants to save to database
    console.log('\n💾 Saving URL to database...');
    
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('✅ Connected to database');
      
      await Settings.set('rulebook_url', result.secure_url, {
        description: 'Cloudinary URL for the event rulebook PDF',
        category: 'documents',
        isPublic: true
      });
      
      console.log('✅ URL saved to database!');
      console.log(`   Key: rulebook_url`);
      console.log(`   Value: ${result.secure_url}`);
      
      await mongoose.connection.close();
      console.log('✅ Database connection closed');
      
    } catch (dbError) {
      console.error('⚠️  Could not save to database:', dbError.message);
      console.log('💡 You can manually add it via admin panel');
    }

    console.log('\n✅ Setup Complete!');
    console.log('🌐 Your rulebook URL: ' + result.secure_url);
    console.log('\n═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.error && error.error.message === 'Resource not found') {
      console.error('\n💡 Rulebook not found in Cloudinary!');
      console.error('   Expected location: savishkar/documents/rulebook');
      console.error('\n📤 Upload it first using:');
      console.error('   npm run upload-rulebook');
    } else {
      console.error('\n📚 Troubleshooting:');
      console.error('   1. Check CLOUDINARY credentials in .env');
      console.error('   2. Verify rulebook exists in Cloudinary');
      console.error('   3. Check folder path: savishkar/documents/');
    }
    
    console.error('\n═'.repeat(60));
    process.exit(1);
  }
};

getRulebookFromCloudinary();
