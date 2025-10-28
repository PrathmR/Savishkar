import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Event from '../models/Event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const clearEvents = async () => {
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

    console.log('\n🗑️  Clearing Events Collection...\n');

    // Count events before deletion
    const totalEvents = await Event.countDocuments();
    const technicalEvents = await Event.countDocuments({ category: 'Technical' });
    const nonTechnicalEvents = await Event.countDocuments({ category: 'Non-Technical' });
    const workshopEvents = await Event.countDocuments({ category: 'Workshop' });

    console.log(`📊 Current Status:`);
    console.log(`   - Total Events: ${totalEvents}`);
    console.log(`   - Technical: ${technicalEvents}`);
    console.log(`   - Non-Technical: ${nonTechnicalEvents}`);
    console.log(`   - Workshops: ${workshopEvents}`);

    // Get event names before deletion
    const events = await Event.find().select('name category');
    if (events.length > 0) {
      console.log('\n📋 Events to be deleted:');
      events.forEach((event, index) => {
        console.log(`   ${index + 1}. ${event.name} (${event.category})`);
      });
    }

    // Delete all events
    const result = await Event.deleteMany({});
    console.log(`\n✅ Deleted ${result.deletedCount} events`);

    console.log('\n✅ Events collection cleared successfully!');
    
    console.log('\n📊 Final Summary:');
    console.log(`   - Total Events Deleted: ${result.deletedCount}`);
    console.log(`   - Technical Events Deleted: ${technicalEvents}`);
    console.log(`   - Non-Technical Events Deleted: ${nonTechnicalEvents}`);
    console.log(`   - Workshop Events Deleted: ${workshopEvents}`);
    console.log(`   - Events Remaining: 0`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing events:', error.message);
    process.exit(1);
  }
};

clearEvents();
