import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

console.log('\n🔍 Verifying Cloudinary Configuration...\n');

// Check environment variables
const checks = {
  'USE_CLOUDINARY': process.env.USE_CLOUDINARY,
  'CLOUDINARY_CLOUD_NAME': process.env.CLOUDINARY_CLOUD_NAME,
  'CLOUDINARY_API_KEY': process.env.CLOUDINARY_API_KEY,
  'CLOUDINARY_API_SECRET': process.env.CLOUDINARY_API_SECRET ? '***' + process.env.CLOUDINARY_API_SECRET.slice(-4) : undefined
};

console.log('📋 Environment Variables:');
console.log('─'.repeat(50));
for (const [key, value] of Object.entries(checks)) {
  const status = value ? '✅' : '❌';
  const displayValue = value || 'NOT SET';
  console.log(`${status} ${key}: ${displayValue}`);
}
console.log('─'.repeat(50));

// Check if Cloudinary is enabled
if (process.env.USE_CLOUDINARY !== 'true') {
  console.log('\n⚠️  USE_CLOUDINARY is not set to "true"');
  console.log('   Current value:', process.env.USE_CLOUDINARY);
  console.log('   Uploads will use local storage instead of Cloudinary\n');
  process.exit(0);
}

// Check if all credentials are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.log('\n❌ Missing Cloudinary credentials!');
  console.log('\nPlease set the following in your .env file:');
  console.log('   CLOUDINARY_CLOUD_NAME=your_cloud_name');
  console.log('   CLOUDINARY_API_KEY=your_api_key');
  console.log('   CLOUDINARY_API_SECRET=your_api_secret');
  console.log('\nGet your credentials from: https://cloudinary.com/console\n');
  process.exit(1);
}

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Test connection
console.log('\n🔌 Testing Cloudinary Connection...\n');

try {
  const result = await cloudinary.api.ping();
  
  if (result.status === 'ok') {
    console.log('✅ Successfully connected to Cloudinary!\n');
    
    // Get account details
    try {
      const usage = await cloudinary.api.usage();
      console.log('📊 Account Information:');
      console.log('─'.repeat(50));
      console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
      console.log(`   Plan: ${usage.plan || 'Free'}`);
      console.log(`   Storage Used: ${(usage.storage.usage / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Bandwidth Used: ${(usage.bandwidth.usage / 1024 / 1024).toFixed(2)} MB (this month)`);
      console.log(`   Transformations: ${usage.transformations?.usage || 0} (this month)`);
      console.log('─'.repeat(50));
      
      console.log('\n📁 Expected Upload Folders:');
      console.log('   • savishkar/avatars/');
      console.log('   • savishkar/events/');
      console.log('   • savishkar/payments/');
      
      console.log('\n🎉 Cloudinary is configured correctly!');
      console.log('   Your uploads will now be stored in the cloud.\n');
      console.log('📍 View your uploads at:');
      console.log(`   https://cloudinary.com/console/media_library\n`);
      
    } catch (usageError) {
      console.log('✅ Connection successful!');
      console.log('⚠️  Could not fetch usage details (this is normal for some accounts)\n');
    }
    
  } else {
    console.log('❌ Connection test returned unexpected status:', result.status);
    process.exit(1);
  }
  
} catch (error) {
  console.log('❌ Failed to connect to Cloudinary!\n');
  console.log('Error:', error.message);
  
  if (error.message.includes('Invalid cloud_name')) {
    console.log('\n💡 Tip: Check your CLOUDINARY_CLOUD_NAME');
  } else if (error.message.includes('Invalid API key')) {
    console.log('\n💡 Tip: Check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET');
  } else if (error.message.includes('401')) {
    console.log('\n💡 Tip: Your credentials are incorrect. Please verify them at:');
    console.log('   https://cloudinary.com/console\n');
  }
  
  process.exit(1);
}
