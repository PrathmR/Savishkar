import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  teamName: {
    type: String,
    trim: true
  },
  isTeamLeader: {
    type: Boolean,
    default: true
  },
  teamMembers: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    college: String,
    year: String,
    isExternal: {
      type: Boolean,
      default: false
    }
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'verification_pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'offline', 'free'],
    default: 'razorpay'
  },
  paymentId: String,
  orderId: String,
  signature: String,
  amount: {
    type: Number,
    required: true
  },
  paidAt: Date,
  registrationNumber: {
    type: String,
    unique: true
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'cancelled', 'attended', 'no-show'],
    default: 'registered'
  },
  specialRequirements: String,
  emergencyContact: {
    name: String,
    phone: String,
    relation: String
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: Date,
  checkedInBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

const Registration = mongoose.model('Registration', registrationSchema);

export default Registration;
