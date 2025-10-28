import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Payment from '../models/Payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const clearPayments = async () => {
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

    console.log('\n🗑️  Clearing Payments Collection...\n');

    // Count payments before deletion
    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: 'completed' });
    const pendingPayments = await Payment.countDocuments({ status: 'pending' });
    const failedPayments = await Payment.countDocuments({ status: 'failed' });

    console.log(`📊 Current Status:`);
    console.log(`   - Total Payments: ${totalPayments}`);
    console.log(`   - Completed: ${completedPayments}`);
    console.log(`   - Pending: ${pendingPayments}`);
    console.log(`   - Failed: ${failedPayments}`);

    // Delete all payments
    const result = await Payment.deleteMany({});
    console.log(`\n✅ Deleted ${result.deletedCount} payments`);

    console.log('\n✅ Payments collection cleared successfully!');
    
    console.log('\n📊 Final Summary:');
    console.log(`   - Total Payments Deleted: ${result.deletedCount}`);
    console.log(`   - Completed Payments Deleted: ${completedPayments}`);
    console.log(`   - Pending Payments Deleted: ${pendingPayments}`);
    console.log(`   - Failed Payments Deleted: ${failedPayments}`);
    console.log(`   - Payments Remaining: 0`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing payments:', error.message);
    process.exit(1);
  }
};

clearPayments();
