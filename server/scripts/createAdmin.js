import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const createAdmin = async () => {
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

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'pawarshrimanta@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists!');
      console.log('Admin Details:', {
        name: existingAdmin.name,
        email: existingAdmin.email,
        role: existingAdmin.role
      });
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'sujeet',
      email: 'pawarshrimanta@gmail.com',
      password: 'Sujeet@123Jcer',
      phone: '9108217274',
      college: 'JCER Admin',
      role: 'admin',
      isEmailVerified: true, // Admin doesn't need email verification
      emailVerificationOTP: undefined,
      emailVerificationExpire: undefined
    });

    console.log('✅ Admin user created successfully!');
    console.log('Admin Details:', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      role: admin.role,
      isEmailVerified: admin.isEmailVerified
    });
    console.log('\n🔐 Login Credentials:');
    console.log('Email: pawarshrimanta@gmail.com');
    console.log('Password: Sujeet@123Jcer');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
