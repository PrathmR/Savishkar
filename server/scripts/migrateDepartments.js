import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Event from '../models/Event.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from server directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Department name mapping from old to new
const departmentMapping = {
  'Mechanical': 'Mech',
  'Computer Science': 'CSE',
  'Computer Science and Engineering': 'CSE',
  'Electronics': 'ECE',
  'Electronics and Communication': 'ECE',
  'Electronics and Communication Engineering': 'ECE',
  'Artificial Intelligence and Machine Learning': 'AIML',
  'AI/ML': 'AIML',
  'Civil Engineering': 'Civil',
  'Management': 'MBA',
  'Business Administration': 'MBA',
  'Applied Sciences': 'Applied Science',
  'General': 'Common',
  'All': 'Common'
};

const migrateDepartments = async () => {
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
    console.log('✅ Connected to MongoDB');

    // Get all events
    const events = await Event.find({});
    console.log(`📊 Found ${events.length} events to check`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const event of events) {
      const oldDepartment = event.department;
      
      // Check if department needs to be updated
      if (departmentMapping[oldDepartment]) {
        const newDepartment = departmentMapping[oldDepartment];
        
        // Update without validation to bypass enum check
        await Event.updateOne(
          { _id: event._id },
          { $set: { department: newDepartment } }
        );
        
        console.log(`✅ Updated: "${event.name}" - "${oldDepartment}" → "${newDepartment}"`);
        updatedCount++;
      } else if (!['AIML', 'CSE', 'ECE', 'Mech', 'Civil', 'MBA', 'Applied Science', 'Common'].includes(oldDepartment)) {
        console.log(`⚠️  Unknown department: "${event.name}" - "${oldDepartment}"`);
        console.log(`   Please manually update this event to one of: AIML, CSE, ECE, Mech, Civil, MBA, Applied Science, Common`);
        skippedCount++;
      } else {
        skippedCount++;
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   ✅ Updated: ${updatedCount} events`);
    console.log(`   ⏭️  Skipped: ${skippedCount} events (already correct or unknown)`);
    console.log('\n✨ Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run migration
migrateDepartments();
