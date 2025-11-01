import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function updatePhotographyCategories() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Find the Photography event
    const photographyEvent = await Event.findOne({ name: 'Photography' });
    
    if (!photographyEvent) {
      console.log('❌ Photography event not found');
      process.exit(1);
    }

    console.log(`📸 Found Photography event: ${photographyEvent.name}`);

    // Update registration categories with correct fees and prizes
    photographyEvent.registrationCategories = [
      {
        categoryName: 'DSLR',
        fee: 150,
        prize: '₹1000',
        description: 'Professional DSLR camera category'
      },
      {
        categoryName: 'Mobile',
        fee: 100,
        prize: '₹500',
        description: 'Mobile phone camera category'
      }
    ];

    // Ensure base registration fee is 0 since we have categories
    photographyEvent.registrationFee = 0;

    await photographyEvent.save();
    
    console.log('✅ Successfully updated registration categories for Photography event:');
    console.log('   - DSLR: ₹150 fee, ₹1000 prize');
    console.log('   - Mobile: ₹100 fee, ₹500 prize');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
updatePhotographyCategories();
