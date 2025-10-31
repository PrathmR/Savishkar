import nodemailer from 'nodemailer';

/**
 * Email Service with Fallback Support
 * Primary: EMAIL_USER / EMAIL_PASS
 * Fallback: FALLBACK_EMAIL_USER / FALLBACK_EMAIL_PASS
 */

// Helper function to add timeout to promises
const withTimeout = (promise, timeoutMs) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Email operation timed out after ${timeoutMs}ms`)), timeoutMs)
    )
  ]);
};

// Helper function to retry email sending
const retryOperation = async (operation, maxRetries = 3, delay = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`⚠️  Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * attempt;
      console.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Create SMTP transporter with fallback support
const createTransporter = (useFallback = false) => {
  let emailUser, emailPass, emailHost, emailPort;

  if (useFallback && process.env.FALLBACK_EMAIL_USER && process.env.FALLBACK_EMAIL_PASS) {
    // Use fallback credentials
    emailUser = process.env.FALLBACK_EMAIL_USER;
    emailPass = process.env.FALLBACK_EMAIL_PASS;
    emailHost = process.env.FALLBACK_EMAIL_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
    emailPort = parseInt(process.env.FALLBACK_EMAIL_PORT || process.env.EMAIL_PORT || '587');
    console.log('📧 Using FALLBACK email credentials');
  } else {
    // Use primary credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('EMAIL_USER and EMAIL_PASS are required in .env file');
    }
    emailUser = process.env.EMAIL_USER;
    emailPass = process.env.EMAIL_PASS;
    emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
    emailPort = parseInt(process.env.EMAIL_PORT || '587');
  }

  const port = emailPort;
  
  const config = {
    host: emailHost,
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 30000,  // 30 seconds (reduced for faster failure)
    greetingTimeout: 20000,    // 20 seconds
    socketTimeout: 30000,      // 30 seconds
    pool: false,               // Disable pooling for serverless/cloud environments
    debug: process.env.NODE_ENV === 'development', // Enable debug in dev
    logger: process.env.NODE_ENV === 'development' // Enable logging in dev
  };

  return nodemailer.createTransport(config);
};

// Main email sending function with automatic fallback
const sendEmail = async (options) => {
  const startTime = Date.now();
  let usedFallback = false;
  
  // Try with primary credentials first
  try {
    return await sendEmailWithCredentials(options, false, startTime);
  } catch (primaryError) {
    console.error('❌ Primary email failed:', primaryError.message);
    
    // Check if fallback credentials are available
    if (process.env.FALLBACK_EMAIL_USER && process.env.FALLBACK_EMAIL_PASS) {
      console.log('\n🔄 Attempting to send with FALLBACK email credentials...');
      
      try {
        const result = await sendEmailWithCredentials(options, true, startTime);
        console.log('✅ Email sent successfully using FALLBACK credentials!');
        return result;
      } catch (fallbackError) {
        console.error('❌ Fallback email also failed:', fallbackError.message);
        throw new Error(`Both primary and fallback email failed. Primary: ${primaryError.message}, Fallback: ${fallbackError.message}`);
      }
    } else {
      console.error('⚠️  No fallback email credentials configured');
      throw primaryError;
    }
  }
};

// Helper function to send email with specific credentials
const sendEmailWithCredentials = async (options, useFallback, startTime) => {
  const emailUser = useFallback ? process.env.FALLBACK_EMAIL_USER : process.env.EMAIL_USER;
  const emailHost = useFallback ? 
    (process.env.FALLBACK_EMAIL_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com') : 
    (process.env.EMAIL_HOST || 'smtp.gmail.com');
  const emailPort = useFallback ? 
    (process.env.FALLBACK_EMAIL_PORT || process.env.EMAIL_PORT || 587) : 
    (process.env.EMAIL_PORT || 587);

  try {
    console.log(`\n📧 Email Send Request ${useFallback ? '(FALLBACK)' : '(PRIMARY)'}`);
    console.log('─'.repeat(50));
    console.log(`🕐 Time: ${new Date().toISOString()}`);
    console.log(`📬 To: ${options.email}`);
    console.log(`📝 Subject: ${options.subject}`);
    console.log(`👤 From: ${emailUser}`);
    console.log(`🌐 SMTP Host: ${emailHost}`);
    console.log(`🔌 Port: ${emailPort}`);

    // Create transporter
    const transporter = createTransporter(useFallback);

    // Prepare mail options with proper headers to avoid spam
    const mailOptions = {
      from: {
        name: 'Savishkar 2025',
        address: emailUser
      },
      to: options.email,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'Savishkar Techfest',
        'Reply-To': emailUser
      },
      // Add List-Unsubscribe header (helps with deliverability)
      list: {
        unsubscribe: {
          url: process.env.CLIENT_URL || 'http://localhost:5173',
          comment: 'Unsubscribe'
        }
      }
    };

    // Send email with retry logic
    const info = await retryOperation(
      async () => {
        return await withTimeout(
          transporter.sendMail(mailOptions),
          30000
        );
      },
      2,
      3000
    );
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Email sent successfully!');
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`📬 Delivered to: ${options.email}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log('─'.repeat(50));
    
    return { 
      messageId: info.messageId, 
      service: useFallback ? 'smtp-fallback' : 'smtp-primary',
      duration: duration,
      usedFallback: useFallback
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    console.error('\n❌ Email Sending Failed');
    console.error('─'.repeat(50));
    console.error(`📬 To: ${options.email}`);
    console.error(`⏱️  Duration: ${duration}ms`);
    console.error(`❌ Error: ${error.message}`);
    
    // Provide specific troubleshooting
    if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      console.error('\n💡 AUTHENTICATION ERROR:');
      console.error('   • For Gmail: Use App Password, NOT regular password');
      console.error('   • Steps:');
      console.error('     1. Enable 2FA: https://myaccount.google.com/security');
      console.error('     2. Generate App Password: https://myaccount.google.com/apppasswords');
      console.error('     3. Use the 16-character App Password in EMAIL_PASS');
      console.error('     4. Remove all spaces from the App Password');
    } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.error('\n💡 CONNECTION ERROR:');
      console.error('   • Check EMAIL_HOST (default: smtp.gmail.com)');
      console.error('   • Check EMAIL_PORT (587 for TLS, 465 for SSL)');
      console.error('   • Check firewall/network settings');
      console.error('   • Verify internet connection');
    } else if (error.message.includes('EAUTH')) {
      console.error('\n💡 AUTHENTICATION ERROR:');
      console.error('   • Verify EMAIL_USER is correct (full email address)');
      console.error('   • Verify EMAIL_PASS is correct (App Password for Gmail)');
      console.error('   • Check for typos or extra spaces');
    } else if (error.message.includes('required in .env')) {
      console.error('\n💡 CONFIGURATION ERROR:');
      console.error('   • Add EMAIL_USER=your-email@gmail.com to .env');
      console.error('   • Add EMAIL_PASS=your-app-password to .env');
      console.error('   • Optional: EMAIL_HOST=smtp.gmail.com');
      console.error('   • Optional: EMAIL_PORT=587');
    }
    
    console.error('─'.repeat(50));
    
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

export default sendEmail;
