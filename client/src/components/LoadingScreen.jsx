import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#FEF3E2' }}>
      {/* Doodle Pattern Background */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C4A574' stroke-width='1.5' stroke-linecap='round' opacity='0.1'%3E%3C!-- Row 1 --%3E%3Cg transform='rotate(-15 40 30)'%3E%3Crect x='30' y='20' width='20' height='20' rx='2'/%3E%3Ctext x='33' y='33' font-size='8' fill='%23C4A574'%3EB%3C/text%3E%3C/g%3E%3Cg transform='rotate(20 90 25)'%3E%3Ctext x='80' y='30' font-size='10' font-weight='bold' fill='%23C4A574'%3ETECH%3C/text%3E%3C/g%3E%3Cg transform='rotate(-10 140 30)'%3E%3Ccircle cx='140' cy='25' r='8'/%3E%3Cpath d='M136 25h8M140 21v8'/%3E%3C/g%3E%3Cg transform='rotate(15 190 28)'%3E%3Crect x='180' y='18' width='18' height='20' rx='1'/%3E%3Cpath d='M183 22h12M183 26h12'/%3E%3C/g%3E%3Cg transform='rotate(-20 240 25)'%3E%3Ccircle cx='240' cy='25' r='10'/%3E%3Ccircle cx='240' cy='25' r='6'/%3E%3C/g%3E%3C!-- Row 2 --%3E%3Cg transform='rotate(10 30 75)'%3E%3Ctext x='20' y='80' font-size='9' font-weight='bold' fill='%23C4A574'%3EMUSIC%3C/text%3E%3C/g%3E%3Cg transform='rotate(-15 85 70)'%3E%3Cpath d='M75 65h20v18h-20z'/%3E%3Ccircle cx='85' cy='74' r='4'/%3E%3C/g%3E%3Cg transform='rotate(25 135 75)'%3E%3Ccircle cx='135' cy='75' r='9'/%3E%3Cpath d='M135 68v14M128 75h14'/%3E%3C/g%3E%3Cg transform='rotate(-12 185 72)'%3E%3Ctext x='175' y='77' font-size='8' font-weight='bold' fill='%23C4A574'%3ECAMPUS%3C/text%3E%3C/g%3E%3Cg transform='rotate(18 245 70)'%3E%3Crect x='235' y='60' width='20' height='20' rx='3'/%3E%3C/g%3E%3C!-- Row 3 --%3E%3Cg transform='rotate(-18 35 120)'%3E%3Cpath d='M25 115l10-10 10 10-10 10z'/%3E%3C/g%3E%3Cg transform='rotate(22 85 118)'%3E%3Ctext x='75' y='123' font-size='9' font-weight='bold' fill='%23C4A574'%3EBATTLE%3C/text%3E%3C/g%3E%3Cg transform='rotate(-8 140 120)'%3E%3Ccircle cx='140' cy='120' r='10'/%3E%3Ccircle cx='137' cy='118' r='2'/%3E%3Ccircle cx='143' cy='118' r='2'/%3E%3Cpath d='M136 125c0-2 2-3 4-3s4 1 4 3'/%3E%3C/g%3E%3Cg transform='rotate(15 190 122)'%3E%3Crect x='180' y='112' width='20' height='20' rx='2'/%3E%3Cpath d='M185 117h10M185 122h10'/%3E%3C/g%3E%3Cg transform='rotate(-20 240 118)'%3E%3Ccircle cx='240' cy='118' r='8'/%3E%3C/g%3E%3C!-- Row 4 --%3E%3Cg transform='rotate(12 32 165)'%3E%3Ctext x='22' y='170' font-size='8' font-weight='bold' fill='%23C4A574'%3ETECH%3C/text%3E%3C/g%3E%3Cg transform='rotate(-16 80 168)'%3E%3Crect x='70' y='158' width='20' height='20' rx='2'/%3E%3C/g%3E%3Cg transform='rotate(20 135 165)'%3E%3Ccircle cx='135' cy='165' r='9'/%3E%3Cpath d='M135 158v14'/%3E%3C/g%3E%3Cg transform='rotate(-10 185 170)'%3E%3Cpath d='M175 160h20v20h-20z'/%3E%3Cpath d='M180 165h10M180 170h10M180 175h10'/%3E%3C/g%3E%3Cg transform='rotate(14 240 168)'%3E%3Ccircle cx='240' cy='168' r='10'/%3E%3Ccircle cx='240' cy='168' r='6'/%3E%3C/g%3E%3C!-- Row 5 --%3E%3Cg transform='rotate(-14 35 215)'%3E%3Crect x='25' y='205' width='20' height='20' rx='3'/%3E%3C/g%3E%3Cg transform='rotate(18 85 212)'%3E%3Ctext x='75' y='217' font-size='9' font-weight='bold' fill='%23C4A574'%3EMUSIC%3C/text%3E%3C/g%3E%3Cg transform='rotate(-22 138 215)'%3E%3Ccircle cx='138' cy='215' r='8'/%3E%3Cpath d='M134 215h8M138 211v8'/%3E%3C/g%3E%3Cg transform='rotate(16 188 218)'%3E%3Crect x='178' y='208' width='20' height='20' rx='2'/%3E%3C/g%3E%3Cg transform='rotate(-12 238 212)'%3E%3Ccircle cx='238' cy='212' r='9'/%3E%3C/g%3E%3C!-- Row 6 --%3E%3Cg transform='rotate(10 30 262)'%3E%3Ctext x='20' y='267' font-size='8' font-weight='bold' fill='%23C4A574'%3ECAMPUS%3C/text%3E%3C/g%3E%3Cg transform='rotate(-18 85 260)'%3E%3Cpath d='M75 250l10 10 10-10'/%3E%3Crect x='75' y='260' width='20' height='15'/%3E%3C/g%3E%3Cg transform='rotate(20 135 265)'%3E%3Ccircle cx='135' cy='265' r='10'/%3E%3Ccircle cx='135' cy='265' r='6'/%3E%3C/g%3E%3Cg transform='rotate(-15 188 262)'%3E%3Crect x='178' y='252' width='20' height='20' rx='2'/%3E%3Cpath d='M183 257h10M183 262h10M183 267h10'/%3E%3C/g%3E%3Cg transform='rotate(12 240 265)'%3E%3Ccircle cx='240' cy='265' r='8'/%3E%3C/g%3E%3C!-- Small scattered elements --%3E%3Ccircle cx='60' cy='50' r='2'/%3E%3Ccircle cx='115' cy='95' r='2'/%3E%3Ccircle cx='165' cy='145' r='2'/%3E%3Ccircle cx='55' cy='190' r='2'/%3E%3Ccircle cx='210' cy='95' r='2'/%3E%3Ccircle cx='265' cy='145' r='2'/%3E%3Ccircle cx='110' cy='240' r='2'/%3E%3Ccircle cx='215' cy='235' r='2'/%3E%3Cpath d='M270 50l3-3 3 3-3 3z'/%3E%3Cpath d='M15 140l3-3 3 3-3 3z'/%3E%3Cpath d='M260 190l3-3 3 3-3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '300px 300px'
        }}
      />
      
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
        {/* Welcome Text */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-4"
        >
          <h2 
            className="text-5xl md:text-6xl font-bold tracking-wide"
            style={{ 
              color: '#1a365d',
              fontFamily: 'Georgia, serif',
              letterSpacing: '0.05em'
            }}
          >
            Welcome to
          </h2>
        </motion.div>

        {/* Logo with Animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          className="mb-4 w-full max-w-2xl mx-auto px-4"
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
              className="w-full object-contain"
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
          className="mb-6"
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
