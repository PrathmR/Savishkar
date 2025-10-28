import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X as CloseIcon, LogOut, User, LayoutDashboard, BookOpen, Home, Calendar, Download, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';

const MobileNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showRulebookModal, setShowRulebookModal] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close menu when route changes
    setIsOpen(false);
  }, [navigate]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showRulebookModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRulebookModal]);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`md:hidden fixed w-full z-50 transition-all duration-500 border-0 ${
        scrolled 
          ? 'navbar-glass shadow-2xl' 
          : 'bg-transparent'
      }`}
      style={scrolled ? { border: 'none', borderBottom: '2px solid rgba(250, 129, 47, 0.3)', paddingTop: 'env(safe-area-inset-top)' } : { paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="w-full px-3">
        <div className="flex justify-between items-center h-16 py-2">
          {/* Compact Logo Section */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink min-w-0" onClick={() => setIsOpen(false)}>
            {/* College Logo */}
            <img 
              src="/jcerlogo.png" 
              alt="JCER Logo" 
              className="h-10 w-auto object-contain flex-shrink-0"
              style={{ filter: 'drop-shadow(0 2px 6px rgba(250, 129, 47, 0.3))' }}
            />
            
            {/* Savishkar Logo */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <img 
                src="/glow.png" 
                alt="Savishkar 2025" 
                className="h-8 w-auto object-contain"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(250, 129, 47, 0.4))' }}
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold leading-tight whitespace-nowrap" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                  SAVISHKAR
                </span>
                <span className="text-[10px] font-semibold -mt-0.5" style={{ color: '#a0522d', fontFamily: 'Georgia, serif' }}>2025</span>
              </div>
            </div>
          </Link>

          {/* User Info & Menu Button */}
          <div className="flex items-center space-x-2">
            {user && (
              <div className="flex items-center space-x-2 glass-effect px-2 py-1 rounded-lg" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                {user.avatar ? (
                  <img 
                    src={getImageUrl(user.avatar)} 
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-gray-600"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-4 h-4" style={{ color: '#FA812F' }} />
                )}
                <div className="flex flex-col max-w-[100px]">
                  <span className="text-xs font-semibold truncate" style={{ color: '#2C1810' }}>{user.name}</span>
                </div>
              </div>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="glass-effect p-2 rounded-lg"
            >
              {isOpen ? <CloseIcon className="w-6 h-6" style={{ color: '#FA812F' }} /> : <Menu className="w-6 h-6" style={{ color: '#FA812F' }} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect overflow-hidden"
            style={{ borderTop: '2px solid rgba(250, 129, 47, 0.3)' }}
          >
            <div className="px-4 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {/* Navigation Links */}
              <MobileNavLink to="/" onClick={() => setIsOpen(false)}>
                <Home className="w-5 h-5" />
                <span>Home</span>
              </MobileNavLink>
              
              <MobileNavLink to="/events" onClick={() => setIsOpen(false)}>
                <Calendar className="w-5 h-5" />
                <span>Events</span>
              </MobileNavLink>
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowRulebookModal(true);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 font-bold text-sm tracking-wide w-full text-left"
                style={{ color: '#8b4513', backgroundColor: 'rgba(250, 129, 47, 0.1)' }}
              >
                <span>Rulebook</span>
              </button>
              
              {user ? (
                <>
                  <div className="my-3" style={{ borderTop: '1px solid rgba(250, 129, 47, 0.3)' }}></div>
                  
                  <MobileNavLink to="/dashboard" onClick={() => setIsOpen(false)}>
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </MobileNavLink>
                  
                  {isAdmin && (
                    <MobileNavLink to="/admin" onClick={() => setIsOpen(false)}>
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Admin Panel</span>
                    </MobileNavLink>
                  )}
                  
                  {/* User Profile Card */}
                  <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: 'rgba(250, 129, 47, 0.1)', border: '1px solid rgba(250, 129, 47, 0.3)' }}>
                    <div className="flex items-center space-x-3 mb-3">
                      {user.avatar ? (
                        <img 
                          src={getImageUrl(user.avatar)} 
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-orange-400"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FA812F' }}>
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: '#2C1810' }}>{user.name}</p>
                        {user.college && (
                          <p className="text-xs truncate" style={{ color: '#8b4513' }}>{user.college}</p>
                        )}
                        {user.userCode && (
                          <p className="text-xs font-mono mt-1" style={{ color: '#FA812F' }}>Code: {user.userCode}</p>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full btn-secondary flex items-center justify-center space-x-2 py-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="my-3" style={{ borderTop: '1px solid rgba(250, 129, 47, 0.3)' }}></div>
                  
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full btn-secondary text-center py-3"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="block w-full btn-primary text-center py-3"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rulebook Modal */}
      <AnimatePresence>
        {showRulebookModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 backdrop-blur-md"
            style={{ backgroundColor: 'rgba(92, 64, 51, 0.7)' }}
            onClick={() => setShowRulebookModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden"
              style={{ backgroundColor: '#FEF3E2' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-3 border-b-2" style={{ borderColor: 'rgba(92, 64, 51, 0.2)' }}>
                <h3 className="text-base md:text-xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>
                  Savishkar 2025 Rulebook
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/rulebook/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 hover:scale-105"
                    style={{ 
                      backgroundColor: 'rgba(250, 129, 47, 0.2)',
                      color: '#FA812F',
                      border: '2px solid rgba(250, 129, 47, 0.3)'
                    }}
                    title="Download PDF"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Download</span>
                  </a>
                  <button
                    onClick={() => setShowRulebookModal(false)}
                    className="p-2 rounded-full hover:bg-black/10 transition-colors"
                    style={{ color: '#5C4033' }}
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              {/* PDF Viewer */}
              <div className="w-full h-[calc(90vh-60px)] overflow-auto">
                <iframe
                  src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/rulebook/view`}
                  className="w-full h-full"
                  title="Savishkar 2025 Rulebook"
                  style={{ border: 'none' }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const MobileNavLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-bold"
    style={{ color: '#8b4513', backgroundColor: 'rgba(250, 129, 47, 0.1)' }}
  >
    {children}
  </Link>
);

export default MobileNavbar;
