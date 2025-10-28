import express from 'express';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import generateUserCode from '../utils/generateUserCode.js';
import { protect } from '../middleware/auth.js';
import { otpEmailTemplate, welcomeEmailTemplate, passwordResetTemplate, userCodeTemplate, newOtpTemplate } from '../utils/emailTemplates.js';

const router = express.Router();

// Rate limiters for auth routes
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 signups per hour
  message: 'Too many accounts created from this IP, please try again after an hour',
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts
  message: 'Too many login attempts, please try again after 15 minutes',
  skipSuccessfulRequests: true,
});

const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 OTP requests per hour
  message: 'Too many OTP requests, please try again after an hour',
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset requests per hour
  message: 'Too many password reset requests, please try again after an hour',
});

// @route   POST /api/auth/signup
// @desc    Register user & send OTP
// @access  Public
router.post('/signup', signupLimiter, [
  body('name')
    .notEmpty().withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2-50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
    .custom((value) => {
      // Block temporary email domains
      const tempDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com'];
      const domain = value.split('@')[1];
      if (tempDomains.includes(domain)) {
        throw new Error('Temporary email addresses are not allowed');
      }
      return true;
    }),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-=\[\]{};':"\\|,.<>\/?])/).withMessage('Password must contain uppercase, lowercase, number and special character'),
  body('phone')
    .matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number required')
    .custom((value) => {
      // Check if phone starts with valid Indian mobile prefix
      const validPrefixes = ['6', '7', '8', '9'];
      if (!validPrefixes.includes(value[0])) {
        throw new Error('Invalid phone number');
      }
      return true;
    }),
  body('college')
    .notEmpty().withMessage('College name is required')
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage('College name must be between 3-100 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg 
      });
    }

    const { name, email, password, phone, college, avatar } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      // If user exists but email not verified, return userId so they can verify
      if (!userExists.isEmailVerified) {
        return res.status(400).json({ 
          success: false, 
          message: 'User already exists with this email. Please verify your email.',
          userId: userExists._id,
          email: userExists.email
        });
      }
      
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Check if phone exists
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number already registered' 
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      college,
      avatar: avatar || undefined // Use uploaded avatar or default
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Log OTP to console for testing (when email fails)
    console.log('🔐 OTP for', user.email, ':', otp);

    // Send response immediately, then send email in background
    res.status(201).json({
      success: true,
      message: 'OTP sent to your email. Please verify to complete registration.',
      userId: user._id
    });

    // Send OTP email asynchronously (non-blocking)
    setImmediate(async () => {
      console.log('📤 Starting email send process for:', user.email);
      try {
        await sendEmail({
          email: user.email,
          subject: 'Verify Your Email - Savishkar 2025',
          html: otpEmailTemplate(otp, user.name)
        });
        console.log('✅ OTP Email sent successfully to', user.email);
      } catch (emailError) {
        console.error('❌ OTP Email failed for', user.email);
        console.error('❌ Error type:', emailError.name);
        console.error('❌ Error message:', emailError.message);
        console.error('❌ Full error:', emailError);
        console.log('⚠️ Email failed but OTP is logged above. User can still verify.');
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during signup' 
    });
  }
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP and complete registration
// @access  Public
router.post('/verify-otp', async (req, res) => {
  try {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide userId and OTP' 
      });
    }

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    if (user.emailVerificationOTP !== otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }

    if (user.emailVerificationExpire < Date.now()) {
      return res.status(400).json({ 
        success: false, 
        message: 'OTP expired. Please request a new one.' 
      });
    }

    // Generate unique user code if not already present (skip for admins)
    if (!user.userCode && user.role !== 'admin') {
      user.userCode = await generateUserCode();
    }

    // Verify user
    user.isEmailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Send response immediately
    res.json({
      success: true,
      message: 'Email verified successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        role: user.role,
        avatar: user.avatar,
        userCode: user.userCode
      }
    });

    // Send welcome email asynchronously (non-blocking)
    setImmediate(async () => {
      console.log('📤 Starting welcome email send process for:', user.email);
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to Savishkar 2025 - Your Unique Code',
          html: welcomeEmailTemplate(user.name, user.userCode)
        });
        console.log('✅ Welcome email sent successfully to', user.email);
      } catch (emailError) {
        console.error('❌ Welcome email failed for', user.email);
        console.error('❌ Error type:', emailError.name);
        console.error('❌ Error message:', emailError.message);
        console.error('❌ Full error:', emailError);
      }
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during verification' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('📧 Login request received:');
    console.log('   Email from request:', email);
    console.log('   Email type:', typeof email);

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user with lowercase email (matching how admin registration stores emails)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    console.log('   User found in DB (as-is)?:', user ? 'YES' : 'NO');
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check password
    console.log('🔐 Login attempt for:', user.email);
    console.log('   Password provided:', password);
    console.log('   Stored hash starts with:', user.password.substring(0, 10));
    
    const isMatch = await user.matchPassword(password);
    console.log('   Password match result:', isMatch);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      // Generate and send new OTP
      const otp = user.generateOTP();
      await user.save();

      // Log OTP to console for testing
      console.log('🔐 OTP for unverified login attempt:', user.email, ':', otp);

      // Send OTP email
      try {
        await sendEmail({
          email: user.email,
          subject: 'Email Verification Required - Savishkar 2025',
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 40px; border-radius: 12px; border: 3px solid #5C4033;">
              <h1 style="color: #1e40af; text-align: center; margin-bottom: 30px; font-size: 32px; font-weight: bold;">Email Verification Required</h1>
              <p style="color: #8b4513; font-size: 18px; margin-bottom: 10px;">Hi ${user.name},</p>
              <p style="color: #8b4513; font-size: 16px; margin-bottom: 30px;">Your OTP is:</p>
              <div style="background: #FFF8DC; padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0; border: 3px solid #FAB12F; box-shadow: 0 4px 12px rgba(250, 177, 47, 0.3);">
                <h2 style="color: #000000; font-size: 42px; margin: 0; letter-spacing: 8px; font-weight: bold; white-space: nowrap; overflow-x: auto;">${otp}</h2>
              </div>
              <p style="color: #8b4513; font-size: 16px; margin-top: 30px;">⏰ <strong>This OTP will expire in 10 minutes.</strong></p>
              <hr style="margin: 40px 0; border: none; border-top: 2px solid #5C4033;">
              <p style="color: #1e40af; font-size: 14px; text-align: center; font-weight: 600; margin: 0;">Savishkar 2025 - Where Innovation Meets Excellence</p>
            </div>
          `
        });
        console.log('✅ OTP email sent to', user.email);
      } catch (emailError) {
        console.error('❌ Email error:', emailError.message);
        console.log('⚠️ Email failed but OTP is logged above.');
      }

      return res.status(403).json({ 
        success: false, 
        message: 'Email not verified. A new OTP has been sent to your email.',
        requiresVerification: true,
        userId: user._id,
        email: user.email
      });
    }

    // Generate user code if not present (for existing users, skip for admins)
    if (!user.userCode && user.role !== 'admin') {
      user.userCode = await generateUserCode();
      await user.save();
      
      // Send email with user code
      try {
        await sendEmail({
          email: user.email,
          subject: 'Your Savishkar 2025 Unique Code',
          html: userCodeTemplate(user.name, user.userCode)
        });
        console.log('✅ User code email sent to', user.email);
      } catch (emailError) {
        console.error('❌ User code email error:', emailError.message);
      }
    }

    // Update last login without triggering validation
    await User.updateOne(
      { _id: user._id },
      { $set: { lastLogin: Date.now() } }
    );

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        role: user.role,
        avatar: user.avatar,
        userCode: user.userCode
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error during login' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        userCode: user.userCode,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP
// @access  Public
router.post('/resend-otp', otpLimiter, async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await sendEmail({
      email: user.email,
      subject: 'New OTP Request - Savishkar 2025',
      html: newOtpTemplate(otp, user.name)
    });

    res.json({
      success: true,
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', passwordResetLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email address' 
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No user found with this email' 
      });
    }

    // Generate reset token
    const resetToken = user.generateResetToken();
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Log token for testing
    console.log('🔐 Password Reset Link for', user.email, ':', resetUrl);

    // Send reset email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset - Savishkar 2025',
        html: passwordResetTemplate(resetUrl, user.name)
      });
      console.log('✅ Password reset email sent to', user.email);
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
      console.log('⚠️ Email failed but reset link is logged above.');
    }

    res.json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password with token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide new password' 
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must be at least 8 characters' 
      });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Password must contain uppercase, lowercase, number and special character' 
      });
    }

    // Hash token from URL
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid or expired reset token' 
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/auth/check-email
// @desc    Check if email already exists
// @access  Public
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    res.json({
      success: true,
      exists: !!user
    });
  } catch (error) {
    console.error('Check email error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/auth/check-phone
// @desc    Check if phone number already exists
// @access  Public
router.post('/check-phone', async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    const user = await User.findOne({ phone });

    res.json({
      success: true,
      exists: !!user
    });
  } catch (error) {
    console.error('Check phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
