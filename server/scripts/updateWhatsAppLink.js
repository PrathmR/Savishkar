import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Event from '../models/Event.js';

// Get directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const WHATSAPP_LINK = 'https://chat.whatsapp.com/Ll4nyOidijK3Btz3RtTv5U';

const updateAllEvents = async () => {
  try {
    // Check if MONGODB_URI exists
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI not found in .env file');
      console.log('Please make sure .env file exists in the server directory');
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB Connected Successfully!\n');

    // Update all events with the WhatsApp link
    console.log('📝 Updating all events with WhatsApp community link...');
    console.log(`🔗 Link: ${WHATSAPP_LINK}\n`);

    const result = await Event.updateMany(
      {}, // Empty filter to match all events
      { $set: { whatsappLink: WHATSAPP_LINK } }
    );

    console.log('✅ Update Complete!');
    console.log(`📊 Total events updated: ${result.modifiedCount}`);
    console.log(`📊 Total events matched: ${result.matchedCount}\n`);

    // Verify the update
    const events = await Event.find({}, 'name whatsappLink');
    console.log('📋 Updated Events:');
    console.log('─'.repeat(80));
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   WhatsApp Link: ${event.whatsappLink || 'Not set'}`);
    });
    console.log('─'.repeat(80));

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the update
updateAllEvents();
