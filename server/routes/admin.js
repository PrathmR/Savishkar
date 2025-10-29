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

export default router;
