import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#FEF3E2' }}>
      <div className="relative text-center px-4 w-full max-w-7xl">
        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 md:mb-12 mt-20 md:mt-32"
        >
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-wide"
            style={{ 
              color: '#1a365d',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em'
            }}
          >
            Welcome to
          </h2>
        </motion.div>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="mb-4 md:mb-6 -mt-8 md:-mt-12"
        >
          <img 
            src="/glow.png" 
            alt="Savishkar 2025" 
            className="w-full max-w-xs sm:max-w-sm md:max-w-xl lg:max-w-2xl mx-auto px-4"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </motion.div>

        {/* SAVISHKAR 2025 Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
          className="mb-4 md:mb-6 -mt-6 md:-mt-10"
        >
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-wider"
            style={{ 
              color: '#1a365d',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.1em'
            }}
          >
            SAVISHKAR
          </h1>
          <p 
            className="text-xl sm:text-2xl md:text-3xl font-semibold mt-2"
            style={{ 
              color: '#8b6f47',
              fontFamily: 'Georgia, serif'
            }}
          >
            2025
          </p>
        </motion.div>

        {/* Circular Spinner */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex flex-col items-center"
        >
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '4px solid rgba(250, 177, 47, 0.2)',
                borderTopColor: '#FAB12F',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          {/* Loading Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="mt-2 text-lg md:text-xl font-semibold"
            style={{ 
              color: '#1a365d',
              fontFamily: 'Georgia, serif'
            }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
