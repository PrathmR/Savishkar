import express from 'express';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import Settings from '../models/Settings.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', protect, authorize('admin'), async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalRegistrations = await Registration.countDocuments();
    const totalPayments = await Payment.countDocuments({ status: 'captured' });

    // Get revenue
    const payments = await Payment.find({ status: 'captured' });
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Recent registrations
    const recentRegistrations = await Registration.find()
      .populate('user', 'name email')
      .populate('event', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent payments
    const recentPayments = await Payment.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    });

    // Event-wise registrations
    const eventStats = await Registration.aggregate([
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: '_id',
          as: 'eventDetails'
        }
      },
      {
        $unwind: '$eventDetails'
      },
      {
        $project: {
          eventName: '$eventDetails.name',
          registrations: '$count',
          revenue: '$revenue'
        }
      },
      {
        $sort: { registrations: -1 }
      }
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalEvents,
        totalRegistrations,
        totalPayments,
        totalRevenue,
        recentPayments
      },
      recentRegistrations,
      eventStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { search, role } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { college: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Private/Admin
router.put('/users/:id/role', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'User role updated',
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/admin/clear-database
// @desc    Clear all data except admin users (ONE-TIME USE)
// @access  Private/Admin
router.post('/clear-database', protect, authorize('admin'), async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    // Verify admin password for security
    if (!confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm this action'
      });
    }

    // Get the current admin user with password
    const admin = await User.findById(req.user._id).select('+password');
    const isPasswordMatch = await admin.matchPassword(confirmPassword);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Database clear operation cancelled.'
      });
    }

    // Delete all notifications
    const notificationsDeleted = await Notification.deleteMany({});
    
    // Delete all payments
    const paymentsDeleted = await Payment.deleteMany({});
    
    // Delete all registrations
    const registrationsDeleted = await Registration.deleteMany({});
    
    // Delete all events
    const eventsDeleted = await Event.deleteMany({});
    
    // Delete all non-admin users
    const usersDeleted = await User.deleteMany({ role: { $ne: 'admin' } });
    
    // Count remaining admin users
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.json({
      success: true,
      message: 'Database cleared successfully! Only admin users remain.',
      deletedCounts: {
        notifications: notificationsDeleted.deletedCount,
        payments: paymentsDeleted.deletedCount,
        registrations: registrationsDeleted.deletedCount,
        events: eventsDeleted.deletedCount,
        users: usersDeleted.deletedCount
      },
      remainingAdmins: adminCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/settings
// @desc    Get all settings
// @access  Private/Admin
router.get('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = await Settings.find().sort({ category: 1, key: 1 });
    
    res.json({
      success: true,
      count: settings.length,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/settings/:key
// @desc    Get a specific setting
// @access  Private/Admin
router.get('/settings/:key', protect, authorize('admin'), async (req, res) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    res.json({
      success: true,
      setting
    });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/settings/:key
// @desc    Update a setting
// @access  Private/Admin
router.put('/settings/:key', protect, authorize('admin'), async (req, res) => {
  try {
    const { value, description, category, isPublic } = req.body;
    
    if (!value) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }
    
    const setting = await Settings.set(req.params.key, value, {
      description,
      category,
      isPublic,
      updatedBy: req.user._id
    });
    
    console.log(`✅ Setting updated: ${req.params.key} by ${req.user.name}`);
    
    res.json({
      success: true,
      message: 'Setting updated successfully',
      setting
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/admin/settings
// @desc    Create a new setting
// @access  Private/Admin
router.post('/settings', protect, authorize('admin'), async (req, res) => {
  try {
    const { key, value, description, category, isPublic } = req.body;
    
    if (!key || !value) {
      return res.status(400).json({
        success: false,
        message: 'Key and value are required'
      });
    }
    
    const setting = await Settings.set(key, value, {
      description,
      category,
      isPublic,
      updatedBy: req.user._id
    });
    
    console.log(`✅ Setting created: ${key} by ${req.user.name}`);
    
    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      setting
    });
  } catch (error) {
    console.error('Create setting error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/admin/settings/:key
// @desc    Delete a setting
// @access  Private/Admin
router.delete('/settings/:key', protect, authorize('admin'), async (req, res) => {
  try {
    const setting = await Settings.findOneAndDelete({ key: req.params.key });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }
    
    console.log(`✅ Setting deleted: ${req.params.key} by ${req.user.name}`);
    
    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/registration-control
// @desc    Get global registration control status
// @access  Private/Admin
router.get('/registration-control', protect, authorize('admin'), async (req, res) => {
  try {
    const setting = await Settings.get('user_registration_disabled', 'false');
    const isDisabled = setting === 'true';
    
    res.json({
      success: true,
      userRegistrationDisabled: isDisabled
    });
  } catch (error) {
    console.error('Get registration control error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/registration-control
// @desc    Toggle global user registration control
// @access  Private/Admin
router.put('/registration-control', protect, authorize('admin'), async (req, res) => {
  try {
    const { disabled } = req.body;
    
    if (typeof disabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'disabled field must be a boolean'
      });
    }
    
    await Settings.set('user_registration_disabled', disabled.toString(), {
      description: 'When true, users cannot register for events. Only admins can register users.',
      category: 'general',
      isPublic: false,
      updatedBy: req.user._id
    });
    
    console.log(`✅ User registration ${disabled ? 'DISABLED' : 'ENABLED'} by ${req.user.name}`);
    
    res.json({
      success: true,
      message: `User registration ${disabled ? 'disabled' : 'enabled'} successfully`,
      userRegistrationDisabled: disabled
    });
  } catch (error) {
    console.error('Toggle registration control error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/admin/registration-auto-disable
// @desc    Get registration auto-disable schedule info
// @access  Private/Admin
router.get('/registration-auto-disable', protect, authorize('admin'), async (req, res) => {
  try {
    const registrationAutoDisable = (await import('../services/registrationAutoDisable.js')).default;
    const info = registrationAutoDisable.getScheduledTime();
    
    res.json({
      success: true,
      ...info
    });
  } catch (error) {
    console.error('Get registration auto-disable info error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/admin/registration-auto-disable
// @desc    Update registration auto-disable scheduled time
// @access  Private/Admin
router.put('/registration-auto-disable', protect, authorize('admin'), async (req, res) => {
  try {
    const { scheduledTime } = req.body;
    
    if (!scheduledTime) {
      return res.status(400).json({
        success: false,
        message: 'scheduledTime is required'
      });
    }

    const registrationAutoDisable = (await import('../services/registrationAutoDisable.js')).default;
    const result = await registrationAutoDisable.updateScheduledTime(scheduledTime);
    
    console.log(`✅ Registration auto-disable time updated by ${req.user.name}`);
    
    res.json({
      success: true,
      message: 'Scheduled time updated successfully',
      ...result
    });
  } catch (error) {
    console.error('Update registration auto-disable time error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/admin/seed-savishkar-events
// @desc    Seed all Savishkar events from CSV data
// @access  Private/Admin
router.post('/seed-savishkar-events', protect, authorize('admin'), async (req, res) => {
  try {
    const dummyImages = [
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800',
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800',
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800',
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800',
      'https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800',
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800',
      'https://images.unsplash.com/photo-1509824227185-9c5a01ceba0d?w=800',
    ];

    const eventsData = [
      { name: 'Savishkar Business Challenge', department: 'MBA', category: 'Non-Technical', shortDescription: 'Case solving and business pitch competition', description: 'Get ready to showcase your business brilliance! Reputation radar challenges participants to think critically and solve real-time business cases, testing decision-making and leadership skills. Boardroom Battles gives platform to pitch innovative business ideas.', teamSize: { min: 2, max: 2 }, registrationFee: 0 },
      { name: 'Robo Race', department: 'Mechanical', category: 'Technical', shortDescription: 'Robot racing through obstacle course', description: 'A race area will be created with hurdles. Design a robot that can navigate through challenging obstacles and complete the race in minimum time.', teamSize: { min: 2, max: 4 }, registrationFee: 0 },
      { name: 'Photography Contest', department: 'Mechanical', category: 'Technical', shortDescription: 'Capture perfect shots with themes', description: 'Showcase your photography skills by clicking amazing photos on given topics. Open for both mobile and DSLR categories.', teamSize: { min: 1, max: 1 }, registrationFee: 0 },
      { name: 'Robo Soccer', department: 'Mechanical', category: 'Technical', shortDescription: 'Robotic football tournament', description: 'Two teams compete with their soccer bots. The team that scores more goals wins. Test your robot design and control skills!', teamSize: { min: 1, max: 4 }, registrationFee: 0 },
      { name: 'Robo Sumo War', department: 'Mechanical', category: 'Technical', shortDescription: 'Robot combat competition', description: 'Battle arena where robots fight to push opponents out. Build a strong sumo bot and dominate the arena!', teamSize: { min: 1, max: 4 }, registrationFee: 0 },
      { name: 'Technical Paper Presentation', department: 'Mechanical', category: 'Technical', shortDescription: 'Present research papers', description: 'Platform to present innovative technical ideas and research work. Showcase your knowledge through PowerPoint presentations.', teamSize: { min: 2, max: 2 }, registrationFee: 0 },
      { name: 'BIGG BOSS', department: 'CSE', category: 'Non-Technical', shortDescription: 'Reality show inspired competition', description: 'Dynamic duo competition with 3 suspenseful eliminating rounds. Face exciting challenges that test wit, teamwork, and resilience!', teamSize: { min: 2, max: 2 }, registrationFee: 0 },
      { name: '3D Modeling Competition', department: 'Mechanical', category: 'Technical', shortDescription: 'CAD modeling challenge', description: 'Create stunning 3D models using Fusion 360. Two rounds of increasing difficulty testing your CAD skills and creativity.', teamSize: { min: 1, max: 1 }, registrationFee: 0 },
      { name: 'Squid Game Challenge', department: 'Mechanical', category: 'Non-Technical', shortDescription: 'Multi-round elimination games', description: 'Inspired by popular series, participate in 4 elimination rounds testing teamwork, focus, agility, and problem-solving.', teamSize: { min: 2, max: 2 }, registrationFee: 120 },
      { name: 'HACKSPHERE', department: 'CSE', category: 'Technical', shortDescription: 'Competitive programming hackathon', description: 'Test technical skills through DSA quiz, surprise challenges, and coding competition. Three progressive rounds culminating in final compile!', teamSize: { min: 3, max: 4 }, registrationFee: 300 },
      { name: 'Treasure Hunt', department: 'CSE', category: 'Non-Technical', shortDescription: 'Campus-wide treasure hunting', description: 'Thrilling clue-based adventure across campus. Four rounds testing logical reasoning, teamwork, and problem-solving abilities!', teamSize: { min: 4, max: 4 }, registrationFee: 0 },
      { name: 'BID Premiere League', department: 'CSE', category: 'Non-Technical', shortDescription: 'IPL auction and quiz', description: 'Ultimate fan arena featuring bidding quiz, IPL player auction with 20-crore purse, and mystery challenge rounds!', teamSize: { min: 4, max: 4 }, registrationFee: 0 },
      { name: 'Technical Paper Presentation CSE', department: 'CSE', category: 'Technical', shortDescription: 'Research paper showcase', description: 'Present papers on AI/ML, Cybersecurity, IoT, Data Science, Robotics. Platform for innovative thinkers and researchers.', teamSize: { min: 2, max: 2 }, registrationFee: 150 },
      { name: 'Valorant Tournament', department: 'CSE', category: 'Non-Technical', shortDescription: '5v5 tactical shooter', description: 'Team-based first-person tactical shooter event. Compete in Swiftplay, Semifinals, and Grand Finals across multiple maps!', teamSize: { min: 5, max: 5 }, registrationFee: 0 },
      { name: 'BGMI Tournament', department: 'CSE', category: 'Non-Technical', shortDescription: 'Battle royale gaming', description: 'Exciting battle royale competition on classic maps. Showcase gaming talent, strategy, and teamwork to emerge victorious!', teamSize: { min: 4, max: 4 }, registrationFee: 0 },
      { name: 'NrityaNova', department: 'Common', category: 'Cultural', shortDescription: 'Solo classical dance', description: 'Solo classical dance event where grace meets devotion. Dancers embody divine spirit through expressive movements and traditional rhythm.', teamSize: { min: 1, max: 1 }, registrationFee: 0 },
      { name: 'Seconds ka Tashan', department: 'AIML', category: 'Non-Technical', shortDescription: 'Fast-paced task challenge', description: 'Fun event with multiple rounds of exciting tasks. Complete challenges in shortest time to advance to next round!', teamSize: { min: 2, max: 2 }, registrationFee: 0 },
      { name: 'TaalRythm', department: 'Common', category: 'Cultural', shortDescription: 'Solo western dance', description: 'Solo western dance event highlighting creativity, confidence, and individuality through energetic modern dance styles.', teamSize: { min: 1, max: 1 }, registrationFee: 0 },
      { name: 'IMPERSONA', department: 'ECE', category: 'Non-Technical', shortDescription: 'Personality contest', description: 'Journey through creativity, confidence, and charisma. Four rounds testing intelligence, talent showcase, and adaptability under pressure.', teamSize: { min: 1, max: 1 }, registrationFee: 0 },
      { name: 'CodeBreaker Escape Room', department: 'AIML', category: 'Technical', shortDescription: 'Tech escape room', description: 'Mind Over Machine - thrilling tech event blending coding, logic, and creativity. Interactive escape room experience with AI prompts!', teamSize: { min: 3, max: 4 }, registrationFee: 0 },
      { name: 'Tandav Troupe', department: 'Common', category: 'Cultural', shortDescription: 'Group dance', description: 'Group dance event showcasing teamwork, coordination, and passion. Create powerful visual spectacle through synchronized performance!', teamSize: { min: 4, max: 7 }, registrationFee: 0 },
      { name: 'Checkmate Strategy', department: 'ECE', category: 'Non-Technical', shortDescription: 'Chess with challenges', description: 'Thrilling twist on traditional chess combining strategy, teamwork, and real-world challenges. Play chess while completing live tasks!', teamSize: { min: 4, max: 4 }, registrationFee: 0 },
      { name: 'ElectroQuest', department: 'ECE', category: 'Technical', shortDescription: 'Electronics treasure hunt', description: 'Three fun rounds testing thinking, logic, and practical abilities. From quiz to circuit puzzles, design and build working circuits!', teamSize: { min: 4, max: 4 }, registrationFee: 0 },
      { name: 'Dhwani Solo Singing', department: 'Common', category: 'Cultural', shortDescription: 'Solo singing competition', description: 'Solo Singing Competition with auditions and finale. Impress judges with vocal skills, song selection, and stage presence!', teamSize: { min: 1, max: 1 }, registrationFee: 0 },
      { name: 'Gaana Groove Group Singing', department: 'Common', category: 'Cultural', shortDescription: 'Group singing', description: 'Celebration of harmony, rhythm, and teamwork. Groups perform synchronized songs showcasing collaboration and musical talent!', teamSize: { min: 4, max: 7 }, registrationFee: 0 },
      { name: 'Corporate Carnival', department: 'ECE', category: 'Non-Technical', shortDescription: 'Business innovation event', description: 'Multi-round business event testing strategic thinking, creativity, and presentation. Pitch, design, strategize, and solve!', teamSize: { min: 2, max: 2 }, registrationFee: 0 },
      { name: 'Mock CID Investigation', department: 'Civil', category: 'Non-Technical', shortDescription: 'Case solving', description: 'Three rounds including quiz, treasure hunt, and case solving. Put your detective skills to test and solve mysteries!', teamSize: { min: 2, max: 3 }, registrationFee: 0 },
      { name: 'Spin to Win', department: 'Civil', category: 'Non-Technical', shortDescription: 'Wheel spinning game', description: 'Spin the wheel and complete fun tasks to win exciting gifts. Simple, fun, and rewarding!', teamSize: { min: 1, max: 1 }, registrationFee: 0 },
      { name: 'Design Dynamix AutoCAD', department: 'Civil', category: 'Technical', shortDescription: 'AutoCAD drafting', description: 'Draft floor plans and working drawings using AutoCAD. Showcase your technical drafting and design skills!', teamSize: { min: 1, max: 1 }, registrationFee: 0 },
      { name: 'Rapid Rush', department: 'Civil', category: 'Non-Technical', shortDescription: 'Multi-round challenge', description: 'Multi-round competition testing skills, strategy, and adaptability. Every round is a knockout challenge!', teamSize: { min: 2, max: 2 }, registrationFee: 0 },
      { name: 'Modulux Bridge Building', department: 'Civil', category: 'Technical', shortDescription: 'Bridge construction', description: 'Build bridge models using allowed materials. Test for strength, load capacity, design efficiency, and creativity!', teamSize: { min: 3, max: 4 }, registrationFee: 0 },
      { name: 'Poster Presentation Civil', department: 'Civil', category: 'Technical', shortDescription: 'Technical poster display', description: 'Prepare posters on A1 paper for selected technical topics. Present your ideas with clarity and technical depth!', teamSize: { min: 2, max: 2 }, registrationFee: 0 },
      { name: 'Videography Competition', department: 'Civil', category: 'Non-Technical', shortDescription: 'Video creation', description: 'Single-round videography competition testing creative skills and video production abilities. Capture campus life!', teamSize: { min: 2, max: 3 }, registrationFee: 0 },
    ];

    let added = 0;
    let errors = [];

    for (let i = 0; i < eventsData.length; i++) {
      const eventData = eventsData[i];
      
      try {
        const slug = eventData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const event = {
          ...eventData,
          slug,
          image: dummyImages[i % dummyImages.length],
          date: new Date('2025-03-15'),
          time: '10:00 AM',
          venue: 'JCER Campus',
          maxParticipants: 100,
          currentParticipants: 0,
          rules: ['Valid ID card required', 'Follow event coordinators instructions'],
          eligibility: ['Open to all college students'],
          prizes: { first: '₹1500', second: '₹1000' },
          coordinators: [],
          isActive: true,
          status: 'upcoming',
          onlineRegistrationOpen: true,
          isFeatured: false,
          createdBy: req.user._id
        };

        await Event.create(event);
        added++;
        console.log(`✅ Added: ${eventData.name} (${eventData.department})`);
      } catch (error) {
        if (error.code === 11000) {
          errors.push(`${eventData.name}: Already exists`);
        } else {
          errors.push(`${eventData.name}: ${error.message}`);
        }
        console.error(`❌ Error adding ${eventData.name}:`, error.message);
      }
    }

    console.log(`\n✅ Seeding complete! Added: ${added}, Errors: ${errors.length}`);

    res.json({
      success: true,
      message: 'Savishkar events seeded successfully!',
      added,
      total: eventsData.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Seed Savishkar events error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
