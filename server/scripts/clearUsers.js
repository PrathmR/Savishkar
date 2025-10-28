import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const clearUsers = async () => {
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

    console.log('\n🗑️  Clearing Users Collection...\n');

    // Count users before deletion
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const regularUsers = totalUsers - adminUsers;

    console.log(`📊 Current Status:`);
    console.log(`   - Total Users: ${totalUsers}`);
    console.log(`   - Admin Users: ${adminUsers}`);
    console.log(`   - Regular Users: ${regularUsers}`);

    // Delete all non-admin users
    const result = await User.deleteMany({ role: { $ne: 'admin' } });
    console.log(`\n✅ Deleted ${result.deletedCount} non-admin users`);

    // Count remaining admin users
    const remainingAdmins = await User.countDocuments({ role: 'admin' });
    console.log(`✅ Kept ${remainingAdmins} admin user(s)`);

    // Display remaining admin users
    const admins = await User.find({ role: 'admin' }).select('name email phone college');
    if (admins.length > 0) {
      console.log('\n👤 Remaining Admin Users:');
      admins.forEach((admin, index) => {
        console.log(`\n${index + 1}. ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Phone: ${admin.phone || 'N/A'}`);
        console.log(`   College: ${admin.college || 'N/A'}`);
      });
    }

    console.log('\n✅ Users collection cleared successfully!');
    
    console.log('\n📊 Final Summary:');
    console.log(`   - Regular Users Deleted: ${result.deletedCount}`);
    console.log(`   - Admin Users Kept: ${remainingAdmins}`);
    console.log(`   - Total Users Remaining: ${remainingAdmins}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing users:', error.message);
    process.exit(1);
  }
};

clearUsers();
