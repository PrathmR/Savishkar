import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupCloudinary() {
  console.log('\n🌥️  Cloudinary Setup Wizard\n');
  console.log('This script will help you configure Cloudinary for cloud image storage.\n');
  console.log('📝 You need to have a Cloudinary account. Get one free at: https://cloudinary.com/users/register/free\n');

  try {
    // Get credentials from user
    const cloudName = await question('Enter your Cloudinary Cloud Name: ');
    const apiKey = await question('Enter your Cloudinary API Key: ');
    const apiSecret = await question('Enter your Cloudinary API Secret: ');
    
    if (!cloudName || !apiKey || !apiSecret) {
      console.log('\n❌ All fields are required. Setup cancelled.');
      rl.close();
      return;
    }

    // Ask if they want to enable it
    const enable = await question('\nEnable Cloudinary now? (yes/no) [yes]: ');
    const useCloudinary = !enable || enable.toLowerCase() === 'yes' || enable.toLowerCase() === 'y';

    // Read existing .env file
    const envPath = path.join(__dirname, '..', '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Remove existing Cloudinary config if present
    envContent = envContent.replace(/\n*# Cloudinary Configuration[\s\S]*?(?=\n#|\n[A-Z]|$)/g, '');
    
    // Add new Cloudinary configuration
    const cloudinaryConfig = `
# Cloudinary Configuration (Cloud Image Storage)
USE_CLOUDINARY=${useCloudinary}
CLOUDINARY_CLOUD_NAME=${cloudName}
CLOUDINARY_API_KEY=${apiKey}
CLOUDINARY_API_SECRET=${apiSecret}
`;

    // Append to .env file
    envContent = envContent.trim() + '\n' + cloudinaryConfig;
    
    // Write back to .env
    fs.writeFileSync(envPath, envContent);

    console.log('\n✅ Cloudinary configuration saved to .env file!');
    console.log('\n📋 Configuration:');
    console.log(`   Cloud Name: ${cloudName}`);
    console.log(`   API Key: ${apiKey}`);
    console.log(`   API Secret: ${'*'.repeat(apiSecret.length)}`);
    console.log(`   Enabled: ${useCloudinary ? 'Yes' : 'No'}`);
    
    if (useCloudinary) {
      console.log('\n🚀 Cloudinary is now ENABLED!');
      console.log('   All new uploads will be stored in the cloud.');
    } else {
      console.log('\n💾 Cloudinary is configured but DISABLED.');
      console.log('   To enable it later, set USE_CLOUDINARY=true in your .env file.');
    }

    console.log('\n⚠️  IMPORTANT: Restart your server for changes to take effect!');
    console.log('\n📚 For more information, see CLOUDINARY_SETUP.md\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the setup
setupCloudinary();
