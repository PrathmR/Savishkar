import toast from 'react-hot-toast';

// Custom toast configuration with better styling and messages
export const toastConfig = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 4000,
      style: {
        background: '#10b981',
        color: '#fff',
        padding: '16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10b981',
      },
      ...options,
    });
  },

  error: (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      style: {
        background: '#ef4444',
        color: '#fff',
        padding: '16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#ef4444',
      },
      ...options,
    });
  },

  loading: (message, options = {}) => {
    return toast.loading(message, {
      style: {
        background: '#8b5cf6',
        color: '#fff',
        padding: '16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      ...options,
    });
  },

  info: (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: '#fff',
        padding: '16px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      ...options,
    });
  },

  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Processing...',
        success: messages.success || 'Success!',
        error: messages.error || 'Something went wrong',
      },
      {
        style: {
          padding: '16px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '500',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        },
        success: {
          duration: 4000,
          style: {
            background: '#10b981',
            color: '#fff',
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#ef4444',
            color: '#fff',
          },
        },
      }
    );
  },
};

// Enhanced notification messages
export const notificationMessages = {
  // Authentication
  auth: {
    loginSuccess: '🎉 Welcome back! Login successful',
    loginError: '❌ Login failed. Please check your credentials',
    signupSuccess: '✅ Account created successfully! Please verify your email',
    signupError: '❌ Signup failed. Please try again',
    otpSent: '📧 OTP sent to your email. Please check your inbox',
    otpVerified: '✅ Email verified successfully! Redirecting...',
    otpInvalid: '❌ Invalid OTP. Please try again',
    passwordReset: '✅ Password reset successful! You can now login',
    logoutSuccess: '👋 Logged out successfully',
  },

  // Registration
  registration: {
    success: '🎉 Registration successful! Complete payment to confirm',
    error: '❌ Registration failed. Please try again',
    alreadyRegistered: 'ℹ️ You are already registered for this event',
    eventFull: '⚠️ Sorry, this event is full',
  },

  // Payment
  payment: {
    submitted: '✅ Payment proof submitted! Awaiting admin verification',
    verified: '🎉 Payment verified! Your registration is confirmed',
    rejected: '❌ Payment verification failed. Please resubmit',
    alreadyCompleted: '✅ Payment already completed',
    error: '❌ Payment submission failed. Please try again',
  },

  // Profile
  profile: {
    updated: '✅ Profile updated successfully',
    avatarUploaded: '✅ Profile picture updated!',
    avatarError: '❌ Failed to upload profile picture',
  },

  // Admin
  admin: {
    eventCreated: '✅ Event created successfully',
    eventUpdated: '✅ Event updated successfully',
    eventDeleted: '✅ Event deleted successfully',
    paymentApproved: '✅ Payment approved! User will be notified',
    paymentRejected: '✅ Payment rejected. User will be notified',
  },

  // General
  general: {
    loading: '⏳ Processing your request...',
    success: '✅ Operation completed successfully',
    error: '❌ Something went wrong. Please try again',
    networkError: '🌐 Network error. Please check your connection',
    serverError: '⚠️ Server error. Please try again later',
  },

  // Validation
  validation: {
    required: '⚠️ Please fill in all required fields',
    invalidEmail: '⚠️ Please enter a valid email address',
    invalidPhone: '⚠️ Please enter a valid 10-digit phone number',
    passwordMismatch: '⚠️ Passwords do not match',
    weakPassword: '⚠️ Password must be at least 8 characters with uppercase, lowercase, number and special character',
    fileTooLarge: '⚠️ File size should be less than 5MB',
    invalidFileType: '⚠️ Invalid file type. Please upload a valid image',
  },
};

export default toastConfig;
