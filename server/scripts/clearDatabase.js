import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const clearDatabase = async () => {
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

    console.log('\n🗑️  Starting database cleanup...\n');

    // Delete all notifications
    const notificationsDeleted = await Notification.deleteMany({});
    console.log(`✅ Deleted ${notificationsDeleted.deletedCount} notifications`);

    // Delete all payments
    const paymentsDeleted = await Payment.deleteMany({});
    console.log(`✅ Deleted ${paymentsDeleted.deletedCount} payments`);

    // Delete all registrations
    const registrationsDeleted = await Registration.deleteMany({});
    console.log(`✅ Deleted ${registrationsDeleted.deletedCount} registrations`);

    // Delete all events
    const eventsDeleted = await Event.deleteMany({});
    console.log(`✅ Deleted ${eventsDeleted.deletedCount} events`);

    // Delete all non-admin users
    const usersDeleted = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`✅ Deleted ${usersDeleted.deletedCount} non-admin users`);

    // Count remaining admin users
    const adminCount = await User.countDocuments({ role: 'admin' });
    console.log(`\n✅ Kept ${adminCount} admin user(s)`);

    // Display remaining admin users
    const admins = await User.find({ role: 'admin' }).select('name email phone college');
    console.log('\n👤 Remaining Admin Users:');
    admins.forEach((admin, index) => {
      console.log(`\n${index + 1}. ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Phone: ${admin.phone}`);
      console.log(`   College: ${admin.college}`);
    });

    console.log('\n✅ Database cleanup completed successfully!');
    console.log('\n📊 Final Summary:');
    console.log(`   - Events: 0`);
    console.log(`   - Registrations: 0`);
    console.log(`   - Payments: 0`);
    console.log(`   - Notifications: 0`);
    console.log(`   - Regular Users: 0`);
    console.log(`   - Admin Users: ${adminCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    process.exit(1);
  }
};

clearDatabase();
