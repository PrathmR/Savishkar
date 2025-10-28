import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const clearNotifications = async () => {
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

    console.log('\n🗑️  Clearing Notifications Collection...\n');

    // Count notifications before deletion
    const totalNotifications = await Notification.countDocuments();
    const sentNotifications = await Notification.countDocuments({ status: 'sent' });
    const failedNotifications = await Notification.countDocuments({ status: 'failed' });

    console.log(`📊 Current Status:`);
    console.log(`   - Total Notifications: ${totalNotifications}`);
    console.log(`   - Sent: ${sentNotifications}`);
    console.log(`   - Failed: ${failedNotifications}`);

    // Delete all notifications
    const result = await Notification.deleteMany({});
    console.log(`\n✅ Deleted ${result.deletedCount} notifications`);

    console.log('\n✅ Notifications collection cleared successfully!');
    
    console.log('\n📊 Final Summary:');
    console.log(`   - Total Notifications Deleted: ${result.deletedCount}`);
    console.log(`   - Sent Notifications Deleted: ${sentNotifications}`);
    console.log(`   - Failed Notifications Deleted: ${failedNotifications}`);
    console.log(`   - Notifications Remaining: 0`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing notifications:', error.message);
    process.exit(1);
  }
};

clearNotifications();
