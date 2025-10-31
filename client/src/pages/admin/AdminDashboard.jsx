import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Users, 
  IndianRupee, 
  Plus,
  TrendingUp,
  Download,
  Edit,
  Trash2,
  UserPlus,
  Eye,
  RefreshCw,
  X,
  Lock,
  Unlock,
  Search
} from 'lucide-react';
import API from '../../services/api';
import toast from 'react-hot-toast';
import { colleges } from '../../data/colleges';
import { getImageUrl } from '../../utils/imageUtils';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    totalRevenue: 0,
    pendingPayments: 0
  });
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationDisabled, setRegistrationDisabled] = useState(false);
  const [togglingRegistration, setTogglingRegistration] = useState(false);
  const [autoDisableInfo, setAutoDisableInfo] = useState(null);

  // Determine active tab from URL
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/events')) return 'events';
    if (path.includes('/registrations')) return 'registrations';
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/register-user')) return 'register-user';
    return 'overview';
  };

  const activeTab = getActiveTab();

  useEffect(() => {
    fetchDashboardData();
    fetchRegistrationControl();
    fetchAutoDisableInfo();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [eventsRes, registrationsRes, paymentsRes] = await Promise.all([
        API.get('/events'),
        API.get('/registrations'),
        API.get('/payments/all')
      ]);

      const eventsData = eventsRes.data.events;
      const registrationsData = registrationsRes.data.registrations;
      const paymentsData = paymentsRes.data.payments || [];

      setEvents(eventsData);
      setRegistrations(registrationsData);

      // Calculate stats - revenue from captured payments only
      const totalRevenue = paymentsData
        .filter(p => p.status === 'captured')
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const pendingPayments = registrationsData
        .filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'verification_pending').length;

      setStats({
        totalEvents: eventsData.length,
        totalRegistrations: registrationsData.length,
        totalRevenue,
        pendingPayments
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrationControl = async () => {
    try {
      const { data } = await API.get('/admin/registration-control');
      setRegistrationDisabled(data.userRegistrationDisabled);
    } catch (error) {
      console.error('Failed to fetch registration control status:', error);
    }
  };

  const toggleRegistrationControl = async () => {
    try {
      setTogglingRegistration(true);
      const newState = !registrationDisabled;
      const { data } = await API.put('/admin/registration-control', { disabled: newState });
      setRegistrationDisabled(data.userRegistrationDisabled);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle registration control');
    } finally {
      setTogglingRegistration(false);
    }
  };

  const fetchAutoDisableInfo = async () => {
    try {
      const { data } = await API.get('/admin/registration-auto-disable');
      setAutoDisableInfo(data);
    } catch (error) {
      console.error('Failed to fetch auto-disable info:', error);
    }
  };

  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds || milliseconds <= 0) return 'Expired';
    
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: '#FA812F' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2" style={{ fontFamily: 'Georgia, serif' }}>
                <span className="bg-gradient-to-r from-[#FAB12F] to-[#FA812F] bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p style={{ color: '#5C4033' }}>Manage events, registrations, and payments</p>
            </div>
            
            {/* Registration Control Toggle */}
            <button
              onClick={toggleRegistrationControl}
              disabled={togglingRegistration}
              className="flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              style={registrationDisabled 
                ? { 
                    background: 'linear-gradient(to right, #DC2626, #991B1B)',
                    color: 'white'
                  }
                : {
                    background: 'linear-gradient(to right, #16A34A, #15803D)',
                    color: 'white'
                  }
              }
              title={registrationDisabled ? 'Click to enable user registration' : 'Click to disable user registration'}
            >
              {togglingRegistration ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : registrationDisabled ? (
                <Lock className="w-5 h-5" />
              ) : (
                <Unlock className="w-5 h-5" />
              )}
              <div className="text-left">
                <div className="text-sm font-bold">
                  {registrationDisabled ? 'Registration Disabled' : 'Registration Enabled'}
                </div>
                <div className="text-xs opacity-90">
                  {registrationDisabled ? 'Users cannot register' : 'Users can register'}
                </div>
              </div>
            </button>
          </div>

          {/* Auto-Disable Schedule Info */}
          {autoDisableInfo && autoDisableInfo.scheduledTime && (
            <div className="mt-4 p-4 rounded-xl" style={{ 
              background: 'linear-gradient(to right, #FEF3E2, #FAE8C8)',
              border: '2px solid #FAB12F'
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5" style={{ color: '#FA812F' }} />
                  <div>
                    <div className="font-semibold" style={{ color: '#5C4033' }}>
                      Auto-Disable Scheduled
                    </div>
                    <div className="text-sm" style={{ color: '#8b4513' }}>
                      Registration will automatically close on{' '}
                      <span className="font-bold">
                        {new Date(autoDisableInfo.scheduledTime).toLocaleString('en-IN', { 
                          timeZone: 'Asia/Kolkata',
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })} IST
                      </span>
                    </div>
                  </div>
                </div>
                {!autoDisableInfo.hasExecuted && autoDisableInfo.timeRemaining > 0 && (
                  <div className="px-4 py-2 rounded-lg font-semibold" style={{ 
                    background: '#FA812F',
                    color: 'white'
                  }}>
                    {formatTimeRemaining(autoDisableInfo.timeRemaining)} remaining
                  </div>
                )}
                {autoDisableInfo.hasExecuted && (
                  <div className="px-4 py-2 rounded-lg font-semibold" style={{ 
                    background: '#DC2626',
                    color: 'white'
                  }}>
                    Executed
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 p-2">
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            label="Total Events"
            value={stats.totalEvents}
            color="primary"
          />
          <StatCard
            icon={<Users className="w-8 h-8" />}
            label="Registrations"
            value={stats.totalRegistrations}
            color="secondary"
          />
          <StatCard
            icon={<IndianRupee className="w-8 h-8" />}
            label="Total Revenue"
            value={`₹${stats.totalRevenue.toLocaleString()}`}
            color="green"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            label="Pending Payments"
            value={stats.pendingPayments}
            color="yellow"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 p-2">
          {[
            { id: 'overview', label: 'Overview', path: '/admin' },
            { id: 'events', label: 'Events', path: '/admin/events' },
            { id: 'registrations', label: 'Registrations', path: '/admin/registrations' },
            { id: 'payments', label: 'Payments', path: '/admin/payments' },
            { id: 'register-user', label: 'Register User', path: '/admin/register-user' }
          ].map((tab) => (
            <Link
              key={tab.id}
              to={tab.path}
              className="px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all shadow-md hover:scale-105"
              style={activeTab === tab.id 
                ? { 
                    background: 'linear-gradient(to right, #5C4033, #8b4513)', 
                    color: '#FEF3E2'
                  } 
                : { 
                    backgroundColor: '#FEF3E2',
                    border: '2px solid rgba(92, 64, 51, 0.2)',
                    color: '#5C4033'
                  }
              }
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Content Area with Routes */}
        <Routes>
          <Route index element={<Overview events={events} registrations={registrations} />} />
          <Route path="events" element={<EventsManagement events={events} onUpdate={fetchDashboardData} />} />
          <Route path="registrations" element={<RegistrationsManagement registrations={registrations} />} />
          <Route path="payments" element={<PaymentsManagement registrations={registrations} events={events} onUpdate={fetchDashboardData} />} />
          <Route path="register-user" element={<RegisterUserManagement events={events} onUpdate={fetchDashboardData} />} />
        </Routes>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    primary: 'text-[#FAB12F]',
    secondary: 'text-[#FA812F]',
    green: 'text-[#5C4033]',
    yellow: 'text-[#8b4513]'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="hover:scale-105 transition-transform group relative overflow-hidden rounded-2xl shadow-lg p-8"
      style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.2)' }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#FAB12F]/0 to-[#FA812F]/0 group-hover:from-[#FAB12F]/10 group-hover:to-[#FA812F]/10 transition-all duration-500"></div>
      <div className="relative z-10">
        <div className={`${colorClasses[color]} mb-4`}>{icon}</div>
        <p className="text-sm mb-2" style={{ color: '#5C4033', opacity: 0.8 }}>{label}</p>
        <p className="text-3xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>{value}</p>
      </div>
    </motion.div>
  );
};

const Overview = ({ events, registrations }) => {
  const recentRegistrations = registrations.slice(0, 5);
  const upcomingEvents = events
    .filter(e => new Date(e.date) > new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-8"
    >
      {/* Recent Registrations */}
      <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.2)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>Recent Registrations</h2>
          <Users className="w-6 h-6" style={{ color: '#FA812F' }} />
        </div>
        
        {recentRegistrations.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3" style={{ color: '#5C4033', opacity: 0.4 }} />
            <p style={{ color: '#5C4033', opacity: 0.6 }}>No registrations yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentRegistrations.map((reg, index) => (
              <motion.div
                key={reg._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between pb-4 border-b border-white/10 last:border-0 hover:bg-white/5 p-2 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: '#5C4033' }}>{reg.user?.name || 'N/A'}</p>
                  <p className="text-sm truncate" style={{ color: '#FA812F' }}>{reg.event?.name || 'N/A'}</p>
                  <p className="text-xs mt-1" style={{ color: '#5C4033', opacity: 0.6 }}>
                    {reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString('en-IN') : 'N/A'}
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap`}
                  style={reg.paymentStatus === 'completed' 
                    ? { backgroundColor: 'rgba(92, 64, 51, 0.2)', color: '#5C4033' }
                    : reg.paymentStatus === 'failed'
                    ? { backgroundColor: 'rgba(44, 24, 16, 0.2)', color: '#2C1810' }
                    : { backgroundColor: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' }
                  }>
                  {reg.paymentStatus || 'pending'}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Events */}
      <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.2)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>Upcoming Events</h2>
          <Calendar className="w-6 h-6" style={{ color: '#FA812F' }} />
        </div>
        
        {upcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#5C4033', opacity: 0.4 }} />
            <p style={{ color: '#5C4033', opacity: 0.6 }}>No upcoming events</p>
          </div>
        ) : (
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between pb-4 border-b border-white/10 last:border-0 hover:bg-white/5 p-2 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold" style={{ color: '#5C4033' }}>{event.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm" style={{ color: '#FA812F' }}>
                      {new Date(event.date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                    <span style={{ color: '#5C4033', opacity: 0.4 }}>•</span>
                    <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' }}>
                      {event.category}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold" style={{ color: '#FA812F' }}>
                    {event.currentParticipants}/{event.maxParticipants}
                  </p>
                  <p className="text-xs" style={{ color: '#5C4033', opacity: 0.6 }}>participants</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const EventsManagement = ({ events, onUpdate }) => {
  const [viewingRegistrations, setViewingRegistrations] = useState(null);
  const [registrationsData, setRegistrationsData] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-refresh registrations every 10 seconds when viewing
  useEffect(() => {
    let interval;
    if (viewingRegistrations && autoRefresh) {
      fetchRegistrations(viewingRegistrations._id);
      interval = setInterval(() => {
        fetchRegistrations(viewingRegistrations._id);
      }, 10000); // Refresh every 10 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [viewingRegistrations, autoRefresh]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (viewingRegistrations) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [viewingRegistrations]);

  const fetchRegistrations = async (eventId) => {
    try {
      setLoadingRegistrations(true);
      const { data } = await API.get(`/registrations/event/${eventId}`);
      setRegistrationsData(data.registrations || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleViewRegistrations = async (event) => {
    setViewingRegistrations(event);
    await fetchRegistrations(event._id);
  };

  const handleDownloadExcel = async (eventId, eventName) => {
    try {
      const response = await API.get(`/registrations/export/${eventId}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventName}-registrations.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Excel file downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download Excel file');
    }
  };

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await API.delete(`/events/${eventId}`);
      toast.success('Event deleted successfully!');
      onUpdate();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  // Filter events based on search query
  const filteredEvents = events.filter(event => {
    const query = searchQuery.toLowerCase();
    return (
      event.name.toLowerCase().includes(query) ||
      event.category.toLowerCase().includes(query) ||
      event.department?.toLowerCase().includes(query) ||
      event.venue.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    );
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* View Registrations Modal */}
      {viewingRegistrations && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(92, 64, 51, 0.7)' }}
          onClick={() => setViewingRegistrations(null)}
        >
          <div 
            className="max-w-7xl w-full rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" 
            style={{ backgroundColor: '#FEF3E2' }} 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b-2" style={{ borderColor: 'rgba(92, 64, 51, 0.2)' }}>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>
                  {viewingRegistrations.name} - Registrations
                </h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm" style={{ color: '#FA812F' }}>
                    Total: {registrationsData.length} registrations
                  </span>
                  {lastUpdated && (
                    <span className="text-xs" style={{ color: '#5C4033', opacity: 0.6 }}>
                      Last updated: {lastUpdated.toLocaleTimeString('en-IN')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold" style={{ color: '#5C4033' }}>
                    Auto-refresh (10s)
                  </span>
                </label>
                <button
                  onClick={() => fetchRegistrations(viewingRegistrations._id)}
                  disabled={loadingRegistrations}
                  className="p-2 rounded-lg transition-all"
                  style={{ 
                    backgroundColor: 'rgba(250, 129, 47, 0.2)',
                    color: '#FA812F',
                    border: '2px solid rgba(250, 129, 47, 0.3)'
                  }}
                  title="Refresh now"
                >
                  <RefreshCw className={`w-5 h-5 ${loadingRegistrations ? 'animate-spin' : ''}`} />
                </button>
                <button 
                  onClick={() => setViewingRegistrations(null)}
                  className="transition-colors p-2 rounded-full hover:bg-black/10"
                  style={{ color: '#5C4033' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-auto flex-1">
              {loadingRegistrations && registrationsData.length === 0 ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: '#FA812F' }}></div>
                </div>
              ) : registrationsData.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 mx-auto mb-4" style={{ color: '#5C4033', opacity: 0.4 }} />
                  <p style={{ color: '#5C4033', opacity: 0.6 }}>No registrations yet</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="sticky top-0" style={{ backgroundColor: '#FAB12F' }}>
                    <tr>
                      <th className="text-left py-3 px-4 font-bold text-white">S.No</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Reg No</th>
                      <th className="text-left py-3 px-4 font-bold text-white">User Code</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Name</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Email</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Phone</th>
                      <th className="text-left py-3 px-4 font-bold text-white">College</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Team Name</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Team Size</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Amount</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Payment Status</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Reg Date</th>
                      <th className="text-left py-3 px-4 font-bold text-white">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrationsData.map((reg, index) => (
                      <tr 
                        key={reg._id} 
                        className="border-b transition-colors hover:bg-white/30"
                        style={{ borderColor: 'rgba(92, 64, 51, 0.1)' }}
                      >
                        <td className="py-3 px-4" style={{ color: '#5C4033' }}>{index + 1}</td>
                        <td className="py-3 px-4 font-mono text-xs" style={{ color: '#5C4033' }}>{reg.registrationNumber || 'N/A'}</td>
                        <td className="py-3 px-4 font-mono text-xs" style={{ color: '#5C4033' }}>{reg.user?.userCode || 'N/A'}</td>
                        <td className="py-3 px-4 font-semibold" style={{ color: '#5C4033' }}>{reg.user?.name || 'N/A'}</td>
                        <td className="py-3 px-4 text-xs" style={{ color: '#5C4033' }}>{reg.user?.email || 'N/A'}</td>
                        <td className="py-3 px-4" style={{ color: '#5C4033' }}>{reg.user?.phone || 'N/A'}</td>
                        <td className="py-3 px-4 text-xs" style={{ color: '#5C4033' }}>{reg.user?.college || 'N/A'}</td>
                        <td className="py-3 px-4" style={{ color: '#5C4033' }}>{reg.teamName || 'Individual'}</td>
                        <td className="py-3 px-4 text-center" style={{ color: '#5C4033' }}>{reg.teamMembers?.length || 1}</td>
                        <td className="py-3 px-4 font-semibold" style={{ color: '#FA812F' }}>₹{reg.amount || 0}</td>
                        <td className="py-3 px-4">
                          <span 
                            className="text-xs px-2 py-1 rounded-full font-bold"
                            style={
                              reg.paymentStatus === 'completed'
                                ? { backgroundColor: '#16A34A', color: 'white' }
                                : reg.paymentStatus === 'verification_pending'
                                ? { backgroundColor: '#FBBF24', color: 'black' }
                                : reg.paymentStatus === 'failed'
                                ? { backgroundColor: '#DC2626', color: 'white' }
                                : { backgroundColor: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' }
                            }
                          >
                            {reg.paymentStatus === 'completed' ? 'APPROVED' : 
                             reg.paymentStatus === 'verification_pending' ? 'PENDING' : 
                             reg.paymentStatus === 'failed' ? 'REJECTED' : 
                             reg.paymentStatus?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs" style={{ color: '#5C4033' }}>
                          {reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-xs px-2 py-1 rounded font-semibold" style={{ backgroundColor: 'rgba(92, 64, 51, 0.2)', color: '#5C4033' }}>
                            {reg.status?.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer with summary */}
            {registrationsData.length > 0 && (
              <div className="mt-4 pt-4 border-t-2 flex justify-between items-center" style={{ borderColor: 'rgba(92, 64, 51, 0.2)' }}>
                <div className="flex gap-6">
                  <div>
                    <span className="text-sm font-semibold" style={{ color: '#5C4033' }}>Total: </span>
                    <span className="text-lg font-bold" style={{ color: '#FA812F' }}>{registrationsData.length}</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: '#5C4033' }}>Approved: </span>
                    <span className="text-lg font-bold" style={{ color: '#16A34A' }}>
                      {registrationsData.filter(r => r.paymentStatus === 'completed').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: '#5C4033' }}>Pending: </span>
                    <span className="text-lg font-bold" style={{ color: '#FBBF24' }}>
                      {registrationsData.filter(r => r.paymentStatus === 'verification_pending' || r.paymentStatus === 'pending').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: '#5C4033' }}>Rejected: </span>
                    <span className="text-lg font-bold" style={{ color: '#DC2626' }}>
                      {registrationsData.filter(r => r.paymentStatus === 'failed').length}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDownloadExcel(viewingRegistrations._id, viewingRegistrations.slug || viewingRegistrations.name)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download Excel
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.2)' }}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>Manage Events</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#FA812F' }} />
              <input
                type="text"
                placeholder="Search events by name, category, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all"
                style={{ 
                  backgroundColor: 'white',
                  borderColor: 'rgba(92, 64, 51, 0.2)',
                  color: '#5C4033'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 rounded-full p-1 transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" style={{ color: '#5C4033' }} />
                </button>
              )}
            </div>
            <Link 
              to="/admin/events/new"
              className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add Event</span>
            </Link>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(250, 129, 47, 0.1)', border: '1px solid rgba(250, 129, 47, 0.3)' }}>
            <p className="text-sm" style={{ color: '#5C4033' }}>
              Found <span className="font-bold" style={{ color: '#FA812F' }}>{filteredEvents.length}</span> event{filteredEvents.length !== 1 ? 's' : ''} matching "{searchQuery}"
            </p>
          </div>
        )}
        
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#5C4033' }}>No Events Yet</h3>
            <p className="mb-6" style={{ color: '#5C4033', opacity: 0.6 }}>Create your first event to get started</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto mb-4" style={{ color: '#5C4033', opacity: 0.4 }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#5C4033' }}>No Events Found</h3>
            <p className="mb-6" style={{ color: '#5C4033', opacity: 0.6 }}>Try adjusting your search query</p>
            <button
              onClick={() => setSearchQuery('')}
              className="btn-secondary"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => (
              <div key={event._id} className="glass-effect p-4 rounded-lg border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {event.image && (
                        <img 
                          src={getImageUrl(event.image)} 
                          alt={event.name}
                          className="w-16 h-16 rounded-lg object-cover"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-white mb-1">{event.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                          <span className="px-2 py-1 rounded" style={{ backgroundColor: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' }}>
                            {event.category}
                          </span>
                          <span>{new Date(event.date).toLocaleDateString('en-IN')}</span>
                          <span>•</span>
                          <span>{event.venue}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <p className="text-sm" style={{ color: '#5C4033', opacity: 0.7 }}>Participants</p>
                      <p className="font-bold" style={{ color: '#FA812F' }}>{event.currentParticipants}/{event.maxParticipants}</p>
                    </div>
                    <Link
                      to={`/admin/events/edit/${event._id}`}
                      className="btn-secondary flex items-center space-x-2 py-2 px-3"
                      title="Edit event"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleViewRegistrations(event)}
                      className="flex items-center space-x-2 py-2 px-3 rounded-lg transition-all font-semibold"
                      style={{ 
                        backgroundColor: 'rgba(250, 129, 47, 0.2)',
                        color: '#FA812F',
                        border: '2px solid rgba(250, 129, 47, 0.3)'
                      }}
                      title="View registrations (Excel view)"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadExcel(event._id, event.slug || event.name)}
                      className="btn-secondary flex items-center space-x-2 py-2 px-3"
                      title="Download Excel file"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id, event.name)}
                      className="bg-red-500 hover:bg-red-600 text-white flex items-center space-x-2 py-2 px-3 rounded-lg transition-all"
                      title="Delete event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const RegistrationsManagement = ({ registrations }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.2)' }}>
        <h2 className="text-2xl font-bold mb-6" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>All Registrations</h2>
        
        {registrations.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#5C4033' }}>No Registrations Yet</h3>
            <p style={{ color: '#5C4033', opacity: 0.6 }}>Registrations will appear here once users sign up for events</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Participant ID</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Event</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg._id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{reg.user?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-white font-mono">{reg.registrationNumber || 'N/A'}</td>
                    <td className="py-3 px-4 text-white">{reg.event?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-gray-300">
                      {reg.registrationDate ? new Date(reg.registrationDate).toLocaleDateString('en-IN') : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">₹{reg.amount || 0}</td>
                    <td className="py-3 px-4">
                      <span className="text-xs px-3 py-1 rounded-full font-medium"
                        style={reg.paymentStatus === 'completed' 
                          ? { backgroundColor: 'rgba(92, 64, 51, 0.2)', color: '#5C4033' }
                          : reg.paymentStatus === 'failed'
                          ? { backgroundColor: 'rgba(44, 24, 16, 0.2)', color: '#2C1810' }
                          : reg.paymentStatus === 'verification_pending'
                          ? { backgroundColor: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' }
                          : { backgroundColor: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' }
                        }>
                        {reg.paymentStatus === 'verification_pending' ? 'Awaiting Verification' : (reg.paymentStatus || 'pending')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const PaymentsManagement = ({ registrations, onUpdate, events }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [selectedEventFilter, setSelectedEventFilter] = useState('all');

  useEffect(() => {
    fetchPayments();
  }, []);

  // Lock body scroll when screenshot modal is open
  useEffect(() => {
    if (showScreenshot) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showScreenshot]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/payments/all');
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  // Filter registrations by selected event
  const filteredRegistrations = selectedEventFilter === 'all' 
    ? registrations 
    : registrations.filter(r => r.event?._id === selectedEventFilter);

  const pendingPayments = filteredRegistrations.filter(r => r.paymentStatus === 'pending' || r.paymentStatus === 'verification_pending');
  const completedPayments = filteredRegistrations.filter(r => r.paymentStatus === 'completed');

  // Get unique events from registrations
  const eventsWithPayments = events.filter(event => 
    registrations.some(r => r.event?._id === event._id)
  );

  // Group pending payments by event
  const pendingPaymentsByEvent = pendingPayments.reduce((acc, reg) => {
    const eventId = reg.event?._id || 'unknown';
    const eventName = reg.event?.name || 'Unknown Event';
    
    if (!acc[eventId]) {
      acc[eventId] = {
        eventId,
        eventName,
        payments: []
      };
    }
    acc[eventId].payments.push(reg);
    return acc;
  }, {});

  const groupedPendingPayments = Object.values(pendingPaymentsByEvent);

  // Get payment details for a registration
  const getPaymentDetails = (regId) => {
    return payments.find(p => p.registration?._id === regId || p.registration === regId);
  };

  const handleVerifyPayment = async (regId) => {
    const payment = getPaymentDetails(regId);
    
    if (!payment) {
      toast.error('Payment details not found. User may not have submitted payment proof yet.');
      return;
    }

    if (!payment.utrNumber) {
      toast.error('UTR number not provided by user');
      return;
    }

    if (!window.confirm(`Verify payment with UTR: ${payment.utrNumber}?`)) {
      return;
    }

    const loadingToast = toast.loading('Verifying payment...');
    try {
      await API.put(`/payments/${payment._id}/approve`);
      toast.dismiss(loadingToast);
      toast.success('Payment verified successfully!');
      // Refresh both payments and registrations data
      await Promise.all([fetchPayments(), onUpdate ? onUpdate() : Promise.resolve()]);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to verify payment');
    }
  };

  const handleRejectPayment = async (regId, reason) => {
    const payment = getPaymentDetails(regId);
    
    if (!payment) {
      toast.error('Payment details not found');
      return;
    }

    const rejectionReason = prompt('Enter rejection reason:', reason || 'Invalid payment proof');
    
    if (!rejectionReason) return;

    const loadingToast = toast.loading('Rejecting payment...');
    try {
      await API.put(`/payments/${payment._id}/reject`, { reason: rejectionReason });
      toast.dismiss(loadingToast);
      toast.success('Payment rejected');
      // Refresh both payments and registrations data
      await Promise.all([fetchPayments(), onUpdate ? onUpdate() : Promise.resolve()]);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || 'Failed to reject payment');
    }
  };

  const viewScreenshot = (payment) => {
    setSelectedPayment(payment);
    setShowScreenshot(true);
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Screenshot Modal */}
      {showScreenshot && selectedPayment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(92, 64, 51, 0.7)' }}
          onClick={() => setShowScreenshot(false)}
        >
          <div className="max-w-4xl w-full rounded-2xl p-6 shadow-2xl" style={{ backgroundColor: '#FEF3E2' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>Payment Screenshot</h3>
              <button 
                onClick={() => setShowScreenshot(false)}
                className="transition-colors p-2 rounded-full hover:bg-black/10"
                style={{ color: '#5C4033' }}
              >
                ✕
              </button>
            </div>
            <div className="mb-4">
              <p style={{ color: '#5C4033' }}><strong>UTR:</strong> {selectedPayment.utrNumber}</p>
              <p style={{ color: '#5C4033' }}><strong>Amount:</strong> ₹{selectedPayment.amount}</p>
            </div>
            <img 
              src={selectedPayment.screenshotUrl?.startsWith('http') 
                ? selectedPayment.screenshotUrl 
                : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${selectedPayment.screenshotUrl}`
              } 
              alt="Payment Screenshot" 
              className="w-full rounded-lg"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23333"/><text x="50%" y="50%" text-anchor="middle" fill="%23999">Screenshot not available</text></svg>';
              }}
            />
          </div>
        </div>
      )}

      {/* Pending Payments */}
      <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.2)' }}>
        {/* Header with Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>Pending Payments</h2>
            <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(139, 69, 19, 0.2)', color: '#8b4513' }}>
              {pendingPayments.length} Pending
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold whitespace-nowrap" style={{ color: '#5C4033' }}>Filter by Event:</label>
            <select
              value={selectedEventFilter}
              onChange={(e) => setSelectedEventFilter(e.target.value)}
              className="px-4 py-2 rounded-lg font-medium"
              style={{ 
                backgroundColor: '#FFF8DC', 
                border: '2px solid rgba(92, 64, 51, 0.2)',
                color: '#5C4033',
                minWidth: '200px'
              }}
            >
              <option value="all">All Events</option>
              {eventsWithPayments.map(event => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics when event is selected */}
        {selectedEventFilter !== 'all' && (
          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(250, 177, 47, 0.1)', border: '1px solid rgba(250, 177, 47, 0.3)' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: '#5C4033' }}>
              <strong>📊 Viewing payments for:</strong> {eventsWithPayments.find(e => e._id === selectedEventFilter)?.name}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <p className="text-xs" style={{ color: '#5C4033', opacity: 0.7 }}>Total Registrations</p>
                <p className="text-lg font-bold" style={{ color: '#5C4033' }}>{filteredRegistrations.length}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#8b4513', opacity: 0.7 }}>Pending</p>
                <p className="text-lg font-bold" style={{ color: '#8b4513' }}>{pendingPayments.length}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: '#2d7a3e', opacity: 0.7 }}>Completed</p>
                <p className="text-lg font-bold" style={{ color: '#2d7a3e' }}>{completedPayments.length}</p>
              </div>
            </div>
          </div>
        )}
        
        {pendingPayments.length === 0 ? (
          <div className="text-center py-12">
            <IndianRupee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#5C4033' }}>No Pending Payments</h3>
            <p style={{ color: '#5C4033', opacity: 0.6 }}>All payments are up to date!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {groupedPendingPayments.map((eventGroup) => (
              <div key={eventGroup.eventId} className="space-y-3">
                {/* Event Header */}
                <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: 'rgba(250, 129, 47, 0.15)', border: '2px solid rgba(250, 129, 47, 0.3)' }}>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5" style={{ color: '#FA812F' }} />
                    <h3 className="font-bold text-lg" style={{ color: '#5C4033' }}>
                      {eventGroup.eventName}
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-sm font-bold" style={{ backgroundColor: 'rgba(250, 129, 47, 0.3)', color: '#FA812F' }}>
                    {eventGroup.payments.length} {eventGroup.payments.length === 1 ? 'Payment' : 'Payments'}
                  </span>
                </div>

                {/* Payments for this event */}
                <div className="space-y-3 pl-4">
                  {eventGroup.payments.map((reg) => {
                    const payment = getPaymentDetails(reg._id);
                    return (
                      <div key={reg._id} className="p-4 rounded-lg border-2 transition-all hover:shadow-lg" style={{ backgroundColor: '#FFF8DC', borderColor: 'rgba(139, 69, 19, 0.3)' }}>
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-bold text-lg" style={{ color: '#FA812F' }}>
                                {reg.user?.name || 'N/A'}
                              </p>
                              <p className="text-sm mt-1" style={{ color: '#5C4033', opacity: 0.7 }}>
                                {reg.user?.email || 'N/A'} • {reg.user?.phone || 'N/A'}
                              </p>
                              <p className="text-sm mt-2" style={{ color: '#5C4033' }}>
                                <strong>ID:</strong> <span className="font-mono">{reg.registrationNumber || 'N/A'}</span>
                              </p>
                              {payment?.utrNumber && (
                                <p className="text-sm mt-2 font-mono font-bold" style={{ color: '#FA812F' }}>
                                  <strong>UTR:</strong> {payment.utrNumber}
                                </p>
                              )}
                              {!payment?.utrNumber && (
                                <p className="text-sm mt-2 font-semibold" style={{ color: '#8b4513' }}>
                                  ⚠️ Payment proof not submitted yet
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-xs" style={{ color: '#5C4033', opacity: 0.6 }}>Amount</p>
                                <p className="text-2xl font-bold" style={{ color: '#FA812F' }}>₹{reg.amount || 0}</p>
                              </div>
                            </div>
                          </div>
                          {payment?.utrNumber && (
                            <div className="flex gap-2 flex-wrap pt-2 border-t" style={{ borderColor: 'rgba(92, 64, 51, 0.2)' }}>
                              {payment.screenshotUrl && (
                                <button 
                                  onClick={() => viewScreenshot(payment)}
                                  className="text-sm px-4 py-2 rounded-lg font-semibold transition-all"
                                  style={{ 
                                    backgroundColor: 'rgba(92, 64, 51, 0.1)',
                                    color: '#5C4033',
                                    border: '2px solid rgba(92, 64, 51, 0.3)'
                                  }}
                                >
                                  View Screenshot
                                </button>
                              )}
                              <button 
                                onClick={() => handleVerifyPayment(reg._id)}
                                className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition-all font-semibold"
                              >
                                ✓ Verify
                              </button>
                              <button 
                                onClick={() => handleRejectPayment(reg._id)}
                                className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg transition-all font-semibold"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Payments Summary */}
      <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.2)' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>Completed Payments</h2>
          <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(92, 64, 51, 0.2)', color: '#5C4033' }}>
            {completedPayments.length} Completed
          </span>
        </div>
        
        {completedPayments.length === 0 ? (
          <div className="text-center py-12">
            <IndianRupee className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2" style={{ color: '#5C4033' }}>No Completed Payments</h3>
            <p style={{ color: '#5C4033', opacity: 0.6 }}>Completed payments will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedPayments.slice(0, 9).map((reg) => (
              <div key={reg._id} className="p-4 rounded-lg border-2 transition-all hover:shadow-md" style={{ backgroundColor: '#FFF8DC', borderColor: 'rgba(45, 122, 62, 0.3)' }}>
                <div className="mb-2">
                  <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(45, 122, 62, 0.15)', color: '#2d7a3e' }}>
                    {reg.event?.name || 'N/A'}
                  </span>
                </div>
                <p className="font-bold" style={{ color: '#5C4033' }}>{reg.user?.name || 'N/A'}</p>
                <p className="text-xs mt-1" style={{ color: '#5C4033', opacity: 0.6 }}>{reg.registrationNumber || 'N/A'}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-bold text-lg" style={{ color: '#2d7a3e' }}>₹{reg.amount || 0}</span>
                  <span className="text-xs px-2 py-1 rounded-full font-semibold" style={{ backgroundColor: 'rgba(45, 122, 62, 0.2)', color: '#2d7a3e' }}>
                    ✓ Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

const RegisterUserManagement = ({ events, onUpdate }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [teamCollegeSuggestions, setTeamCollegeSuggestions] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    phone: '',
    college: ''
  });
  const [collegeSuggestions, setCollegeSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users');
      // Filter out admin users
      const nonAdminUsers = data.users.filter(u => u.role !== 'admin');
      setUsers(nonAdminUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    
    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    // Validate new user data
    if (!newUserData.name || !newUserData.email || !newUserData.phone || !newUserData.college) {
      toast.error('Please fill in all user details');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Validate phone format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newUserData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    // Get selected event data
    const eventData = events.find(e => e._id === selectedEvent);
    
    // Validate team event requirements
    if (eventData && eventData.teamSize && eventData.teamSize.max > 1) {
      if (!teamName) {
        toast.error('Team name is required for team events');
        return;
      }
      
      // Total team size = 1 (main user) + additional members
      const totalTeamSize = teamMembers.length + 1;
      
      if (totalTeamSize < eventData.teamSize.min) {
        toast.error(`Team size must be at least ${eventData.teamSize.min} members. Current: ${totalTeamSize}. Please add ${eventData.teamSize.min - totalTeamSize} more member(s).`);
        return;
      }
      if (totalTeamSize > eventData.teamSize.max) {
        toast.error(`Maximum team size is ${eventData.teamSize.max} members. Current: ${totalTeamSize}. Please remove ${totalTeamSize - eventData.teamSize.max} member(s).`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Send only the additional team members (not the main user)
      // The backend will handle the main user separately
      const payload = {
        eventId: selectedEvent,
        teamName: teamName || undefined,
        teamMembers: teamMembers.length > 0 ? teamMembers : undefined,
        newUser: newUserData
      };
      
      await API.post('/registrations/admin-register', payload);
      
      toast.success('User created and registered successfully!');
      setSelectedEvent('');
      setTeamName('');
      setTeamMembers([]);
      setNewUserData({ name: '', email: '', phone: '', college: '' });
      if (onUpdate) onUpdate();
      fetchUsers();
    } catch (error) {
      const errorData = error.response?.data;
      
      // Check if there are detailed validation errors
      if (errorData?.errors && errorData.errors.length > 0) {
        // Display main message
        toast.error(errorData.message || 'Registration validation failed', {
          duration: 6000,
          style: {
            background: '#FEF3E2',
            color: '#5C4033',
            border: '2px solid #dc2626',
            maxWidth: '600px'
          }
        });
        
        // Display each error
        errorData.errors.forEach((err, index) => {
          setTimeout(() => {
            toast.error(`❌ ${err}`, {
              duration: 5000,
              style: {
                background: '#FFF8DC',
                color: '#dc2626',
                border: '1px solid #dc2626'
              }
            });
          }, (index + 1) * 300);
        });
        
        // Display instructions
        if (errorData.instructions && errorData.instructions.length > 0) {
          setTimeout(() => {
            toast(
              <div style={{ color: '#5C4033' }}>
                <strong style={{ color: '#FA812F' }}>📋 Instructions:</strong>
                <ul style={{ marginTop: '8px', paddingLeft: '20px', fontSize: '13px' }}>
                  {errorData.instructions.map((instruction, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{instruction}</li>
                  ))}
                </ul>
              </div>,
              {
                duration: 8000,
                style: {
                  background: '#FFF8DC',
                  border: '2px solid #FA812F',
                  maxWidth: '500px'
                }
              }
            );
          }, (errorData.errors.length + 1) * 300);
        }
      } else {
        // Simple error message
        toast.error(errorData?.message || 'Failed to register user');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedUserData = users.find(u => u._id === selectedUser);
  const selectedEventData = events.find(e => e._id === selectedEvent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl shadow-lg p-6" style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.2)' }}>
        <div className="flex items-center gap-3 mb-6">
          <UserPlus className="w-8 h-8" style={{ color: '#FA812F' }} />
          <h2 className="text-2xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>Register User for Event</h2>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: '#FA812F' }}></div>
          </div>
        ) : (
          <form onSubmit={handleRegisterUser} className="space-y-6">
            {/* New User Form */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold" style={{ color: '#5C4033' }}>User Details</h3>
                
                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#5C4033' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="Enter full name"
                    required
                    className="w-full px-4 py-3 rounded-lg"
                    style={{ 
                      backgroundColor: '#FFF8DC', 
                      border: '2px solid rgba(92, 64, 51, 0.2)',
                      color: '#5C4033'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#5C4033' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                    className="w-full px-4 py-3 rounded-lg"
                    style={{ 
                      backgroundColor: '#FFF8DC', 
                      border: '2px solid rgba(92, 64, 51, 0.2)',
                      color: '#5C4033'
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#5C4033' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    placeholder="Enter 10-digit phone number"
                    required
                    className="w-full px-4 py-3 rounded-lg"
                    style={{ 
                      backgroundColor: '#FFF8DC', 
                      border: '2px solid rgba(92, 64, 51, 0.2)',
                      color: '#5C4033'
                    }}
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-semibold mb-2" style={{ color: '#5C4033' }}>
                    College Name *
                  </label>
                  <input
                    type="text"
                    value={newUserData.college}
                    onChange={(e) => {
                      const value = e.target.value;
                      setNewUserData({ ...newUserData, college: value });
                      
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
                      if (newUserData.college.length > 0) {
                        const filtered = colleges.filter(college =>
                          college.toLowerCase().includes(newUserData.college.toLowerCase())
                        ).slice(0, 10);
                        setCollegeSuggestions(filtered);
                        setShowSuggestions(true);
                      }
                    }}
                    onBlur={() => {
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="Start typing college name..."
                    required
                    className="w-full px-4 py-3 rounded-lg"
                    style={{ 
                      backgroundColor: '#FFF8DC', 
                      border: '2px solid rgba(92, 64, 51, 0.2)',
                      color: '#5C4033'
                    }}
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
                            setNewUserData({ ...newUserData, college });
                            setShowSuggestions(false);
                          }}
                          className="px-4 py-2 cursor-pointer transition-colors"
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

                <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(250, 129, 47, 0.1)', border: '1px solid rgba(250, 129, 47, 0.3)' }}>
                  <p className="text-xs" style={{ color: '#5C4033' }}>
                    ℹ️ A temporary password will be generated and sent to the user's email. They can change it after first login.
                  </p>
                </div>
              </div>

            {/* Event Selection */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: '#5C4033' }}>
                Select Event *
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg"
                style={{ 
                  backgroundColor: '#FFF8DC', 
                  border: '2px solid rgba(92, 64, 51, 0.2)',
                  color: '#5C4033'
                }}
              >
                <option value="">-- Select an event --</option>
                {events.map(event => (
                  <option key={event._id} value={event._id} disabled={event.isFull}>
                    {event.name} - {new Date(event.date).toLocaleDateString('en-IN')} 
                    {event.isFull ? ' (FULL)' : ` (${event.currentParticipants}/${event.maxParticipants})`}
                  </option>
                ))}
              </select>
              {selectedEventData && (
                <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(250, 177, 47, 0.1)', border: '1px solid rgba(250, 177, 47, 0.3)' }}>
                  <p className="text-sm" style={{ color: '#5C4033' }}>
                    <strong>Event:</strong> {selectedEventData.name}<br />
                    <strong>Date:</strong> {new Date(selectedEventData.date).toLocaleDateString('en-IN')}<br />
                    <strong>Time:</strong> {selectedEventData.time}<br />
                    <strong>Venue:</strong> {selectedEventData.venue}<br />
                    <strong>Fee:</strong> ₹{selectedEventData.registrationFee}<br />
                    <strong>Available Slots:</strong> {selectedEventData.maxParticipants - selectedEventData.currentParticipants}
                  </p>
                </div>
              )}
            </div>

            {/* Team Name (Required for Team Events) */}
            {selectedEventData && selectedEventData.teamSize && selectedEventData.teamSize.max > 1 && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#5C4033' }}>
                  Team Name *
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  required
                  className="w-full px-4 py-3 rounded-lg"
                  style={{ 
                    backgroundColor: '#FFF8DC', 
                    border: '2px solid rgba(92, 64, 51, 0.2)',
                    color: '#5C4033'
                  }}
                />
                <p className="text-xs mt-1" style={{ color: '#FA812F' }}>
                  This is a team event (Team size: {selectedEventData.teamSize.min}-{selectedEventData.teamSize.max})
                </p>
              </div>
            )}

            {/* Team Members (Required for Team Events) */}
            {selectedEventData && selectedEventData.teamSize && selectedEventData.teamSize.max > 1 && (
              <div className="space-y-3 p-4 rounded-lg" style={{ backgroundColor: 'rgba(250, 177, 47, 0.05)', border: '2px solid rgba(250, 177, 47, 0.2)' }}>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold" style={{ color: '#5C4033' }}>
                      Team Members * ({teamMembers.length + 1}/{selectedEventData.teamSize.max})
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        if (teamMembers.length + 1 >= selectedEventData.teamSize.max) {
                          alert(`Maximum team size is ${selectedEventData.teamSize.max} members`);
                          return;
                        }
                        setTeamMembers([...teamMembers, { name: '', email: '', phone: '', college: '' }]);
                      }}
                      disabled={teamMembers.length + 1 >= selectedEventData.teamSize.max}
                      className="px-3 py-1 rounded text-sm font-semibold transition-opacity"
                      style={{ 
                        background: teamMembers.length + 1 >= selectedEventData.teamSize.max 
                          ? '#ccc' 
                          : 'linear-gradient(to right, #FA812F, #FAB12F)',
                        color: '#FEF3E2',
                        cursor: teamMembers.length + 1 >= selectedEventData.teamSize.max ? 'not-allowed' : 'pointer',
                        opacity: teamMembers.length + 1 >= selectedEventData.teamSize.max ? 0.5 : 1
                      }}
                    >
                      + Add Member
                    </button>
                  </div>
                  {/* Minimum team size warning */}
                  {teamMembers.length + 1 < selectedEventData.teamSize.min && (
                    <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                      <p className="text-xs font-semibold" style={{ color: '#dc2626' }}>
                        ⚠️ Minimum team size is {selectedEventData.teamSize.min} members. Please add {selectedEventData.teamSize.min - (teamMembers.length + 1)} more member(s).
                      </p>
                    </div>
                  )}
                  {/* Team size complete indicator */}
                  {teamMembers.length + 1 >= selectedEventData.teamSize.min && teamMembers.length + 1 <= selectedEventData.teamSize.max && (
                    <div className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(45, 122, 62, 0.1)', border: '1px solid rgba(45, 122, 62, 0.3)' }}>
                      <p className="text-xs font-semibold" style={{ color: '#2d7a3e' }}>
                        ✓ Team size requirement met ({teamMembers.length + 1} members)
                      </p>
                    </div>
                  )}
                </div>

                {/* Member 1 - Auto-filled (Read-only) */}
                <div className="p-3 rounded-lg space-y-2" style={{ backgroundColor: 'rgba(45, 122, 62, 0.1)', border: '2px solid rgba(45, 122, 62, 0.3)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold" style={{ color: '#2d7a3e' }}>✓ Member 1 (Registered User - Auto-filled)</span>
                  </div>
                  <input
                    type="text"
                    value={newUserData.name}
                    readOnly
                    className="w-full px-3 py-2 rounded cursor-not-allowed"
                    style={{ backgroundColor: 'rgba(45, 122, 62, 0.05)', border: '1px solid rgba(45, 122, 62, 0.3)', color: '#2d7a3e' }}
                  />
                  <input
                    type="email"
                    value={newUserData.email}
                    readOnly
                    className="w-full px-3 py-2 rounded cursor-not-allowed"
                    style={{ backgroundColor: 'rgba(45, 122, 62, 0.05)', border: '1px solid rgba(45, 122, 62, 0.3)', color: '#2d7a3e' }}
                  />
                  <input
                    type="tel"
                    value={newUserData.phone}
                    readOnly
                    className="w-full px-3 py-2 rounded cursor-not-allowed"
                    style={{ backgroundColor: 'rgba(45, 122, 62, 0.05)', border: '1px solid rgba(45, 122, 62, 0.3)', color: '#2d7a3e' }}
                  />
                  <input
                    type="text"
                    value={newUserData.college}
                    readOnly
                    className="w-full px-3 py-2 rounded cursor-not-allowed"
                    style={{ backgroundColor: 'rgba(45, 122, 62, 0.05)', border: '1px solid rgba(45, 122, 62, 0.3)', color: '#2d7a3e' }}
                  />
                </div>
                
                {/* Additional Team Members */}
                {teamMembers.map((member, index) => (
                  <div key={index} className="p-3 rounded-lg space-y-2" style={{ backgroundColor: '#FFF8DC', border: '1px solid rgba(92, 64, 51, 0.2)' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: '#5C4033' }}>Member {index + 2}</span>
                      <button
                        type="button"
                        onClick={() => setTeamMembers(teamMembers.filter((_, i) => i !== index))}
                        className="text-red-600 text-sm font-semibold hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={member.name}
                      onChange={(e) => {
                        const updated = [...teamMembers];
                        updated[index].name = e.target.value;
                        setTeamMembers(updated);
                      }}
                      className="w-full px-3 py-2 rounded"
                      style={{ backgroundColor: '#FEF3E2', border: '1px solid rgba(92, 64, 51, 0.2)', color: '#5C4033' }}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={member.email}
                      onChange={(e) => {
                        const updated = [...teamMembers];
                        updated[index].email = e.target.value;
                        setTeamMembers(updated);
                      }}
                      className="w-full px-3 py-2 rounded"
                      style={{ backgroundColor: '#FEF3E2', border: '1px solid rgba(92, 64, 51, 0.2)', color: '#5C4033' }}
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={member.phone}
                      onChange={(e) => {
                        const updated = [...teamMembers];
                        updated[index].phone = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setTeamMembers(updated);
                      }}
                      className="w-full px-3 py-2 rounded"
                      style={{ backgroundColor: '#FEF3E2', border: '1px solid rgba(92, 64, 51, 0.2)', color: '#5C4033' }}
                    />
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="College"
                        value={member.college}
                        onChange={(e) => {
                          const value = e.target.value;
                          const updated = [...teamMembers];
                          updated[index].college = value;
                          setTeamMembers(updated);
                          
                          if (value.length > 0) {
                            const filtered = colleges.filter(college =>
                              college.toLowerCase().includes(value.toLowerCase())
                            ).slice(0, 10);
                            setTeamCollegeSuggestions({ ...teamCollegeSuggestions, [index]: filtered });
                          } else {
                            setTeamCollegeSuggestions({ ...teamCollegeSuggestions, [index]: [] });
                          }
                        }}
                        onFocus={() => {
                          if (member.college && member.college.length > 0) {
                            const filtered = colleges.filter(college =>
                              college.toLowerCase().includes(member.college.toLowerCase())
                            ).slice(0, 10);
                            setTeamCollegeSuggestions({ ...teamCollegeSuggestions, [index]: filtered });
                          }
                        }}
                        onBlur={() => {
                          setTimeout(() => setTeamCollegeSuggestions({ ...teamCollegeSuggestions, [index]: [] }), 200);
                        }}
                        className="w-full px-3 py-2 rounded"
                        style={{ backgroundColor: '#FEF3E2', border: '1px solid rgba(92, 64, 51, 0.2)', color: '#5C4033' }}
                        autoComplete="off"
                      />
                      {/* College Suggestions Dropdown */}
                      {teamCollegeSuggestions[index] && teamCollegeSuggestions[index].length > 0 && (
                        <div 
                          className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                          style={{ 
                            backgroundColor: '#FFF8DC', 
                            border: '2px solid rgba(250, 129, 47, 0.3)',
                          }}
                        >
                          {teamCollegeSuggestions[index].map((college, idx) => (
                            <div
                              key={idx}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                const updated = [...teamMembers];
                                updated[index].college = college;
                                setTeamMembers(updated);
                                setTeamCollegeSuggestions({ ...teamCollegeSuggestions, [index]: [] });
                              }}
                              className="px-4 py-2 cursor-pointer transition-colors"
                              style={{ 
                                color: '#5C4033',
                                borderBottom: idx < teamCollegeSuggestions[index].length - 1 ? '1px solid rgba(92, 64, 51, 0.1)' : 'none'
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
                  </div>
                ))}
                
                {teamMembers.length === 0 && (
                  <p className="text-sm text-center py-3" style={{ color: '#5C4033' }}>
                    Click "Add Member" to add team members
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !selectedEvent}
              className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                background: submitting ? '#ccc' : 'linear-gradient(to right, #FA812F, #FAB12F)',
                boxShadow: '0 4px 12px rgba(250, 129, 47, 0.3)'
              }}
            >
              {submitting ? 'Creating & Registering...' : 'Create User & Register'}
            </button>
          </form>
        )}

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(92, 64, 51, 0.1)', border: '2px solid rgba(92, 64, 51, 0.2)' }}>
          <p className="text-sm font-semibold" style={{ color: '#5C4033' }}>
            ℹ️ <strong>Note:</strong>
          </p>
          <ul className="text-sm mt-2 space-y-1" style={{ color: '#5C4033', paddingLeft: '20px' }}>
            <li>Registration will be created with payment status set to "pending"</li>
            <li>User must login and complete the payment to confirm their registration</li>
            <li>A temporary password will be randomly generated and sent to the user's email automatically</li>
            <li>User will receive their unique participant code via email for event check-ins</li>
            <li>For team events: Enter team name and add team members' details</li>
            <li>All registrations are automatically added to the Excel sheet for the event</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
