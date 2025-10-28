import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Phone, Building2, UserPlus, ArrowLeft, Camera, X, Eye, EyeOff, CheckCircle, AlertCircle, UserCircle, Video, Image as ImageIcon, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import colleges from '../data/colleges';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    college: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [stream, setStream] = useState(null);
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const { signup } = useAuth();
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

  // Check if email already exists (silent check, no notification)
  const checkEmailExists = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailExists(false);
      return;
    }

    setCheckingEmail(true);
    try {
      const { data } = await API.post('/auth/check-email', { email: email.toLowerCase() });
      setEmailExists(data.exists);
      // No notification here - only show on form submission
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailExists(false);
    } finally {
      setCheckingEmail(false);
    }
  };

  // Check if phone already exists (silent check, no notification)
  const checkPhoneExists = async (phone) => {
    if (!phone || phone.length !== 10) {
      setPhoneExists(false);
      return;
    }

    setCheckingPhone(true);
    try {
      const { data } = await API.post('/auth/check-phone', { phone });
      setPhoneExists(data.exists);
      // No notification here - only show on form submission
    } catch (error) {
      console.error('Error checking phone:', error);
      setPhoneExists(false);
    } finally {
      setCheckingPhone(false);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      
      // Wait for next tick to ensure modal is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(err => {
            console.error('Error playing video:', err);
          });
        }
      }, 100);
    } catch (error) {
      console.error('Camera access error:', error);
      showNotification({
        title: 'Camera Access Denied',
        message: error.name === 'NotAllowedError' 
          ? 'Please allow camera access in your browser settings' 
          : 'Unable to access camera. Please check your device.',
        icon: AlertCircle,
        type: 'error'
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
      
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append('avatar', file);

      try {
        const { data } = await API.post('/users/upload-avatar-public', formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
        showNotification({
          title: 'Photo Captured!',
          message: 'Profile picture uploaded successfully!',
          icon: CheckCircle,
          type: 'success'
        });
        stopCamera();
      } catch (error) {
        showNotification({
          title: 'Upload Failed',
          message: 'Failed to upload captured photo',
          icon: AlertCircle,
          type: 'error'
        });
        setFormData(prev => ({ ...prev, avatar: '' }));
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.95);
  };

  useEffect(() => {
    // Connect stream to video element when both are available
    if (stream && videoRef.current && showCamera) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }
  }, [stream, showCamera]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Lock body scroll when camera modal is open
  useEffect(() => {
    if (showCamera) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCamera]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification({
        title: 'Invalid File',
        message: 'Please select an image file',
        icon: AlertCircle,
        type: 'error'
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        title: 'File Too Large',
        message: 'Image size should be less than 5MB',
        icon: AlertCircle,
        type: 'error'
      });
      return;
    }

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload image to server
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('avatar', file);

    try {
      console.log('Attempting to upload avatar...');
      const { data } = await API.post('/users/upload-avatar-public', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      console.log('Signup avatar upload response:', data);
      console.log('Avatar URL:', data.avatarUrl);
      
      // Update with server URL
      setFormData(prev => ({ ...prev, avatar: data.avatarUrl }));
      showNotification({
        title: 'Upload Successful!',
        message: 'Profile picture uploaded!',
        icon: CheckCircle,
        type: 'success'
      });
    } catch (error) {
      console.error('Signup avatar upload error:', error);
      console.error('Error details:', error.response?.data);
      showNotification({
        title: 'Upload Failed',
        message: error.response?.data?.message || 'Failed to upload image. You can still continue signup.',
        icon: AlertCircle,
        type: 'error'
      });
      // Keep the preview but don't set avatar URL
      setFormData(prev => ({ ...prev, avatar: '' }));
    } finally {
      setUploading(false);
    }
  };

  const validateName = (name) => {
    if (name.length < 2 || name.length > 50) {
      showNotification({
        title: 'Invalid Name',
        message: 'Name must be between 2-50 characters',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
      showNotification({
        title: 'Invalid Name',
        message: 'Name can only contain letters and spaces',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    return true;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showNotification({
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    // Block temporary email domains
    const tempDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    if (tempDomains.includes(domain)) {
      showNotification({
        title: 'Invalid Email',
        message: 'Temporary email addresses are not allowed',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      showNotification({
        title: 'Weak Password',
        message: 'Password must be at least 8 characters',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    // Check for uppercase, lowercase, number, and special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(password)) {
      showNotification({
        title: 'Weak Password',
        message: 'Password must contain uppercase, lowercase, number and special character',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    return true;
  };

  const validatePhone = (phone) => {
    if (!/^[0-9]{10}$/.test(phone)) {
      showNotification({
        title: 'Invalid Phone Number',
        message: 'Please enter a valid 10-digit phone number',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    const validPrefixes = ['6', '7', '8', '9'];
    if (!validPrefixes.includes(phone[0])) {
      showNotification({
        title: 'Invalid Phone Number',
        message: 'Phone number must start with 6, 7, 8, or 9',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }
    return true;
  };

  const validateCollege = (college) => {
    if (college.length < 3 || college.length > 100) {
      showNotification({
        title: 'Invalid College Name',
        message: 'College name must be between 3-100 characters',
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

    // Final check for duplicates before submission
    setLoading(true);
    
    try {
      // Check email one more time
      const emailCheck = await API.post('/auth/check-email', { email: formData.email.toLowerCase() });
      if (emailCheck.data.exists) {
        setEmailExists(true);
        showNotification({
          title: 'Email Already Registered',
          message: 'This email is already registered. Please use a different email.',
          icon: AlertCircle,
          type: 'error'
        });
        setLoading(false);
        return false;
      }

      // Check phone one more time
      const phoneCheck = await API.post('/auth/check-phone', { phone: formData.phone });
      if (phoneCheck.data.exists) {
        setPhoneExists(true);
        showNotification({
          title: 'Phone Already Registered',
          message: 'This phone number is already registered. Please use a different number.',
          icon: AlertCircle,
          type: 'error'
        });
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
      setLoading(false);
      showNotification({
        title: 'Validation Error',
        message: 'Unable to verify email/phone. Please try again.',
        icon: AlertCircle,
        type: 'error'
      });
      return false;
    }

    // Check for duplicate email/phone from state
    if (emailExists) {
      showNotification({
        title: 'Email Already Registered',
        message: 'This email is already registered. Please use a different email.',
        icon: AlertCircle,
        type: 'error'
      });
      setLoading(false);
      return false;
    }

    if (phoneExists) {
      showNotification({
        title: 'Phone Already Registered',
        message: 'This phone number is already registered. Please use a different number.',
        icon: AlertCircle,
        type: 'error'
      });
      setLoading(false);
      return false;
    }

    // Comprehensive validation
    if (!validateName(formData.name)) {
      setLoading(false);
      return false;
    }
    if (!validateEmail(formData.email)) {
      setLoading(false);
      return false;
    }
    if (!validatePhone(formData.phone)) {
      setLoading(false);
      return false;
    }
    if (!validateCollege(formData.college)) {
      setLoading(false);
      return false;
    }
    if (!validatePassword(formData.password)) {
      setLoading(false);
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showNotification({
        title: 'Password Mismatch',
        message: 'Passwords do not match',
        icon: AlertCircle,
        type: 'error'
      });
      setLoading(false);
      return false;
    }

    // Validate profile picture is uploaded
    if (!formData.avatar || !avatarPreview) {
      showNotification({
        title: 'Profile Picture Required',
        message: 'Please upload a profile picture to continue',
        icon: AlertCircle,
        type: 'error'
      });
      setLoading(false);
      return false;
    }

    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await signup(signupData);
      showNotification({
        title: 'Registration Successful!',
        message: 'You have successfully registered for Savishkar 2025 🎊 Please check your email to verify your account.',
        icon: CheckCircle
      });
      // Keep loading state active during navigation delay
      setTimeout(() => {
        navigate('/verify-otp', { state: { userId: response.userId, email: formData.email } });
        setLoading(false); // Reset loading after navigation
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Signup failed';
      const errorStatus = error.response?.status;
      const userId = error.response?.data?.userId;
      const email = error.response?.data?.email || formData.email;
      
      // Check if user already exists but email not verified
      if ((errorMessage.includes('already exists') || errorMessage.includes('already registered')) && userId) {
        // User exists and is not verified - redirect to OTP page
        showNotification({
          title: 'Account Exists - Verification Needed',
          message: 'This account already exists but is not verified. Redirecting to verification page...',
          icon: AlertCircle,
          type: 'warning'
        });
        
        setTimeout(() => {
          navigate('/verify-otp', { state: { email: email, userId: userId } });
          setLoading(false);
        }, 1500);
        return;
      }
      
      // Check if user already exists and is verified
      if (errorMessage.includes('already exists') || errorMessage.includes('already registered')) {
        showNotification({
          title: 'Account Already Exists',
          message: 'This account is already registered. Please try logging in instead.',
          icon: AlertCircle,
          type: 'error'
        });
        setLoading(false);
        return;
      }
      
      // For other errors, show notification directly without reload
      showNotification({
        title: 'Signup Failed',
        message: errorMessage,
        icon: AlertCircle,
        type: 'error'
      });
      setLoading(false);
      return;
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
        <Link to="/" className="inline-flex items-center mb-6 transition-colors font-bold" style={{ color: '#5C4033' }}>
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: 'linear-gradient(to bottom right, #5C4033, #8b4513)' }}>
                <UserCircle className="w-10 h-10" style={{ color: '#FEF3E2' }} />
              </div>
            </motion.div>
            <h2 className="text-3xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Create Account</h2>
            <p style={{ color: '#5C4033' }}>Join Savishkar Techfest today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium mb-2 text-center" style={{ color: '#1a365d' }}>
                Profile Picture <span className="text-red-500">*</span>
              </label>
              <div className="flex justify-center mb-4">
                <div className="relative">
                  {avatarPreview ? (
                    <div className="relative w-32 h-32">
                      <img 
                        src={avatarPreview} 
                        alt="Profile preview" 
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                        onError={(e) => {
                          console.error('Image failed to load:', avatarPreview);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => console.log('Image loaded successfully:', avatarPreview)}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAvatarPreview(null);
                          setFormData(prev => ({ ...prev, avatar: '' }));
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute -top-2 -right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowUploadOptions(!showUploadOptions)}
                      className="w-32 h-32 rounded-full border-4 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all"
                      style={{ borderColor: 'rgba(250, 129, 47, 0.5)', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
                    >
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: '#FA812F' }}></div>
                      ) : (
                        <>
                          <Camera className="w-8 h-8 mb-1" style={{ color: '#FA812F' }} />
                          <span className="text-xs" style={{ color: '#5C4033' }}>Required</span>
                        </>
                      )}
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Upload Options - Show only when circle is clicked */}
              <AnimatePresence>
                {showUploadOptions && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex justify-center gap-3 mb-3"
                  >
                    <motion.button
                      type="button"
                      onClick={() => {
                        fileInputRef.current?.click();
                        setShowUploadOptions(false);
                      }}
                      disabled={uploading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                      style={{ background: 'linear-gradient(to right, #FA812F, #FAB12F)', color: '#FEF3E2' }}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Upload Photo
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => {
                        startCamera();
                        setShowUploadOptions(false);
                      }}
                      disabled={uploading}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
                      style={{ backgroundColor: '#5C4033', color: '#FEF3E2' }}
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Example Images Button */}
              <div className="text-center mb-3">
                <button
                  type="button"
                  onClick={() => setShowExamples(!showExamples)}
                  className="text-xs flex items-center gap-1 mx-auto transition-colors"
                  style={{ color: '#FA812F' }}
                >
                  <Info className="w-3 h-3" />
                  {showExamples ? 'Hide' : 'View'} Example Photos
                </button>
              </div>
              
              {/* Example Images */}
              <AnimatePresence>
                {showExamples && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-3 overflow-hidden"
                  >
                    <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(250, 177, 47, 0.1)' }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#5C4033' }}>Good Profile Photo Examples:</p>
                      <div className="grid grid-cols-3 gap-2 mb-2">
                        <div className="text-center">
                          <div className="w-full aspect-square rounded-lg mb-1 overflow-hidden border-2" style={{ borderColor: '#2e7d32' }}>
                            <img 
                              src="https://randomuser.me/api/portraits/men/32.jpg" 
                              alt="Good example 1"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-[10px]" style={{ color: '#2e7d32' }}>✓ Clear face</p>
                        </div>
                        <div className="text-center">
                          <div className="w-full aspect-square rounded-lg mb-1 overflow-hidden border-2" style={{ borderColor: '#2e7d32' }}>
                            <img 
                              src="https://randomuser.me/api/portraits/women/44.jpg" 
                              alt="Good example 2"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-[10px]" style={{ color: '#2e7d32' }}>✓ Good lighting</p>
                        </div>
                        <div className="text-center">
                          <div className="w-full aspect-square rounded-lg mb-1 overflow-hidden border-2" style={{ borderColor: '#2e7d32' }}>
                            <img 
                              src="https://randomuser.me/api/portraits/men/65.jpg" 
                              alt="Good example 3"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-[10px]" style={{ color: '#2e7d32' }}>✓ Centered</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold mb-2" style={{ color: '#5C4033' }}>Avoid:</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                          <div className="w-full aspect-square rounded-lg mb-1 overflow-hidden border-2 relative" style={{ borderColor: '#c62828' }}>
                            <img 
                              src="https://randomuser.me/api/portraits/men/75.jpg" 
                              alt="Bad example 1"
                              className="w-full h-full object-cover"
                              style={{ filter: 'brightness(0.4)' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-4xl">🕶️</div>
                            </div>
                          </div>
                          <p className="text-[10px]" style={{ color: '#c62828' }}>✗ Sunglasses</p>
                        </div>
                        <div className="text-center">
                          <div className="w-full aspect-square rounded-lg mb-1 overflow-hidden border-2" style={{ borderColor: '#c62828' }}>
                            <img 
                              src="https://randomuser.me/api/portraits/women/28.jpg" 
                              alt="Bad example 2"
                              className="w-full h-full object-cover"
                              style={{ filter: 'brightness(0.2)' }}
                            />
                          </div>
                          <p className="text-[10px]" style={{ color: '#c62828' }}>✗ Too dark</p>
                        </div>
                        <div className="text-center">
                          <div className="w-full aspect-square rounded-lg mb-1 overflow-hidden border-2 relative" style={{ borderColor: '#c62828' }}>
                            <img 
                              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop" 
                              alt="Bad example 3"
                              className="w-full h-full object-cover"
                              style={{ filter: 'blur(1px)' }}
                            />
                          </div>
                          <p className="text-[10px]" style={{ color: '#c62828' }}>✗ Group photo</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <p className="text-xs text-center font-semibold" style={{ color: '#5C4033' }}>JPG, PNG, GIF up to 5MB • Required for registration</p>
            </div>

            {/* Camera Modal */}
            <AnimatePresence>
              {showCamera && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center p-4"
                  style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
                  onClick={stopCamera}
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative max-w-2xl w-full rounded-2xl overflow-hidden"
                    style={{ backgroundColor: '#FEF3E2' }}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold" style={{ color: '#1a365d' }}>Take Your Photo</h3>
                        <button
                          onClick={stopCamera}
                          className="p-2 rounded-full transition-colors"
                          style={{ backgroundColor: 'rgba(250, 129, 47, 0.2)' }}
                        >
                          <X className="w-5 h-5" style={{ color: '#FA812F' }} />
                        </button>
                      </div>
                      
                      <div className="relative rounded-xl overflow-hidden mb-4" style={{ backgroundColor: '#000' }}>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-auto"
                        />
                        <div className="absolute inset-0 border-4 border-dashed pointer-events-none" style={{ borderColor: 'rgba(250, 177, 47, 0.5)' }}>
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4" style={{ borderColor: 'rgba(250, 177, 47, 0.7)' }}></div>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <button
                          onClick={capturePhoto}
                          disabled={uploading}
                          className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                          style={{ backgroundColor: '#FA812F', color: '#FEF3E2' }}
                        >
                          {uploading ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-5 h-5" />
                              <span>Capture Photo</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={stopCamera}
                          className="px-6 py-3 rounded-xl font-bold transition-colors"
                          style={{ backgroundColor: 'rgba(92, 64, 51, 0.2)', color: '#5C4033' }}
                        >
                          Cancel
                        </button>
                      </div>
                      
                      <p className="text-xs text-center mt-3" style={{ color: '#5C4033' }}>
                        Position your face in the circle for best results
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <canvas ref={canvasRef} className="hidden" />

            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#FA812F' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="John Doe"
                  pattern="[a-zA-Z\s]{2,50}"
                  title="Name must be 2-50 characters, letters and spaces only"
                  required
                />
              </div>
              <p className="text-xs mt-1 font-semibold" style={{ color: '#5C4033' }}>2-50 characters, letters and spaces only</p>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#FA812F' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={(e) => checkEmailExists(e.target.value)}
                  className={`input-field ${emailExists ? 'border-red-500' : ''}`}
                  placeholder="your.email@example.com"
                  title="Enter a valid email address"
                  required
                />
                {checkingEmail && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2" style={{ borderColor: '#FA812F' }}></div>
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 font-semibold" style={{ color: '#5C4033' }}>Use a valid email (temporary emails not allowed)</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#FA812F' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({ ...formData, phone: value });
                  }}
                  onBlur={(e) => checkPhoneExists(e.target.value)}
                  className={`input-field ${phoneExists ? 'border-red-500' : ''}`}
                  placeholder="9876543210"
                  pattern="[6-9][0-9]{9}"
                  title="10-digit Indian mobile number starting with 6, 7, 8, or 9"
                  maxLength="10"
                  required
                />
                {checkingPhone && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2" style={{ borderColor: '#FA812F' }}></div>
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 font-semibold" style={{ color: '#5C4033' }}>10 digits, must start with 6/7/8/9</p>
            </div>

            {/* College */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>College Name</label>
              <div className="relative">
                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none z-10" style={{ color: '#FA812F' }} />
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={(e) => {
                    handleChange(e);
                    const value = e.target.value;
                    
                    // Filter colleges based on input
                    if (value.length > 0) {
                      const filtered = colleges.filter(college =>
                        college.toLowerCase().includes(value.toLowerCase())
                      ).slice(0, 10);
                      setCollegeSuggestions(filtered);
                      setShowSuggestions(true);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onFocus={() => {
                    if (formData.college.length > 0) {
                      const filtered = colleges.filter(college =>
                        college.toLowerCase().includes(formData.college.toLowerCase())
                      ).slice(0, 10);
                      setCollegeSuggestions(filtered);
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    setTimeout(() => setShowSuggestions(false), 200);
                  }}
                  className="input-field"
                  placeholder="Start typing college name..."
                  minLength="3"
                  maxLength="100"
                  title="College name must be 3-100 characters"
                  required
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && collegeSuggestions.length > 0 && (
                  <div 
                    className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                    style={{ 
                      backgroundColor: '#FFF8DC', 
                      border: '2px solid rgba(250, 129, 47, 0.3)',
                    }}
                  >
                    {collegeSuggestions.map((college, index) => (
                      <div
                        key={index}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur from firing
                          setFormData({ ...formData, college });
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2 cursor-pointer transition-colors text-sm"
                        style={{ 
                          color: '#5C4033',
                          borderBottom: index < collegeSuggestions.length - 1 ? '1px solid rgba(92, 64, 51, 0.1)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = 'rgba(250, 129, 47, 0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = 'transparent';
                        }}
                      >
                        {college}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs mt-1 font-semibold" style={{ color: '#5C4033' }}>Start typing to see suggestions</p>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#FA812F' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  minLength="8"
                  title="Password must be at least 8 characters with uppercase, lowercase, number and special character"
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
              <p className="text-xs mt-1 font-semibold" style={{ color: '#5C4033' }}>Minimum 8 characters with uppercase, lowercase, number and special character</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#5C4033' }}>Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: '#FA812F' }} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pr-12"
                  placeholder="••••••••"
                  minLength="8"
                  title="Must match password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 transition-colors" style={{ color: '#FA812F' }}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p style={{ color: '#5C4033' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-bold transition-colors" style={{ color: '#1a365d' }}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
