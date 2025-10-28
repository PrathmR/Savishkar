import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';

dotenv.config();

const checkEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const events = await Event.find({ isActive: true });
    console.log(`\nTotal events in database: ${events.length}`);
    
    const byDepartment = events.reduce((acc, event) => {
      acc[event.department] = (acc[event.department] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\nEvents by Department:');
    Object.entries(byDepartment).sort().forEach(([dept, count]) => {
      console.log(`  ${dept}: ${count} events`);
    });
    
    console.log('\nRecent events:');
    events.slice(0, 5).forEach(event => {
      console.log(`  - ${event.name} (${event.department})`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
};

checkEvents();
