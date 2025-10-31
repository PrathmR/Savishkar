import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

dotenv.config();

// Parse CSV manually
const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    // Simple CSV parsing (doesn't handle commas in quotes perfectly, but good enough)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    
    data.push(row);
  }
  
  return data;
};

const parseTeamSize = (teamSizeStr) => {
  if (!teamSizeStr) return { min: 1, max: 1 };
  
  const str = teamSizeStr.toString().toLowerCase();
  let min = 1, max = 1;
  
  const minMatch = str.match(/minimum\s*:?\s*(\d+)/i);
  if (minMatch) min = parseInt(minMatch[1]);
  
  const maxMatch = str.match(/maximum\s*:?\s*(\d+)/i);
  if (maxMatch) {
    max = parseInt(maxMatch[1]);
  } else if (str.includes('maximum') && !str.includes('minimum')) {
    const numMatch = str.match(/(\d+)/);
    if (numMatch) {
      max = parseInt(numMatch[1]);
      min = 1;
    }
  }
  
  if (!minMatch && !maxMatch) {
    const numMatch = str.match(/(\d+)/);
    if (numMatch) {
      const num = parseInt(numMatch[1]);
      min = num;
      max = num;
    }
  }
  
  return { min, max };
};

const parsePrizes = (prizeStr) => {
  if (!prizeStr) return {};
  
  const prizes = {};
  const str = prizeStr.toString();
  
  const firstMatch = str.match(/1st\s*:?\s*[₹rs]*\s*(\d+)/i);
  if (firstMatch) prizes.first = `₹${firstMatch[1]}`;
  
  const secondMatch = str.match(/2nd\s*:?\s*[₹rs]*\s*(\d+)/i);
  if (secondMatch) prizes.second = `₹${secondMatch[1]}`;
  
  const thirdMatch = str.match(/3rd\s*:?\s*[₹rs]*\s*(\d+)/i);
  if (thirdMatch) prizes.third = `₹${thirdMatch[1]}`;
  
  return prizes;
};

const parseDate = (dateStr) => {
  if (!dateStr) return new Date('2025-11-12');
  
  const str = dateStr.toString().trim();
  const parts = str.split('/');
  
  if (parts.length === 3) {
    const month = parseInt(parts[0]);
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    return new Date(year, month - 1, day);
  }
  
  return new Date(str);
};

const parseRegistrationFee = (feeStr) => {
  if (!feeStr) return 0;
  const match = feeStr.toString().match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
};

const parseMaxParticipants = (maxStr) => {
  if (!maxStr) return 100;
  const match = maxStr.toString().match(/(\d+)/);
  return match ? parseInt(match[1]) : 100;
};

const normalizeCategory = (category) => {
  if (!category) return 'Technical';
  const cat = category.toString().trim();
  if (cat.toLowerCase().includes('technical') && !cat.toLowerCase().includes('non')) {
    return 'Technical';
  } else if (cat.toLowerCase().includes('non')) {
    return 'Non-Technical';
  } else if (cat.toLowerCase().includes('cultural')) {
    return 'Cultural';
  }
  return 'Technical';
};

const normalizeDepartment = (dept) => {
  if (!dept) return 'Common';
  const deptStr = dept.toString().trim().toUpperCase();
  const deptMap = {
    'AIML': 'AIML',
    'CSE': 'CSE',
    'ECE': 'ECE',
    'MECH': 'Mech',
    'MECHANICAL': 'Mech',
    'CIVIL': 'Civil',
    'MBA': 'MBA',
    'COMMON': 'Common'
  };
  return deptMap[deptStr] || 'Common';
};

const parseCoordinators = (nameStr, phoneStr, emailStr) => {
  const coordinators = [];
  if (!nameStr) return coordinators;
  
  const names = nameStr.toString().split(/[,&;]|and/i).map(n => n.trim()).filter(n => n);
  const phones = phoneStr ? phoneStr.toString().split(/[,&;]/).map(p => p.trim()).filter(p => p) : [];
  const emails = emailStr ? emailStr.toString().split(/[,&;]/).map(e => e.trim()).filter(e => e) : [];
  
  names.forEach((name, index) => {
    coordinators.push({
      name: name,
      phone: phones[index] || '',
      email: emails[index] || '',
      role: index === 0 ? 'head' : 'coordinator'
    });
  });
  
  return coordinators;
};

const dummyImages = {
  Technical: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
  'Non-Technical': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
  Cultural: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
  default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
};

const importEvents = async () => {
  try {
    console.log('🚀 Starting event import...\n');
    
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected\n');
    
    // Read CSV file
    const csvFilePath = 'D:\\code3\\Savishkar detail final submission form (Responses).csv';
    console.log('📖 Reading CSV file...');
    
    if (!fs.existsSync(csvFilePath)) {
      console.error('❌ CSV file not found at:', csvFilePath);
      return;
    }
    
    const rows = parseCSV(csvFilePath);
    console.log(`✅ Found ${rows.length} rows in CSV\n`);
    
    const events = [];
    const uniqueEvents = new Map();
    
    for (const row of rows) {
      try {
        const eventName = row['Event name']?.trim();
        
        if (!eventName || eventName.toLowerCase().includes('event name')) {
          continue;
        }
        
        const category = normalizeCategory(row['Event Category']);
        const department = normalizeDepartment(row['Event department ']);
        const teamSize = parseTeamSize(row['Team size (minimum  & maximum)\nIf team event \nExample :  Minimum : 2\n                   Maximum : 4\nIf individual type : 1\n']);
        const prizes = parsePrizes(row['Prizes\nExample : 1st : 1500rs \n                  2nd : 1000rs ']);
        const date = parseDate(row['Event date ']);
        const registrationFee = parseRegistrationFee(row['Registration fee']);
        const maxParticipants = parseMaxParticipants(row['Maximum team slots ']);
        const coordinators = parseCoordinators(
          row['Event Coordinators  Name '],
          row['Event Coordinators contact number'],
          row['Event Coordinators E-mail']
        );
        
        const event = {
          name: eventName,
          description: row['Full description\nDescribe you event in detail around a paragraph.'] || row['Short description \nexample :  hackathon, solo dance, singing, bgmi, '] || 'Event description',
          shortDescription: row['Short description \nexample :  hackathon, solo dance, singing, bgmi, '] || eventName,
          category: category,
          department: department,
          image: dummyImages[category] || dummyImages.default,
          date: date,
          time: row['Event start time'] || '10:00 AM',
          venue: row['Venue\nExample: classroom number, quadrangle etc\n'] || 'TBA',
          registrationFee: registrationFee,
          maxParticipants: maxParticipants,
          teamSize: teamSize,
          prizes: prizes,
          coordinators: coordinators,
          rules: [],
          eligibility: ['Open to all students'],
          isActive: true,
          status: 'upcoming',
          onlineRegistrationOpen: true,
          tags: [category.toLowerCase(), department.toLowerCase()],
          slug: eventName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        };
        
        // Use Map to keep only the last occurrence of duplicate events
        uniqueEvents.set(eventName, event);
        
      } catch (error) {
        console.error(`❌ Error parsing event:`, error.message);
      }
    }
    
    const finalEvents = Array.from(uniqueEvents.values());
    console.log(`📊 Parsed ${finalEvents.length} unique events\n`);
    
    // Insert events
    let successCount = 0;
    let errorCount = 0;
    
    console.log('💾 Importing events to database...\n');
    
    for (const event of finalEvents) {
      try {
        await Event.findOneAndUpdate(
          { name: event.name },
          event,
          { upsert: true, new: true }
        );
        console.log(`✅ ${event.name} (${event.department} - ${event.category})`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${event.name}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Successfully imported ${successCount} events!`);
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} events failed to import`);
    }
    
    // Show summary by department
    console.log(`\n📊 Events by Department:`);
    const deptCounts = {};
    finalEvents.forEach(event => {
      deptCounts[event.department] = (deptCounts[event.department] || 0) + 1;
    });
    Object.entries(deptCounts).sort().forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} events`);
    });
    
    console.log(`${'='.repeat(60)}\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  }
};

importEvents();
