import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('\n🔍 Email Configuration Diagnostic Tool\n');
console.log('='.repeat(60));

// Check environment variables
console.log('\n1️⃣  Checking Environment Variables...');
console.log('-'.repeat(60));

const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASS'];
const missingVars = [];

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: NOT SET`);
    missingVars.push(varName);
  } else {
    if (varName === 'EMAIL_PASS') {
      console.log(`✅ ${varName}: ${'*'.repeat(12)}${value.slice(-4)} (length: ${value.length})`);
      // Check for spaces
      if (value.includes(' ')) {
        console.log(`   ⚠️  WARNING: Password contains spaces!`);
      }
    } else {
      console.log(`✅ ${varName}: ${value}`);
    }
  }
});

if (missingVars.length > 0) {
  console.log('\n❌ Missing required variables:', missingVars.join(', '));
  console.log('Please add them to your .env file');
  process.exit(1);
}

// Test SMTP connection
console.log('\n2️⃣  Testing SMTP Connection...');
console.log('-'.repeat(60));

const port = parseInt(process.env.EMAIL_PORT) || 587;

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: port,
  secure: port === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS.trim()
  },
  tls: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1.2'
  },
  connectionTimeout: 30000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
  debug: true,
  logger: true
});

try {
  console.log('⏳ Connecting to SMTP server...');
  await transporter.verify();
  console.log('✅ SMTP Connection Successful!');
  console.log(`   Host: ${process.env.EMAIL_HOST}:${port}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   TLS: ${port === 465 ? 'SSL' : 'STARTTLS'}`);
} catch (error) {
  console.log('❌ SMTP Connection Failed!');
  console.log(`   Error: ${error.message}`);
  console.log('\n💡 Troubleshooting Tips:');
  
  if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
    console.log('   • For Gmail: Use App Password, NOT regular password');
    console.log('   • Enable 2FA: https://myaccount.google.com/security');
    console.log('   • Generate App Password: https://myaccount.google.com/apppasswords');
    console.log('   • Remove ALL spaces from the App Password');
  } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
    console.log('   • Check EMAIL_HOST is correct');
    console.log('   • Check EMAIL_PORT (587 for TLS, 465 for SSL)');
    console.log('   • Check firewall/network settings');
    console.log('   • Try using port 465 instead of 587');
  } else if (error.message.includes('EAUTH')) {
    console.log('   • Verify EMAIL_USER is your full email address');
    console.log('   • Verify EMAIL_PASS is correct (no typos)');
    console.log('   • For Gmail: Ensure App Password is used');
  }
  
  process.exit(1);
}

// Test sending email
console.log('\n3️⃣  Testing Email Sending...');
console.log('-'.repeat(60));

const testEmail = process.argv[2] || process.env.EMAIL_USER;

console.log(`⏳ Sending test email to: ${testEmail}`);

try {
  const info = await transporter.sendMail({
    from: {
      name: 'Savishkar Test',
      address: process.env.EMAIL_USER
    },
    to: testEmail,
    subject: 'Test Email - Savishkar Email Configuration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50;">✅ Email Configuration Successful!</h2>
        <p>This is a test email from your Savishkar application.</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        <p><strong>SMTP Host:</strong> ${process.env.EMAIL_HOST}</p>
        <p><strong>Port:</strong> ${port}</p>
        <p>If you received this email, your email configuration is working correctly!</p>
      </div>
    `,
    text: `Email Configuration Successful! This is a test email from Savishkar. Timestamp: ${new Date().toISOString()}`
  });
  
  console.log('✅ Test Email Sent Successfully!');
  console.log(`   Message ID: ${info.messageId}`);
  console.log(`   To: ${testEmail}`);
  console.log(`   Response: ${info.response}`);
} catch (error) {
  console.log('❌ Failed to Send Test Email!');
  console.log(`   Error: ${error.message}`);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('✅ All Email Tests Passed!');
console.log('Your email configuration is working correctly.');
console.log('='.repeat(60) + '\n');

process.exit(0);
