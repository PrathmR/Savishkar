import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const clearRegistrations = async () => {
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

    console.log('\n🗑️  Clearing Registrations Collection...\n');

    // Count registrations before deletion
    const totalRegistrations = await Registration.countDocuments();
    const completedRegistrations = await Registration.countDocuments({ paymentStatus: 'completed' });
    const pendingRegistrations = await Registration.countDocuments({ paymentStatus: 'pending' });
    const verificationPendingRegistrations = await Registration.countDocuments({ paymentStatus: 'verification_pending' });
    const teamRegistrations = await Registration.countDocuments({ teamName: { $exists: true, $ne: null } });

    console.log(`📊 Current Status:`);
    console.log(`   - Total Registrations: ${totalRegistrations}`);
    console.log(`   - Completed Payment: ${completedRegistrations}`);
    console.log(`   - Pending Payment: ${pendingRegistrations}`);
    console.log(`   - Verification Pending: ${verificationPendingRegistrations}`);
    console.log(`   - Team Registrations: ${teamRegistrations}`);

    // Delete all registrations
    const result = await Registration.deleteMany({});
    console.log(`\n✅ Deleted ${result.deletedCount} registrations`);

    console.log('\n✅ Registrations collection cleared successfully!');
    
    console.log('\n📊 Final Summary:');
    console.log(`   - Total Registrations Deleted: ${result.deletedCount}`);
    console.log(`   - Completed Payment Registrations: ${completedRegistrations}`);
    console.log(`   - Pending Payment Registrations: ${pendingRegistrations}`);
    console.log(`   - Verification Pending Registrations: ${verificationPendingRegistrations}`);
    console.log(`   - Team Registrations: ${teamRegistrations}`);
    console.log(`   - Registrations Remaining: 0`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing registrations:', error.message);
    process.exit(1);
  }
};

clearRegistrations();
