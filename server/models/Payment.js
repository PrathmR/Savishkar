import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registration: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Registration',
    required: true
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  // Razorpay Details
  razorpayOrderId: {
    type: String,
    unique: true,
    sparse: true
  },
  razorpayPaymentId: {
    type: String,
    unique: true,
    sparse: true
  },
  razorpaySignature: String,
  
  // Manual Payment Verification (QR Code)
  utrNumber: {
    type: String,
    trim: true
  },
  screenshotUrl: {
    type: String
  },
  transactionDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: String,
  
  // QR Code tracking
  qrCodeUsed: {
    upiId: String,
    accountName: String,
    qrIndex: Number
  },
  
  status: {
    type: String,
    enum: ['created', 'captured', 'failed', 'refunded'],
    default: 'created'
  },
  method: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'offline'],
  },
  
  // Refund details
  refundId: String,
  refundAmount: Number,
  refundReason: String,
  refundedAt: Date,
  
  paidAt: Date
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ user: 1 });
paymentSchema.index({ registration: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
