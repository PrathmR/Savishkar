import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Default images by category
const defaultImages = {
  'Technical': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  'Non-Technical': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
  'Cultural': 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'
};

async function updateEventImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    const events = await Event.find({});
    console.log(`📊 Found ${events.length} events\n`);

    let updatedCount = 0;

    for (const event of events) {
      // Skip if event already has a Cloudinary image
      if (event.image && event.image.includes('cloudinary.com')) {
        console.log(`⏭️  Skipping "${event.name}" - Already has Cloudinary image`);
        continue;
      }

      // Assign default image based on category
      const newImage = defaultImages[event.category] || defaultImages['Technical'];
      
      event.image = newImage;
      await event.save();
      
      console.log(`✅ Updated "${event.name}" with ${event.category} image`);
      updatedCount++;
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Updated: ${updatedCount} events`);
    console.log(`   Skipped: ${events.length - updatedCount} events (already have Cloudinary images)`);
    console.log(`\n💡 Note: These are placeholder images. Upload actual event images via Admin Dashboard.`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the update
updateEventImages();
