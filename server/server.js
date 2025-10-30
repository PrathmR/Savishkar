import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import registrationRoutes from './routes/registrations.js';
import userRoutes from './routes/users.js';
import paymentRoutes from './routes/payments.js';
import adminRoutes from './routes/admin.js';
import testRoutes from './routes/test.js';
import rulebookRoutes from './routes/rulebook.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// Connect to database
connectDB();

// Check email configuration on startup
const checkEmailConfig = async () => {
  console.log('\n📧 Checking Email Configuration...');
  console.log('─'.repeat(50));
  
  try {
    // Check if environment variables exist
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('❌ Email: NOT CONFIGURED');
      console.log('📋 Missing environment variables:');
      if (!process.env.EMAIL_HOST) console.log('   ❌ EMAIL_HOST');
      if (!process.env.EMAIL_PORT) console.log('   ⚠️  EMAIL_PORT (will default to 587)');
      if (!process.env.EMAIL_USER) console.log('   ❌ EMAIL_USER');
      if (!process.env.EMAIL_PASS) console.log('   ❌ EMAIL_PASS');
      
      if (process.env.NODE_ENV === 'production') {
        console.log('\n⚠️  WARNING: Email features will not work in production!');
        console.log('💡 Add these variables in Render Dashboard → Environment tab');
      }
      console.log('─'.repeat(50));
      return;
    }

    // Log configuration details (without sensitive data)
    console.log('📋 Email Configuration Found:');
    console.log(`   Host: ${process.env.EMAIL_HOST}`);
    console.log(`   Port: ${process.env.EMAIL_PORT || '587 (default)'}`);
    console.log(`   User: ${process.env.EMAIL_USER}`);
    console.log(`   Pass: ${'*'.repeat(12)}${process.env.EMAIL_PASS.slice(-4)}`);

    // Import nodemailer to verify connection
    console.log('\n🔌 Testing SMTP Connection...');
    const nodemailer = (await import('nodemailer')).default;
    const port = parseInt(process.env.EMAIL_PORT) || 587;
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: port,
      secure: port === 465,
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

    // Verify connection with timeout (don't block server startup)
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Verification timeout')), 10000)
    );
    
    await Promise.race([verifyPromise, timeoutPromise]);
    
    console.log('✅ Email Server Connected Successfully!');
    console.log(`📧 SMTP Host: ${process.env.EMAIL_HOST}:${port}`);
    console.log(`👤 Sender: ${process.env.EMAIL_USER}`);
    console.log(`🔒 Authentication: Verified`);
    console.log(`⏱️  Timeouts: Connection(60s), Greeting(30s), Socket(60s)`);
    console.log('─'.repeat(50));
  } catch (error) {
    console.log('❌ Email Server Connection FAILED!');
    console.log(`📛 Error: ${error.message}`);
    
    // Provide specific troubleshooting tips
    if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
      console.log('\n💡 SOLUTION - Invalid Credentials:');
      console.log('   1. For Gmail: Use App Password, NOT regular password');
      console.log('   2. Enable 2FA: https://myaccount.google.com/security');
      console.log('   3. Generate App Password: https://myaccount.google.com/apppasswords');
      console.log('   4. Remove ALL spaces from the App Password');
      console.log('   5. Update EMAIL_PASS on Render and redeploy');
    } else if (error.message.includes('ECONNECTION') || error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 SOLUTION - Connection Timeout:');
      console.log('   1. Verify EMAIL_HOST is correct (e.g., smtp.gmail.com)');
      console.log('   2. Verify EMAIL_PORT is 587 (or 465 for SSL)');
      console.log('   3. Check if port 587 is blocked by firewall');
      console.log('   4. On Render Free tier: Service may be cold starting');
    } else if (error.message.includes('EAUTH')) {
      console.log('\n💡 SOLUTION - Authentication Error:');
      console.log('   1. Check EMAIL_USER is your full email address');
      console.log('   2. Check EMAIL_PASS is correct (no typos)');
      console.log('   3. For Gmail: Ensure App Password is used');
    } else {
      console.log('\n💡 TROUBLESHOOTING:');
      console.log('   1. Check all environment variables are set correctly');
      console.log('   2. Run: npm run diagnose-email (locally)');
      console.log('   3. Check Render logs for more details');
    }
    
    console.log('─'.repeat(50));
    
    if (process.env.NODE_ENV === 'production') {
      console.log('⚠️  Email features will be unavailable until this is fixed!');
    }
  }
};

checkEmailConfig();

// Check Cloudinary configuration
const useCloudinary = process.env.USE_CLOUDINARY === 'true' && 
                      process.env.CLOUDINARY_CLOUD_NAME && 
                      process.env.CLOUDINARY_API_KEY && 
                      process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
  console.log('☁️  Cloudinary: ENABLED');
  console.log(`📦 Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
  console.log('✅ File uploads will be stored in Cloudinary');
} else {
  console.log('💾 Cloudinary: DISABLED (using local storage)');
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️  WARNING: Local storage not recommended for production!');
    console.log('   Set USE_CLOUDINARY=true and add Cloudinary credentials');
  }
}

// Ensure upload directories exist (for local storage fallback)
const uploadDirs = ['uploads/avatars', 'uploads/events', 'uploads/payments'];
uploadDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`📁 Created directory: ${dir}`);
  }
});

// Security Middleware
// Set security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "http:", "blob:"],
      connectSrc: ["'self'", "http://localhost:5173", "http://localhost:5174", "http://localhost:5000"],
      frameSrc: ["'self'", "https://res.cloudinary.com"],
      objectSrc: ["'none'"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

// Body parser with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Response caching middleware for static data
const cacheMiddleware = (duration) => (req, res, next) => {
  if (req.method === 'GET') {
    res.set('Cache-Control', `public, max-age=${duration}`);
  }
  next();
};

// Serve static files with CORS headers and caching
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  // Cache images for 1 day
  res.set('Cache-Control', 'public, max-age=86400');
  next();
}, express.static('uploads', {
  maxAge: '1d',
  etag: true,
  lastModified: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', cacheMiddleware(300), eventRoutes); // Cache events for 5 minutes
app.use('/api/registrations', registrationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/test', testRoutes);
app.use('/api/rulebook', rulebookRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Savishkar API is running',
    timestamp: new Date().toISOString()
  });
});

// Keep-alive endpoint (lightweight, no database queries)
app.get('/api/keep-alive', (req, res) => {
  res.status(200).json({ 
    alive: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server (works for both Render and local development)
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Start keep-alive service (only in development or if explicitly enabled)
  if (process.env.NODE_ENV !== 'production' || process.env.ENABLE_KEEP_ALIVE === 'true') {
    try {
      const keepAliveService = (await import('./utils/keepAlive.js')).default;
      keepAliveService.start();
    } catch (error) {
      console.error('⚠️  Failed to start keep-alive service:', error.message);
    }
  }

  // Start registration auto-disable scheduler
  try {
    const registrationAutoDisable = (await import('./services/registrationAutoDisable.js')).default;
    await registrationAutoDisable.start();
  } catch (error) {
    console.error('⚠️  Failed to start registration auto-disable scheduler:', error.message);
  }
});

export default app;
