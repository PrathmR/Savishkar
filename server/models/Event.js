import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide event name'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    required: [true, 'Please provide event description']
  },
  shortDescription: {
    type: String,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  category: {
    type: String,
    required: [true, 'Please provide event category'],
    enum: ['Technical', 'Non-Technical', 'Cultural']
  },
  department: {
    type: String,
    enum: ['CSE', 'ECE', 'CSE(AIML)', 'CIVIL', 'Applied Science', 'Common', 'Mech', 'MBA']
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
  },
  gallery: [{
    type: String
  }],
  duration: {
    type: Number,
    comment: 'Duration in minutes'
  },
  date: {
    type: Date,
    required: [true, 'Please provide event date']
  },
  time: {
    type: String,
    required: [true, 'Please provide event time']
  },
  venue: {
    type: String,
    required: [true, 'Please provide event venue']
  },
  rules: [{
    type: String
  }],
  eligibility: [{
    type: String
  }],
  prizes: {
    first: String,
    second: String,
    third: String,
    other: [String]
  },
  teamSize: {
    min: {
      type: Number,
      default: 1
    },
    max: {
      type: Number,
      default: 1
    }
  },
  registrationFee: {
    type: Number,
    required: [true, 'Please provide registration fee'],
    default: 0
  },
  registrationDeadline: {
    type: Date
  },
  // Payment QR Code Details (for each event)
  paymentQRCode: {
    type: String,
    comment: 'URL or path to QR code image'
  },
  paymentUPI: {
    type: String,
    comment: 'UPI ID for this event'
  },
  paymentAccountName: {
    type: String,
    comment: 'Account holder name'
  },
  paymentInstructions: {
    type: String,
    comment: 'Special payment instructions for this event'
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  currentParticipants: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  onlineRegistrationOpen: {
    type: Boolean,
    default: true,
    comment: 'Controls whether users can register online for this event'
  },
  coordinators: [{
    name: String,
    phone: String,
    email: String,
    role: {
      type: String,
      enum: ['head', 'coordinator'],
      default: 'coordinator'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for registration status
eventSchema.virtual('isFull').get(function() {
  return this.currentParticipants >= this.maxParticipants;
});

// Method to increment participants
eventSchema.methods.incrementParticipants = async function() {
  this.currentParticipants += 1;
  await this.save();
};

const Event = mongoose.model('Event', eventSchema);

export default Event;
