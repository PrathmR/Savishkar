  import express from 'express';
import ExcelJS from 'exceljs';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import sendEmail from '../utils/sendEmail.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/registrations
// @desc    Register for an event
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { eventId, teamName, teamMembers } = req.body;
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if online registration is open
    if (!event.onlineRegistrationOpen) {
      return res.status(403).json({ 
        success: false, 
        message: 'Online registration is currently closed for this event. Please contact the admin.' 
      });
    }
    
    // Check if event is full
    if (event.isFull) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event is full' 
      });
    }
    
    // Check if already registered
    const existingRegistration = await Registration.findOne({
      user: req.user._id,
      event: eventId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false, 
        message: 'You are already registered for this event' 
      });
    }
    
    // Check for time conflicts with other registered events
    const userRegistrations = await Registration.find({
      user: req.user._id,
      status: { $ne: 'cancelled' },
      paymentStatus: { $in: ['completed', 'pending', 'verification_pending'] }
    }).populate('event');
    
    // Check if any registered event has the same date and time
    const conflictingEvent = userRegistrations.find(reg => {
      if (!reg.event) return false;
      
      const registeredEventDate = new Date(reg.event.date).toDateString();
      const newEventDate = new Date(event.date).toDateString();
      
      // If dates match, check if times overlap
      if (registeredEventDate === newEventDate) {
        const registeredEventTime = reg.event.time;
        const newEventTime = event.time;
        
        return registeredEventTime === newEventTime;
      }
      
      return false;
    });
    
    if (conflictingEvent) {
      return res.status(400).json({ 
        success: false, 
        message: `You are already registered for "${conflictingEvent.event.name}" which is scheduled at the same time (${conflictingEvent.event.time} on ${new Date(conflictingEvent.event.date).toLocaleDateString('en-IN')}). You cannot register for multiple events at the same time.`,
        conflictingEvent: {
          name: conflictingEvent.event.name,
          date: conflictingEvent.event.date,
          time: conflictingEvent.event.time
        }
      });
    }
    
    // Generate registration number
    const count = await Registration.countDocuments();
    const registrationNumber = `SAV2025-${String(count + 1).padStart(4, '0')}`;
    
    // Create registration
    const registration = await Registration.create({
      user: req.user._id,
      event: eventId,
      teamName,
      teamMembers: teamMembers || [],
      amount: event.registrationFee,
      registrationNumber,
      paymentStatus: event.registrationFee === 0 ? 'completed' : 'pending'
    });
    
    // Increment participant count
    await event.incrementParticipants();

    // Send confirmation email
    try {
      const emailContent = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 30px; border-radius: 12px; border: 2px solid #5C4033;">
          <h1 style="color: #1e40af; text-align: center; margin-bottom: 20px; font-size: 28px;">Registration Successful! 🎉</h1>
          <p style="color: #2C1810; font-size: 16px;">Hi ${req.user.name},</p>
          <p style="color: #2C1810;">You have successfully registered for <strong style="color: #1e40af;">${event.name}</strong>!</p>
          
          <div style="background: #f5f5dc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #8b4513;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">Registration Details:</h3>
            <p style="color: #2C1810;"><strong>Registration Number:</strong> <span style="color: #8b4513;">${registration.registrationNumber}</span></p>
            <p style="color: #2C1810;"><strong>Event:</strong> ${event.name}</p>
            <p style="color: #2C1810;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN')}</p>
            <p style="color: #2C1810;"><strong>Time:</strong> ${event.time}</p>
            <p style="color: #2C1810;"><strong>Venue:</strong> ${event.venue}</p>
            ${registration.teamName ? `
              <p style="color: #2C1810;"><strong>Team Name:</strong> ${registration.teamName}</p>
              <div style="margin-top: 15px;">
                <p style="color: #2C1810; font-weight: bold; margin-bottom: 10px;">Team Members:</p>
                ${registration.teamMembers.map((member, idx) => `
                  <div style="background: rgba(250, 129, 47, 0.1); padding: 10px; margin-bottom: 8px; border-radius: 5px;">
                    <p style="color: #2C1810; margin: 2px 0;"><strong>${idx + 1}. ${member.name}</strong> ${idx === 0 ? '(Team Leader - You)' : ''}</p>
                    <p style="color: #5C4033; margin: 2px 0; font-size: 13px;">📧 ${member.email} | 📱 ${member.phone}</p>
                    ${member.college ? `<p style="color: #5C4033; margin: 2px 0; font-size: 13px;">🏫 ${member.college}</p>` : ''}
                  </div>
                `).join('')}
              </div>
            ` : ''}
            <p style="color: #2C1810;"><strong>Amount:</strong> <span style="color: #8b4513; font-size: 18px;">₹${registration.amount}</span></p>
            <p style="color: #2C1810;"><strong>Payment Status:</strong> <span style="color: ${registration.paymentStatus === 'pending' ? '#8b4513' : '#2d7a3e'};">${registration.paymentStatus.toUpperCase()}</span></p>
          </div>
          
          ${registration.amount > 0 && registration.paymentStatus === 'pending' ? 
            '<div style="background: rgba(139, 69, 19, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #8b4513; margin: 20px 0;"><p style="color: #8b4513; margin: 0; font-weight: bold;"><strong>⚠️ Please complete the payment to confirm your registration.</strong></p></div>' : 
            '<div style="background: rgba(45, 122, 62, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #2d7a3e; margin: 20px 0;"><p style="color: #2d7a3e; margin: 0; font-weight: bold;"><strong>✅ Your registration is confirmed!</strong></p></div>'
          }
          
          <p style="color: #2C1810; text-align: center; font-size: 16px;">See you at the event!</p>
          <hr style="margin: 30px 0; border: none; border-top: 2px solid #5C4033;">
          <p style="color: #5C4033; font-size: 12px; text-align: center; font-weight: 600;">Savishkar 2025 - Where Innovation Meets Excellence</p>
        </div>
      `;

      await sendEmail({
        email: req.user.email,
        subject: `Registration Confirmed - ${event.name}`,
        html: emailContent
      });

      // Log notification
      await Notification.create({
        user: req.user._id,
        email: req.user.email,
        type: 'registration',
        subject: `Registration Confirmed - ${event.name}`,
        content: emailContent,
        status: 'sent',
        sentAt: new Date(),
        relatedEvent: event._id,
        relatedRegistration: registration._id
      });

      console.log('✅ Registration email sent to', req.user.email);
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
      // Continue even if email fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      registration
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/registrations
// @desc    Get all registrations (admin) or user's registrations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show user's own registrations
    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }
    
    const registrations = await Registration.find(query)
      .populate('user', 'name email phone college')
      .populate('event', 'name category date venue')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/registrations/my
// @desc    Get user's registrations
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/registrations/check-conflict/:eventId
// @desc    Check if registering for an event would cause a time conflict
// @access  Private
router.get('/check-conflict/:eventId', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Get user's active registrations
    const userRegistrations = await Registration.find({
      user: req.user._id,
      status: { $ne: 'cancelled' }
    }).populate('event');
    
    // Check for conflicts
    const conflictingEvent = userRegistrations.find(reg => {
      if (!reg.event) return false;
      
      const registeredEventDate = new Date(reg.event.date).toDateString();
      const newEventDate = new Date(event.date).toDateString();
      
      if (registeredEventDate === newEventDate) {
        return reg.event.time === event.time;
      }
      
      return false;
    });
    
    res.json({
      success: true,
      hasConflict: !!conflictingEvent,
      conflictingEvent: conflictingEvent ? {
        name: conflictingEvent.event.name,
        date: conflictingEvent.event.date,
        time: conflictingEvent.event.time
      } : null
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/registrations/event/:eventId
// @desc    Get all registrations for an event
// @access  Private/Admin
router.get('/event/:eventId', protect, authorize('admin'), async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email phone college')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: registrations.length,
      registrations
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/registrations/:id
// @desc    Get single registration
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('event')
      .populate('user', 'name email phone college');
    
    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }
    
    // Check if user owns this registration or is admin
    if (registration.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    
    res.json({
      success: true,
      registration
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/registrations/admin-register
// @desc    Admin registers a user for an event (existing or new user)
// @access  Private/Admin
router.post('/admin-register', protect, authorize('admin'), async (req, res) => {
  try {
    const { userId, eventId, teamName, teamMembers, newUser } = req.body;
    
    // Import User model
    const User = (await import('../models/User.js')).default;
    const generateUserCode = (await import('../utils/generateUserCode.js')).default;
    
    // ============================================
    // STEP 1: VALIDATE ALL EMAILS AND PHONES FIRST
    // ============================================
    const emailsToCheck = [];
    const phonesToCheck = [];
    const validationErrors = [];
    
    // Validate main user
    if (newUser && newUser.name && newUser.email && newUser.phone && newUser.college) {
      emailsToCheck.push({ email: newUser.email.toLowerCase(), type: 'Main User' });
      phonesToCheck.push({ phone: newUser.phone, type: 'Main User' });
    }
    
    // Validate team members
    if (teamMembers && teamMembers.length > 0) {
      for (let i = 0; i < teamMembers.length; i++) {
        const member = teamMembers[i];
        if (member.name && member.email && member.phone) {
          emailsToCheck.push({ email: member.email.toLowerCase(), type: `Team Member ${i + 2}` });
          phonesToCheck.push({ phone: member.phone, type: `Team Member ${i + 2}` });
        }
      }
    }
    
    // Check for duplicate emails within the submission
    const emailSet = new Set();
    for (const item of emailsToCheck) {
      if (emailSet.has(item.email)) {
        validationErrors.push(`Duplicate email found within team: ${item.email} (${item.type})`);
      }
      emailSet.add(item.email);
    }
    
    // Check for duplicate phones within the submission
    const phoneSet = new Set();
    for (const item of phonesToCheck) {
      if (phoneSet.has(item.phone)) {
        validationErrors.push(`Duplicate phone number found within team: ${item.phone} (${item.type})`);
      }
      phoneSet.add(item.phone);
    }
    
    // Only check if the MAIN USER (new user being created) already exists
    // Team members can be existing users who participate in multiple events
    if (newUser && newUser.email) {
      const existingMainUser = await User.findOne({ email: newUser.email.toLowerCase() });
      if (existingMainUser) {
        validationErrors.push(`Main user email already registered: ${newUser.email}. Please use a different email for the main user.`);
      }
    }
    
    if (newUser && newUser.phone) {
      const existingMainUserPhone = await User.findOne({ phone: newUser.phone });
      if (existingMainUserPhone) {
        validationErrors.push(`Main user phone number already registered: ${newUser.phone}. Please use a different phone number for the main user.`);
      }
    }
    
    // If there are any validation errors, return them all
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration validation failed. Please fix the following issues:',
        errors: validationErrors,
        instructions: [
          '• The main user must be a NEW user with unique email and phone',
          '• Team members can be existing users (they can participate in multiple events)',
          '• Check for duplicate entries within your team',
          '• Verify all information before submitting'
        ]
      });
    }
    
    // ============================================
    // STEP 2: PROCEED WITH USER CREATION
    // ============================================
    let user;
    let isNewUser = false;
    
    // If newUser data is provided, create a new user
    if (newUser && newUser.name && newUser.email && newUser.phone && newUser.college) {
      
      // Generate a random password that meets validation requirements
      const crypto = (await import('crypto')).default;
      const randomString = crypto.randomBytes(4).toString('hex');
      const tempPassword = `Sav${randomString}@2025`; // Format: SavXXXXXXXX@2025 (uppercase, lowercase, number, special char)
      
      // Generate user code for non-admin users
      const userCode = await generateUserCode();
      
      // Create new user
      user = await User.create({
        name: newUser.name,
        email: newUser.email.toLowerCase(),
        password: tempPassword,
        phone: newUser.phone,
        college: newUser.college,
        isEmailVerified: true, // Auto-verify admin-created users
        userCode: userCode
      });
      
      isNewUser = true;
      
      // Fetch the user again to ensure we have the hashed password
      const savedUser = await User.findById(user._id).select('+password');
      
      // Log credentials for testing
      console.log('🔐 New user created by admin:');
      console.log('   Email:', user.email);
      console.log('   Password (plain):', tempPassword);
      console.log('   Password (hashed):', savedUser.password ? savedUser.password.substring(0, 30) + '...' : 'NOT HASHED!');
      console.log('   Password starts with $2a$?:', savedUser.password ? savedUser.password.startsWith('$2a$') : false);
      console.log('   Email Verified:', user.isEmailVerified);
      console.log('   User Code:', user.userCode);
      console.log('   User ID:', user._id);
      
      // Send welcome email with credentials
      try {
        await sendEmail({
          email: user.email,
          subject: 'Welcome to Savishkar 2025 - Account Created',
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 30px; border-radius: 12px; border: 2px solid #5C4033;">
              <h1 style="color: #1e40af; text-align: center; margin-bottom: 20px; font-size: 28px;">Welcome to Savishkar 2025! 🎉</h1>
              <p style="color: #2C1810; font-size: 16px;">Hi ${user.name},</p>
              <p style="color: #2C1810;">An account has been created for you by the admin team. Here are your login credentials:</p>
              
              <div style="background: #f5f5dc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #8b4513;">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">Login Credentials:</h3>
                <p style="color: #2C1810;"><strong>Email:</strong> ${user.email}</p>
                <p style="color: #2C1810;"><strong>Temporary Password:</strong> <span style="color: #8b4513; font-family: monospace; font-size: 16px;">${tempPassword}</span></p>
              </div>
              
              <div style="background: linear-gradient(135deg, #FA812F 0%, #FAB12F 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 25px 0; box-shadow: 0 4px 15px rgba(250, 129, 47, 0.3); overflow-x: auto;">
                <p style="color: #FEF3E2; font-size: 14px; margin: 0 0 10px 0; font-weight: 600; letter-spacing: 2px;">YOUR UNIQUE CODE</p>
                <h2 style="color: #FEF3E2; font-size: 32px; margin: 0; letter-spacing: 2px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); white-space: nowrap; display: inline-block;">${user.userCode}</h2>
              </div>
              
              <div style="background: rgba(250, 177, 47, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #FA812F; margin: 20px 0;">
                <p style="color: #2C1810; margin: 0; font-weight: 600;">⚠️ Important:</p>
                <ul style="color: #5C4033; margin: 10px 0; padding-left: 20px;">
                  <li>Please change your password after first login</li>
                  <li>Keep your unique code safe - you'll need it for event check-ins</li>
                  <li>This code is unique to you and cannot be changed</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(to right, #FA812F, #FAB12F); color: #FEF3E2; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Login Now</a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 2px solid #5C4033;">
              <p style="color: #5C4033; font-size: 12px; text-align: center; font-weight: 600;">Savishkar 2025 - Where Innovation Meets Excellence</p>
            </div>
          `
        });
        console.log('✅ Welcome email with credentials sent to', user.email);
      } catch (emailError) {
        console.error('❌ Email error:', emailError.message);
      }
    } else if (userId) {
      // Use existing user
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Either userId or newUser data is required' 
      });
    }
    
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Check if event is full
    if (event.isFull) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event is full' 
      });
    }
    
    // Check if already registered
    const existingRegistration = await Registration.findOne({
      user: user._id,
      event: eventId
    });
    
    if (existingRegistration) {
      return res.status(400).json({ 
        success: false, 
        message: 'User is already registered for this event' 
      });
    }
    
    // Generate registration number
    const count = await Registration.countDocuments();
    const registrationNumber = `SAV2025-${String(count + 1).padStart(4, '0')}`;
    
    // Process team members - create accounts for new members
    const processedTeamMembers = [];
    const newTeamMemberCredentials = [];
    const teamMemberUsers = []; // Store all team member user objects
    
    // For team events, add the main user as the first team member
    if (event.teamSize && event.teamSize.max > 1) {
      processedTeamMembers.push({
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college
      });
    }
    
    // Process additional team members if provided
    if (teamMembers && teamMembers.length > 0) {
      const crypto = (await import('crypto')).default;
      
      for (const member of teamMembers) {
        // Skip if member data is empty or incomplete
        if (!member.name || !member.email || !member.phone) {
          continue;
        }
        
        // Check if member already has an account
        let memberUser = await User.findOne({ email: member.email.toLowerCase() });
        
        // Check if this is the main user (already created and emailed)
        const isMainUser = memberUser && memberUser._id.toString() === user._id.toString();
        
        if (!memberUser) {
          // Create account for team member
          const randomString = crypto.randomBytes(4).toString('hex');
          const tempPassword = `Sav${randomString}@2025`;
          const memberUserCode = await generateUserCode();
          
          memberUser = await User.create({
            name: member.name,
            email: member.email.toLowerCase(),
            password: tempPassword,
            phone: member.phone,
            college: member.college || 'Not specified',
            isEmailVerified: true,
            userCode: memberUserCode
          });
          
          // Fetch the user again to ensure we have the hashed password
          const savedMember = await User.findById(memberUser._id).select('+password');
          
          // Log credentials for testing
          console.log('🔐 Team member account created:');
          console.log('   Email:', memberUser.email);
          console.log('   Password (plain):', tempPassword);
          console.log('   Password (hashed):', savedMember.password ? savedMember.password.substring(0, 30) + '...' : 'NOT HASHED!');
          console.log('   Password starts with $2a$?:', savedMember.password ? savedMember.password.startsWith('$2a$') : false);
          console.log('   Email Verified:', memberUser.isEmailVerified);
          console.log('   User Code:', memberUser.userCode);
          console.log('   User ID:', memberUser._id);
          
          // Store credentials to send email later (only for new users, not main user)
          if (!isMainUser) {
            newTeamMemberCredentials.push({
              user: memberUser,
              tempPassword: tempPassword
            });
          }
        } else if (!isMainUser) {
          // Existing user but not the main user - log it
          console.log('ℹ️ Team member already has account:', memberUser.email);
        }
        
        // Add to processed team members
        processedTeamMembers.push({
          name: memberUser.name,
          email: memberUser.email,
          phone: memberUser.phone,
          college: memberUser.college
        });
        
        // Store user object for creating individual registrations
        if (!isMainUser) {
          teamMemberUsers.push(memberUser);
        }
      }
    }
    
    // Create registration for the main user (team leader)
    const registration = await Registration.create({
      user: user._id,
      event: eventId,
      teamName,
      teamMembers: processedTeamMembers,
      amount: event.registrationFee,
      registrationNumber,
      paymentStatus: event.registrationFee === 0 ? 'completed' : 'pending',
      paymentMethod: event.registrationFee === 0 ? 'free' : undefined,
      isTeamLeader: true
    });
    
    // Create individual registrations for each team member
    const teamMemberRegistrations = [];
    for (let i = 0; i < teamMemberUsers.length; i++) {
      const memberUser = teamMemberUsers[i];
      
      // Check if this team member is already registered for this event
      const existingMemberReg = await Registration.findOne({
        user: memberUser._id,
        event: eventId
      });
      
      if (!existingMemberReg) {
        const memberRegCount = await Registration.countDocuments();
        const memberRegNumber = `SAV2025-${String(memberRegCount + 1).padStart(4, '0')}`;
        
        const memberRegistration = await Registration.create({
          user: memberUser._id,
          event: eventId,
          teamName,
          teamMembers: processedTeamMembers,
          amount: 0, // Team members don't pay separately
          registrationNumber: memberRegNumber,
          paymentStatus: 'completed', // Auto-complete since leader pays
          paymentMethod: 'free',
          isTeamLeader: false
        });
        
        teamMemberRegistrations.push(memberRegistration);
        console.log(`✅ Created registration for team member: ${memberUser.name} (${memberRegNumber})`);
      } else {
        console.log(`ℹ️ Team member ${memberUser.name} already registered for this event`);
      }
    }
    
    // Increment participant count (only once for the team, not per member)
    await event.incrementParticipants();
    
    // Send login credentials ONLY to new team members (not event registration)
    for (const memberCred of newTeamMemberCredentials) {
      try {
        await sendEmail({
          email: memberCred.user.email,
          subject: 'Welcome to Savishkar 2025 - Account Created',
          html: `
            <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 30px; border-radius: 12px; border: 2px solid #5C4033;">
              <h1 style="color: #1e40af; text-align: center; margin-bottom: 20px; font-size: 28px;">Welcome to Savishkar 2025! 🎉</h1>
              <p style="color: #2C1810; font-size: 16px;">Hi ${memberCred.user.name},</p>
              <p style="color: #2C1810;">An account has been created for you by the admin team. Here are your login credentials:</p>
              
              <div style="background: #f5f5dc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #8b4513;">
                <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">Login Credentials:</h3>
                <p style="color: #2C1810;"><strong>Email:</strong> ${memberCred.user.email}</p>
                <p style="color: #2C1810;"><strong>Temporary Password:</strong> <span style="color: #8b4513; font-family: monospace; font-size: 16px;">${memberCred.tempPassword}</span></p>
              </div>
              
              <div style="background: linear-gradient(135deg, #FA812F 0%, #FAB12F 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 25px 0; box-shadow: 0 4px 15px rgba(250, 129, 47, 0.3);">
                <p style="color: #FEF3E2; font-size: 14px; margin: 0 0 10px 0; font-weight: 600; letter-spacing: 2px;">YOUR UNIQUE CODE</p>
                <h2 style="color: #FEF3E2; font-size: 32px; margin: 0; letter-spacing: 2px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">${memberCred.user.userCode}</h2>
              </div>
              
              <div style="background: rgba(250, 177, 47, 0.1); padding: 20px; border-radius: 8px; border-left: 4px solid #FA812F; margin: 20px 0;">
                <p style="color: #2C1810; margin: 0; font-weight: 600;">⚠️ Important:</p>
                <ul style="color: #5C4033; margin: 10px 0; padding-left: 20px;">
                  <li>Please change your password after first login</li>
                  <li>Keep your unique code safe - you'll need it for event check-ins</li>
                  <li>This code is unique to you and cannot be changed</li>
                  <li>You will receive a separate email with event registration details</li>
                </ul>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(to right, #FA812F, #FAB12F); color: #FEF3E2; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Login Now</a>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 2px solid #5C4033;">
              <p style="color: #5C4033; font-size: 12px; text-align: center; font-weight: 600;">Savishkar 2025 - Where Innovation Meets Excellence</p>
            </div>
          `
        });
        console.log('✅ Login credentials email sent to new team member:', memberCred.user.email);
      } catch (emailError) {
        console.error('❌ Email error for team member:', emailError.message);
      }
    }

    // Send registration email to user
    try {
      const emailContent = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 30px; border-radius: 12px; border: 2px solid #5C4033;">
          <h1 style="color: #1e40af; text-align: center; margin-bottom: 20px; font-size: 28px;">Event Registration Created! 🎉</h1>
          <p style="color: #2C1810; font-size: 16px;">Hi ${user.name},</p>
          <p style="color: #2C1810;">You have been registered for <strong style="color: #1e40af;">${event.name}</strong> by the admin team!</p>
          
          <div style="background: #f5f5dc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #8b4513;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">Registration Details:</h3>
            <p style="color: #2C1810;"><strong>Registration Number:</strong> <span style="color: #8b4513;">${registration.registrationNumber}</span></p>
            <p style="color: #2C1810;"><strong>Event:</strong> ${event.name}</p>
            <p style="color: #2C1810;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN')}</p>
            <p style="color: #2C1810;"><strong>Time:</strong> ${event.time}</p>
            <p style="color: #2C1810;"><strong>Venue:</strong> ${event.venue}</p>
            ${registration.teamName ? `<p style="color: #2C1810;"><strong>Team Name:</strong> ${registration.teamName}</p>` : ''}
            <p style="color: #2C1810;"><strong>Amount:</strong> <span style="color: #8b4513; font-size: 18px;">₹${registration.amount}</span></p>
            <p style="color: #2C1810;"><strong>Payment Status:</strong> <span style="color: ${registration.paymentStatus === 'pending' ? '#8b4513' : '#2d7a3e'};">${registration.paymentStatus.toUpperCase()}</span></p>
          </div>
          
          ${registration.amount > 0 && registration.paymentStatus === 'pending' ? 
            `<div style="background: rgba(139, 69, 19, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #8b4513; margin: 20px 0;">
              <p style="color: #8b4513; margin: 0 0 10px 0; font-weight: bold;"><strong>⚠️ Payment Required</strong></p>
              <p style="color: #5C4033; margin: 0;">Please login to your account and complete the payment to confirm your registration.</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(to right, #FA812F, #FAB12F); color: #FEF3E2; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Login & Pay Now</a>
            </div>` : 
            `<div style="background: rgba(45, 122, 62, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #2d7a3e; margin: 20px 0;">
              <p style="color: #2d7a3e; margin: 0; font-weight: bold;"><strong>✅ Your registration is confirmed!</strong></p>
            </div>`
          }
          
          <p style="color: #2C1810; text-align: center; font-size: 16px;">See you at the event!</p>
          <hr style="margin: 30px 0; border: none; border-top: 2px solid #5C4033;">
          <p style="color: #5C4033; font-size: 12px; text-align: center; font-weight: 600;">Savishkar 2025 - Where Innovation Meets Excellence</p>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: `Event Registration - ${event.name}`,
        html: emailContent
      });

      // Log notification
      await Notification.create({
        user: user._id,
        email: user.email,
        type: 'registration',
        subject: `Event Registration - ${event.name}`,
        content: emailContent,
        status: 'sent',
        sentAt: new Date(),
        relatedEvent: event._id,
        relatedRegistration: registration._id
      });

      console.log('✅ Admin registration email sent to team leader:', user.email);
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
      // Continue even if email fails
    }
    
    // Send event registration confirmation to ALL team members
    for (const memberUser of teamMemberUsers) {
      try {
        const confirmationEmail = `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 30px; border-radius: 12px; border: 2px solid #5C4033;">
            <h1 style="color: #1e40af; text-align: center; margin-bottom: 20px; font-size: 28px;">Event Registration Confirmed! 🎉</h1>
            <p style="color: #2C1810; font-size: 16px;">Hi ${memberUser.name},</p>
            <p style="color: #2C1810;">You have been registered for <strong style="color: #1e40af;">${event.name}</strong> as part of team <strong>${teamName}</strong>!</p>
            
            <div style="background: #f5f5dc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #8b4513;">
              <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">Event Details:</h3>
              <p style="color: #2C1810;"><strong>Event:</strong> ${event.name}</p>
              <p style="color: #2C1810;"><strong>Team Name:</strong> ${teamName}</p>
              <p style="color: #2C1810;"><strong>Date:</strong> ${new Date(event.date).toLocaleDateString('en-IN')}</p>
              <p style="color: #2C1810;"><strong>Time:</strong> ${event.time}</p>
              <p style="color: #2C1810;"><strong>Venue:</strong> ${event.venue}</p>
            </div>
            
            <div style="background: rgba(45, 122, 62, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #2d7a3e; margin: 20px 0;">
              <p style="color: #2d7a3e; margin: 0; font-weight: bold;"><strong>✅ Your registration is confirmed!</strong></p>
              <p style="color: #5C4033; margin: 10px 0 0 0;">Please login to your account to view more details.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" style="display: inline-block; background: linear-gradient(to right, #FA812F, #FAB12F); color: #FEF3E2; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">View Dashboard</a>
            </div>
            
            <p style="color: #2C1810; text-align: center; font-size: 16px;">See you at the event!</p>
            <hr style="margin: 30px 0; border: none; border-top: 2px solid #5C4033;">
            <p style="color: #5C4033; font-size: 12px; text-align: center; font-weight: 600;">Savishkar 2025 - Where Innovation Meets Excellence</p>
          </div>
        `;
        
        await sendEmail({
          email: memberUser.email,
          subject: `Event Registration Confirmed - ${event.name}`,
          html: confirmationEmail
        });
        
        console.log('✅ Event confirmation email sent to team member:', memberUser.email);
      } catch (emailError) {
        console.error('❌ Email error for team member confirmation:', emailError.message);
      }
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      registration
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   PUT /api/registrations/:id/cancel
// @desc    Cancel registration
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({ 
        success: false, 
        message: 'Registration not found' 
      });
    }
    
    // Check ownership
    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }
    
    if (registration.status === 'cancelled') {
      return res.status(400).json({ 
        success: false, 
        message: 'Registration already cancelled' 
      });
    }
    
    registration.status = 'cancelled';
    await registration.save();
    
    // Decrement participant count
    const event = await Event.findById(registration.event);
    if (event) {
      event.currentParticipants = Math.max(0, event.currentParticipants - 1);
      await event.save();
    }
    
    res.json({
      success: true,
      message: 'Registration cancelled successfully',
      registration
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/registrations/export/:eventId
// @desc    Export registrations to Excel
// @access  Private/Admin
router.get('/export/:eventId', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId);
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }

    const registrations = await Registration.find({ event: req.params.eventId })
      .populate('user', 'name email phone college')
      .sort({ createdAt: 1 });

    // Get payment details for each registration
    const Payment = (await import('../models/Payment.js')).default;
    const registrationIds = registrations.map(r => r._id);
    const payments = await Payment.find({ registration: { $in: registrationIds } });
    
    // Create payment map for quick lookup
    const paymentMap = {};
    payments.forEach(p => {
      paymentMap[p.registration.toString()] = p;
    });

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Registrations');

    // Set column headers
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Registration No', key: 'regNo', width: 18 },
      { header: 'Unique Code', key: 'userCode', width: 15 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Phone', key: 'phone', width: 15 },
      { header: 'College', key: 'college', width: 30 },
      { header: 'Team Name', key: 'teamName', width: 25 },
      { header: 'Team Size', key: 'teamSize', width: 12 },
      { header: 'Amount', key: 'amount', width: 12 },
      { header: 'Payment Status', key: 'paymentStatus', width: 18 },
      { header: 'QR Code Used', key: 'qrCodeUsed', width: 25 },
      { header: 'UTR Number', key: 'utrNumber', width: 18 },
      { header: 'Payment Date', key: 'paymentDate', width: 20 },
      { header: 'Registration Date', key: 'regDate', width: 20 },
      { header: 'Status', key: 'status', width: 15 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

    // Add data rows
    registrations.forEach((reg, index) => {
      const payment = paymentMap[reg._id.toString()];
      
      // Determine payment status display
      let paymentStatusDisplay = reg.paymentStatus.toUpperCase();
      if (reg.paymentStatus === 'completed' && payment?.status === 'captured') {
        paymentStatusDisplay = 'APPROVED';
      } else if (reg.paymentStatus === 'verification_pending') {
        paymentStatusDisplay = 'PENDING VERIFICATION';
      } else if (reg.paymentStatus === 'failed') {
        paymentStatusDisplay = 'REJECTED';
      }
      
      // Get QR code information
      let qrCodeInfo = 'N/A';
      if (payment?.qrCodeUsed) {
        const qrData = payment.qrCodeUsed;
        if (qrData.accountName && qrData.upiId) {
          qrCodeInfo = `${qrData.accountName} (${qrData.upiId})`;
        } else if (qrData.accountName) {
          qrCodeInfo = qrData.accountName;
        } else if (qrData.upiId) {
          qrCodeInfo = qrData.upiId;
        }
        // Add QR index if available
        if (qrData.qrIndex !== undefined && qrData.qrIndex !== null) {
          qrCodeInfo += ` [QR ${qrData.qrIndex + 1}]`;
        }
      }
      
      const row = worksheet.addRow({
        sno: index + 1,
        regNo: reg.registrationNumber,
        userCode: reg.user?.userCode || 'N/A',
        name: reg.user?.name || 'N/A',
        email: reg.user?.email || 'N/A',
        phone: reg.user?.phone || 'N/A',
        college: reg.user?.college || 'N/A',
        teamName: reg.teamName || 'Individual',
        teamSize: reg.teamMembers?.length || 1,
        amount: `₹${reg.amount}`,
        paymentStatus: paymentStatusDisplay,
        qrCodeUsed: qrCodeInfo,
        utrNumber: payment?.utrNumber || 'N/A',
        paymentDate: payment?.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-IN') : 'N/A',
        regDate: new Date(reg.registrationDate).toLocaleDateString('en-IN'),
        status: reg.status.toUpperCase()
      });
      
      // Color code payment status cells
      const paymentStatusCell = row.getCell('paymentStatus');
      if (paymentStatusDisplay === 'APPROVED') {
        paymentStatusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF16A34A' }
        };
        paymentStatusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      } else if (paymentStatusDisplay === 'PENDING VERIFICATION') {
        paymentStatusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFBBF24' }
        };
        paymentStatusCell.font = { color: { argb: 'FF000000' }, bold: true };
      } else if (paymentStatusDisplay === 'REJECTED') {
        paymentStatusCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFDC2626' }
        };
        paymentStatusCell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      }
    });

    // Add summary at the bottom
    worksheet.addRow([]);
    worksheet.addRow([]);
    const approvedCount = registrations.filter(r => r.paymentStatus === 'completed').length;
    const pendingCount = registrations.filter(r => r.paymentStatus === 'verification_pending' || r.paymentStatus === 'pending').length;
    const rejectedCount = registrations.filter(r => r.paymentStatus === 'failed').length;
    
    const summaryRow = worksheet.addRow([
      'SUMMARY',
      '',
      `Total Registrations: ${registrations.length}`,
      '',
      `Approved: ${approvedCount}`,
      '',
      `Pending: ${pendingCount}`,
      '',
      `Rejected: ${rejectedCount}`
    ]);
    summaryRow.font = { bold: true };

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${event.slug}-registrations.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

export default router;
