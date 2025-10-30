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
    enum: ['AIML', 'CSE', 'ECE', 'Mech', 'Civil', 'MBA', 'Applied Science', 'Common']
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
    comment: 'URL or path to QR code image (legacy - kept for backward compatibility)'
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
  // Multiple QR Codes with automatic switching
  qrCodes: [{
    qrCodeUrl: {
      type: String,
      required: true,
      comment: 'URL or path to QR code image'
    },
    upiId: {
      type: String,
      comment: 'UPI ID for this QR code'
    },
    accountName: {
      type: String,
      comment: 'Account holder name for this QR code'
    },
    usageCount: {
      type: Number,
      default: 0,
      comment: 'Number of payments using this QR code'
    },
    maxUsage: {
      type: Number,
      default: 40,
      comment: 'Maximum number of payments before switching to next QR code'
    },
    isActive: {
      type: Boolean,
      default: true,
      comment: 'Whether this QR code is currently active'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  currentQRIndex: {
    type: Number,
    default: 0,
    comment: 'Index of currently active QR code'
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

// Method to get active QR code
eventSchema.methods.getActiveQRCode = function() {
  // If new qrCodes array exists and has items, use it
  if (this.qrCodes && this.qrCodes.length > 0) {
    const activeQR = this.qrCodes[this.currentQRIndex];
    if (activeQR && activeQR.isActive) {
      return {
        qrCodeUrl: activeQR.qrCodeUrl,
        upiId: activeQR.upiId,
        accountName: activeQR.accountName,
        usageCount: activeQR.usageCount,
        maxUsage: activeQR.maxUsage
      };
    }
  }
  
  // Fallback to legacy single QR code
  return {
    qrCodeUrl: this.paymentQRCode,
    upiId: this.paymentUPI,
    accountName: this.paymentAccountName,
    usageCount: 0,
    maxUsage: 0
  };
};

// Method to increment QR code usage and switch if needed
eventSchema.methods.incrementQRUsage = async function() {
  if (!this.qrCodes || this.qrCodes.length === 0) {
    return; // No QR codes to manage
  }
  
  const currentQR = this.qrCodes[this.currentQRIndex];
  if (!currentQR) return;
  
  // Increment usage count
  currentQR.usageCount += 1;
  
  // Check if we need to switch to next QR code
  if (currentQR.usageCount >= currentQR.maxUsage) {
    // Find next active QR code
    let nextIndex = this.currentQRIndex + 1;
    while (nextIndex < this.qrCodes.length) {
      if (this.qrCodes[nextIndex].isActive) {
        this.currentQRIndex = nextIndex;
        console.log(`✅ Switched to QR code ${nextIndex + 1} for event ${this.name}`);
        break;
      }
      nextIndex++;
    }
    
    // If no more QR codes available, keep using the last one
    if (nextIndex >= this.qrCodes.length) {
      console.log(`⚠️ No more QR codes available for event ${this.name}, continuing with current`);
    }
  }
  
  await this.save();
};

const Event = mongoose.model('Event', eventSchema);

export default Event;
