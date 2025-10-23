import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('\n' + '='.repeat(70));
console.log('🔍 EMAIL CONFIGURATION DIAGNOSTIC TOOL');
console.log('='.repeat(70));

// Step 1: Check Environment Variables
console.log('\n📋 STEP 1: Checking Environment Variables');
console.log('-'.repeat(70));

const checks = {
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : null
};

let allSet = true;
for (const [key, value] of Object.entries(checks)) {
  if (!process.env[key]) {
    console.log(`❌ ${key}: NOT SET`);
    allSet = false;
  } else {
    console.log(`✅ ${key}: ${value}`);
  }
}

if (!allSet) {
  console.log('\n❌ MISSING VARIABLES!');
  console.log('\n📝 On Render:');
  console.log('   1. Go to Dashboard → Your Service → Environment');
  console.log('   2. Add these variables:');
  console.log('      EMAIL_HOST=smtp.gmail.com');
  console.log('      EMAIL_PORT=587');
  console.log('      EMAIL_USER=your-email@gmail.com');
  console.log('      EMAIL_PASS=your-app-password');
  console.log('   3. Click "Save Changes"');
  console.log('   4. Manual Deploy → Deploy latest commit');
  console.log('\n' + '='.repeat(70));
  process.exit(1);
}

// Step 2: Validate Configuration
console.log('\n📋 STEP 2: Validating Configuration');
console.log('-'.repeat(70));

let hasErrors = false;

// Check EMAIL_HOST
if (process.env.EMAIL_HOST !== 'smtp.gmail.com') {
  console.log(`⚠️  EMAIL_HOST: "${process.env.EMAIL_HOST}"`);
  console.log('   Expected: "smtp.gmail.com"');
  hasErrors = true;
} else {
  console.log('✅ EMAIL_HOST: Correct');
}

// Check EMAIL_PORT
if (process.env.EMAIL_PORT !== '587') {
  console.log(`⚠️  EMAIL_PORT: "${process.env.EMAIL_PORT}"`);
  console.log('   Expected: "587"');
  hasErrors = true;
} else {
  console.log('✅ EMAIL_PORT: Correct');
}

// Check EMAIL_USER format
if (!process.env.EMAIL_USER.includes('@gmail.com')) {
  console.log(`⚠️  EMAIL_USER: "${process.env.EMAIL_USER}"`);
  console.log('   Should include @gmail.com');
  hasErrors = true;
} else {
  console.log('✅ EMAIL_USER: Valid format');
}

// Check EMAIL_PASS length and spaces
const passLength = process.env.EMAIL_PASS.length;
const hasSpaces = process.env.EMAIL_PASS.includes(' ');

if (passLength !== 16) {
  console.log(`⚠️  EMAIL_PASS: Length is ${passLength} characters`);
  console.log('   Gmail App Password should be exactly 16 characters');
  hasErrors = true;
} else {
  console.log('✅ EMAIL_PASS: Correct length (16 characters)');
}

if (hasSpaces) {
  console.log('❌ EMAIL_PASS: Contains spaces!');
  console.log('   Remove all spaces from your App Password');
  hasErrors = true;
} else {
  console.log('✅ EMAIL_PASS: No spaces detected');
}

if (hasErrors) {
  console.log('\n⚠️  CONFIGURATION ISSUES DETECTED!');
  console.log('   Fix the issues above and try again.');
  console.log('\n' + '='.repeat(70));
  process.exit(1);
}

// Step 3: Test SMTP Connection
console.log('\n📋 STEP 3: Testing SMTP Connection');
console.log('-'.repeat(70));

const testConnection = async () => {
  try {
    console.log('🔌 Connecting to Gmail SMTP server...');
    
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
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 45000
    });

    await transporter.verify();
    console.log('✅ Connection successful!');
    console.log('✅ Gmail SMTP authentication verified');
    
    return transporter;
  } catch (error) {
    console.log('❌ Connection failed!');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('Invalid login')) {
      console.log('\n💡 SOLUTION:');
      console.log('   Your App Password is incorrect or 2FA is not enabled.');
      console.log('   1. Enable 2FA: https://myaccount.google.com/security');
      console.log('   2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('   3. Copy the 16-character password');
      console.log('   4. REMOVE ALL SPACES from the password');
      console.log('   5. Update EMAIL_PASS with the password (no spaces)');
    } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout')) {
      console.log('\n💡 SOLUTION:');
      console.log('   Connection timeout. This can happen if:');
      console.log('   - EMAIL_HOST is wrong (should be smtp.gmail.com)');
      console.log('   - EMAIL_PORT is wrong (should be 587)');
      console.log('   - Your firewall is blocking port 587');
      console.log('   - On Render Free tier: Service is cold starting');
    }
    
    console.log('\n' + '='.repeat(70));
    process.exit(1);
  }
};

const transporter = await testConnection();

// Step 4: Send Test Email
console.log('\n📋 STEP 4: Sending Test Email');
console.log('-'.repeat(70));

const sendTestEmail = async () => {
  try {
    console.log('📧 Preparing test email...');
    console.log(`📬 Recipient: ${process.env.EMAIL_USER}`);
    
    const info = await transporter.sendMail({
      from: `Savishkar Test <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: '✅ Email Test Successful - Render Deployment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 10px;">
          <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #10b981; margin-top: 0;">✅ Email Configuration Working!</h2>
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Congratulations! Your email configuration is working correctly.
            </p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0; color: #6b7280;"><strong>Server:</strong> ${process.env.EMAIL_HOST}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Port:</strong> ${process.env.EMAIL_PORT}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>From:</strong> ${process.env.EMAIL_USER}</p>
              <p style="margin: 5px 0; color: #6b7280;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              Your Savishkar application can now send emails successfully!
            </p>
          </div>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📧 Check your inbox: ${process.env.EMAIL_USER}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(70));
    console.log('\n✅ Your email configuration is working correctly.');
    console.log('✅ Emails will be sent from your application.');
    console.log('✅ Check your inbox for the test email.');
    console.log('\n💡 Next steps:');
    console.log('   1. Check your email inbox (and spam folder)');
    console.log('   2. If on Render, verify logs show "Email: CONFIGURED"');
    console.log('   3. Test user registration on your live site');
    console.log('\n' + '='.repeat(70));
    
  } catch (error) {
    console.log('❌ Failed to send test email!');
    console.log(`   Error: ${error.message}`);
    
    if (error.message.includes('timeout')) {
      console.log('\n💡 TIMEOUT ISSUE:');
      console.log('   Email sending timed out. On Render Free tier, this can happen');
      console.log('   during cold starts. Consider:');
      console.log('   1. Increasing timeout values (I can help with this)');
      console.log('   2. Using uptime monitoring to keep service active');
      console.log('   3. Upgrading to Render paid tier ($7/month)');
    }
    
    console.log('\n' + '='.repeat(70));
    process.exit(1);
  }
};

await sendTestEmail();
