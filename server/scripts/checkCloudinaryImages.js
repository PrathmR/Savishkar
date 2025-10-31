import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import Settings from '../models/Settings.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkCloudinaryImages() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Check Cloudinary configuration
    console.log('📋 Cloudinary Configuration:');
    console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET'}`);
    console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'NOT SET'}`);
    console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'}`);
    console.log(`   Use Cloudinary: ${process.env.USE_CLOUDINARY}\n`);

    // Check events with images
    const events = await Event.find({});
    console.log(`📊 Total Events: ${events.length}\n`);

    let cloudinaryCount = 0;
    let localCount = 0;
    let noImageCount = 0;

    console.log('🖼️  Event Images:');
    console.log('─'.repeat(80));

    events.forEach((event, index) => {
      const imageUrl = event.image;
      let imageType = 'None';
      
      if (!imageUrl) {
        noImageCount++;
        imageType = '❌ No Image';
      } else if (imageUrl.includes('cloudinary.com')) {
        cloudinaryCount++;
        imageType = '☁️  Cloudinary';
      } else if (imageUrl.startsWith('http')) {
        imageType = '🌐 External URL';
      } else {
        localCount++;
        imageType = '💾 Local Storage';
      }

      console.log(`${index + 1}. ${event.name}`);
      console.log(`   Type: ${imageType}`);
      console.log(`   URL: ${imageUrl || 'N/A'}`);
      console.log('');
    });

    console.log('─'.repeat(80));
    console.log('\n📈 Summary:');
    console.log(`   ☁️  Cloudinary Images: ${cloudinaryCount}`);
    console.log(`   💾 Local Images: ${localCount}`);
    console.log(`   ❌ No Images: ${noImageCount}`);

    // Check rulebook
    console.log('\n📖 Rulebook Status:');
    const rulebookUrl = await Settings.get('rulebook_url');
    if (rulebookUrl) {
      console.log(`   ✅ Rulebook URL stored in database`);
      console.log(`   URL: ${rulebookUrl}`);
      if (rulebookUrl.includes('cloudinary.com')) {
        console.log(`   Type: ☁️  Cloudinary`);
      } else {
        console.log(`   Type: 🌐 External URL`);
      }
    } else {
      console.log(`   ⚠️  No rulebook URL in database`);
      console.log(`   Will serve from local storage if available`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the check
checkCloudinaryImages();
