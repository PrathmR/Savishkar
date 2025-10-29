import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Payment from '../models/Payment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const addUTRUniqueIndex = async () => {
  try {
    // Check if MONGODB_URI exists
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGO_URI or MONGODB_URI not found in .env file');
      console.log('Please make sure .env file exists in the server directory');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Checking for duplicate UTR numbers...');
    
    // Find all payments with UTR numbers
    const paymentsWithUTR = await Payment.find({ 
      utrNumber: { $exists: true, $ne: null, $ne: '' } 
    }).sort({ createdAt: 1 });

    console.log(`📊 Found ${paymentsWithUTR.length} payments with UTR numbers`);

    // Check for duplicates
    const utrMap = new Map();
    const duplicates = [];

    for (const payment of paymentsWithUTR) {
      if (utrMap.has(payment.utrNumber)) {
        duplicates.push({
          utr: payment.utrNumber,
          first: utrMap.get(payment.utrNumber),
          duplicate: payment._id
        });
      } else {
        utrMap.set(payment.utrNumber, payment._id);
      }
    }

    if (duplicates.length > 0) {
      console.log('⚠️  Found duplicate UTR numbers:');
      duplicates.forEach(dup => {
        console.log(`   UTR: ${dup.utr}`);
        console.log(`   First Payment ID: ${dup.first}`);
        console.log(`   Duplicate Payment ID: ${dup.duplicate}`);
        console.log('   ---');
      });
      console.log('⚠️  Please resolve duplicate UTR numbers before adding unique index');
      console.log('   You can either:');
      console.log('   1. Manually update duplicate UTR numbers in the database');
      console.log('   2. Delete duplicate payment records');
      console.log('   3. Set duplicate UTR numbers to null');
    } else {
      console.log('✅ No duplicate UTR numbers found');
      
      console.log('🔄 Creating unique index on utrNumber field...');
      
      // Drop existing index if it exists (without unique constraint)
      try {
        await Payment.collection.dropIndex('utrNumber_1');
        console.log('✅ Dropped old utrNumber index');
      } catch (err) {
        // Index might not exist, that's okay
        console.log('ℹ️  No existing utrNumber index to drop');
      }

      // Create unique sparse index
      await Payment.collection.createIndex(
        { utrNumber: 1 }, 
        { unique: true, sparse: true }
      );
      
      console.log('✅ Successfully created unique index on utrNumber field');
      console.log('✅ UTR numbers are now enforced to be unique in the database');
    }

    console.log('✅ Migration completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

addUTRUniqueIndex();
