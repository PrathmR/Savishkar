import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Diverse dummy images for different event types
const dummyImages = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', // Tech event
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800', // Music
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800', // Dance
  'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800', // Business
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', // Tech
  'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', // Coding
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800', // Office
  'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800', // Robot
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800', // Cultural
  'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800', // Workshop
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800', // Coding screen
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800', // Conference
  'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800', // Gaming
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800', // Music performance
  'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800', // Stage
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', // Concert
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800', // Performer
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800', // Music tech
  'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800', // Engineering
  'https://images.unsplash.com/photo-1581093458791-9d42e01a4b8e?w=800', // Robotics
];

// Parse CSV manually
const parseCSV = (csvContent) => {
  const lines = csvContent.split('\n');
  const events = [];
  
  let currentEvent = null;
  let fieldBuffer = '';
  let insideQuotes = false;
  let fieldIndex = 0;
  
  for (let i = 1; i < lines.length; i++) { // Skip header
    const line = lines[i];
    
    if (!line.trim()) continue;
    
    // Simple CSV parsing - looking for the timestamp pattern to identify new rows
    if (line.match(/^\d{1,2}\/\d{1,2}\/\d{4} \d{1,2}:\d{2}:\d{2},/)) {
      // New event row
      if (currentEvent) {
        events.push(currentEvent);
      }
      
      const parts = line.split(',');
      currentEvent = {
        timestamp: parts[0],
        email: parts[1],
        department: parts[2],
        name: parts[3],
        category: parts[4]?.trim(),
        type: parts[5],
        shortDescription: parts[6],
        description: '',
        prizes: '',
        rules: '',
        coordinators: ''
      };
      
      // Collect remaining fields
      let remainingText = parts.slice(6).join(',');
      let fields = [];
      let buffer = '';
      let inQuote = false;
      
      for (let char of remainingText) {
        if (char === '"') {
          inQuote = !inQuote;
        } else if (char === ',' && !inQuote) {
          fields.push(buffer);
          buffer = '';
        } else {
          buffer += char;
        }
      }
      fields.push(buffer);
      
      currentEvent.shortDescription = fields[0]?.replace(/^"|"$/g, '').trim() || '';
      currentEvent.description = fields[1]?.replace(/^"|"$/g, '').trim() || '';
      currentEvent.prizes = fields[2]?.replace(/^"|"$/g, '').trim() || '';
      currentEvent.rules = fields[3]?.replace(/^"|"$/g, '').trim() || '';
      currentEvent.coordinators = fields[4]?.replace(/^"|"$/g, '').trim() || '';
      
    } else if (currentEvent) {
      // Continuation of previous field (multiline)
      currentEvent.coordinators += '\n' + line;
    }
  }
  
  if (currentEvent) {
    events.push(currentEvent);
  }
  
  return events;
};

// Extract prize amounts
const extractPrizes = (prizeText) => {
  const prizes = {};
  if (!prizeText) return prizes;
  
  const first = prizeText.match(/1st[:\s-]*(?:rs\.?|₹)?\s*(\d+)/i);
  const second = prizeText.match(/2nd[:\s-]*(?:rs\.?|₹)?\s*(\d+)/i);
  const third = prizeText.match(/3rd[:\s-]*(?:rs\.?|₹)?\s*(\d+)/i);
  
  if (first) prizes.first = `₹${first[1]}`;
  if (second) prizes.second = `₹${second[1]}`;
  if (third) prizes.third = `₹${third[1]}`;
  
  return prizes;
};

// Extract team size
const extractTeamSize = (rulesText, eventType) => {
  const teamSize = { min: 1, max: 1 };
  
  if (eventType?.toLowerCase().includes('individual')) {
    return teamSize;
  }
  
  if (!rulesText) {
    return { min: 2, max: 4 }; // Default for team events
  }
  
  // Look for team size patterns
  const teamPattern = rulesText.match(/team.*?(\d+).*?(\d+).*?member/i);
  const minPattern = rulesText.match(/(?:minimum|min).*?(\d+).*?member/i);
  const maxPattern = rulesText.match(/(?:maximum|max).*?(\d+).*?member/i);
  const exactPattern = rulesText.match(/(?:team of|consist of).*?(\d+).*?member/i);
  
  if (exactPattern) {
    const size = parseInt(exactPattern[1]);
    return { min: size, max: size };
  }
  
  if (minPattern) teamSize.min = parseInt(minPattern[1]);
  if (maxPattern) teamSize.max = parseInt(maxPattern[1]);
  if (teamPattern) {
    teamSize.min = parseInt(teamPattern[1]);
    teamSize.max = parseInt(teamPattern[2]);
  }
  
  // Default team sizes if nothing found
  if (eventType?.toLowerCase().includes('team')) {
    return { min: 2, max: 4 };
  }
  
  return teamSize;
};

// Extract registration fee
const extractRegistrationFee = (rulesText) => {
  if (!rulesText) return 0;
  
  const feePattern = rulesText.match(/(?:registration fee|fee).*?(?:rs\.?|₹)\s*(\d+)/i);
  if (feePattern) {
    return parseInt(feePattern[1]);
  }
  
  return 0;
};

// Extract coordinators
const extractCoordinators = (coordinatorText) => {
  if (!coordinatorText) return [];
  
  const coordinators = [];
  const lines = coordinatorText.split('\n').filter(l => l.trim());
  
  let currentCoordinator = {};
  
  for (const line of lines) {
    const nameMatch = line.match(/(?:Name[:\s-]*)?([A-Za-z\s\.]+?)(?:\s*,|\s*\+?\d)/i);
    const phoneMatch = line.match(/(\+?\d{10,})/);
    const emailMatch = line.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    
    if (nameMatch && nameMatch[1]?.trim()) {
      if (currentCoordinator.name) {
        coordinators.push(currentCoordinator);
        currentCoordinator = {};
      }
      currentCoordinator.name = nameMatch[1].trim();
    }
    
    if (phoneMatch) {
      currentCoordinator.phone = phoneMatch[1].replace(/\s/g, '');
    }
    
    if (emailMatch) {
      currentCoordinator.email = emailMatch[1];
    }
  }
  
  if (currentCoordinator.name) {
    coordinators.push(currentCoordinator);
  }
  
  return coordinators.slice(0, 3); // Max 3 coordinators
};

// Map category
const mapCategory = (category) => {
  if (!category) return 'Technical';
  const cat = category.toLowerCase().trim();
  if (cat.includes('tech')) return 'Technical';
  if (cat.includes('non') || cat.includes('cultural')) return 'Non-Technical';
  if (cat.includes('cultural')) return 'Cultural';
  return 'Technical';
};

// Map department
const mapDepartment = (dept) => {
  if (!dept) return 'Common';
  const d = dept.trim();
  const validDepts = ['CSE', 'AIML', 'ECE', 'Mechanical', 'Civil', 'MBA', 'Applied Science', 'Common'];
  return validDepts.includes(d) ? d : 'Common';
};

const seedEvents = async () => {
  try {
    console.log('Starting seed process...');
    await connectDB();
    
    console.log('📖 Reading CSV file...');
    const csvContent = fs.readFileSync('D:\\code3\\Savishkar_events_detail.csv', 'utf-8');
    console.log('CSV file read successfully, length:', csvContent.length);
    
    console.log('🔍 Parsing CSV data...');
    const rawEvents = parseCSV(csvContent);
    
    console.log(`✅ Found ${rawEvents.length} events in CSV\n`);
    
    const events = [];
    
    for (let i = 0; i < rawEvents.length; i++) {
      const raw = rawEvents[i];
      
      try {
        const event = {
          name: raw.name?.trim() || `Event ${i + 1}`,
          description: raw.description?.trim() || raw.shortDescription?.trim() || 'Event description',
          shortDescription: raw.shortDescription?.trim().substring(0, 200) || '',
          category: mapCategory(raw.category),
          department: mapDepartment(raw.department),
          image: dummyImages[i % dummyImages.length],
          date: new Date('2025-03-15'), // Default Savishkar date
          time: '10:00 AM',
          venue: 'JCER Campus',
          registrationFee: extractRegistrationFee(raw.rules),
          maxParticipants: 100,
          currentParticipants: 0,
          teamSize: extractTeamSize(raw.rules, raw.type),
          rules: raw.rules ? raw.rules.split('\n').filter(r => r.trim()).slice(0, 15) : [],
          eligibility: ['Open to all college students', 'Valid ID card required'],
          prizes: extractPrizes(raw.prizes),
          coordinators: extractCoordinators(raw.coordinators),
          isActive: true,
          status: 'upcoming',
          onlineRegistrationOpen: true,
          isFeatured: false
        };
        
        // Generate slug
        event.slug = event.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        events.push(event);
        
      } catch (error) {
        console.error(`⚠️  Error processing event ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\n📥 Inserting ${events.length} events into database...\n`);
    
    let addedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    for (const event of events) {
      try {
        const existing = await Event.findOne({ name: event.name });
        
        if (existing) {
          await Event.findOneAndUpdate({ name: event.name }, event, { new: true });
          console.log(`🔄 Updated: ${event.name} (${event.department})`);
          updatedCount++;
        } else {
          await Event.create(event);
          console.log(`✅ Added: ${event.name} (${event.department})`);
          addedCount++;
        }
      } catch (error) {
        console.error(`❌ Error with ${event.name}:`, error.message);
        errorCount++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Seeding Complete!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Summary:`);
    console.log(`   ✅ Added: ${addedCount} events`);
    console.log(`   🔄 Updated: ${updatedCount} events`);
    console.log(`   ❌ Errors: ${errorCount} events`);
    console.log(`   📝 Total: ${addedCount + updatedCount} events in database`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Show breakdown by department
    const allEvents = await Event.find({ isActive: true });
    const byDepartment = allEvents.reduce((acc, event) => {
      acc[event.department] = (acc[event.department] || 0) + 1;
      return acc;
    }, {});
    
    console.log('📋 Events by Department:');
    Object.entries(byDepartment).sort().forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} events`);
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 MongoDB disconnected');
  }
};

seedEvents();
