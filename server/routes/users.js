import express from 'express';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
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
        avatar: user.avatar,
        bio: user.bio,
        role: user.role,
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

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, college, bio, avatar } = req.body;
    
    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (college) updateFields.college = college;
    if (bio) updateFields.bio = bio;
    if (avatar) updateFields.avatar = avatar;
    
    // Update without triggering password validation
    await User.updateOne(
      { _id: req.user._id },
      { $set: updateFields }
    );
    
    const user = await User.findById(req.user._id);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        college: user.college,
        avatar: user.avatar,
        bio: user.bio
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/users/upload-avatar-public
// @desc    Upload avatar during signup (public)
// @access  Public
router.post('/upload-avatar-public', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Cloudinary returns full URL in req.file.path, local storage uses filename
    const avatarUrl = req.file.path || `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/avatars/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload user avatar
// @access  Private
router.post('/upload-avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Cloudinary returns full URL in req.file.path, local storage uses filename
    const avatarUrl = req.file.path || `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/avatars/${req.file.filename}`;
    
    // Update without triggering validation
    await User.updateOne(
      { _id: req.user._id },
      { $set: { avatar: avatarUrl } }
    );

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatar: avatarUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-password');
    
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

export default router;
