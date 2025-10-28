import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, ArrowRight, Zap, Target, Rocket, Clock, BookOpen, Download, Instagram, Mail, ChevronDown, ChevronLeft, ChevronRight, ArrowUp, X, Eye } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { useLenisScroll } from '../hooks/useLenisScroll';

const Home = () => {
  const { isAuthenticated } = useAuth();
  
  // Initialize Lenis-style scroll animations
  useLenisScroll();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Back to Top Button State
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Rulebook Modal State
  const [showRulebookModal, setShowRulebookModal] = useState(false);

  // Photo Gallery State
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const galleryImages = [
    {
      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      caption: 'Savishkar 2024 - Opening Ceremony'
    },
    {
      url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
      caption: 'Savishkar 2024 - Technical Events'
    },
    {
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800',
      caption: 'Savishkar 2024 - Cultural Night'
    },
    {
      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800',
      caption: 'Savishkar 2024 - Prize Distribution'
    },
    {
      url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800',
      caption: 'Savishkar 2024 - Workshops'
    },
    {
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800',
      caption: 'Savishkar 2024 - Team Events'
    }
  ];

  useEffect(() => {
    // Set event date - November 12-13, 2025 (2 Days)
    const eventDate = new Date('2025-11-12T00:00:00').getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = eventDate - now;

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });

      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [galleryImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  // Back to Top scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 500) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Logo Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="relative z-10 flex flex-col items-center justify-center px-4">
          {/* Welcome Text */}
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center"
            style={{ 
              color: '#1e40af',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              fontFamily: "'Playfair Display', serif"
            }}
          >
            Welcome to
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, type: "spring" }}
            className="w-full max-w-3xl"
          >
            <img 
              src="/glow.png" 
              alt="Savishkar 2025" 
              className="w-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
          
          {/* Scroll Down Indicator */}
          <motion.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            onClick={() => window.scrollBy({ top: window.innerHeight, behavior: 'smooth' })}
            className="absolute bottom-0 pb-4 flex flex-col items-center gap-2 cursor-pointer"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <motion.p
              animate={{ opacity: [1, 0.6, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-sm font-bold uppercase tracking-[0.3em]"
              style={{ color: '#FA812F' }}
            >
              SCROLL DOWN
            </motion.p>
          </motion.button>
        </div>
      </section>

      {/* Welcome Section (Previously Hero) */}
      <section className="relative min-h-screen flex items-center overflow-hidden py-20">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h1
                className="leading-tight"
                data-scroll="slide-up"
              >
                <span className="text-4xl md:text-5xl font-bold block mb-2" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>
                  Welcome to
                </span>
                <span className="text-5xl md:text-7xl font-extrabold block" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                  Savishkar
                </span>
                <span className="text-5xl md:text-7xl font-extrabold block" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                  2025
                </span>
              </h1>

              <p
                className="text-base md:text-lg max-w-xl leading-relaxed"
                style={{ color: '#5C4033' }}
                data-scroll="slide-up"
                data-scroll-delay="100"
              >
                Join National level techno-cultural fest where innovation meets excellence. Experience cutting-edge technology, compete in thrilling events, and network with the brightest minds.
              </p>

              <div
                className="flex flex-col sm:flex-row gap-4"
                data-scroll="slide-up"
                data-scroll-delay="200"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/events" className="btn-primary text-base px-8 py-4 inline-flex items-center justify-center group">
                    <span>Explore Events</span>
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </motion.div>
                {!isAuthenticated && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/signup" className="btn-secondary text-base px-8 py-4 inline-flex items-center justify-center">
                      <span>Register Now</span>
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Right Content - Photo Gallery Carousel */}
            <div
              className="relative flex items-center justify-end lg:justify-end -mt-8 lg:-mt-12"
              data-scroll="slide-right"
            >
              <div className="relative w-full max-w-md lg:max-w-lg lg:mr-0">
                {/* Gallery Title */}
                <h3
                  className="text-2xl font-bold text-center mb-6"
                  style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}
                  data-scroll="fade"
                  data-scroll-delay="100"
                >
                  GalleryHub
                </h3>

                {/* Carousel Container */}
                <div className="relative overflow-hidden rounded-2xl shadow-2xl" style={{ aspectRatio: '4/3' }}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, x: 100 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ duration: 0.5 }}
                      className="relative w-full h-full"
                    >
                      <img
                        src={galleryImages[currentImageIndex].url}
                        alt={galleryImages[currentImageIndex].caption}
                        className="w-full h-full object-cover"
                        style={{ filter: 'brightness(0.9)' }}
                      />
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-all shadow-lg z-10"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6" style={{ color: '#1a365d' }} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white transition-all shadow-lg z-10"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6" style={{ color: '#1a365d' }} />
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              className="card text-center p-8 hover:-translate-y-1 transition-all duration-300"
              data-scroll="scale"
            >
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: '#1a365d' }} />
              <h3 className="text-4xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                50+
              </h3>
              <p className="text-sm" style={{ color: '#5C4033' }}>Events</p>
            </div>
            <div
              className="card text-center p-8 hover:-translate-y-1 transition-all duration-300"
              data-scroll="scale"
              data-scroll-delay="100"
            >
              <Trophy className="w-12 h-12 mx-auto mb-4" style={{ color: '#1a365d' }} />
              <h3 className="text-4xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                ₹10L+
              </h3>
              <p className="text-sm" style={{ color: '#5C4033' }}>Prize Pool</p>
            </div>
            <div
              className="card text-center p-8 hover:-translate-y-1 transition-all duration-300"
              data-scroll="scale"
              data-scroll-delay="200"
            >
              <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: '#1a365d' }} />
              <h3 className="text-4xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                2 Days
              </h3>
              <p className="text-sm" style={{ color: '#5C4033' }}>Of Innovation</p>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center mb-12"
            data-scroll="slide-up"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
              Event Schedule
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: '#5C4033' }}>
              Two days of innovation, competition, and celebration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Day 1 */}
            <div
              className="card p-6 hover:-translate-y-1 transition-all duration-300"
              data-scroll="slide-up"
              data-scroll-delay="100"
            >
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-2 rounded-full mb-3" style={{ background: 'linear-gradient(to right, #FA812F, #FAB12F)' }}>
                  <span className="text-sm font-bold" style={{ color: '#FEF3E2' }}>Day 1</span>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                  November 12, 2025
                </h3>
              </div>
              <div className="space-y-3">
                <ScheduleItem time="09:00 AM" event="Registration & Inauguration" />
                <ScheduleItem time="11:00 AM" event="Technical Events Begin" />
                <ScheduleItem time="02:00 PM" event="Workshop Sessions" />
                <ScheduleItem time="05:00 PM" event="Cultural Performances" />
              </div>
            </div>

            {/* Day 2 */}
            <div
              className="card p-6 hover:-translate-y-1 transition-all duration-300"
              data-scroll="slide-up"
              data-scroll-delay="200"
            >
              <div className="text-center mb-4">
                <div className="inline-block px-4 py-2 rounded-full mb-3" style={{ background: 'linear-gradient(to right, #FA812F, #FAB12F)' }}>
                  <span className="text-sm font-bold" style={{ color: '#FEF3E2' }}>Day 2</span>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                  November 13, 2025
                </h3>
              </div>
              <div className="space-y-3">
                <ScheduleItem time="09:00 AM" event="Hackathon & Competitions" />
                <ScheduleItem time="12:00 PM" event="Gaming & Project Exhibitions" />
                <ScheduleItem time="04:00 PM" event="Prize Distribution" />
                <ScheduleItem time="06:00 PM" event="Closing Ceremony" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rulebook Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="card text-center p-8 md:p-12 relative overflow-hidden"
            data-scroll="scale"
          >
            <div className="relative z-10">
              <div
                className="inline-block mb-6"
                data-scroll="scale"
                data-scroll-delay="100"
              >
                <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #5C4033, #8b4513)' }}>
                  <BookOpen className="w-8 h-8" style={{ color: '#FEF3E2' }} />
                </div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                Event Rulebook
              </h2>
              <p className="text-base mb-8 max-w-2xl mx-auto" style={{ color: '#5C4033' }}
              >
                View our comprehensive rulebook to learn everything about Savishkar 2025, event guidelines, rules and regulations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowRulebookModal(true)}
                  className="btn-primary text-base px-8 py-3 inline-flex items-center justify-center group"
                >
                  <Eye className="mr-2 w-5 h-5" />
                  <span>View Rulebook</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <a
                  href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/rulebook/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-base px-8 py-3 inline-flex items-center justify-center group"
                >
                  <Download className="mr-2 w-5 h-5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rulebook Modal */}
      <AnimatePresence>
        {showRulebookModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md"
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
              <div className="flex items-center justify-between p-4 border-b-2" style={{ borderColor: 'rgba(92, 64, 51, 0.2)' }}>
                <h3 className="text-2xl font-bold" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>
                  Savishkar 2025 - Event Rulebook
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/rulebook/download`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg transition-all font-semibold flex items-center gap-2"
                    style={{ 
                      backgroundColor: 'rgba(250, 129, 47, 0.2)',
                      color: '#FA812F',
                      border: '2px solid rgba(250, 129, 47, 0.3)'
                    }}
                    title="Download PDF"
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Download</span>
                  </a>
                  <button
                    onClick={() => setShowRulebookModal(false)}
                    className="p-2 rounded-full hover:bg-black/10 transition-colors"
                    style={{ color: '#5C4033' }}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* PDF Viewer */}
              <div className="w-full h-[calc(90vh-80px)] overflow-auto">
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

      {/* Countdown Timer Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="text-center mb-8"
            data-scroll="slide-up"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
              Event Starts In
            </h3>
            <p className="text-base mb-6" style={{ color: '#8b4513', fontWeight: '600' }}>
              November 12-13, 2025 | 2 Days of Innovation
            </p>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-8 max-w-3xl mx-auto px-2">
              <TimeBox value={timeLeft.days} label="DAYS" />
              <TimeBox value={timeLeft.hours} label="HOURS" />
              <TimeBox value={timeLeft.minutes} label="MINUTES" />
              <TimeBox value={timeLeft.seconds} label="SECONDS" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 relative overflow-hidden">
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              className="card text-center p-12 relative overflow-hidden"
              data-scroll="scale"
            >
              <div className="relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                  Ready to Join the Revolution?
                </h2>
                <p className="text-base mb-8" style={{ color: '#5C4033' }}>
                  Register now and be part of something extraordinary
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup" className="btn-primary text-base px-8 py-3 inline-flex items-center">
                    <span>Get Started</span>
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-6" style={{ borderTop: '2px solid rgba(250, 129, 47, 0.3)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Coordinators Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center" data-scroll="fade" data-scroll-delay="100">
              <h4 className="text-lg font-bold mb-2" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                Student Co-ordinators
              </h4>
              <p style={{ color: '#2C1810' }}>Contact: +91 XXXXXXXXXX</p>
            </div>
            <div className="text-center" data-scroll="fade" data-scroll-delay="200">
              <h4 className="text-lg font-bold mb-2" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                Faculty Co-ordinator
              </h4>
              <p className="mb-6" style={{ color: '#2C1810' }}>Prof. [Name]</p>
              
              {/* Navigation Links - Below Faculty Coordinator */}
              <div className="flex items-center justify-center flex-wrap gap-4 mt-2">
              <Link to="/" className="text-sm transition-all duration-300 relative group font-bold" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full" style={{ backgroundColor: '#8b4513' }} />
              </Link>
              <Link to="/events" className="text-sm transition-all duration-300 relative group font-bold" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                Events
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full" style={{ backgroundColor: '#8b4513' }} />
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="text-sm transition-all duration-300 relative group font-bold" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                    Dashboard
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full" style={{ backgroundColor: '#8b4513' }} />
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm transition-all duration-300 relative group font-bold" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                    Login
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full" style={{ backgroundColor: '#8b4513' }} />
                  </Link>
                  <Link to="/signup" className="text-sm transition-all duration-300 relative group font-bold" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                    Register
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full" style={{ backgroundColor: '#8b4513' }} />
                  </Link>
                </>
              )}
              </div>
            </div>
            <div className="text-center" data-scroll="fade" data-scroll-delay="300">
              <h4 className="text-lg font-bold mb-2" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                Principal
              </h4>
              <p style={{ color: '#2C1810' }}>Dr. [Name]</p>
            </div>
          </div>
          
          <div className="text-center" data-scroll="slide-up">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <img 
                src="/glow.png" 
                alt="Savishkar Logo" 
                className="w-10 h-10 object-contain"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(250, 129, 47, 0.4))' }}
              />
              <span className="text-lg font-bold" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>Savishkar 2025</span>
            </div>
            
            {/* Social Media Links */}
            <div className="flex items-center justify-center space-x-6 mb-3">
              <motion.a
                href="https://instagram.com/savishkar2025"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors"
                style={{ color: '#FA812F' }}
                aria-label="Instagram"
                whileHover={{ scale: 1.2, rotate: 15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Instagram className="w-6 h-6" />
              </motion.a>
              <motion.a
                href="mailto:contact@savishkar.com"
                className="transition-colors"
                style={{ color: '#FA812F' }}
                aria-label="Email"
                whileHover={{ scale: 1.2, rotate: -15 }}
                whileTap={{ scale: 0.9 }}
              >
                <Mail className="w-6 h-6" />
              </motion.a>
            </div>
            
            <p style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
              © {new Date().getFullYear()} Savishkar - Jain College of Engineering & Research. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full shadow-lg z-50 transition-all hover:shadow-2xl backdrop-blur-sm"
            style={{ 
              background: 'rgba(250, 129, 47, 0.95)',
              border: '2px solid rgba(255, 255, 255, 0.8)',
              boxShadow: '0 4px 20px rgba(250, 129, 47, 0.4)'
            }}
            whileHover={{ scale: 1.15, y: -2 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" style={{ color: '#FFFFFF', strokeWidth: 2.5 }} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

const TimeBox = ({ value, label }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.05, y: -5 }}
    className="card p-2 sm:p-4 md:p-6 flex flex-col items-center justify-center min-h-[90px] sm:min-h-[100px]"
  >
    <div className="text-2xl sm:text-4xl md:text-5xl font-bold mb-1" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
      {String(value).padStart(2, '0')}
    </div>
    <div className="text-[9px] sm:text-xs md:text-sm uppercase tracking-wide leading-tight text-center" style={{ color: '#5C4033' }}>
      {label}
    </div>
  </motion.div>
);

const ScheduleItem = ({ time, event }) => (
  <div className="flex items-start gap-3 p-3 rounded-lg transition-all hover:scale-105 hover:shadow-md cursor-pointer" style={{ backgroundColor: 'rgba(250, 129, 47, 0.05)' }}>
    <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#FA812F' }} />
    <div className="flex-1">
      <p className="text-sm font-semibold mb-1" style={{ color: '#1a365d' }}>{time}</p>
      <p className="text-sm" style={{ color: '#5C4033' }}>{event}</p>
    </div>
  </div>
);

export default Home;
