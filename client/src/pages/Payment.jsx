import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, Upload, CheckCircle, IndianRupee, Calendar, User, AlertCircle } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

const Payment = () => {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    utrNumber: '',
    screenshot: null
  });

  useEffect(() => {
    fetchRegistration();
  }, [registrationId]);

  const fetchRegistration = async () => {
    try {
      const { data } = await API.get(`/registrations/${registrationId}`);
      setRegistration(data.registration);
      
      if (data.registration.paymentStatus === 'completed') {
        showNotification({
          title: 'Payment Completed',
          message: 'Payment already completed',
          icon: CheckCircle,
          type: 'success'
        });
        navigate('/dashboard');
      } else if (data.registration.paymentStatus === 'verification_pending') {
        showNotification({
          title: 'Verification Pending',
          message: 'Payment proof already submitted. Awaiting verification.',
          icon: CheckCircle,
          type: 'info'
        });
        navigate('/dashboard');
      }
    } catch (error) {
      showNotification({
        title: 'Loading Failed',
        message: 'Failed to load registration details',
        icon: AlertCircle,
        type: 'error'
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size
      if (file.size > 5 * 1024 * 1024) {
        showNotification({
          title: 'File Too Large',
          message: 'File size should be less than 5MB',
          icon: AlertCircle,
          type: 'error'
        });
        return;
      }
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showNotification({
          title: 'Invalid File Type',
          message: 'Please upload a valid image file (JPG, PNG, or WebP)',
          icon: AlertCircle,
          type: 'error'
        });
        return;
      }
      setPaymentData({ ...paymentData, screenshot: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!paymentData.utrNumber) {
      showNotification({
        title: 'Missing Information',
        message: 'Please enter UTR/Transaction number',
        icon: AlertCircle,
        type: 'error'
      });
      return;
    }

    if (!paymentData.screenshot) {
      showNotification({
        title: 'Missing Screenshot',
        message: 'Please upload payment screenshot',
        icon: AlertCircle,
        type: 'error'
      });
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('registrationId', registrationId);
      formData.append('utrNumber', paymentData.utrNumber);
      formData.append('screenshot', paymentData.screenshot);
      formData.append('amount', registration.amount);

      console.log('Submitting payment proof:', {
        registrationId,
        utrNumber: paymentData.utrNumber,
        screenshotName: paymentData.screenshot.name,
        screenshotSize: paymentData.screenshot.size,
        amount: registration.amount
      });

      const response = await API.post('/payments/offline', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      console.log('Payment submission response:', response.data);

      showNotification({
        title: 'Payment Submitted Successfully!',
        message: 'Your payment proof has been submitted. We will verify it shortly. 🎉',
        icon: CheckCircle
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Payment submission error:', error);
      console.error('Error response:', error.response?.data);
      showNotification({
        title: 'Submission Failed',
        message: error.response?.data?.message || 'Payment submission failed',
        icon: AlertCircle,
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!registration) return null;

  return (
    <div className="min-h-screen pt-20 pb-12 relative">
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-2">Complete Payment</h1>
          <p className="text-gray-400 mb-8">Complete your registration by making the payment</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Details */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-primary-400" />
                Payment Details
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Event</span>
                  <span className="font-semibold">{registration.event?.name}</span>
                </div>
                <div className="pb-3 border-b border-white/10">
                  <div className="flex justify-center">
                    <div className="inline-block px-4 py-2 rounded-lg" style={{ 
                      background: 'linear-gradient(135deg, #FA812F 0%, #FAB12F 100%)',
                      boxShadow: '0 2px 8px rgba(250, 129, 47, 0.3)'
                    }}>
                      <div className="text-xs font-semibold mb-1" style={{ color: '#FEF3E2', opacity: 0.9, letterSpacing: '0.5px' }}>
                        PARTICIPANT ID
                      </div>
                      <div className="font-bold text-base" style={{ 
                        color: '#2C5F7F',
                        fontFamily: 'monospace',
                        letterSpacing: '0.5px'
                      }}>
                        {registration.registrationNumber || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
                {registration.teamName && (
                  <div className="flex justify-between items-center pb-3 border-b border-white/10">
                    <span className="text-gray-400">Team Name</span>
                    <span className="font-semibold">{registration.teamName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-gray-400">Amount</span>
                  <span className="text-2xl font-bold text-primary-400 flex items-center">
                    <IndianRupee className="w-5 h-5" />
                    {registration.amount}
                  </span>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="bg-white/5 rounded-lg p-6 mb-6">
                <h3 className="font-semibold mb-4 text-center">Scan QR Code to Pay</h3>
                <div className="bg-white rounded-lg p-4 mb-4">
                  {registration.event?.paymentQRCode ? (
                    <img 
                      src={getImageUrl(registration.event.paymentQRCode)} 
                      alt="Payment QR Code" 
                      className="w-full max-w-xs mx-auto"
                    />
                  ) : (
                    <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                      <p className="text-gray-600 text-center">QR Code<br/>Not Available</p>
                    </div>
                  )}
                </div>
                
                {registration.event?.paymentUPI && (
                  <div className="text-center">
                    <p className="text-sm text-gray-400 mb-1">UPI ID</p>
                    <p className="font-mono text-primary-400 font-semibold">
                      {registration.event.paymentUPI}
                    </p>
                  </div>
                )}
                
                {registration.event?.paymentAccountName && (
                  <div className="text-center mt-2">
                    <p className="text-sm text-gray-400 mb-1">Account Name</p>
                    <p className="font-semibold">{registration.event.paymentAccountName}</p>
                  </div>
                )}
              </div>

              {registration.event?.paymentInstructions && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                  <p className="text-sm text-yellow-200">{registration.event.paymentInstructions}</p>
                </div>
              )}
            </div>

            {/* Upload Form */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Upload className="w-6 h-6 mr-2 text-primary-400" />
                Upload Payment Proof
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* UTR Number */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    UTR/Transaction Number *
                  </label>
                  <input
                    type="text"
                    value={paymentData.utrNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, utrNumber: e.target.value })}
                    className="input-field"
                    placeholder="Enter 12-digit UTR number"
                    pattern="[0-9]{12}"
                    maxLength="12"
                    title="Please enter a valid 12-digit UTR number"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    You can find this in your payment confirmation message. Each UTR must be unique.
                  </p>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Payment Screenshot *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="screenshot-upload"
                    />
                    <label
                      htmlFor="screenshot-upload"
                      className="block w-full glass-effect border-2 border-dashed border-white/20 rounded-lg p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
                    >
                      {paymentData.screenshot ? (
                        <div className="space-y-2">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                          <p className="text-sm font-semibold text-green-400">
                            {paymentData.screenshot.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            Size: {(paymentData.screenshot.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-gray-400">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                          <p className="text-sm font-semibold">Click to upload screenshot</p>
                          <p className="text-xs text-gray-400">PNG, JPG, WebP up to 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
                  <p className="text-sm text-primary-200">
                    <strong>Important:</strong> Your payment will be verified by our team within 24 hours. 
                    You'll receive a confirmation email once verified.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Submit Payment</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payment;
