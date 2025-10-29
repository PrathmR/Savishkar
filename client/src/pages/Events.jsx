import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, IndianRupee, Search, Filter, AlertCircle } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';
import { useNotification } from '../context/NotificationContext';
import { getImageUrl } from '../utils/imageUtils';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const { showNotification } = useNotification();

  const categories = ['All', 'Technical', 'Non-Technical', 'Cultural'];
  const departments = ['All', 'ECE', 'CSE', 'Mech', 'Civil', 'AIML', 'Applied Science', 'MBA', 'Common'];

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await API.get('/events');
      console.log('Fetched events:', data.events);
      data.events.forEach(event => {
        console.log(`Event: ${event.name}, Image URL: ${event.image || 'NO IMAGE'}`);
      });
      setEvents(data.events);
    } catch (error) {
      showNotification({
        title: 'Loading Failed',
        message: 'Failed to load events',
        icon: AlertCircle,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesDepartment = selectedDepartment === 'All' || event.department === selectedDepartment;
    return matchesSearch && matchesCategory && matchesDepartment;
  });

  // Group events by department
  const groupedByDepartment = filteredEvents.reduce((acc, event) => {
    const department = event.department || 'Other';
    
    if (!acc[department]) {
      acc[department] = [];
    }
    acc[department].push(event);
    return acc;
  }, {});

  // Sort departments according to the specified order
  const departmentOrder = ['ECE', 'CSE', 'Mech', 'Civil', 'AIML', 'Applied Science', 'MBA', 'Common'];
  const sortedDepartments = Object.keys(groupedByDepartment).sort((a, b) => {
    const indexA = departmentOrder.indexOf(a);
    const indexB = departmentOrder.indexOf(b);
    
    // If both departments are in the order list, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only one is in the list, prioritize it
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    // If neither is in the list, sort alphabetically
    return a.localeCompare(b);
  });

  return (
    <div className="min-h-screen pt-20 pb-12 relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>
              Explore Events
            </h1>
            <p className="text-base md:text-lg max-w-3xl mx-auto leading-relaxed" style={{ color: '#5C4033' }}>
              Discover amazing events and competitions at Savishkar Techfest
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 py-4">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: '#FA812F' }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-12"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#5C4033' }}>Category</label>
            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all text-sm sm:text-base flex-shrink-0 ${
                    selectedCategory === category
                      ? 'btn-primary'
                      : ''
                  }`}
                  style={selectedCategory === category 
                    ? {} 
                    : { 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        border: '2px solid rgba(92, 64, 51, 0.3)',
                        color: '#5C4033'
                      }
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Events Grid - Grouped by Category and Department */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2" style={{ borderColor: '#FA812F' }}></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <img 
              src="/glow.png" 
              alt="Savishkar Logo" 
              className="w-32 h-32 mx-auto mb-4 object-contain opacity-40"
            />
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>No events found</h3>
            <p style={{ color: '#5C4033' }}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-12 py-8">
            {sortedDepartments.map((department) => (
              <div key={department}>
                {/* Department Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6"
                >
                  <h2 className="text-2xl font-bold mb-4" style={{ color: '#5C4033', fontFamily: 'Georgia, serif' }}>
                    {department}
                  </h2>
                </motion.div>

                {/* Events Grid for this Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {groupedByDepartment[department].map((event, index) => (
                    <EventCard key={event._id} event={event} index={index} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const EventCard = ({ event, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -5 }}
    className="card group transition-all duration-300"
  >
    {/* Event Image */}
    <div className="relative h-48 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-2xl" style={{ backgroundColor: 'rgba(250, 177, 47, 0.1)' }}>
      {event.image ? (
        <img
          src={getImageUrl(event.image)}
          alt={event.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-110"
          onError={(e) => {
            console.error('Event image failed to load:', event.image);
            e.target.src = 'https://via.placeholder.com/400x300/FAB12F/5C4033?text=' + encodeURIComponent(event.name);
          }}
          onLoad={() => console.log('Event image loaded:', getImageUrl(event.image))}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" style={{ background: 'linear-gradient(to bottom right, #FAB12F, #FA812F)' }}>
          <img 
            src="/glow.png" 
            alt="Savishkar Logo" 
            className="w-20 h-20 object-contain"
          />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ background: 'linear-gradient(to right, #5C4033, #8b4513)', color: '#FEF3E2' }}>
          {event.category}
        </span>
        {event.department && (
          <span className="px-3 py-1 text-xs font-semibold rounded-full" style={{ background: 'linear-gradient(to right, #FA812F, #FAB12F)', color: '#FEF3E2' }}>
            {event.department}
          </span>
        )}
      </div>
      {event.isFeatured && (
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 text-xs font-semibold rounded-full flex items-center" style={{ background: 'linear-gradient(to right, #FA812F, #DD0303)', color: '#FEF3E2' }}>
            <img 
              src="/glow.png" 
              alt="Featured" 
              className="w-4 h-4 mr-1 object-contain"
            />
            Featured
          </span>
        </div>
      )}
    </div>

    {/* Event Details */}
    <h3 className="text-xl font-bold mb-2" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
      {event.name}
    </h3>
    <p className="text-sm mb-4 line-clamp-2" style={{ color: '#5C4033' }}>
      {event.shortDescription || event.description}
    </p>

    {/* Event Info */}
    <div className="space-y-2 mb-4">
      <div className="flex items-center text-sm" style={{ color: '#5C4033' }}>
        <Calendar className="w-4 h-4 mr-2" style={{ color: '#FA812F' }} />
        {new Date(event.date).toLocaleDateString('en-IN', { 
          day: 'numeric', 
          month: 'short', 
          year: 'numeric' 
        })} • {event.time}
      </div>
      <div className="flex items-center text-sm" style={{ color: '#5C4033' }}>
        <MapPin className="w-4 h-4 mr-2" style={{ color: '#FA812F' }} />
        {event.venue}
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center" style={{ color: '#5C4033' }}>
          <Users className="w-4 h-4 mr-2" style={{ color: '#FA812F' }} />
          {event.currentParticipants}/{event.maxParticipants}
        </div>
        <div className="flex items-center font-semibold" style={{ color: '#1a365d' }}>
          <IndianRupee className="w-4 h-4" />
          {event.registrationFee === 0 ? 'Free' : event.registrationFee}
        </div>
      </div>
    </div>

    {/* View Details Button */}
    <Link
      to={`/events/${event._id}`}
      className="block w-full btn-primary text-center"
    >
      View Details
    </Link>
  </motion.div>
);

export default Events;
