import express from 'express';
import Payment from '../models/Payment.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import { protect, authorize } from '../middleware/auth.js';
import { uploadPaymentScreenshot } from '../middleware/upload.js';

const router = express.Router();

// @route   POST /api/payments/create-order
// @desc    Create payment order and get QR code details
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { registrationId } = req.body;

    // Get registration details
    const registration = await Registration.findById(registrationId)
      .populate('event');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check if user owns this registration
    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if already paid
    if (registration.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Create payment record
    const payment = await Payment.create({
      user: req.user._id,
      registration: registrationId,
      event: registration.event._id,
      amount: registration.amount,
      status: 'created',
      method: 'upi'
    });

    // Get event-specific QR code details or use default
    const event = registration.event;
    
    // Get active QR code from the event
    const activeQR = event.getActiveQRCode();
    
    const paymentDetails = {
      paymentId: payment._id,
      amount: registration.amount,
      eventName: event.name,
      registrationNumber: registration.registrationNumber,
      // Use active QR code from qrCodes array, or fallback to legacy single QR code, or default
      qrCodeUrl: activeQR.qrCodeUrl || event.paymentQRCode || process.env.QR_CODE_URL || '/images/payment-qr.png',
      upiId: activeQR.upiId || event.paymentUPI || process.env.UPI_ID || 'savishkar@paytm',
      accountName: activeQR.accountName || event.paymentAccountName || 'Savishkar Techfest',
      instructions: event.paymentInstructions || [
        'Scan the QR code using any UPI app',
        'Enter the exact amount shown: ₹' + registration.amount,
        'Complete the payment',
        'Take a screenshot of the payment confirmation',
        'Upload the screenshot and enter UTR number below'
      ].join('\n')
    };

    res.json({
      success: true,
      message: 'Payment order created',
      paymentDetails
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/offline
// @desc    Submit offline payment proof (screenshot + UTR) - User submission
// @access  Private
router.post('/offline', protect, uploadPaymentScreenshot.single('screenshot'), async (req, res) => {
  try {
    const { registrationId, utrNumber, amount } = req.body;
    const screenshot = req.file;

    if (!registrationId || !utrNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide registration ID and UTR number'
      });
    }

    if (!screenshot) {
      return res.status(400).json({
        success: false,
        message: 'Please upload payment screenshot'
      });
    }

    // Find registration
    const registration = await Registration.findById(registrationId)
      .populate('event', 'name date time venue');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Check ownership
    if (registration.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Check if already paid
    if (registration.paymentStatus === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed'
      });
    }

    // Cloudinary returns full URL in screenshot.path, local storage uses filename
    const screenshotUrl = screenshot.path || `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/payments/${screenshot.filename}`;

    // Get the event to track which QR code was used
    const event = await Event.findById(registration.event._id);
    const activeQR = event ? event.getActiveQRCode() : null;
    
    // Prepare QR code tracking info
    const qrCodeUsed = activeQR ? {
      upiId: activeQR.upiId,
      accountName: activeQR.accountName,
      qrIndex: event.currentQRIndex
    } : undefined;

    // Create or update payment record
    let payment = await Payment.findOne({ registration: registrationId });
    
    if (!payment) {
      payment = await Payment.create({
        user: req.user._id,
        registration: registrationId,
        event: registration.event._id,
        amount: registration.amount,
        status: 'created',
        method: 'offline',
        utrNumber,
        screenshotUrl,
        transactionDate: new Date(),
        qrCodeUsed
      });
    } else {
      payment.utrNumber = utrNumber;
      payment.screenshotUrl = screenshotUrl;
      payment.transactionDate = new Date();
      payment.method = 'offline';
      payment.qrCodeUsed = qrCodeUsed;
      await payment.save();
    }

    // Update registration payment method and status
    registration.paymentMethod = 'offline';
    registration.paymentStatus = 'verification_pending';
    await registration.save();

    res.json({
      success: true,
      message: 'Payment proof submitted successfully! Awaiting admin verification.',
      payment: {
        id: payment._id,
        utrNumber: payment.utrNumber,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Offline payment submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payments/verify
// @desc    Submit payment proof (screenshot + UTR)
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const { paymentId, utrNumber, screenshotUrl, transactionDate } = req.body;

    if (!paymentId || !utrNumber || !screenshotUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide payment ID, UTR number, and screenshot'
      });
    }

    // Find payment
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Update payment with proof and auto-approve
    payment.utrNumber = utrNumber;
    payment.screenshotUrl = screenshotUrl;
    payment.transactionDate = transactionDate || new Date();
    payment.status = 'captured'; // Auto-approve
    payment.paidAt = new Date();
    await payment.save();

    // Update registration status to completed
    const registration = await Registration.findById(payment.registration)
      .populate('event', 'name date time venue');
    registration.paymentStatus = 'completed';
    registration.paymentId = paymentId;
    registration.paidAt = new Date();
    await registration.save();

    // Send confirmation email
    try {
      const emailContent = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 30px; border-radius: 12px; border: 2px solid #2d7a3e;">
          <h1 style="color: #1e40af; text-align: center; margin-bottom: 20px; font-size: 28px;">Payment Confirmed! ✅</h1>
          <p style="color: #2C1810; font-size: 16px;">Hi ${req.user.name},</p>
          <p style="color: #2C1810;">Your payment has been successfully verified and your registration is now confirmed!</p>
          
          <div style="background: #f5f5dc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #8b4513;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">Payment Details:</h3>
            <p style="color: #2C1810;"><strong>UTR Number:</strong> <span style="color: #8b4513;">${utrNumber}</span></p>
            <p style="color: #2C1810;"><strong>Amount:</strong> <span style="color: #8b4513; font-size: 18px;">₹${payment.amount}</span></p>
            <p style="color: #2C1810;"><strong>Event:</strong> ${registration.event.name}</p>
            <p style="color: #2C1810;"><strong>Date:</strong> ${new Date(registration.event.date).toLocaleDateString('en-IN')}</p>
            <p style="color: #2C1810;"><strong>Time:</strong> ${registration.event.time}</p>
            <p style="color: #2C1810;"><strong>Venue:</strong> ${registration.event.venue}</p>
            <p style="color: #2C1810;"><strong>Registration Number:</strong> <span style="color: #8b4513;">${registration.registrationNumber}</span></p>
          </div>
          
          <div style="background: rgba(45, 122, 62, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #2d7a3e; margin: 20px 0;">
            <p style="color: #2d7a3e; margin: 0; font-weight: bold; text-align: center; font-size: 16px;"><strong>✅ Your registration is confirmed! See you at the event!</strong></p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 2px solid #5C4033;">
          <p style="color: #5C4033; font-size: 12px; text-align: center; font-weight: 600;">Savishkar 2025 - Where Innovation Meets Excellence</p>
        </div>
      `;

      const sendEmail = (await import('../utils/sendEmail.js')).default;
      await sendEmail({
        email: req.user.email,
        subject: `Payment Confirmed - ${registration.event.name}`,
        html: emailContent
      });

      console.log('✅ Payment confirmation email sent to', req.user.email);
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified successfully! Your registration is confirmed.',
      payment: {
        id: payment._id,
        status: payment.status,
        utrNumber: payment.utrNumber,
        paidAt: payment.paidAt
      },
      registration: {
        registrationNumber: registration.registrationNumber,
        paymentStatus: registration.paymentStatus
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/my
// @desc    Get user's payments
// @access  Private
router.get('/my', protect, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('event', 'name date')
      .populate('registration', 'registrationNumber')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/all
// @desc    Get all payments (Admin)
// @access  Private/Admin
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) {
      query.status = status;
    }

    const payments = await Payment.find(query)
      .populate('user', 'name email phone college')
      .populate('event', 'name date')
      .populate('registration', 'registrationNumber teamName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/:id
// @desc    Get single payment details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('event', 'name date venue')
      .populate('registration', 'registrationNumber teamName')
      .populate('user', 'name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check if user owns this payment or is admin
    if (payment.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.json({
      success: true,
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/payments/:id/approve
// @desc    Approve payment (Admin)
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event', 'name date time venue');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'captured';
    payment.paidAt = new Date();
    payment.verifiedBy = req.user._id;
    
    // Update registration in parallel
    const [savedPayment, registration] = await Promise.all([
      payment.save(),
      Registration.findByIdAndUpdate(
        payment.registration,
        { 
          paymentStatus: 'completed',
          paidAt: new Date()
        },
        { new: true }
      )
    ]);

    // Increment QR code usage for the event (async, non-blocking)
    setImmediate(async () => {
      try {
        const event = await Event.findById(payment.event);
        if (event) {
          await event.incrementQRUsage();
          console.log(`✅ QR usage incremented for event: ${event.name}`);
        }
      } catch (error) {
        console.error('❌ Error incrementing QR usage:', error.message);
      }
    });

    // Send response immediately, then send email asynchronously
    res.json({
      success: true,
      message: 'Payment approved successfully',
      payment: savedPayment
    });

    // Send confirmation email asynchronously (non-blocking)
    setImmediate(async () => {
      try {
        const emailContent = `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 30px; border-radius: 12px; border: 2px solid #2d7a3e;">
            <h1 style="color: #1e40af; text-align: center; margin-bottom: 20px; font-size: 28px;">Payment Approved! ✅</h1>
            <p style="color: #2C1810; font-size: 16px;">Hi ${payment.user.name},</p>
            <p style="color: #2C1810;">Great news! Your payment has been verified and approved by our admin team.</p>
            
            <div style="background: #f5f5dc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #8b4513;">
              <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">Payment Details:</h3>
              <p style="color: #2C1810;"><strong>UTR Number:</strong> <span style="color: #8b4513;">${payment.utrNumber}</span></p>
              <p style="color: #2C1810;"><strong>Amount:</strong> <span style="color: #8b4513; font-size: 18px;">₹${payment.amount}</span></p>
              <p style="color: #2C1810;"><strong>Event:</strong> ${payment.event.name}</p>
              <p style="color: #2C1810;"><strong>Date:</strong> ${new Date(payment.event.date).toLocaleDateString('en-IN')}</p>
              <p style="color: #2C1810;"><strong>Time:</strong> ${payment.event.time}</p>
              <p style="color: #2C1810;"><strong>Venue:</strong> ${payment.event.venue}</p>
              <p style="color: #2C1810;"><strong>Registration Number:</strong> <span style="color: #8b4513;">${registration.registrationNumber}</span></p>
            </div>
            
            <div style="background: rgba(45, 122, 62, 0.1); padding: 20px; border-radius: 10px; border-left: 4px solid #2d7a3e; margin: 20px 0;">
              <p style="color: #2d7a3e; margin: 0; font-weight: bold; text-align: center; font-size: 16px;"><strong>✅ Your registration is confirmed! See you at the event!</strong></p>
            </div>
            
            <hr style="margin: 30px 0; border: none; border-top: 2px solid #5C4033;">
            <p style="color: #5C4033; font-size: 12px; text-align: center; font-weight: 600;">Savishkar 2025 - Where Innovation Meets Excellence</p>
          </div>
        `;

        const sendEmail = (await import('../utils/sendEmail.js')).default;
        await sendEmail({
          email: payment.user.email,
          subject: `Payment Approved - ${payment.event.name}`,
          html: emailContent
        });

        console.log('✅ Payment approval email sent to', payment.user.email);
      } catch (emailError) {
        console.error('❌ Email error:', emailError.message);
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/payments/:id/reject
// @desc    Reject payment (Admin)
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { reason } = req.body;

    const payment = await Payment.findById(req.params.id)
      .populate('user', 'name email')
      .populate('event', 'name date time venue');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Get registration before deleting
    const registration = await Registration.findById(payment.registration)
      .populate('event', 'name date time venue currentParticipants');

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    // Store event info for email
    const eventInfo = {
      name: payment.event.name,
      date: payment.event.date,
      time: payment.event.time,
      venue: payment.event.venue
    };
    
    // Store event ID before deletion
    const eventId = registration.event._id;

    // Update payment status
    payment.status = 'failed';
    payment.rejectionReason = reason || 'Payment verification failed';
    payment.verifiedBy = req.user._id;
    await payment.save();

    // Delete the registration to free up the slot
    await Registration.findByIdAndDelete(payment.registration);

    // Decrease event participant count AFTER deleting registration
    const event = await Event.findById(eventId);
    if (event && event.currentParticipants > 0) {
      event.currentParticipants -= 1;
      await event.save();
      console.log(`✅ Decreased participant count for event ${event.name}: ${event.currentParticipants}`);
    }

    // Send rejection email to user
    try {
      const emailContent = `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FEF3E2; padding: 30px; border-radius: 12px; border: 2px solid #8b4513;">
          <h1 style="color: #1e40af; text-align: center; margin-bottom: 20px; font-size: 28px;">Payment Verification Failed ❌</h1>
          <p style="color: #2C1810; font-size: 16px;">Hi ${payment.user.name},</p>
          <p style="color: #2C1810;">We regret to inform you that your payment verification was unsuccessful, and your registration has been cancelled.</p>
          
          <div style="background: rgba(139, 69, 19, 0.15); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #8b4513;">
            <h3 style="margin-top: 0; color: #8b4513; font-size: 18px;">Reason:</h3>
            <p style="color: #2C1810; font-weight: bold;">${payment.rejectionReason}</p>
          </div>

          <div style="background: #f5f5dc; padding: 25px; border-radius: 10px; margin: 25px 0; border: 2px solid #8b4513;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 20px;">Payment Details:</h3>
            <p style="color: #2C1810;"><strong>UTR Number:</strong> <span style="color: #8b4513;">${payment.utrNumber || 'N/A'}</span></p>
            <p style="color: #2C1810;"><strong>Amount:</strong> <span style="color: #8b4513; font-size: 18px;">₹${payment.amount}</span></p>
            <p style="color: #2C1810;"><strong>Event:</strong> ${eventInfo.name}</p>
            <p style="color: #2C1810;"><strong>Registration Number:</strong> <span style="color: #8b4513;">${registration.registrationNumber}</span></p>
          </div>
          
          <div style="background: rgba(139, 69, 19, 0.1); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #8b4513;">
            <h3 style="margin-top: 0; color: #8b4513; font-size: 18px;">⚠️ Registration Cancelled</h3>
            <p style="color: #2C1810;">Your registration for <strong style="color: #1e40af;">${eventInfo.name}</strong> has been removed from our system.</p>
            <p style="color: #2C1810;">This means you can now:</p>
            <ul style="color: #2C1810;">
              <li>Register for this event again with correct payment details</li>
              <li>Register for other events, even if they have the same timing</li>
            </ul>
          </div>
          
          <div style="background: #f5f5dc; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #5C4033;">
            <h3 style="margin-top: 0; color: #1e40af; font-size: 18px;">What to do next?</h3>
            <p style="color: #2C1810;">If you still want to participate in <strong style="color: #1e40af;">${eventInfo.name}</strong>, please:</p>
            <ol style="color: #2C1810;">
              <li>Register for the event again from the Events page</li>
              <li>Make the payment with correct details</li>
              <li>Ensure the screenshot is clear and readable</li>
              <li>Verify the UTR number is correct (12 digits)</li>
              <li>Make sure the payment amount matches exactly</li>
            </ol>
            <p style="color: #2C1810;"><strong>Note:</strong> You are now free to register for any other event as well!</p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 2px solid #5C4033;">
          <p style="color: #5C4033; font-size: 12px; text-align: center; font-weight: 600;">Savishkar 2025 - Where Innovation Meets Excellence</p>
        </div>
      `;

      const sendEmail = (await import('../utils/sendEmail.js')).default;
      await sendEmail({
        email: payment.user.email,
        subject: `Payment Verification Failed - ${payment.event.name}`,
        html: emailContent
      });

      console.log('✅ Payment rejection email sent to', payment.user.email);
    } catch (emailError) {
      console.error('❌ Email error:', emailError.message);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Payment rejected',
      payment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/payments/event/:eventId
// @desc    Get all payments for an event (Admin)
// @access  Private/Admin
router.get('/event/:eventId', protect, authorize('admin'), async (req, res) => {
  try {
    const payments = await Payment.find({ event: req.params.eventId })
      .populate('user', 'name email phone')
      .populate('registration', 'registrationNumber teamName')
      .sort({ createdAt: -1 });

    const stats = {
      total: payments.length,
      completed: payments.filter(p => p.status === 'captured').length,
      pending: payments.filter(p => p.status === 'pending_verification').length,
      failed: payments.filter(p => p.status === 'failed').length,
      totalAmount: payments
        .filter(p => p.status === 'captured')
        .reduce((sum, p) => sum + p.amount, 0)
    };

    res.json({
      success: true,
      stats,
      payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
