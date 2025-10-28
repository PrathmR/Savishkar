import nodemailer from 'nodemailer';

/**
 * Simple SMTP Email Service
 * Uses Gmail SMTP with App Password (no OAuth required)
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

// Create SMTP transporter
const createTransporter = () => {
  // Check for required environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS are required in .env file');
  }

  const port = parseInt(process.env.EMAIL_PORT) || 587;
  
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    },
    connectionTimeout: 60000,  // 60 seconds
    greetingTimeout: 30000,    // 30 seconds
    socketTimeout: 60000,      // 60 seconds
    pool: true,                // Use pooled connections
    maxConnections: 5,         // Max simultaneous connections
    maxMessages: 100,          // Max messages per connection
    rateDelta: 1000,           // Time window for rate limiting
    rateLimit: 5               // Max messages per rateDelta
  };

  return nodemailer.createTransport(config);
};

// Main email sending function
const sendEmail = async (options) => {
  const startTime = Date.now();
  
  try {
    console.log('\n📧 Email Send Request');
    console.log('─'.repeat(50));
    console.log(`🕐 Time: ${new Date().toISOString()}`);
    console.log(`📬 To: ${options.email}`);
    console.log(`📝 Subject: ${options.subject}`);
    console.log(`👤 From: ${process.env.EMAIL_USER}`);
    console.log(`🌐 SMTP Host: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
    console.log(`🔌 Port: ${process.env.EMAIL_PORT || 587}`);

    // Create transporter
    const transporter = createTransporter();

    // Prepare mail options with proper headers to avoid spam
    const mailOptions = {
      from: {
        name: 'Savishkar 2025',
        address: process.env.EMAIL_USER
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
        'Reply-To': process.env.EMAIL_USER
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
          45000 // 45 second timeout
        );
      },
      3, // 3 retries
      2000 // 2 second delay between retries
    );
    
    const duration = Date.now() - startTime;
    
    console.log('✅ Email sent successfully!');
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`📬 Delivered to: ${options.email}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log('─'.repeat(50));
    
    return { 
      messageId: info.messageId, 
      service: 'smtp',
      duration: duration
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
