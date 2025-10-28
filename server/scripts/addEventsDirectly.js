import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

dotenv.config();

// Dummy images
const images = [
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

const events = [
  { name: 'Savishkar Business Challenge', department: 'MBA', category: 'Non-Technical', shortDescription: 'Case solving and business pitch competition', teamSize: { min: 2, max: 2 } },
  { name: 'Robo Race', department: 'Mechanical', category: 'Technical', shortDescription: 'Robot racing competition through obstacle course', teamSize: { min: 2, max: 4 } },
  { name: 'Photography Contest', department: 'Mechanical', category: 'Technical', shortDescription: 'Capture the perfect shot with given themes', teamSize: { min: 1, max: 1 } },
  { name: 'Robo Soccer', department: 'Mechanical', category: 'Technical', shortDescription: 'Robotic football tournament', teamSize: { min: 1, max: 4 } },
  { name: 'Robo Sumo War', department: 'Mechanical', category: 'Technical', shortDescription: 'Robot combat competition', teamSize: { min: 1, max: 4 } },
  { name: 'Technical Paper Presentation', department: 'Mechanical', category: 'Technical', shortDescription: 'Present your research and technical papers', teamSize: { min: 2, max: 2 } },
  { name: 'BIGG BOSS', department: 'CSE', category: 'Non-Technical', shortDescription: 'Reality show inspired duo competition', teamSize: { min: 2, max: 2 } },
  { name: '3D Modeling Competition', department: 'Mechanical', category: 'Technical', shortDescription: 'Design 3D models using CAD software', teamSize: { min: 1, max: 1 } },
  { name: 'Squid Game Challenge', department: 'Mechanical', category: 'Non-Technical', shortDescription: 'Multi-round elimination game challenges', teamSize: { min: 2, max: 2 } },
  { name: 'HACKSPHERE', department: 'CSE', category: 'Technical', shortDescription: 'Competitive programming and hackathon', teamSize: { min: 3, max: 4 } },
  { name: 'Treasure Hunt', department: 'CSE', category: 'Non-Technical', shortDescription: 'Campus-wide treasure hunting adventure', teamSize: { min: 4, max: 4 } },
  { name: 'BID Premiere League', department: 'CSE', category: 'Non-Technical', shortDescription: 'IPL auction and cricket quiz competition', teamSize: { min: 4, max: 4 } },
  { name: 'Technical Paper Presentation CSE', department: 'CSE', category: 'Technical', shortDescription: 'Showcase innovative research ideas', teamSize: { min: 2, max: 2 } },
  { name: 'Valorant Tournament', department: 'CSE', category: 'Non-Technical', shortDescription: '5v5 tactical shooter gaming competition', teamSize: { min: 5, max: 5 } },
  { name: 'BGMI Tournament', department: 'CSE', category: 'Non-Technical', shortDescription: 'Battle royale mobile gaming event', teamSize: { min: 4, max: 4 } },
  { name: 'NrityaNova', department: 'Common', category: 'Cultural', shortDescription: 'Solo classical dance performance', teamSize: { min: 1, max: 1 } },
  { name: 'Seconds ka Tashan', department: 'AIML', category: 'Non-Technical', shortDescription: 'Fast-paced fun task completion', teamSize: { min: 2, max: 2 } },
  { name: 'TaalRythm', department: 'Common', category: 'Cultural', shortDescription: 'Solo western dance showcase', teamSize: { min: 1, max: 1 } },
  { name: 'IMPERSONA', department: 'ECE', category: 'Non-Technical', shortDescription: 'Personality and talent competition', teamSize: { min: 1, max: 1 } },
  { name: 'CodeBreaker Escape Room', department: 'AIML', category: 'Technical', shortDescription: 'Tech-themed escape room challenge', teamSize: { min: 3, max: 4 } },
  { name: 'Tandav Troupe', department: 'Common', category: 'Cultural', shortDescription: 'Group dance performance', teamSize: { min: 4, max: 7 } },
  { name: 'Checkmate Strategy', department: 'ECE', category: 'Non-Technical', shortDescription: 'Live chess with physical challenges', teamSize: { min: 4, max: 4 } },
  { name: 'ElectroQuest', department: 'ECE', category: 'Technical', shortDescription: 'Electronics treasure hunt and circuit building', teamSize: { min: 4, max: 4 } },
  { name: 'Dhwani Solo Singing', department: 'Common', category: 'Cultural', shortDescription: 'Showcase your vocal talent', teamSize: { min: 1, max: 1 } },
  { name: 'Gaana Groove Group Singing', department: 'Common', category: 'Cultural', shortDescription: 'Harmonious group singing', teamSize: { min: 4, max: 7 } },
  { name: 'Corporate Carnival', department: 'ECE', category: 'Non-Technical', shortDescription: 'Business innovation and strategy', teamSize: { min: 2, max: 2 } },
  { name: 'Mock CID Investigation', department: 'Civil', category: 'Non-Technical', shortDescription: 'Crime case solving competition', teamSize: { min: 2, max: 3 } },
  { name: 'Spin to Win', department: 'Civil', category: 'Non-Technical', shortDescription: 'Spin the wheel for challenges', teamSize: { min: 1, max: 1 } },
  { name: 'Design Dynamix AutoCAD', department: 'Civil', category: 'Technical', shortDescription: '2D drafting and floor plan design', teamSize: { min: 1, max: 1 } },
  { name: 'Rapid Rush', department: 'Civil', category: 'Non-Technical', shortDescription: 'Multi-round elimination challenges', teamSize: { min: 2, max: 2 } },
  { name: 'Modulux Bridge Building', department: 'Civil', category: 'Technical', shortDescription: 'Construct and test bridge models', teamSize: { min: 3, max: 4 } },
  { name: 'Poster Presentation Civil', department: 'Civil', category: 'Technical', shortDescription: 'Present technical posters', teamSize: { min: 2, max: 2 } },
  { name: 'Videography Competition', department: 'Civil', category: 'Non-Technical', shortDescription: 'Create compelling videos', teamSize: { min: 2, max: 3 } },
];

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected!\n');

    let added = 0;
    let updated = 0;

    for (let i = 0; i < events.length; i++) {
      const eventData = events[i];
      
      const event = {
        ...eventData,
        description: `${eventData.shortDescription}. Join us at Savishkar 2025 for this exciting event!`,
        slug: eventData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        image: images[i % images.length],
        date: new Date('2025-03-15'),
        time: '10:00 AM',
        venue: 'JCER Campus',
        registrationFee: 0,
        maxParticipants: 100,
        currentParticipants: 0,
        rules: ['Valid ID card required', 'Follow event coordinators instructions'],
        eligibility: ['Open to all college students'],
        prizes: { first: '₹1500', second: '₹1000' },
        coordinators: [],
        isActive: true,
        status: 'upcoming',
        onlineRegistrationOpen: true,
        isFeatured: false
      };

      const existing = await Event.findOne({ name: event.name });
      if (existing) {
        await Event.findByIdAndUpdate(existing._id, event);
        console.log(`🔄 Updated: ${event.name}`);
        updated++;
      } else {
        await Event.create(event);
        console.log(`✅ Added: ${event.name}`);
        added++;
      }
    }

    console.log(`\n✅ Complete! Added ${added}, Updated ${updated}`);
    
    const total = await Event.countDocuments({ isActive: true });
    console.log(`📊 Total active events: ${total}\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected');
  }
}

seed();
