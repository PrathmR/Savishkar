import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, IndianRupee, CheckCircle, Clock, XCircle, User, Mail, Phone, Building2, Camera, AlertCircle, Copy, Check, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/imageUtils';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const { data } = await API.get('/registrations/my');
      setRegistrations(data.registrations);
    } catch (error) {
      showNotification({
        title: 'Loading Failed',
        message: 'Failed to load registrations',
        icon: AlertCircle,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-[#5C4033]'; // Brown for completed
      case 'pending':
        return 'text-[#8b4513]'; // Saddle brown for pending
      case 'verification_pending':
        return 'text-[#8b4513]'; // Saddle brown for verification pending
      case 'failed':
        return 'text-[#2C1810]'; // Dark brown for failed
      default:
        return 'text-[#5C4033]'; // Brown default
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5" />;
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'verification_pending':
        return <Clock className="w-5 h-5" />;
      case 'failed':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleCopyCode = () => {
    if (user?.userCode) {
      navigator.clipboard.writeText(user.userCode);
      setCopied(true);
      showNotification({
        title: 'Copied!',
        message: 'User code copied to clipboard',
        icon: CheckCircle,
        type: 'success'
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification({
        title: 'Invalid File',
        message: 'Please select an image file',
        icon: AlertCircle,
        type: 'error'
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        title: 'File Too Large',
        message: 'Image size should be less than 5MB',
        icon: AlertCircle,
        type: 'error'
      });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await API.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      console.log('Upload response:', data); // Debug log
      console.log('Avatar URL:', data.avatar); // Debug log
      
      showNotification({
        title: 'Upload Successful!',
        message: 'Profile picture updated successfully!',
        icon: CheckCircle,
        type: 'success'
      });
      
      // Refresh user data from server
      await refreshUser();
      
      // Force re-render by reloading
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      console.error('Upload error:', error); // Debug log
      showNotification({
        title: 'Upload Failed',
        message: error.response?.data?.message || 'Failed to upload image',
        icon: AlertCircle,
        type: 'error'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-12 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
            Welcome, <span className="bg-gradient-to-r from-[#FAB12F] to-[#FA812F] bg-clip-text text-transparent">{user?.name || 'Guest'}</span>
          </h1>
          <p style={{ color: '#5C4033' }}>Manage your event registrations and profile</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="card sticky top-24">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4 group">
                  {user?.avatar ? (
                    <img 
                      src={getImageUrl(user.avatar)} 
                      alt={user.name} 
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        console.error('Image failed to load:', user.avatar);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => console.log('Image loaded successfully:', getImageUrl(user.avatar))}
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-violet-600 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-white" />
                    </div>
                  )}
                  <button
                    onClick={handleAvatarClick}
                    disabled={uploading}
                    className="absolute bottom-0 left-0 text-white p-2 rounded-full transition-all duration-300 shadow-lg disabled:opacity-50"
                    style={{ background: 'linear-gradient(to right, #FA812F, #FAB12F)' }}
                    title="Upload profile picture"
                  >
                    {uploading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>{user?.name || 'Loading...'}</h2>
                <p className="font-semibold" style={{ color: '#5C4033' }}>{user?.role === 'admin' ? 'Administrator' : 'Participant'}</p>
                {user?.userCode && user?.role !== 'admin' && (
                  <div className="mt-3 px-4 py-2 rounded-lg inline-block" style={{ background: 'linear-gradient(135deg, #FA812F 0%, #FAB12F 100%)' }}>
                    <p className="text-xs font-semibold" style={{ color: '#FEF3E2', opacity: 0.9 }}>PARTICIPANT ID</p>
                    <p className="text-lg font-bold tracking-wider" style={{ color: '#1a365d', fontFamily: 'monospace' }}>{user.userCode}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center font-semibold" style={{ color: '#5C4033' }}>
                  <Mail className="w-4 h-4 mr-3" style={{ color: '#5C4033' }} />
                  {user?.email || 'N/A'}
                </div>
                <div className="flex items-center font-semibold" style={{ color: '#5C4033' }}>
                  <Phone className="w-4 h-4 mr-3" style={{ color: '#5C4033' }} />
                  {user?.phone || 'N/A'}
                </div>
                <div className="flex items-center font-semibold" style={{ color: '#5C4033' }}>
                  <Building2 className="w-4 h-4 mr-3" style={{ color: '#5C4033' }} />
                  {user?.college || 'N/A'}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#1a365d' }}>{registrations.length}</p>
                    <p className="text-xs font-bold" style={{ color: '#5C4033' }}>Registrations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#1a365d' }}>
                      {registrations.filter(r => r.paymentStatus === 'completed').length}
                    </p>
                    <p className="text-xs font-bold" style={{ color: '#5C4033' }}>Confirmed</p>
                  </div>
                </div>
              </div>

              {user?.role === 'admin' && (
                <Link to="/admin" className="block mt-6 btn-primary text-center">
                  Admin Dashboard
                </Link>
              )}
            </div>
          </motion.div>

          {/* Registrations */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-6" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>My Registrations</h2>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : registrations.length === 0 ? (
                <div className="card text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Registrations Yet</h3>
                  <p className="text-gray-300 mb-6">Start exploring events and register now!</p>
                  <Link to="/events" className="btn-primary inline-block">
                    Browse Events
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {registrations.map((registration) => (
                    <RegistrationCard key={registration._id} registration={registration} getStatusColor={getStatusColor} getStatusIcon={getStatusIcon} />
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegistrationCard = ({ registration, getStatusColor, getStatusIcon }) => (
  <div className="card hover:scale-[1.02] transition-transform">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>{registration.event?.name}</h3>
          <span className={`flex items-center space-x-1 ${getStatusColor(registration.paymentStatus)}`}>
            {getStatusIcon(registration.paymentStatus)}
            <span className="text-sm font-semibold capitalize">
              {registration.paymentStatus === 'verification_pending' 
                ? 'Awaiting Verification' 
                : registration.paymentStatus}
            </span>
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center font-semibold" style={{ color: '#5C4033' }}>
            <Calendar className="w-4 h-4 mr-2" />
            {new Date(registration.event?.date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>
          <div className="flex items-center font-semibold" style={{ color: '#5C4033' }}>
            <MapPin className="w-4 h-4 mr-2" />
            {registration.event?.venue}
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-white">₹{registration.amount}</span>
          </div>
        </div>

        {registration.teamName && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-sm" style={{ color: '#5C4033' }}>
              Team: <span className="font-semibold" style={{ color: '#5C4033' }}>{registration.teamName}</span>
            </p>
          </div>
        )}
        
        {registration.registrationNumber && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <p className="text-sm" style={{ color: '#5C4033' }}>
              Reg No: <span className="font-semibold font-mono" style={{ color: '#5C4033' }}>{registration.registrationNumber}</span>
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {registration.paymentStatus === 'pending' && registration.amount > 0 && (
          <Link
            to={`/payment/${registration._id}`}
            className="btn-primary text-sm text-center"
          >
            Complete Payment
          </Link>
        )}
        {registration.paymentStatus === 'verification_pending' && (
          <div className="text-sm text-center px-3 py-2 rounded-lg font-semibold" style={{ backgroundColor: 'rgba(139, 69, 19, 0.15)', border: '2px solid rgba(139, 69, 19, 0.3)', color: '#8b4513' }}>
            Waiting for Confirmation
          </div>
        )}
      </div>
    </div>
  </div>
);

export default Dashboard;
