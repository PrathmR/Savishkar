import { useEffect } from 'react';

// Lenis-inspired scroll animations hook
export const useLenisScroll = () => {
  useEffect(() => {
    let ticking = false;
    let scrollY = window.scrollY;

    const updateScroll = () => {
      scrollY = window.scrollY;
      
      // Update all elements with data-scroll-speed (parallax)
      const parallaxElements = document.querySelectorAll('[data-scroll-speed]');
      parallaxElements.forEach((el) => {
        const speed = parseFloat(el.getAttribute('data-scroll-speed'));
        const yPos = -(scrollY * speed);
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
      });

      // Update elements with data-scroll (fade/slide animations)
      const scrollElements = document.querySelectorAll('[data-scroll]');
      scrollElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        
        // Element is in viewport
        if (elementTop < windowHeight * 0.85 && elementBottom > 0) {
          el.classList.add('is-inview');
        } else {
          el.classList.remove('is-inview');
        }
      });

      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateScroll);
        ticking = true;
      }
    };

    const handleScroll = () => {
      requestTick();
    };

    // Initial check
    updateScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);
};

export default useLenisScroll;
