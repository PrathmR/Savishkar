import { motion } from 'framer-motion';
import { useState } from 'react';

const BackgroundDemo = () => {
  const [activeDemo, setActiveDemo] = useState(1);

  const demos = [
    { id: 1, name: 'Animated Gradient Mesh' },
    { id: 2, name: 'Floating Particles/Orbs' },
    { id: 3, name: 'Geometric Pattern' },
    { id: 4, name: 'Parallax Layers' },
    { id: 5, name: 'Noise Texture' },
    { id: 6, name: 'Wavy Lines' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Options */}
      
      {/* Option 1: Animated Gradient Mesh */}
      {activeDemo === 1 && (
        <div className="fixed inset-0 -z-10">
          <div 
            className="absolute inset-0 animate-gradient-shift"
            style={{
              background: 'linear-gradient(45deg, #FEF3E2, #f5e6d3, #ede0cc, #FEF3E2)',
              backgroundSize: '400% 400%',
            }}
          />
        </div>
      )}

      {/* Option 2: Floating Particles/Orbs */}
      {activeDemo === 2 && (
        <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: '#FEF3E2' }}>
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl opacity-20"
              style={{
                width: `${Math.random() * 300 + 100}px`,
                height: `${Math.random() * 300 + 100}px`,
                background: i % 3 === 0 ? '#FAB12F' : i % 3 === 1 ? '#1a365d' : '#8b6f47',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 20, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      )}

      {/* Option 3: Geometric Pattern */}
      {activeDemo === 3 && (
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#FEF3E2' }}>
          <svg className="absolute inset-0 w-full h-full opacity-10">
            <defs>
              <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="2" fill="#1a365d" />
                <path d="M 0 30 L 60 30 M 30 0 L 30 60" stroke="#8b6f47" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      )}

      {/* Option 4: Parallax Layers */}
      {activeDemo === 4 && (
        <div className="fixed inset-0 -z-10 overflow-hidden" style={{ backgroundColor: '#FEF3E2' }}>
          {/* Layer 1 - Slowest */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(26, 54, 93, 0.08) 0%, transparent 50%)',
            }}
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Layer 2 - Medium */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(250, 177, 47, 0.12) 0%, transparent 50%)',
            }}
            animate={{ x: [0, -30, 0], y: [0, 50, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />
          
          {/* Layer 3 - Fastest */}
          <motion.div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 50% 80%, rgba(139, 111, 71, 0.1) 0%, transparent 50%)',
            }}
            animate={{ x: [0, 40, 0], y: [0, -40, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
        </div>
      )}

      {/* Option 5: Noise Texture */}
      {activeDemo === 5 && (
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#FEF3E2' }}>
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
            }}
          />
        </div>
      )}

      {/* Option 6: Wavy Lines */}
      {activeDemo === 6 && (
        <div className="fixed inset-0 -z-10" style={{ backgroundColor: '#FEF3E2' }}>
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <motion.path
              d="M0,100 Q250,50 500,100 T1000,100 V0 H0 Z"
              fill="rgba(26, 54, 93, 0.05)"
              animate={{ 
                d: [
                  "M0,100 Q250,50 500,100 T1000,100 V0 H0 Z",
                  "M0,50 Q250,100 500,50 T1000,50 V0 H0 Z",
                  "M0,100 Q250,50 500,100 T1000,100 V0 H0 Z"
                ]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M0,200 Q250,150 500,200 T1000,200 V0 H0 Z"
              fill="rgba(250, 177, 47, 0.08)"
              animate={{ 
                d: [
                  "M0,200 Q250,150 500,200 T1000,200 V0 H0 Z",
                  "M0,150 Q250,200 500,150 T1000,150 V0 H0 Z",
                  "M0,200 Q250,150 500,200 T1000,200 V0 H0 Z"
                ]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M0,300 Q250,250 500,300 T1000,300 V0 H0 Z"
              fill="rgba(139, 111, 71, 0.06)"
              animate={{ 
                d: [
                  "M0,300 Q250,250 500,300 T1000,300 V0 H0 Z",
                  "M0,250 Q250,300 500,250 T1000,250 V0 H0 Z",
                  "M0,300 Q250,250 500,300 T1000,300 V0 H0 Z"
                ]
              }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </svg>
        </div>
      )}

      {/* Demo Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 
            className="text-5xl md:text-6xl font-bold mb-4"
            style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}
          >
            Background Demos
          </h1>
          <p className="text-xl" style={{ color: '#8b6f47' }}>
            Click on any option below to preview
          </p>
        </motion.div>

        {/* Demo Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl w-full mb-12">
          {demos.map((demo) => (
            <motion.button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className="p-6 rounded-xl shadow-lg transition-all"
              style={{
                backgroundColor: activeDemo === demo.id ? '#1a365d' : '#ffffff',
                color: activeDemo === demo.id ? '#FEF3E2' : '#1a365d',
                border: `2px solid ${activeDemo === demo.id ? '#FAB12F' : 'rgba(26, 54, 93, 0.2)'}`,
              }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-lg font-bold" style={{ fontFamily: 'Georgia, serif' }}>
                {demo.id}. {demo.name}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Sample Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl w-full p-8 rounded-2xl shadow-2xl"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h2 
            className="text-3xl font-bold mb-4"
            style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}
          >
            SAVISHKAR 2025
          </h2>
          <p className="text-lg mb-6" style={{ color: '#5C4033' }}>
            This is sample content to show how the background looks with actual text and elements. 
            The dynamic backgrounds are subtle enough to not distract from the content while adding 
            visual interest to your website.
          </p>
          <div className="flex gap-4">
            <button 
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{ 
                background: 'linear-gradient(to right, #FA812F, #FAB12F)',
                color: '#FEF3E2'
              }}
            >
              Primary Button
            </button>
            <button 
              className="px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
              style={{ 
                backgroundColor: 'transparent',
                color: '#1a365d',
                border: '2px solid #1a365d'
              }}
            >
              Secondary Button
            </button>
          </div>
        </motion.div>

        {/* Info */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-center text-sm"
          style={{ color: '#8b6f47' }}
        >
          Currently viewing: <strong>{demos.find(d => d.id === activeDemo)?.name}</strong>
        </motion.p>
      </div>

      {/* CSS for gradient animation */}
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          animation: gradient-shift 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default BackgroundDemo;
