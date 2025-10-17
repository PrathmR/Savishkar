import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';

const DecorativeElements = memo(({ density = 'medium' }) => {
  // Density options: 'light', 'medium', 'heavy'
  const getElements = () => {
    if (density === 'light') {
      return {
        stars: 4,
        circles: 3
      };
    } else if (density === 'heavy') {
      return {
        stars: 8,
        circles: 6
      };
    }
    return {
      stars: 6,
      circles: 4
    };
  };

  const { stars, circles } = useMemo(() => getElements(), [density]);

  const starPositions = useMemo(() => [
    { top: '10%', left: '8%', size: 30, duration: 4, color: '#FAB12F', opacity: 0.6 },
    { top: '25%', left: '15%', size: 22, duration: 5, color: '#FA812F', opacity: 0.4 },
    { top: '40%', right: '10%', size: 28, duration: 6, color: '#DD0303', opacity: 0.45 },
    { bottom: '20%', left: '12%', size: 25, duration: 5, color: '#FAB12F', opacity: 0.5 },
    { bottom: '35%', right: '15%', size: 20, duration: 7, color: '#FA812F', opacity: 0.4 },
    { top: '60%', left: '10%', size: 18, duration: 6, color: '#DD0303', opacity: 0.35 },
    { top: '15%', right: '20%', size: 24, duration: 5, color: '#FAB12F', opacity: 0.5 },
    { bottom: '15%', right: '8%', size: 26, duration: 6, color: '#FA812F', opacity: 0.45 },
  ], []);

  const circlePositions = useMemo(() => [
    { top: '18%', left: '12%', size: 4, duration: 4, color: '#FA812F', opacity: 0.5 },
    { top: '45%', right: '12%', size: 5, duration: 3, color: '#FAB12F', opacity: 0.4 },
    { bottom: '25%', left: '18%', size: 6, duration: 5, color: '#DD0303', opacity: 0.35 },
    { top: '70%', right: '20%', size: 3, duration: 4, color: '#FAB12F', opacity: 0.4 },
    { top: '35%', left: '20%', size: 5, duration: 6, color: '#FA812F', opacity: 0.3 },
    { bottom: '40%', right: '18%', size: 4, duration: 5, color: '#DD0303', opacity: 0.35 },
  ], []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Stars - Only rotate and scale in place */}
      {starPositions.slice(0, stars).map((star, index) => (
        <motion.div
          key={`star-${index}`}
          className="absolute"
          style={{
            ...(star.top ? { top: star.top } : { bottom: star.bottom }),
            ...(star.left ? { left: star.left } : { right: star.right })
          }}
          animate={{
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <svg width={star.size} height={star.size} viewBox="0 0 24 24" fill="none">
            <path 
              d="M12 2L14.5 9L22 9.5L16.5 14.5L18 22L12 18L6 22L7.5 14.5L2 9.5L9.5 9L12 2Z" 
              stroke={star.color} 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              opacity={star.opacity}
            />
          </svg>
        </motion.div>
      ))}

      {/* Circles - Only scale in place */}
      {circlePositions.slice(0, circles).map((circle, index) => (
        <motion.div
          key={`circle-${index}`}
          className="absolute rounded-full border-[3px]"
          style={{
            ...(circle.top ? { top: circle.top } : { bottom: circle.bottom }),
            ...(circle.left ? { left: circle.left } : { right: circle.right }),
            width: `${circle.size * 4}px`,
            height: `${circle.size * 4}px`,
            borderColor: circle.color,
            opacity: circle.opacity
          }}
          animate={{
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
});

DecorativeElements.displayName = 'DecorativeElements';

export default DecorativeElements;
