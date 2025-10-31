import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let j = 0; j < lines[i].length; j++) {
      const char = lines[i][j];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

// Helper function to parse team size
function parseTeamSize(teamSizeStr) {
  const str = teamSizeStr.toLowerCase();
  
  // Extract numbers from the string
  const numbers = str.match(/\d+/g);
  
  if (!numbers || numbers.length === 0) {
    return { min: 1, max: 1 };
  }
  
  // Check if it's individual
  if (str.includes('individual') || (numbers.length === 1 && numbers[0] === '1')) {
    return { min: 1, max: 1 };
  }
  
  // Check for minimum and maximum
  if (str.includes('minimum') && str.includes('maximum')) {
    const min = parseInt(numbers[0]);
    const max = parseInt(numbers[1]);
    return { min, max };
  }
  
  // Check for only maximum
  if (str.includes('maximum')) {
    return { min: 1, max: parseInt(numbers[0]) };
  }
  
  // Check for only minimum
  if (str.includes('minimum')) {
    return { min: parseInt(numbers[0]), max: parseInt(numbers[0]) };
  }
  
  // If just a number
  if (numbers.length === 1) {
    const size = parseInt(numbers[0]);
    return { min: size, max: size };
  }
  
  // If two numbers without keywords
  return { min: parseInt(numbers[0]), max: parseInt(numbers[1]) };
}

// Helper function to parse prizes
function parsePrizes(prizesStr) {
  const prizes = {
    first: '',
    second: '',
    third: ''
  };
  
  const lines = prizesStr.split(/[,\n]/);
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.match(/1st|first/i)) {
      prizes.first = trimmed.replace(/1st\s*:?\s*/i, '').replace(/first\s*:?\s*/i, '').trim();
    } else if (trimmed.match(/2nd|second/i)) {
      prizes.second = trimmed.replace(/2nd\s*:?\s*/i, '').replace(/second\s*:?\s*/i, '').trim();
    } else if (trimmed.match(/3rd|third/i)) {
      prizes.third = trimmed.replace(/3rd\s*:?\s*/i, '').replace(/third\s*:?\s*/i, '').trim();
    } else if (!prizes.first && trimmed) {
      prizes.first = trimmed;
    }
  }
  
  return prizes;
}

// Helper function to parse coordinators
function parseCoordinators(names, phones, emails) {
  const nameList = names.split(/[,&]/).map(n => n.trim().replace(/^\d+\./, '').trim());
  const phoneList = phones.split(/[,;&]/).map(p => p.trim().replace(/\+91\s*/, '').replace(/\s+/g, ''));
  const emailList = emails.split(/[,;&]/).map(e => e.trim());
  
  const coordinators = [];
  const maxLength = Math.max(nameList.length, phoneList.length, emailList.length);
  
  for (let i = 0; i < maxLength; i++) {
    coordinators.push({
      name: nameList[i] || '',
      phone: phoneList[i] || '',
      email: emailList[i] || '',
      role: i === 0 ? 'head' : 'coordinator'
    });
  }
  
  return coordinators;
}

// Helper function to parse date
function parseDate(dateStr) {
  const [month, day, year] = dateStr.split('/');
  return new Date(year, month - 1, day);
}

// Helper function to normalize category
function normalizeCategory(category) {
  const cat = category.toLowerCase().trim();
  if (cat.includes('technical') && !cat.includes('non')) return 'Technical';
  if (cat.includes('non') || cat.includes('non-technical')) return 'Non-Technical';
  if (cat.includes('cultural')) return 'Cultural';
  return 'Non-Technical';
}

async function importEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Read CSV file
    const csvFilePath = path.join(__dirname, 'events.csv');
    const fileContent = fs.readFileSync(csvFilePath, 'utf-8');
    
    // Parse CSV
    const records = parseCSV(fileContent);

    console.log(`📊 Found ${records.length} events in CSV`);

    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
      try {
        const eventName = record['Event name'];
        
        // Check if event already exists
        const existingEvent = await Event.findOne({ name: eventName });
        if (existingEvent) {
          console.log(`⚠️  Event "${eventName}" already exists, skipping...`);
          continue;
        }

        // Parse team size
        const teamSize = parseTeamSize(record['Team size']);
        
        // Parse prizes
        const prizes = parsePrizes(record['Prizes']);
        
        // Parse coordinators
        const coordinators = parseCoordinators(
          record['Event Coordinators Name'],
          record['Event Coordinators contact number'],
          record['Event Coordinators E-mail']
        );
        
        // Parse date
        const eventDate = parseDate(record['Event date']);
        
        // Generate slug
        const slug = eventName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        
        // Parse max slots
        let maxSlots = 100;
        const slotsStr = record['Maximum team slots'];
        const slotsMatch = slotsStr.match(/\d+/);
        if (slotsMatch) {
          maxSlots = parseInt(slotsMatch[0]);
        }
        
        // Create event object
        const eventData = {
          name: eventName,
          slug: slug,
          shortDescription: record['Short description'],
          description: record['Full description'],
          category: normalizeCategory(record['Event Category']),
          department: record['Event department'].trim(),
          date: eventDate,
          time: record['Event start time'] || '10:00:00 AM',
          venue: record['Venue'],
          maxParticipants: maxSlots,
          registrationFee: parseInt(record['Registration fee']) || 0,
          teamSize: teamSize,
          prizes: prizes,
          coordinators: coordinators,
          rules: [
            'Get Your Valid ID Card.',
            'Follow the Co-ordinators Instructions.',
            'For Further Rules Visit RuleBook.'
          ],
          eligibility: [
            'All UG, PG and diploma students'
          ],
          isActive: true,
          status: 'upcoming',
          onlineRegistrationOpen: true
        };

        // Create event
        await Event.create(eventData);
        console.log(`✅ Created event: ${eventName}`);
        successCount++;

      } catch (error) {
        console.error(`❌ Error creating event "${record['Event name']}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Import Summary:');
    console.log(`✅ Successfully imported: ${successCount} events`);
    console.log(`❌ Failed: ${errorCount} events`);
    console.log(`📊 Total processed: ${records.length} events`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the import
importEvents();
