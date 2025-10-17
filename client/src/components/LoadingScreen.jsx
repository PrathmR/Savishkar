import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#FEF3E2' }}>
      {/* Subtle Background Animation */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #FA812F, transparent)',
            top: '20%',
            left: '10%'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute w-96 h-96 rounded-full blur-3xl"
          style={{ 
            background: 'radial-gradient(circle, #FAB12F, transparent)',
            bottom: '20%',
            right: '10%'
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative text-center px-4">
        {/* Logo with Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <img
              src="/glow.png"
              alt="Savishkar 2025"
              className="w-28 h-28 md:w-36 md:h-36 mx-auto object-contain"
              style={{ filter: 'drop-shadow(0 6px 16px rgba(250, 129, 47, 0.4))' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-8"
        >
          <h1 
            className="text-4xl md:text-5xl font-extrabold mb-2"
            style={{ 
              color: '#1a365d',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em'
            }}
          >
            SAVISHKAR
          </h1>
          <p
            className="text-xl md:text-2xl font-bold"
            style={{ 
              color: '#5C4033',
              fontFamily: 'Georgia, serif'
            }}
          >
            2025
          </p>
        </motion.div>

        {/* Modern Loader */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col items-center space-y-4"
        >
          {/* Circular Spinner */}
          <div className="relative w-16 h-16">
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                border: '3px solid rgba(250, 129, 47, 0.2)',
                borderTopColor: '#FA812F',
              }}
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
            <motion.div
              className="absolute inset-2 rounded-full"
              style={{
                border: '3px solid rgba(250, 177, 47, 0.2)',
                borderTopColor: '#FAB12F',
              }}
              animate={{ rotate: -360 }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>

          {/* Loading Text */}
          <motion.p
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-sm font-medium tracking-wider"
            style={{ color: '#5C4033' }}
          >
            Loading...
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoadingScreen;
