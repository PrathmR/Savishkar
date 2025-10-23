import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, IndianRupee, Clock, Trophy, ArrowLeft, UserPlus, X, AlertTriangle, CheckCircle, AlertCircle as AlertIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import API from '../services/api';
import toast from 'react-hot-toast';
import colleges from '../data/colleges';
import { getImageUrl } from '../utils/imageUtils';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showNotification } = useNotification();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamName, setTeamName] = useState('');
  const [conflictInfo, setConflictInfo] = useState(null);
  const [collegeSuggestions, setCollegeSuggestions] = useState({});

  // Initialize team members with logged-in user as first member when modal opens
  useEffect(() => {
    if (showTeamModal && user && teamMembers.length === 0) {
      setTeamMembers([{
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        college: user.college || ''
      }]);
    }
  }, [showTeamModal, user]);

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (event && isAuthenticated) {
      checkTimeConflict();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, isAuthenticated]);

  const fetchEvent = async () => {
    try {
      const { data } = await API.get(`/events/${id}`);
      console.log('Event details:', data.event);
      console.log('Event image URL:', data.event.image || 'NO IMAGE');
      setEvent(data.event);
    } catch (error) {
      showNotification({
        title: 'Loading Failed',
        message: 'Failed to load event details',
        icon: AlertIcon,
        type: 'error'
      });
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const checkTimeConflict = async () => {
    try {
      const { data } = await API.get(`/registrations/check-conflict/${id}`);
      if (data.hasConflict) {
        setConflictInfo(data.conflictingEvent);
      } else {
        setConflictInfo(null);
      }
    } catch (error) {
      // Silently fail - user might not be logged in
      console.log('Could not check conflict:', error.message);
    }
  };

  const handleRegister = async () => {
    if (!isAuthenticated) {
      showNotification({
        title: 'Login Required',
        message: 'Please login to register',
        icon: AlertIcon,
        type: 'error'
      });
      navigate('/login');
      return;
    }

    const isTeamEvent = event.teamSize.max > 1;
    
    // For team events, show the team modal
    if (isTeamEvent) {
      setShowTeamModal(true);
      return;
    }

    // For individual events, register directly
    setRegistering(true);

    try {
      const { data } = await API.post('/registrations', {
        eventId: id
      });

      showNotification({
        title: 'Registration Successful!',
        message: `You have successfully registered for ${event.name}! 🎉`,
        icon: CheckCircle
      });
      
      setTimeout(() => {
        if (event.registrationFee > 0) {
          navigate(`/payment/${data.registration._id}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      showNotification({
        title: 'Registration Failed',
        message: errorMessage,
        icon: AlertIcon,
        type: 'error'
      });
    } finally {
      setRegistering(false);
    }
  };

  const handleTeamSubmit = async () => {
    if (!teamName.trim()) {
      showNotification({
        title: 'Team Name Required',
        message: 'Please enter a team name',
        icon: AlertIcon,
        type: 'error'
      });
      return;
    }

    if (teamMembers.length < event.teamSize.min) {
      showNotification({
        title: 'Insufficient Members',
        message: `Minimum ${event.teamSize.min} team members required`,
        icon: AlertIcon,
        type: 'error'
      });
      return;
    }

    if (teamMembers.some(m => !m.name || !m.email || !m.phone)) {
      showNotification({
        title: 'Incomplete Details',
        message: 'Please fill all team member details',
        icon: AlertIcon,
        type: 'error'
      });
      return;
    }

    setRegistering(true);

    try {
      const { data } = await API.post('/registrations', {
        eventId: id,
        teamName,
        teamMembers
      });

      showNotification({
        title: 'Team Registration Successful!',
        message: `Team "${teamName}" has been successfully registered for ${event.name}! 🎉`,
        icon: CheckCircle
      });
      setShowTeamModal(false);
      
      setTimeout(() => {
        if (event.registrationFee > 0) {
          navigate(`/payment/${data.registration._id}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      
      showNotification({
        title: 'Registration Failed',
        message: errorMessage,
        icon: AlertIcon,
        type: 'error'
      });
    } finally {
      setRegistering(false);
    }
  };

  const addTeamMember = () => {
    if (teamMembers.length < event.teamSize.max) {
      setTeamMembers([...teamMembers, { name: '', email: '', phone: '', college: '' }]);
    } else {
      showNotification({
        title: 'Maximum Reached',
        message: `Maximum ${event.teamSize.max} team members allowed`,
        icon: AlertIcon,
        type: 'error'
      });
    }
  };

  const removeTeamMember = (index) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    } else {
      showNotification({
        title: 'Cannot Remove',
        message: 'At least one team member is required',
        icon: AlertIcon,
        type: 'error'
      });
    }
  };

  const updateTeamMember = (index, field, value) => {
    const updated = [...teamMembers];
    updated[index][field] = value;
    setTeamMembers(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!event) return null;

  const isTeamEvent = event.teamSize.max > 1;

  return (
    <div className="min-h-screen pt-20 pb-12 relative">
      {/* Back Button */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <Link to="/events" className="inline-flex items-center font-bold transition-colors" style={{ color: '#8b4513' }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Link>
      </div>

      {/* Time Conflict Warning */}
      {conflictInfo && isAuthenticated && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl p-5 backdrop-blur-sm"
            style={{ 
              background: 'linear-gradient(135deg, rgba(250, 177, 47, 0.15) 0%, rgba(250, 129, 47, 0.15) 100%)',
              border: '2px solid rgba(250, 129, 47, 0.4)',
              boxShadow: '0 8px 32px rgba(250, 129, 47, 0.2)'
            }}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6" style={{ color: '#FA812F' }} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2 text-lg" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                  Time Conflict Detected
                </h3>
                <p className="text-sm leading-relaxed font-semibold" style={{ color: '#8b4513' }}>
                  You are already registered for <span className="font-bold" style={{ color: '#2C1810' }}>"{conflictInfo.name}"</span> which is scheduled at the same time 
                  ({conflictInfo.time} on {new Date(conflictInfo.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}). 
                  You cannot register for multiple events at the same time.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Event Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-500 to-secondary-500"
          >
            {event.image ? (
              <img 
                src={getImageUrl(event.image)} 
                alt={event.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Event detail image failed to load:', event.image);
                  e.target.style.display = 'none';
                }}
                onLoad={() => console.log('Event detail image loaded:', getImageUrl(event.image))}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-white">
                  <Calendar className="w-24 h-24 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-semibold">No Image Available</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-6 left-6">
              <span className="px-4 py-2 bg-primary-500 text-white font-semibold rounded-full">
                {event.category}
              </span>
            </div>
          </motion.div>

          {/* Event Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col justify-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>{event.name}</h1>
            <p className="text-gray-300 text-lg mb-6">{event.shortDescription}</p>

            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-300">
                <Calendar className="w-5 h-5 mr-3 text-primary-400" />
                {new Date(event.date).toLocaleDateString('en-IN', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </div>
              <div className="flex items-center text-gray-300">
                <Clock className="w-5 h-5 mr-3 text-primary-400" />
                {event.time}
              </div>
              <div className="flex items-center text-gray-300">
                <MapPin className="w-5 h-5 mr-3 text-primary-400" />
                {event.venue}
              </div>
              <div className="flex items-center text-gray-300">
                <Users className="w-5 h-5 mr-3 text-primary-400" />
                {event.currentParticipants}/{event.maxParticipants} Participants
              </div>
              <div className="flex items-center text-2xl font-bold text-primary-400">
                <IndianRupee className="w-6 h-6 mr-2" />
                {event.registrationFee === 0 ? 'Free' : event.registrationFee}
              </div>
            </div>

            <button
              onClick={handleRegister}
              disabled={registering || event.currentParticipants >= event.maxParticipants || conflictInfo}
              className="btn-primary text-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registering ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  <span>Registering...</span>
                </>
              ) : event.currentParticipants >= event.maxParticipants ? (
                <span>Event Full</span>
              ) : conflictInfo ? (
                <>
                  <AlertTriangle className="w-5 h-5" />
                  <span>Time Conflict</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Register Now</span>
                </>
              )}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Event Details Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="card">
              <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>About Event</h2>
              <p className="whitespace-pre-line" style={{ color: '#8b4513' }}>{event.description}</p>
            </div>

            {/* Rules */}
            {event.rules && event.rules.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Rules & Regulations</h2>
                <ul className="space-y-2">
                  {event.rules.map((rule, index) => (
                    <li key={index} className="flex items-start" style={{ color: '#8b4513' }}>
                      <span className="mr-2" style={{ color: '#FA812F' }}>•</span>
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Eligibility */}
            {event.eligibility && event.eligibility.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-bold mb-4 text-white">Eligibility</h2>
                <ul className="space-y-2">
                  {event.eligibility.map((item, index) => (
                    <li key={index} className="flex items-start text-gray-300">
                      <span className="text-primary-400 mr-2">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prizes */}
            {event.prizes && (event.prizes.first || event.prizes.second || event.prizes.third) && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 flex items-center" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                  <Trophy className="w-6 h-6 mr-2" style={{ color: '#FAB12F' }} />
                  Prizes
                </h2>
                <div className="space-y-3">
                  {event.prizes.first && (
                    <div className="flex justify-between items-center">
                      <span style={{ color: '#8b4513' }}>1st Prize</span>
                      <span className="font-bold" style={{ color: '#FAB12F' }}>{event.prizes.first}</span>
                    </div>
                  )}
                  {event.prizes.second && (
                    <div className="flex justify-between items-center">
                      <span style={{ color: '#8b4513' }}>2nd Prize</span>
                      <span className="font-bold" style={{ color: '#8b4513' }}>{event.prizes.second}</span>
                    </div>
                  )}
                  {event.prizes.third && (
                    <div className="flex justify-between items-center">
                      <span style={{ color: '#8b4513' }}>3rd Prize</span>
                      <span className="font-bold" style={{ color: '#FA812F' }}>{event.prizes.third}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Team Info */}
            {isTeamEvent && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4 text-white">Team Information</h2>
                <div className="space-y-2 text-gray-300">
                  <p>Min Team Size: <span className="font-bold text-white">{event.teamSize.min}</span></p>
                  <p>Max Team Size: <span className="font-bold text-white">{event.teamSize.max}</span></p>
                </div>
              </div>
            )}

            {/* Coordinators */}
            {event.coordinators && event.coordinators.length > 0 && (
              <div className="card">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>Contact</h2>
                <div className="space-y-3">
                  {event.coordinators.map((coord, index) => (
                    <div key={index} className="text-sm">
                      <p className="font-semibold" style={{ color: '#2C1810' }}>{coord.name}</p>
                      <p style={{ color: '#8b4513' }}>{coord.phone}</p>
                      <p style={{ color: '#8b4513' }}>{coord.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Team Registration Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: '#FEF3E2', border: '2px solid rgba(92, 64, 51, 0.3)' }}
          >
            <div className="sticky top-0 p-6 flex justify-between items-center" style={{ backgroundColor: '#FEF3E2', borderBottom: '2px solid rgba(92, 64, 51, 0.3)' }}>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: '#FA812F' }}>Team Registration</h2>
                <p className="text-sm mt-1" style={{ color: '#FA812F' }}>
                  Team size: {event.teamSize.min} - {event.teamSize.max} members
                </p>
              </div>
              <button
                onClick={() => setShowTeamModal(false)}
                className="p-2 rounded-lg transition-colors"
                style={{ color: '#FA812F' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(250, 129, 47, 0.2)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Team Name */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#FA812F' }}>Team Name *</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your team name"
                  required
                />
              </div>

              {/* Team Members */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium" style={{ color: '#FA812F' }}>
                    Team Members ({teamMembers.length}/{event.teamSize.max})
                  </label>
                  <button
                    onClick={addTeamMember}
                    disabled={teamMembers.length >= event.teamSize.max}
                    className="btn-secondary text-sm py-2 px-4 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={teamMembers.length >= event.teamSize.max ? 'Maximum team size reached' : 'Add another team member'}
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {teamMembers.map((member, index) => (
                    <div key={index} className="card relative" style={{ backgroundColor: index === 0 ? 'rgba(45, 122, 62, 0.1)' : '#FFF8DC', border: index === 0 ? '2px solid rgba(45, 122, 62, 0.3)' : '2px solid rgba(250, 129, 47, 0.3)' }}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold" style={{ color: index === 0 ? '#2d7a3e' : '#5C4033' }}>
                          {index === 0 ? '✓ Member 1 (You)' : `Member ${index + 1}`}
                        </h3>
                        {teamMembers.length > 1 && index > 0 && (
                          <button
                            onClick={() => removeTeamMember(index)}
                            className="p-1 hover:bg-red-500/20 rounded transition-colors"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm mb-1" style={{ color: '#FA812F' }}>Name *</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            className="input-field"
                            placeholder="Full name"
                            required
                            readOnly={index === 0}
                            style={index === 0 ? { backgroundColor: 'rgba(45, 122, 62, 0.05)', cursor: 'not-allowed' } : {}}
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1" style={{ color: '#FA812F' }}>Email *</label>
                          <input
                            type="email"
                            value={member.email}
                            onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
                            className="input-field"
                            placeholder="email@example.com"
                            required
                            readOnly={index === 0}
                            style={index === 0 ? { backgroundColor: 'rgba(45, 122, 62, 0.05)', cursor: 'not-allowed' } : {}}
                          />
                        </div>

                        <div>
                          <label className="block text-sm mb-1" style={{ color: '#FA812F' }}>Phone *</label>
                          <input
                            type="tel"
                            value={member.phone}
                            onChange={(e) => updateTeamMember(index, 'phone', e.target.value)}
                            className="input-field"
                            placeholder="10-digit phone number"
                            required
                            readOnly={index === 0}
                            style={index === 0 ? { backgroundColor: 'rgba(45, 122, 62, 0.05)', cursor: 'not-allowed' } : {}}
                          />
                        </div>

                        <div className="relative">
                          <label className="block text-sm mb-1" style={{ color: '#FA812F' }}>College</label>
                          <input
                            type="text"
                            value={member.college}
                            onChange={(e) => {
                              const value = e.target.value;
                              updateTeamMember(index, 'college', value);
                              
                              if (value.length > 0 && index !== 0) {
                                const filtered = colleges.filter(college =>
                                  college.toLowerCase().includes(value.toLowerCase())
                                ).slice(0, 10);
                                setCollegeSuggestions({ ...collegeSuggestions, [index]: filtered });
                              } else {
                                setCollegeSuggestions({ ...collegeSuggestions, [index]: [] });
                              }
                            }}
                            onFocus={() => {
                              if (member.college && member.college.length > 0 && index !== 0) {
                                const filtered = colleges.filter(college =>
                                  college.toLowerCase().includes(member.college.toLowerCase())
                                ).slice(0, 10);
                                setCollegeSuggestions({ ...collegeSuggestions, [index]: filtered });
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => setCollegeSuggestions({ ...collegeSuggestions, [index]: [] }), 200);
                            }}
                            className="input-field"
                            placeholder="College name (optional)"
                            readOnly={index === 0}
                            style={index === 0 ? { backgroundColor: 'rgba(45, 122, 62, 0.05)', cursor: 'not-allowed' } : {}}
                            autoComplete="off"
                          />
                          {/* College Suggestions Dropdown */}
                          {collegeSuggestions[index] && collegeSuggestions[index].length > 0 && index !== 0 && (
                            <div 
                              className="absolute z-50 w-full mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                              style={{ 
                                backgroundColor: '#FFF8DC', 
                                border: '2px solid rgba(250, 129, 47, 0.3)',
                              }}
                            >
                              {collegeSuggestions[index].map((college, idx) => (
                                <div
                                  key={idx}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    updateTeamMember(index, 'college', college);
                                    setCollegeSuggestions({ ...collegeSuggestions, [index]: [] });
                                  }}
                                  className="px-4 py-2 cursor-pointer transition-colors"
                                  style={{ 
                                    color: '#5C4033',
                                    borderBottom: idx < collegeSuggestions[index].length - 1 ? '1px solid rgba(92, 64, 51, 0.1)' : 'none'
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => setShowTeamModal(false)}
                  className="flex-1 btn-secondary"
                  disabled={registering}
                >
                  Cancel
                </button>
                <button
                  onClick={handleTeamSubmit}
                  disabled={registering}
                  className="flex-1 btn-primary flex items-center justify-center space-x-2"
                >
                  {registering ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Registering...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Register Team</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
