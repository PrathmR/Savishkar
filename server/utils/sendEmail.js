import nodemailer from 'nodemailer';

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

const sendEmail = async (options) => {
  const startTime = Date.now();
  
  try {
    // Check if email configuration exists
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('❌ Email configuration missing');
      console.log('📋 Required variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS');
      console.log('📋 Current status:');
      console.log(`   EMAIL_HOST: ${process.env.EMAIL_HOST ? '✅ Set' : '❌ Missing'}`);
      console.log(`   EMAIL_PORT: ${process.env.EMAIL_PORT ? '✅ Set' : '⚠️  Missing (will use 587)'}`);
      console.log(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Missing'}`);
      console.log(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing'}`);
      throw new Error('Email configuration is incomplete');
    }

    console.log('\n📧 Email Send Request');
    console.log('─'.repeat(50));
    console.log(`📬 To: ${options.email}`);
    console.log(`📝 Subject: ${options.subject}`);
    console.log(`🌐 Host: ${process.env.EMAIL_HOST}`);
    console.log(`👤 From: ${process.env.EMAIL_USER}`);
    console.log(`🕐 Time: ${new Date().toISOString()}`);

    // Create transporter with production-optimized settings
    const port = parseInt(process.env.EMAIL_PORT) || 587;
    const isSecure = port === 465;
    
    const transportConfig = {
      host: process.env.EMAIL_HOST,
      port: port,
      secure: isSecure,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      // Production-optimized timeouts for Render
      connectionTimeout: 60000,  // 60 seconds for cold starts
      greetingTimeout: 30000,    // 30 seconds
      socketTimeout: 60000,      // 60 seconds
      // TLS settings
      tls: {
        rejectUnauthorized: false,
        minVersion: 'TLSv1.2'
      },
      // Connection pooling for better performance
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      // Debug mode in development
      debug: process.env.NODE_ENV === 'development',
      logger: process.env.NODE_ENV === 'development'
    };

    console.log(`🔧 Transport Config: Port ${port}, Secure: ${isSecure}`);
    const transporter = nodemailer.createTransport(transportConfig);

    // Email options
    const mailOptions = {
      from: `Savishkar 2025 <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html,
      // Add text fallback
      text: options.text || options.html.replace(/<[^>]*>/g, '')
    };

    // Send email with retry logic and timeout
    console.log('📤 Sending email...');
    const info = await retryOperation(
      async () => {
        return await withTimeout(
          transporter.sendMail(mailOptions),
          45000 // 45 second timeout per attempt
        );
      },
      3, // 3 retry attempts
      2000 // 2 second initial delay
    );
    
    const duration = Date.now() - startTime;
    console.log('✅ Email sent successfully!');
    console.log(`📨 Message ID: ${info.messageId}`);
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log(`📬 Delivered to: ${options.email}`);
    console.log('─'.repeat(50));
    
    return info;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('\n❌ Email Sending Failed');
    console.error('─'.repeat(50));
    console.error(`📬 To: ${options.email}`);
    console.error(`⏱️  Duration: ${duration}ms`);
    console.error(`❌ Error: ${error.message}`);
    
    // Provide specific troubleshooting based on error type
    if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      console.error('\n💡 AUTHENTICATION ERROR:');
      console.error('   • For Gmail: Use App Password, not regular password');
      console.error('   • Enable 2FA: https://myaccount.google.com/security');
      console.error('   • Generate App Password: https://myaccount.google.com/apppasswords');
      console.error('   • Remove ALL spaces from App Password');
      console.error('   • For SendGrid: Use "apikey" as EMAIL_USER and API key as EMAIL_PASS');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT') || error.message.includes('ECONNECTION')) {
      console.error('\n💡 CONNECTION TIMEOUT:');
      console.error('   • Verify EMAIL_HOST is correct');
      console.error('   • Verify EMAIL_PORT (587 for TLS, 465 for SSL)');
      console.error('   • On Render: Service may be cold starting (normal on free tier)');
      console.error('   • Consider using SendGrid for better reliability');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('\n💡 HOST NOT FOUND:');
      console.error('   • Check EMAIL_HOST spelling');
      console.error('   • Gmail: smtp.gmail.com');
      console.error('   • SendGrid: smtp.sendgrid.net');
    }
    
    console.error('─'.repeat(50));
    
    // Re-throw with more context
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};

export default sendEmail;
