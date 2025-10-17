// Custom Smooth Scroll Implementation (Lenis-like behavior)
export class SmoothScroll {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 1.2,
      easing: options.easing || this.easeOutQuart,
      smooth: options.smooth !== false,
    };
    
    this.isScrolling = false;
    this.targetScroll = 0;
    this.currentScroll = 0;
    this.rafId = null;
  }

  // Easing function for smooth animation
  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  // Linear interpolation
  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Scroll to a specific position
  scrollTo(target, options = {}) {
    const duration = options.duration || this.options.duration;
    const offset = options.offset || 0;
    
    let targetPosition;
    
    if (typeof target === 'number') {
      targetPosition = target;
    } else if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (element) {
        targetPosition = element.offsetTop + offset;
      }
    } else if (target instanceof HTMLElement) {
      targetPosition = target.offsetTop + offset;
    }

    if (targetPosition !== undefined) {
      this.animateScroll(targetPosition, duration);
    }
  }

  // Animate scroll with easing
  animateScroll(target, duration) {
    const start = window.pageYOffset;
    const distance = target - start;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeProgress = this.options.easing(progress);
      
      window.scrollTo(0, start + distance * easeProgress);

      if (progress < 1) {
        this.rafId = requestAnimationFrame(animate);
      } else {
        this.isScrolling = false;
      }
    };

    this.isScrolling = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    this.rafId = requestAnimationFrame(animate);
  }

  // Smooth scroll on wheel event
  enableSmoothScroll() {
    let isScrolling = false;
    let targetY = window.pageYOffset;
    let currentY = window.pageYOffset;

    const smoothScrollLoop = () => {
      if (Math.abs(targetY - currentY) > 0.5) {
        currentY = this.lerp(currentY, targetY, 0.1);
        window.scrollTo(0, currentY);
        requestAnimationFrame(smoothScrollLoop);
      } else {
        isScrolling = false;
      }
    };

    window.addEventListener('wheel', (e) => {
      targetY += e.deltaY;
      targetY = Math.max(0, Math.min(targetY, document.body.scrollHeight - window.innerHeight));
      
      if (!isScrolling) {
        isScrolling = true;
        requestAnimationFrame(smoothScrollLoop);
      }
    }, { passive: true });
  }

  // Destroy instance
  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

export default SmoothScroll;
