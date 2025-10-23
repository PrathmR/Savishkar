import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('\n🔍 EMAIL CONFIGURATION DIAGNOSTIC TEST\n');
console.log('=' .repeat(60));

// Check if environment variables are loaded
console.log('\n📋 Environment Variables Check:');
console.log('─'.repeat(60));
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ NOT SET');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ NOT SET');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET (hidden)' : '❌ NOT SET');

// Check if all required variables are present
const hasAllVars = process.env.EMAIL_HOST && 
                   process.env.EMAIL_PORT && 
                   process.env.EMAIL_USER && 
                   process.env.EMAIL_PASS;

if (!hasAllVars) {
  console.log('\n❌ MISSING ENVIRONMENT VARIABLES!');
  console.log('\nRequired variables:');
  console.log('  - EMAIL_HOST (e.g., smtp.gmail.com)');
  console.log('  - EMAIL_PORT (e.g., 587)');
  console.log('  - EMAIL_USER (e.g., your-email@gmail.com)');
  console.log('  - EMAIL_PASS (e.g., your-app-password)');
  console.log('\n💡 On Render: Add these in Environment tab of your service');
  console.log('=' .repeat(60));
  process.exit(1);
}

console.log('\n✅ All environment variables are set!');

// Test email connection
async function testEmailConnection() {
  console.log('\n🔌 Testing Email Server Connection...');
  console.log('─'.repeat(60));
  
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    console.log('⏳ Verifying connection to SMTP server...');
    await transporter.verify();
    console.log('✅ Email server connection successful!');
    
    // Try sending a test email
    console.log('\n📧 Sending test email...');
    const info = await transporter.sendMail({
      from: `Savishkar Test <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email from Savishkar - Render Deployment',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5;">
          <h2 style="color: #1e40af;">✅ Email Configuration Working!</h2>
          <p>This is a test email from your Savishkar application.</p>
          <p><strong>Server:</strong> ${process.env.EMAIL_HOST}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: #666; font-size: 12px;">If you received this, your email configuration is correct!</p>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📧 Check your inbox:', process.env.EMAIL_USER);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 EMAIL CONFIGURATION IS WORKING CORRECTLY!');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.log('\n❌ EMAIL CONNECTION FAILED!');
    console.log('─'.repeat(60));
    console.log('Error:', error.message);
    
    // Provide specific troubleshooting based on error
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 SOLUTION:');
      console.log('  - For Gmail: Use App Password, not regular password');
      console.log('  - Enable 2FA first: https://myaccount.google.com/security');
      console.log('  - Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('  - Use the 16-character password (remove spaces)');
    } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout')) {
      console.log('\n💡 SOLUTION:');
      console.log('  - Check EMAIL_HOST is correct (e.g., smtp.gmail.com)');
      console.log('  - Check EMAIL_PORT is 587');
      console.log('  - Verify your internet connection');
      console.log('  - Check if port 587 is blocked by firewall');
    } else if (error.message.includes('EAUTH')) {
      console.log('\n💡 SOLUTION:');
      console.log('  - Email or password is incorrect');
      console.log('  - For Gmail: Make sure you\'re using App Password');
      console.log('  - Check for typos in EMAIL_USER and EMAIL_PASS');
    }
    
    console.log('\n📋 Current Configuration:');
    console.log('  HOST:', process.env.EMAIL_HOST);
    console.log('  PORT:', process.env.EMAIL_PORT);
    console.log('  USER:', process.env.EMAIL_USER);
    console.log('  PASS:', '***' + (process.env.EMAIL_PASS?.slice(-4) || ''));
    
    console.log('\n' + '='.repeat(60));
    process.exit(1);
  }
}

// Run the test
testEmailConnection().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
