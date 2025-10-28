import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing MongoDB connection...');
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected successfully!');
  
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('\nAvailable collections:');
  collections.forEach(col => console.log(`  - ${col.name}`));
  
  await mongoose.disconnect();
  console.log('\n✅ Test complete');
} catch (error) {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
}
