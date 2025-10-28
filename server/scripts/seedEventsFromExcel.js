import xlsx from 'xlsx';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Dummy images array for different event types
const dummyImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
];

const seedEvents = async () => {
  try {
    await connectDB();

    // Read the Excel file
    const workbook = xlsx.readFile('D:\\code3\\Savishkar_events_detail.xlsx');
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);
    
    console.log(`Found ${jsonData.length} events in Excel file`);
    console.log('Sample data:', jsonData[0]);

    const events = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      // Map Excel columns to Event schema
      // Adjust these field names based on actual Excel column names
      const event = {
        name: row['Event Name'] || row['Name'] || row['name'] || `Event ${i + 1}`,
        description: row['Description'] || row['description'] || 'Event description',
        shortDescription: row['Tagline'] || row['Tag Line'] || row['tagline'] || row['Short Description'] || '',
        category: row['Category'] || row['category'] || 'Technical',
        department: row['Department'] || row['department'] || 'Common',
        image: dummyImages[i % dummyImages.length],
        date: new Date('2025-03-15'), // Default date, adjust as needed
        time: row['Time'] || row['time'] || '10:00 AM',
        venue: row['Venue'] || row['venue'] || 'Main Auditorium',
        registrationFee: parseInt(row['Fee'] || row['fee'] || row['Registration Fee'] || '0'),
        maxParticipants: parseInt(row['Max Participants'] || row['maxParticipants'] || '100'),
        teamSize: {
          min: parseInt(row['Team Size Min'] || row['minTeamSize'] || '1'),
          max: parseInt(row['Team Size Max'] || row['maxTeamSize'] || '1')
        },
        rules: row['Rules'] ? row['Rules'].split('\n').filter(r => r.trim()) : [],
        eligibility: row['Eligibility'] ? row['Eligibility'].split('\n').filter(e => e.trim()) : ['Open to all'],
        isActive: true,
        status: 'upcoming',
        onlineRegistrationOpen: true
      };
      
      // Generate slug
      event.slug = event.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      events.push(event);
    }

    // Insert events
    console.log(`Preparing to insert ${events.length} events...`);
    
    // Remove duplicate events by name
    for (const event of events) {
      try {
        await Event.findOneAndUpdate(
          { name: event.name },
          event,
          { upsert: true, new: true }
        );
        console.log(`✅ Added/Updated: ${event.name} (${event.department})`);
      } catch (error) {
        console.error(`❌ Error adding ${event.name}:`, error.message);
      }
    }

    console.log(`\n✅ Successfully seeded ${events.length} events!`);
    
  } catch (error) {
    console.error('Error seeding events:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

seedEvents();
