import express from 'express';
import fs from 'fs';
import ExcelJS from 'exceljs';
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

// @route   POST /api/admin/import-events-csv
// @desc    Import events from CSV file
// @access  Private/Admin
router.post('/import-events-csv', protect, authorize('admin'), async (req, res) => {
  try {
    const csvFilePath = 'D:\\code3\\Savishkar detail final submission form (Responses).csv';
    const xlsxFilePath = 'D:\\code3\\Savishkar detail final submission form (Responses).xlsx';
    
    if (!fs.existsSync(csvFilePath) && !fs.existsSync(xlsxFilePath)) {
      return res.status(404).json({
        success: false,
        message: 'Neither CSV nor XLSX file found at expected paths'
      });
    }
    
    // Helper functions
    const parseTeamSize = (teamSizeStr) => {
      if (!teamSizeStr) return { min: 1, max: 1 };
      const str = teamSizeStr.toString().toLowerCase();
      let min = 1, max = 1;
      const minMatch = str.match(/minimum\s*:?\s*(\d+)/i);
      if (minMatch) min = parseInt(minMatch[1]);
      const maxMatch = str.match(/maximum\s*:?\s*(\d+)/i);
      if (maxMatch) {
        max = parseInt(maxMatch[1]);
      } else if (str.includes('maximum') && !str.includes('minimum')) {
        const numMatch = str.match(/(\d+)/);
        if (numMatch) {
          max = parseInt(numMatch[1]);
          min = 1;
        }
      }
      if (!minMatch && !maxMatch) {
        const numMatch = str.match(/(\d+)/);
        if (numMatch) {
          const num = parseInt(numMatch[1]);
          min = num;
          max = num;
        }
      }
      return { min, max };
    };
    
    // Helper to pick first available non-empty value from multiple header keys
    const getFirst = (row, keys = []) => {
      for (const k of keys) {
        if (k in row && row[k] !== undefined && String(row[k]).trim() !== '') {
          return row[k];
        }
      }
      return '';
    };
    
    const parsePrizes = (prizeStr) => {
      if (!prizeStr) return {};
      const prizes = {};
      const str = prizeStr.toString();
      const firstMatch = str.match(/1st\s*:?\s*[₹rs]*\s*(\d+)/i);
      if (firstMatch) prizes.first = `₹${firstMatch[1]}`;
      const secondMatch = str.match(/2nd\s*:?\s*[₹rs]*\s*(\d+)/i);
      if (secondMatch) prizes.second = `₹${secondMatch[1]}`;
      const thirdMatch = str.match(/3rd\s*:?\s*[₹rs]*\s*(\d+)/i);
      if (thirdMatch) prizes.third = `₹${thirdMatch[1]}`;
      return prizes;
    };
    
    const parseDate = (dateStr) => {
      if (!dateStr) return new Date('2025-11-12');
      const str = dateStr.toString().trim();
      const parts = str.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]);
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        return new Date(year, month - 1, day);
      }
      return new Date(str);
    };
    
    const parseRegistrationFee = (feeStr) => {
      if (!feeStr) return 0;
      const match = feeStr.toString().match(/(\d+)/);
      return match ? parseInt(match[1]) : 0;
    };
    
    const parseMaxParticipants = (maxStr) => {
      if (!maxStr) return 100;
      const match = maxStr.toString().match(/(\d+)/);
      return match ? parseInt(match[1]) : 100;
    };
    
    const normalizeCategory = (category) => {
      if (!category) return 'Technical';
      const cat = category.toString().trim();
      if (cat.toLowerCase().includes('technical') && !cat.toLowerCase().includes('non')) {
        return 'Technical';
      } else if (cat.toLowerCase().includes('non')) {
        return 'Non-Technical';
      } else if (cat.toLowerCase().includes('cultural')) {
        return 'Cultural';
      }
      return 'Technical';
    };
    
    const normalizeDepartment = (dept) => {
      if (!dept) return 'Common';
      const deptStr = dept.toString().trim().toUpperCase();
      const deptMap = {
        'AIML': 'AIML',
        'CSE': 'CSE',
        'ECE': 'ECE',
        'MECH': 'Mech',
        'MECHANICAL': 'Mech',
        'CIVIL': 'Civil',
        'MBA': 'MBA',
        'APPLIED SCIENCE': 'Applied Science',
        'COMMON': 'Common'
      };
      return deptMap[deptStr] || 'Common';
    };
    
    const parseCoordinators = (nameStr, phoneStr, emailStr) => {
      const coordinators = [];
      if (!nameStr) return coordinators;
      const names = nameStr.toString().split(/[,&;]|and/i).map(n => n.trim()).filter(n => n);
      const phones = phoneStr ? phoneStr.toString().split(/[,&;]/).map(p => p.trim()).filter(p => p) : [];
      const emails = emailStr ? emailStr.toString().split(/[,&;]/).map(e => e.trim()).filter(e => e) : [];
      names.forEach((name, index) => {
        coordinators.push({
          name: name,
          phone: phones[index] || '',
          email: emails[index] || '',
          role: index === 0 ? 'head' : 'coordinator'
        });
      });
      return coordinators;
    };
    
    const dummyImages = {
      Technical: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
      'Non-Technical': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      Cultural: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800',
      default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
    };
    
    // Parse CSV
    const parseCSV = (filePath) => {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let char of lines[i]) {
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        values.push(current.trim());
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
      return data;
    };

    // Parse XLSX using ExcelJS (assumes header row at row 1)
    const parseXLSX = async (filePath) => {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
      const worksheet = workbook.worksheets[0];
      if (!worksheet) return [];
      
      // Read headers from first row
      const headerRow = worksheet.getRow(1);
      const headers = [];
      headerRow.eachCell((cell, colNumber) => {
        headers[colNumber] = String(cell.text || cell.value || '').trim();
      });
      
      const data = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // skip header
        const obj = {};
        row.eachCell((cell, colNumber) => {
          const key = headers[colNumber];
          if (!key) return;
          obj[key] = String(cell.text ?? cell.value ?? '').trim();
        });
        // skip empty rows
        if (Object.values(obj).some(v => v && v.length > 0)) {
          data.push(obj);
        }
      });
      return data;
    };
    
    let rows = [];
    if (fs.existsSync(csvFilePath)) {
      rows = rows.concat(parseCSV(csvFilePath));
    }
    if (fs.existsSync(xlsxFilePath)) {
      const xrows = await parseXLSX(xlsxFilePath);
      rows = rows.concat(xrows);
    }
    const uniqueEvents = new Map();
    
    for (const row of rows) {
      const eventName = String(getFirst(row, ['Event name', 'Event Name', 'Name', 'Event'])).trim();
      if (!eventName || eventName.toLowerCase().includes('event name')) {
        continue;
      }
      
      const category = normalizeCategory(getFirst(row, ['Event Category', 'Category', 'Event category']));
      const department = normalizeDepartment(getFirst(row, ['Event department ', 'Event department', 'Department', 'Event Department']));
      const teamSize = parseTeamSize(row['Team size (minimum  & maximum)\nIf team event \nExample :  Minimum : 2\n                   Maximum : 4\nIf individual type : 1\n']);
      const prizes = parsePrizes(row['Prizes\nExample : 1st : 1500rs \n                  2nd : 1000rs ']);
      const date = parseDate(getFirst(row, ['Event date ', 'Event Date', 'Date']));
      const registrationFee = parseRegistrationFee(getFirst(row, ['Registration fee', 'Registration Fee', 'Fee']));
      const maxParticipants = parseMaxParticipants(getFirst(row, ['Maximum team slots ', 'Max Participants']));
      const coordinators = parseCoordinators(
        getFirst(row, ['Event Coordinators  Name ', 'Event Coordinators Name', 'Coordinators Name', 'Coordinator Name']),
        getFirst(row, ['Event Coordinators contact number', 'Event Coordinators Contact', 'Coordinator Contact']),
        getFirst(row, ['Event Coordinators E-mail', 'Event Coordinators Email', 'Coordinator Email'])
      );
      
      const event = {
        name: eventName,
        description: getFirst(row, ['Full description\nDescribe you event in detail around a paragraph.', 'Description', 'Full Description']) || getFirst(row, ['Short description \nexample :  hackathon, solo dance, singing, bgmi, ']) || 'Event description',
        shortDescription: getFirst(row, ['Short description \nexample :  hackathon, solo dance, singing, bgmi, ', 'Short Description', 'Tagline']) || eventName,
        category: category,
        department: department,
        image: dummyImages[category] || dummyImages.default,
        date: date,
        time: getFirst(row, ['Event start time', 'Time']) || '10:00 AM',
        venue: getFirst(row, ['Venue\nExample: classroom number, quadrangle etc\n', 'Venue']) || 'TBA',
        registrationFee: registrationFee,
        maxParticipants: maxParticipants,
        teamSize: teamSize,
        prizes: prizes,
        coordinators: coordinators,
        rules: [],
        eligibility: ['Open to all students'],
        isActive: true,
        status: 'upcoming',
        onlineRegistrationOpen: true,
        tags: [category.toLowerCase(), department.toLowerCase()],
        slug: eventName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      };
      
      uniqueEvents.set(eventName, event);
    }
    
    const finalEvents = Array.from(uniqueEvents.values());
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const event of finalEvents) {
      try {
        await Event.findOneAndUpdate(
          { name: event.name },
          event,
          { upsert: true, new: true }
        );
        successCount++;
      } catch (error) {
        errorCount++;
        errors.push({ event: event.name, error: error.message });
      }
    }
    
    // Department summary
    const deptCounts = {};
    finalEvents.forEach(event => {
      deptCounts[event.department] = (deptCounts[event.department] || 0) + 1;
    });
    
    res.json({
      success: true,
      message: `Successfully imported ${successCount} events`,
      stats: {
        totalParsed: finalEvents.length,
        successCount,
        errorCount,
        byDepartment: deptCounts
      },
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Import events error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
