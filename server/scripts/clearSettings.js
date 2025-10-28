import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Settings from '../models/Settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const clearSettings = async () => {
  try {
    // Check if MONGODB_URI exists
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('Please make sure .env file exists in the server directory');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected');

    console.log('\n🗑️  Clearing Settings Collection...\n');

    // Count settings before deletion
    const totalSettings = await Settings.countDocuments();

    console.log(`📊 Current Status:`);
    console.log(`   - Total Settings: ${totalSettings}`);

    // Get settings before deletion
    const settings = await Settings.find();
    if (settings.length > 0) {
      console.log('\n⚙️  Current Settings:');
      settings.forEach((setting, index) => {
        console.log(`\n${index + 1}. Setting ID: ${setting._id}`);
        console.log(`   Registration Open: ${setting.registrationOpen}`);
        console.log(`   Payment Gateway: ${setting.paymentGateway}`);
        console.log(`   Max Registrations Per User: ${setting.maxRegistrationsPerUser}`);
      });
    }

    // Delete all settings
    const result = await Settings.deleteMany({});
    console.log(`\n✅ Deleted ${result.deletedCount} settings`);

    console.log('\n⚠️  Warning: Settings collection cleared!');
    console.log('   You may need to recreate default settings for the application to work properly.');

    console.log('\n✅ Settings collection cleared successfully!');
    
    console.log('\n📊 Final Summary:');
    console.log(`   - Total Settings Deleted: ${result.deletedCount}`);
    console.log(`   - Settings Remaining: 0`);
    console.log(`   - ⚠️  Action Required: Recreate default settings`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing settings:', error.message);
    process.exit(1);
  }
};

clearSettings();
