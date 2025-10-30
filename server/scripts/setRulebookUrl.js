#!/usr/bin/env node

/**
 * Set Rulebook URL in Database
 * This script saves the Cloudinary rulebook URL to the database
 * Usage: node scripts/setRulebookUrl.js
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n📝 Setting Rulebook URL in Database');
console.log('═'.repeat(60));

const setRulebookUrl = async () => {
  try {
    // Check if Cloudinary cloud name is set
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) {
      console.log('\n❌ CLOUDINARY_CLOUD_NAME not found in .env');
      console.log('💡 Please set CLOUDINARY_CLOUD_NAME in your .env file');
      process.exit(1);
    }
    
    // Construct the Cloudinary URL
    // Format: https://res.cloudinary.com/{cloud_name}/raw/upload/{folder}/{public_id}.{format}
    const rulebookUrl = `https://res.cloudinary.com/${cloudName}/raw/upload/savishkar/documents/rulebook.pdf`;
    
    console.log('\n🔗 Cloudinary URL:');
    console.log(`   ${rulebookUrl}`);
    
    // Connect to MongoDB
    console.log('\n📡 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');
    
    // Save URL to settings
    console.log('\n💾 Saving URL to database...');
    await Settings.set('rulebook_url', rulebookUrl, {
      description: 'Cloudinary URL for the event rulebook PDF',
      category: 'documents',
      isPublic: true
    });
    
    console.log('✅ URL saved to database!');
    console.log(`   Key: rulebook_url`);
    console.log(`   Value: ${rulebookUrl}`);
    console.log(`   Category: documents`);
    console.log(`   Public: true`);
    
    // Verify the setting was saved
    console.log('\n🔍 Verifying...');
    const savedUrl = await Settings.get('rulebook_url');
    
    if (savedUrl === rulebookUrl) {
      console.log('✅ Verification successful!');
    } else {
      console.log('⚠️  Verification failed - URL mismatch');
    }
    
    // Close database connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    console.log('\n✅ Setup Complete!');
    console.log('🌐 Your rulebook is now accessible via:');
    console.log('   - Download: http://localhost:5000/api/rulebook/download');
    console.log('   - View: http://localhost:5000/api/rulebook/view');
    console.log('   - Info: http://localhost:5000/api/rulebook/info');
    
    console.log('\n🧪 Test It:');
    console.log('   curl http://localhost:5000/api/rulebook/info');
    
    console.log('\n═'.repeat(60));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\n📚 Troubleshooting:');
    console.error('   1. Make sure MONGO_URI is set in .env');
    console.error('   2. Make sure CLOUDINARY_CLOUD_NAME is set in .env');
    console.error('   3. Make sure MongoDB is running');
    console.error('   4. Make sure the rulebook exists in Cloudinary at:');
    console.error('      folder: savishkar/documents');
    console.error('      public_id: rulebook');
    console.error('\n═'.repeat(60));
    process.exit(1);
  }
};

setRulebookUrl();
