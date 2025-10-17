// Custom Lenis-like smooth scroll implementation
// Based on https://lenis.darkroom.engineering/

class Lenis {
  constructor(options = {}) {
    this.options = {
      duration: options.duration || 1.2,
      easing: options.easing || ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      smooth: options.smooth !== false,
      smoothTouch: options.smoothTouch || false,
      touchMultiplier: options.touchMultiplier || 2,
      wheelMultiplier: options.wheelMultiplier || 1,
      infinite: options.infinite || false,
    };

    this.animatedScroll = window.scrollY;
    this.targetScroll = window.scrollY;
    this.isScrolling = false;
    this.velocity = 0;
    this.direction = 0;
    this.rafId = null;
    this.isLocked = false;

    this.init();
  }

  init() {
    // Bind methods
    this.onWheel = this.onWheel.bind(this);
    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchMove = this.onTouchMove.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);
    this.raf = this.raf.bind(this);

    // Add event listeners
    window.addEventListener('wheel', this.onWheel, { passive: false });
    
    if (this.options.smoothTouch) {
      window.addEventListener('touchstart', this.onTouchStart, { passive: true });
      window.addEventListener('touchmove', this.onTouchMove, { passive: false });
      window.addEventListener('touchend', this.onTouchEnd, { passive: true });
    }

    // Start RAF loop
    this.raf();
  }

  onWheel(e) {
    if (this.isLocked) return;
    
    e.preventDefault();
    
    const delta = e.deltaY * this.options.wheelMultiplier;
    this.targetScroll += delta;
    this.clampTarget();
  }

  onTouchStart(e) {
    this.touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  onTouchMove(e) {
    if (this.isLocked) return;
    
    const deltaY = this.touchStart.y - e.touches[0].clientY;
    this.targetScroll += deltaY * this.options.touchMultiplier;
    this.clampTarget();
    
    this.touchStart = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }

  onTouchEnd() {
    // Touch ended
  }

  clampTarget() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.targetScroll = Math.max(0, Math.min(this.targetScroll, maxScroll));
  }

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  raf() {
    if (this.isLocked) {
      this.rafId = requestAnimationFrame(this.raf);
      return;
    }

    const delta = this.targetScroll - this.animatedScroll;
    
    // Calculate velocity
    this.velocity = delta * 0.1;
    
    // Update direction
    if (Math.abs(delta) > 0.1) {
      this.direction = delta > 0 ? 1 : -1;
      this.isScrolling = true;
    } else {
      this.isScrolling = false;
    }

    // Smooth interpolation
    if (Math.abs(delta) > 0.1) {
      this.animatedScroll = this.lerp(this.animatedScroll, this.targetScroll, 0.1);
      window.scrollTo(0, this.animatedScroll);
    } else {
      this.animatedScroll = this.targetScroll;
      window.scrollTo(0, this.animatedScroll);
    }

    // Emit scroll event
    this.emit();

    this.rafId = requestAnimationFrame(this.raf);
  }

  emit() {
    // Dispatch custom event with scroll data
    window.dispatchEvent(new CustomEvent('lenis-scroll', {
      detail: {
        scroll: this.animatedScroll,
        velocity: this.velocity,
        direction: this.direction,
        isScrolling: this.isScrolling,
      }
    }));
  }

  scrollTo(target, options = {}) {
    let targetScroll;

    if (typeof target === 'number') {
      targetScroll = target;
    } else if (typeof target === 'string') {
      const element = document.querySelector(target);
      if (element) {
        targetScroll = element.offsetTop + (options.offset || 0);
      }
    } else if (target instanceof HTMLElement) {
      targetScroll = target.offsetTop + (options.offset || 0);
    }

    if (targetScroll !== undefined) {
      this.targetScroll = targetScroll;
      this.clampTarget();
    }
  }

  start() {
    this.isLocked = false;
  }

  stop() {
    this.isLocked = true;
  }

  destroy() {
    window.removeEventListener('wheel', this.onWheel);
    window.removeEventListener('touchstart', this.onTouchStart);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('touchend', this.onTouchEnd);
    
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}

export default Lenis;
