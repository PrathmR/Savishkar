import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @route   GET /api/test/schemas
// @desc    Get all schema information
// @access  Public
router.get('/schemas', async (req, res) => {
  try {
    const schemas = {
      User: {
        fields: Object.keys(User.schema.paths),
        indexes: User.schema.indexes()
      },
      Event: {
        fields: Object.keys(Event.schema.paths),
        indexes: Event.schema.indexes()
      },
      Registration: {
        fields: Object.keys(Registration.schema.paths),
        indexes: Registration.schema.indexes()
      },
      Payment: {
        fields: Object.keys(Payment.schema.paths),
        indexes: Payment.schema.indexes()
      },
      Notification: {
        fields: Object.keys(Notification.schema.paths),
        indexes: Notification.schema.indexes()
      }
    };

    res.json({
      success: true,
      message: 'All schemas loaded successfully',
      schemas
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/test/collections
// @desc    Get all collections in database
// @access  Public
router.get('/collections', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    res.json({
      success: true,
      count: collections.length,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/test/create-sample-data
// @desc    Create sample data for testing
// @access  Public
router.post('/create-sample-data', async (req, res) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ email: 'test@savishkar.com' });
    
    if (!user) {
      // Create sample user
      user = await User.create({
        name: 'Test User',
        email: 'test@savishkar.com',
        password: 'test123',
        phone: '9999999999',
        college: 'Test College',
        isEmailVerified: true
      });
    }

    // Check if event already exists
    let event = await Event.findOne({ slug: 'sample-hackathon' });
    
    if (!event) {
      // Create sample event
      event = await Event.create({
        name: 'Sample Hackathon',
        slug: 'sample-hackathon',
        description: 'A sample hackathon event for testing',
        shortDescription: 'Test event',
        category: 'Technical',
        tags: ['coding', 'hackathon'],
        date: new Date('2025-03-15'),
        time: '9:00 AM',
        venue: 'Computer Lab',
        registrationFee: 500,
        teamSize: { min: 2, max: 4 },
        prizes: {
          first: '₹50,000',
          second: '₹30,000',
          third: '₹20,000'
        },
        maxParticipants: 100,
        isActive: true,
        isFeatured: true,
        status: 'upcoming'
      });
    }

    res.json({
      success: true,
      message: 'Sample data ready',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        event: {
          id: event._id,
          name: event.name,
          slug: event.slug
        }
      }
    });
  } catch (error) {
    console.error('Sample data error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString()
    });
  }
});

// @route   GET /api/test/stats
// @desc    Get database statistics
// @access  Public
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      events: await Event.countDocuments(),
      registrations: await Registration.countDocuments(),
      payments: await Payment.countDocuments(),
      notifications: await Notification.countDocuments()
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
