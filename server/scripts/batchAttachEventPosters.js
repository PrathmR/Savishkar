import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import Event from '../models/Event.js';
import connectDB from '../config/database.js';
import { convertAndUploadImage } from './convertAndUploadToCloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const USE_CLOUDINARY = (process.env.USE_CLOUDINARY === 'true');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

const isImage = (file) => /\.(png|jpg|jpeg|gif|webp)$/i.test(file);

const normalizeName = (raw) => {
  let name = raw
    .replace(/\.[^/.]+$/, '')
    .replace(/\s*\([^)]*\)\s*/g, ' ')
    .replace(/\s*-\s*[^-]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  // handle special cases like extra spaces or hyphens inside names
  return name;
};

const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const main = async () => {
  const args = process.argv.slice(2);
  const dirFlagIndex = args.indexOf('--dir');
  const dryRun = args.includes('--dry-run');
  const folder = dirFlagIndex !== -1 ? args[dirFlagIndex + 1] : null;

  if (!folder) {
    console.log('\nUsage: node server/scripts/batchAttachEventPosters.js --dir "<absolute_path_to_posters_folder>" [--dry-run]\n');
    process.exit(1);
  }

  if (!fs.existsSync(folder) || !fs.statSync(folder).isDirectory()) {
    console.error(`❌ Folder not found or not a directory: ${folder}`);
    process.exit(1);
  }

  await connectDB();

  const files = fs.readdirSync(folder).filter(isImage);
  console.log(`\n📁 Found ${files.length} image files in: ${folder}`);

  let updated = 0;
  const unmatched = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fullPath = path.join(folder, file);
    const baseName = normalizeName(file);
    const slug = toSlug(baseName);

    // Try matching by name or slug
    let event = await Event.findOne({ $or: [ { name: new RegExp(`^${baseName}$`, 'i') }, { slug } ] });

    if (!event) {
      // Fallback: loose match by removing spaces and case
      const loose = baseName.replace(/\s+/g, '').toLowerCase();
      event = await Event.findOne({});
      if (event) {
        // try broader search
        event = await Event.findOne({ name: new RegExp(baseName.split(' ')[0], 'i') });
      }
    }

    if (!event) {
      console.log(`\n⚠️  No matching event for file: ${file} -> candidate: "${baseName}"`);
      unmatched.push(file);
      continue;
    }

    let imageUrl = '';

    try {
      if (USE_CLOUDINARY) {
        const res = await convertAndUploadImage(fullPath, {
          folder: 'savishkar/events',
          imageType: 'event'
        });
        if (!res.success) throw new Error(res.error || 'Upload failed');
        imageUrl = res.url;
      } else {
        // Copy to server/uploads/events with unique name
        const uploadsDir = path.join(__dirname, '..', 'uploads', 'events');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
        const unique = `event-${Date.now()}-${Math.round(Math.random()*1e9)}${path.extname(file)}`;
        const dest = path.join(uploadsDir, unique);
        fs.copyFileSync(fullPath, dest);
        imageUrl = `${SERVER_URL}/uploads/events/${unique}`;
      }
    } catch (e) {
      console.error(`❌ Failed processing ${file}: ${e.message}`);
      continue;
    }

    console.log(`\n🎯 Matched: "${event.name}" <- ${file}`);
    console.log(`🖼️  Image URL: ${imageUrl}`);

    if (dryRun) {
      console.log('🟡 Dry-run: skipping database update');
      continue;
    }

    event.image = imageUrl;
    await event.save();
    updated++;

    // Small delay to avoid rate limits
    await sleep(250);
  }

  console.log('\n===== SUMMARY =====');
  console.log(`✅ Updated events: ${updated}`);
  console.log(`⚠️ Unmatched files: ${unmatched.length}`);
  if (unmatched.length) {
    unmatched.forEach(f => console.log(` - ${f}`));
  }

  await mongoose.connection.close();
  console.log('\n🔌 MongoDB connection closed.');
};

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
