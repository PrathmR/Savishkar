import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  email: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['otp', 'registration', 'payment', 'reminder', 'update', 'cancellation'],
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'failed'],
    default: 'pending'
  },
  sentAt: Date,
  error: String,
  
  // Read status for in-app notifications
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  
  // Related data
  relatedEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  relatedRegistration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ status: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
