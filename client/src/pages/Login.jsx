import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowLeft, Eye, EyeOff, CheckCircle, AlertCircle, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for pending notification message
    const pendingNotification = localStorage.getItem('pendingNotification');
    if (pendingNotification) {
      const { type, title, message } = JSON.parse(pendingNotification);
      showNotification({
        title: title || (type === 'error' ? 'Error' : 'Success'),
        message: message,
        icon: type === 'error' ? AlertCircle : CheckCircle,
        type: type
      });
      localStorage.removeItem('pendingNotification');
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|net|edu|gov|mil|io|co)$/;
    if (!emailRegex.test(email)) {
      showNotification({
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Validation
    if (!validateEmail(formData.email)) {
      return false;
    }
    
    if (!formData.password || formData.password.length < 6) {
      showNotification({
        title: 'Invalid Password',
        message: 'Password must be at least 6 characters',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }

    setLoading(true);

    try {
      console.log('Attempting login for:', formData.email);
      await login(formData.email, formData.password);
      showNotification({
        title: 'Login Successful!',
        message: 'Welcome back to Savishkar 2025! 🎉',
        icon: CheckCircle
      });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      const errorStatus = error.response?.status;
      const userId = error.response?.data?.userId;
      const email = error.response?.data?.email || formData.email;
      const requiresVerification = error.response?.data?.requiresVerification;
      
      // Check if email is not verified (status 403 with requiresVerification flag or status 401 with userId)
      if ((errorStatus === 403 && requiresVerification) || (errorStatus === 401 && userId)) {
        console.log('Unverified email detected:', { userId, email });
        
        if (!userId) {
          console.error('No userId received from backend');
          showNotification({
            title: 'Email Not Verified',
            message: 'Your email is not verified. Please sign up again or contact support.',
            icon: AlertCircle,
            type: 'error'
          });
          setLoading(false);
          return;
        }
        
        showNotification({
          title: 'Email Not Verified',
          message: errorMessage || 'A new OTP has been sent to your email. Redirecting to verification page...',
          icon: AlertCircle,
          type: 'warning'
        });
        
        // Navigate to verify page after 2 seconds
        setTimeout(() => {
          console.log('Navigating to verify-otp with:', { email, userId });
          navigate('/verify-otp', { state: { email: email, userId: userId } });
          setLoading(false);
        }, 2000);
        return;
      }
      
      // Determine error message for other cases
      let displayMessage = errorMessage;
      let errorTitle = 'Login Failed';
      
      if (errorMessage.includes('Invalid email or password')) {
        errorTitle = 'Invalid Credentials';
        displayMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.code === 'ERR_NETWORK') {
        errorTitle = 'Connection Error';
        displayMessage = 'Cannot connect to server. Please ensure the backend is running.';
      }
      
      // Show notification for other errors
      showNotification({
        title: errorTitle,
        message: displayMessage,
        icon: AlertCircle,
        type: 'error'
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center mb-6 font-bold transition-colors" style={{ color: '#5C4033' }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="card">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-4"
            >
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #5C4033, #8b4513)' }}>
                <UserCircle className="w-10 h-10" style={{ color: '#FEF3E2' }} strokeWidth={1.5} />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Welcome Back</h2>
            <p className="font-semibold" style={{ color: '#5C4033' }}>Login to your Savishkar account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a365d' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#FA812F' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-12"
                  placeholder="your.email@example.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#1a365d' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#FA812F' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors" style={{ color: '#FA812F' }}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link to="/forgot-password" className="text-sm font-semibold transition-colors" style={{ color: '#1a365d' }}>
                Forgot Password?
              </Link>
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
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="font-semibold" style={{ color: '#5C4033' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-bold transition-colors" style={{ color: '#1a365d' }}>
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
