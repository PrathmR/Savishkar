import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExcelJS from 'exceljs';
import Event from '../models/Event.js';

dotenv.config();

const CSV_PATH = 'D:\\code3\\Savishkar detail final submission form (Responses).csv';
const CSV_PATH2 = 'D:\\code3\\Savishkar_events_detail.csv';
const XLSX_PATH = 'D:\\code3\\Savishkar detail final submission form (Responses).xlsx';

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
};

const parseCSV = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
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

const parseXLSX = async (filePath) => {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);
  const worksheet = workbook.worksheets[0];
  if (!worksheet) return [];
  const headerRow = worksheet.getRow(1);
  const headers = [];
  headerRow.eachCell((cell, col) => {
    headers[col] = String(cell.text || cell.value || '').trim();
  });
  const data = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    row.eachCell((cell, col) => {
      const key = headers[col];
      if (!key) return;
      obj[key] = String(cell.text ?? cell.value ?? '').trim();
    });
    if (Object.values(obj).some(v => v && v.length > 0)) data.push(obj);
  });
  return data;
};

const getFirst = (row, keys = []) => {
  for (const k of keys) {
    if (k in row && row[k] !== undefined && String(row[k]).trim() !== '') {
      return row[k];
    }
  }
  return '';
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
      min = num; max = num;
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
  if (cat.toLowerCase().includes('technical') && !cat.toLowerCase().includes('non')) return 'Technical';
  if (cat.toLowerCase().includes('non')) return 'Non-Technical';
  if (cat.toLowerCase().includes('cultural')) return 'Cultural';
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
    'APPLIED SCIENCE': 'Applied Science',
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
      name,
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

const run = async () => {
  try {
    await connectDB();
    if (!fs.existsSync(CSV_PATH) && !fs.existsSync(CSV_PATH2) && !fs.existsSync(XLSX_PATH)) {
      console.error('❌ Neither CSV nor XLSX found.');
      process.exit(1);
    }

    let rows = [];
    if (fs.existsSync(CSV_PATH)) {
      console.log('📖 Reading CSV...');
      rows = rows.concat(parseCSV(CSV_PATH));
    }
    if (fs.existsSync(CSV_PATH2)) {
      console.log('📖 Reading CSV #2...');
      rows = rows.concat(parseCSV(CSV_PATH2));
    }
    if (fs.existsSync(XLSX_PATH)) {
      console.log('📖 Reading XLSX...');
      rows = rows.concat(await parseXLSX(XLSX_PATH));
    }
    console.log(`🔍 Total rows loaded: ${rows.length}`);

    const unique = new Map();
    for (const row of rows) {
      const name = String(getFirst(row, ['Event name', 'Event Name', 'Name', 'Event'])).trim();
      if (!name || name.toLowerCase().includes('event name')) continue;
      const category = normalizeCategory(getFirst(row, ['Event Category', 'Category', 'Event category']));
      const department = normalizeDepartment(getFirst(row, ['Event department ', 'Event department', 'Department', 'Event Department']));
      const teamSize = parseTeamSize(row['Team size (minimum  & maximum)\nIf team event \nExample :  Minimum : 2\n                   Maximum : 4\nIf individual type : 1\n']);
      const prizes = parsePrizes(row['Prizes\nExample : 1st : 1500rs \n                  2nd : 1000rs ']);
      const date = parseDate(getFirst(row, ['Event date ', 'Event Date', 'Date']));
      const registrationFee = parseRegistrationFee(getFirst(row, ['Registration fee', 'Registration Fee', 'Fee']));
      const maxParticipants = parseMaxParticipants(getFirst(row, ['Maximum team slots ', 'Max Participants']));
      const coordinators = parseCoordinators(
        getFirst(row, ['Event Coordinators  Name ', 'Event Coordinators Name', 'Coordinators Name', 'Coordinator Name']),
        getFirst(row, ['Event Coordinators contact number', 'Event Coordinators Contact', 'Coordinator Contact']),
        getFirst(row, ['Event Coordinators E-mail', 'Event Coordinators Email', 'Coordinator Email'])
      );

      const event = {
        name,
        description: getFirst(row, ['Full description\nDescribe you event in detail around a paragraph.', 'Description', 'Full Description']) || getFirst(row, ['Short description \nexample :  hackathon, solo dance, singing, bgmi, ']) || 'Event description',
        shortDescription: getFirst(row, ['Short description \nexample :  hackathon, solo dance, singing, bgmi, ', 'Short Description', 'Tagline']) || name,
        category,
        department,
        image: dummyImages[category] || dummyImages.default,
        date,
        time: getFirst(row, ['Event start time', 'Time']) || '10:00 AM',
        venue: getFirst(row, ['Venue\nExample: classroom number, quadrangle etc\n', 'Venue']) || 'TBA',
        registrationFee,
        maxParticipants,
        teamSize,
        prizes,
        coordinators,
        rules: [],
        eligibility: ['Open to all students'],
        isActive: true,
        status: 'upcoming',
        onlineRegistrationOpen: true,
        tags: [category.toLowerCase(), (department || 'Common').toLowerCase()],
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };

      unique.set(name, event);
    }

    const events = Array.from(unique.values());
    console.log(`📊 Unique events: ${events.length}`);

    let success = 0, failed = 0;
    const deptCounts = {};

    for (const ev of events) {
      try {
        await Event.findOneAndUpdate({ name: ev.name }, ev, { upsert: true, new: true });
        success++;
        deptCounts[ev.department || 'Common'] = (deptCounts[ev.department || 'Common'] || 0) + 1;
        console.log(`✅ ${ev.name} (${ev.department})`);
      } catch (e) {
        failed++;
        console.error(`❌ ${ev.name}: ${e.message}`);
      }
    }

    console.log('\n==== Import Summary ====');
    console.log(`✅ Success: ${success}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('📋 By Department:');
    Object.entries(deptCounts).sort().forEach(([d, c]) => console.log(`  ${d}: ${c}`));
  } catch (err) {
    console.error('💥 Fatal:', err);
  } finally {
    await mongoose.disconnect();
    console.log('👋 MongoDB disconnected');
  }
};

run();
