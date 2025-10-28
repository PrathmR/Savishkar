import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

dotenv.config();

const log = (message) => {
  console.log(message);
  fs.appendFileSync('D:\\code3\\server\\seed_log.txt', message + '\n');
};

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    log('✅ MongoDB connected');
  } catch (error) {
    log('❌ MongoDB connection error: ' + error.message);
    process.exit(1);
  }
};

// Dummy images
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
  'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
  'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800',
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
  'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
  'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800',
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
  'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800',
  'https://images.unsplash.com/photo-1581093458791-9d42e01a4b8e?w=800',
];

// Manually defined events from the CSV
const eventsData = [
  {
    name: 'Savishkar',
    department: 'MBA',
    category: 'Non-Technical',
    shortDescription: 'This event are technical and non-technical. Get ready to showcase your business brilliance!',
    description: 'Reputation radar and Boardroom Battles. Reputation radar challenges participants to think critically and solve real-time business cases.',
    teamSize: { min: 2, max: 2 },
    registrationFee: 0
  },
  {
    name: 'Robo Race',
    department: 'Mechanical',
    category: 'Technical',
    shortDescription: 'Race for robots',
    description: 'A race area will be created which will consist of hurdles the player who completes the race and time taken will be checked.',
    teamSize: { min: 2, max: 4 },
    registrationFee: 0
  },
  {
    name: 'Photography',
    department: 'Mechanical',
    category: 'Technical',
    shortDescription: 'Clicking photos and topic will be given',
    description: 'Clicking photos with given topics',
    teamSize: { min: 1, max: 1 },
    registrationFee: 0
  },
  {
    name: 'Robo Soccer',
    department: 'Mechanical',
    category: 'Technical',
    shortDescription: 'Robo soccer',
    description: 'Two teams will play opposite to each other the team which scores more wins',
    teamSize: { min: 1, max: 4 },
    registrationFee: 0
  },
  {
    name: 'Robo Sumo War',
    department: 'Mechanical',
    category: 'Technical',
    shortDescription: 'Robo sumo war',
    description: 'There will be two teams playing against each other making the robots fight',
    teamSize: { min: 1, max: 4 },
    registrationFee: 0
  },
  {
    name: 'Technical Paper Presentation',
    department: 'Mechanical',
    category: 'Technical',
    shortDescription: 'Paper presentation',
    description: 'Presentation of technical paper',
    teamSize: { min: 2, max: 2 },
    registrationFee: 0
  },
  {
    name: 'BIGG BOSS',
    department: 'CSE',
    category: 'Non-Technical',
    shortDescription: 'Bigg Boss event, a dynamic duo competition',
    description: 'Bigg Boss event unfolds in 3 suspenseful eliminating rounds, culminating in a Grand finale.',
    teamSize: { min: 2, max: 2 },
    registrationFee: 0
  },
  {
    name: '3D Modeling',
    department: 'Mechanical',
    category: 'Technical',
    shortDescription: '3D modeling in software',
    description: 'There will be two rounds conducted first of 15 mins and 2nd of 60 mins',
    teamSize: { min: 1, max: 1 },
    registrationFee: 0
  },
  {
    name: 'Squid Game',
    department: 'Mechanical',
    category: 'Non-Technical',
    shortDescription: 'Squid game',
    description: 'It is a game of a team of two members',
    teamSize: { min: 2, max: 2 },
    registrationFee: 120
  },
  {
    name: 'HACKSPHERE',
    department: 'CSE',
    category: 'Technical',
    shortDescription: 'The HackSphere competition is a key technical event',
    description: 'The event is designed to test participants proficiency in Technical Skills, critical thinking, and collaborative problem solving.',
    teamSize: { min: 3, max: 4 },
    registrationFee: 300
  },
  {
    name: 'Treasure Hunt',
    department: 'CSE',
    category: 'Non-Technical',
    shortDescription: 'The Treasure Hunt is one of the most thrilling non-technical events',
    description: 'It challenges participants to showcase their teamwork, logical reasoning, and problem-solving abilities.',
    teamSize: { min: 4, max: 4 },
    registrationFee: 0
  },
  {
    name: 'BID Premiere League',
    department: 'CSE',
    category: 'Non-Technical',
    shortDescription: 'Welcome to the Ultimate Fan Arena',
    description: 'A high-stakes battle where youll first gamble your points in a thrilling quiz auction.',
    teamSize: { min: 4, max: 4 },
    registrationFee: 0
  },
  {
    name: 'PAPER PRESENTATION',
    department: 'CSE',
    category: 'Technical',
    shortDescription: 'Paper Presentation is a platform for innovative thinkers',
    description: 'Paper Presentation is a platform for innovative thinkers and researchers to showcase their ideas.',
    teamSize: { min: 2, max: 2 },
    registrationFee: 150
  },
  {
    name: 'Virtual Gaming - Valorant',
    department: 'CSE',
    category: 'Non-Technical',
    shortDescription: 'Valorant is a team-based first-person tactical shooter event',
    description: 'Valorant is a team-based first-person tactical shooter event where participants compete in 5v5 matches.',
    teamSize: { min: 5, max: 5 },
    registrationFee: 0
  },
  {
    name: 'Virtual Gaming - BGMI',
    department: 'CSE',
    category: 'Non-Technical',
    shortDescription: 'BGMI (Battlegrounds Mobile India) is an exciting battle royale gaming event',
    description: 'BGMI event is a thrilling non-technical team competition designed for gamers.',
    teamSize: { min: 4, max: 4 },
    registrationFee: 0
  },
  {
    name: 'NrityaNova',
    department: 'Common',
    category: 'Cultural',
    shortDescription: 'Solo classical dance',
    description: 'A solo classical dance event where grace meets devotion.',
    teamSize: { min: 1, max: 1 },
    registrationFee: 0
  },
  {
    name: 'Seconds ka tashan',
    department: 'AIML',
    category: 'Non-Technical',
    shortDescription: 'Fun event',
    description: 'The event consists of set of rounds in which there will be some tasks to complete.',
    teamSize: { min: 2, max: 2 },
    registrationFee: 0
  },
  {
    name: 'TaalRythm',
    department: 'Common',
    category: 'Cultural',
    shortDescription: 'Solo western dance',
    description: 'A solo western dance event that highlights creativity, confidence, and individuality.',
    teamSize: { min: 1, max: 1 },
    registrationFee: 0
  },
  {
    name: 'IMPERSONA',
    department: 'ECE',
    category: 'Non-Technical',
    shortDescription: 'Personality Contest',
    description: 'A journey through creativity, confidence, and charisma — where personality takes the spotlight.',
    teamSize: { min: 1, max: 1 },
    registrationFee: 0
  },
  {
    name: 'Code Break',
    department: 'AIML',
    category: 'Technical',
    shortDescription: 'Escape room',
    description: 'CodeBreaker: MIND OVER MACHINE is a thrilling tech event that blends coding, logic, and creativity.',
    teamSize: { min: 3, max: 4 },
    registrationFee: 0
  },
  {
    name: 'Tandav Troupe',
    department: 'Common',
    category: 'Cultural',
    shortDescription: 'Group dance',
    description: 'A group dance event that showcases teamwork, coordination, and passion.',
    teamSize: { min: 4, max: 7 },
    registrationFee: 0
  },
  {
    name: 'Checkmate',
    department: 'ECE',
    category: 'Non-Technical',
    shortDescription: 'Interactive Strategy Challenge / Live Chess-Themed Game',
    description: 'Checkmate is a thrilling twist on traditional chess that combines strategy, teamwork, and real-world challenges.',
    teamSize: { min: 4, max: 4 },
    registrationFee: 0
  },
  {
    name: 'Electroquest',
    department: 'ECE',
    category: 'Technical',
    shortDescription: 'Treasure hunt',
    description: 'ElectroQuest consists of three fun and challenging rounds that test your thinking, logic, and practical abilities.',
    teamSize: { min: 4, max: 4 },
    registrationFee: 0
  },
  {
    name: 'Solo Singing',
    department: 'Common',
    category: 'Cultural',
    shortDescription: 'Singing',
    description: 'Get ready to shine at our college fest Solo Singing Competition – Dhwani.',
    teamSize: { min: 1, max: 1 },
    registrationFee: 0
  },
  {
    name: 'Group Singing',
    department: 'Common',
    category: 'Cultural',
    shortDescription: 'Singing',
    description: 'Gaana Groove is a celebration of harmony, rhythm, and teamwork.',
    teamSize: { min: 4, max: 7 },
    registrationFee: 0
  },
  {
    name: 'Corporate Carnival',
    department: 'ECE',
    category: 'Non-Technical',
    shortDescription: 'Pitch • Design • Strategize • Solve',
    description: 'Multi-round business innovation event designed to test strategic thinking, creativity, and presentation abilities.',
    teamSize: { min: 2, max: 2 },
    registrationFee: 0
  },
  {
    name: 'Mock CID',
    department: 'Civil',
    category: 'Non-Technical',
    shortDescription: 'Case solving',
    description: 'This event is of 3 rounds where 1st round is of quiz, 2nd is of treasure hunt and 3rd round is of case solving.',
    teamSize: { min: 2, max: 3 },
    registrationFee: 0
  },
  {
    name: 'Spin to Win',
    department: 'Civil',
    category: 'Non-Technical',
    shortDescription: 'Spin to win',
    description: 'Spin the wheel and win gifts',
    teamSize: { min: 1, max: 1 },
    registrationFee: 0
  },
  {
    name: 'Design Dynamix',
    department: 'Civil',
    category: 'Technical',
    shortDescription: 'Drafting 2d plans',
    description: 'It is an event where participants need to draft the floor plans and other working drawings with help of AutoCAD.',
    teamSize: { min: 1, max: 1 },
    registrationFee: 0
  },
  {
    name: 'Rapid Rush',
    department: 'Civil',
    category: 'Non-Technical',
    shortDescription: 'Rapid rush',
    description: 'Rapid Rush is a multi-round competition designed to test participants skills, strategy, and adaptability.',
    teamSize: { min: 2, max: 2 },
    registrationFee: 0
  },
  {
    name: 'Modulux',
    department: 'Civil',
    category: 'Technical',
    shortDescription: 'Model making competition',
    description: 'In this Model Making Competition, teams will build a bridge using only allowed materials.',
    teamSize: { min: 3, max: 4 },
    registrationFee: 0
  },
  {
    name: 'Poster Presentation',
    department: 'Civil',
    category: 'Technical',
    shortDescription: 'Presenting prepared posters',
    description: 'It is an event where team need to prepare poster on A1 paper of selected topic.',
    teamSize: { min: 2, max: 2 },
    registrationFee: 0
  },
  {
    name: 'Videography',
    department: 'Civil',
    category: 'Non-Technical',
    shortDescription: 'Videography',
    description: 'Videography is a single-round competition designed to test participants skills.',
    teamSize: { min: 2, max: 3 },
    registrationFee: 0
  }
];

const seedEvents = async () => {
  try {
    // Clear log file
    fs.writeFileSync('D:\\code3\\server\\seed_log.txt', '');
    
    log('🚀 Starting seed process...');
    await connectDB();
    
    log(`📦 Preparing to add ${eventsData.length} events...\n`);
    
    let addedCount = 0;
    let updatedCount = 0;
    
    for (let i = 0; i < eventsData.length; i++) {
      const eventData = eventsData[i];
      
      try {
        const event = {
          ...eventData,
          date: new Date('2025-03-15'),
          time: '10:00 AM',
          venue: 'JCER Campus',
          image: dummyImages[i % dummyImages.length],
          maxParticipants: 100,
          currentParticipants: 0,
          rules: ['Participants must bring valid ID', 'Registration required'],
          eligibility: ['Open to all college students'],
          prizes: {
            first: '₹1500',
            second: '₹1000'
          },
          coordinators: [],
          isActive: true,
          status: 'upcoming',
          onlineRegistrationOpen: true,
          isFeatured: false,
          slug: eventData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        };
        
        const existing = await Event.findOne({ name: event.name });
        
        if (existing) {
          await Event.findOneAndUpdate({ name: event.name }, event, { new: true });
          log(`🔄 Updated: ${event.name} (${event.department})`);
          updatedCount++;
        } else {
          await Event.create(event);
          log(`✅ Added: ${event.name} (${event.department})`);
          addedCount++;
        }
      } catch (error) {
        log(`❌ Error with ${eventData.name}: ${error.message}`);
      }
    }
    
    log(`\n${'='.repeat(60)}`);
    log(`✅ Seeding Complete!`);
    log(`${'='.repeat(60)}`);
    log(`📊 Summary:`);
    log(`   ✅ Added: ${addedCount} events`);
    log(`   🔄 Updated: ${updatedCount} events`);
    log(`   📝 Total: ${addedCount + updatedCount} events`);
    log(`${'='.repeat(60)}\n`);
    
    // Show breakdown by department
    const allEvents = await Event.find({ isActive: true });
    const byDepartment = allEvents.reduce((acc, event) => {
      acc[event.department] = (acc[event.department] || 0) + 1;
      return acc;
    }, {});
    
    log('📋 Events by Department:');
    Object.entries(byDepartment).sort().forEach(([dept, count]) => {
      log(`   ${dept}: ${count} events`);
    });
    
  } catch (error) {
    log('💥 Fatal error: ' + error.message);
    log(error.stack);
  } finally {
    await mongoose.disconnect();
    log('\n👋 MongoDB disconnected');
    log('✅ Check D:\\code3\\server\\seed_log.txt for full output');
  }
};

seedEvents();
