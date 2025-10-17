import { useEffect, useRef } from 'react';

// Hook for scroll-triggered animations that rewind on scroll up
export const useScrollAnimation = (options = {}) => {
  const threshold = options.threshold || 0.1; // When to trigger (10% visible)
  const rootMargin = options.rootMargin || '0px';

  useEffect(() => {
    const observerOptions = {
      threshold: threshold,
      rootMargin: rootMargin,
    };

    // Intersection Observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Element is in view - add visible class
          entry.target.classList.add('animate-in');
          entry.target.classList.remove('animate-out');
        } else {
          // Element is out of view - remove visible class (rewind)
          entry.target.classList.remove('animate-in');
          entry.target.classList.add('animate-out');
        }
      });
    }, observerOptions);

    // Observe all elements with data-scroll attribute
    const scrollElements = document.querySelectorAll('[data-scroll]');
    scrollElements.forEach((el) => observer.observe(el));

    // Cleanup
    return () => {
      scrollElements.forEach((el) => observer.unobserve(el));
    };
  }, [threshold, rootMargin]);
};

export default useScrollAnimation;
