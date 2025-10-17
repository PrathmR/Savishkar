import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import toast from 'react-hot-toast';
import API from '../services/api';

const VerifyOTP = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { verifyOTP } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, email } = location.state || {};

  useEffect(() => {
    if (!userId) {
      console.error('No userId provided to VerifyOTP page');
      console.log('Location state:', location.state);
      showNotification({
        title: 'Invalid Request',
        message: 'Invalid verification request. Please sign up or login again.',
        icon: AlertCircle,
        type: 'error'
      });
      setTimeout(() => {
        navigate('/signup');
      }, 2000);
    } else {
      console.log('VerifyOTP page loaded with userId:', userId, 'email:', email);
    }
  }, [userId, navigate, location.state, email, showNotification]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      showNotification({
        title: 'Invalid OTP',
        message: 'Please enter a 6-digit OTP',
        icon: AlertCircle,
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      await verifyOTP(userId, otp);
      showNotification({
        title: 'Email Verified Successfully!',
        message: 'Your email has been verified. Welcome to Savishkar 2025! 🎊',
        icon: CheckCircle
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      showNotification({
        title: 'Verification Failed',
        message: error.response?.data?.message || 'Invalid OTP',
        icon: AlertCircle,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResending(true);

    try {
      await API.post('/auth/resend-otp', { userId });
      showNotification({
        title: 'OTP Sent!',
        message: 'New OTP sent to your email',
        icon: CheckCircle,
        type: 'success'
      });
      setCountdown(60);
    } catch (error) {
      showNotification({
        title: 'Failed to Resend',
        message: error.response?.data?.message || 'Failed to resend OTP',
        icon: AlertCircle,
        type: 'error'
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <Link to="/signup" className="inline-flex items-center text-amber-700 hover:text-amber-600 mb-6 transition-colors font-bold">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Signup
        </Link>

        <div className="card">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center mx-auto">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#5C4033' }}>Verify Your Email</h2>
            <p className="text-gray-300">
              We've sent a 6-digit OTP to<br />
              <span className="text-white font-semibold">{email}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium mb-2 text-center text-white">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength="6"
                required
              />
              <p className="text-xs text-gray-400 text-center mt-2">
                OTP expires in 10 minutes
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Verify Email</span>
                </>
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm mb-2">
              Didn't receive the OTP?
            </p>
            <button
              onClick={handleResendOTP}
              disabled={resending || countdown > 0}
              className={`text-amber-700 hover:text-amber-600 hover:underline font-semibold transition-colors ${
                (resending || countdown > 0) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {resending ? 'Sending...' : countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyOTP;
