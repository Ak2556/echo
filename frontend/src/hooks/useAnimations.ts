'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';

interface AnimationOptions {
  duration?: number;
  delay?: number;
  easing?: string;
  threshold?: number;
  rootMargin?: string;
}

interface RippleOptions {
  color?: string;
  duration?: number;
  size?: number;
}

export function useIntersectionAnimation(options: AnimationOptions = {}) {
  const { accessibility } = useEnhancedTheme();
  const elementRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    duration = 600,
    delay = 0,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
  } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element || accessibility.reducedMotion) return;

    // Set initial state
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = `opacity ${duration}ms ${easing} ${delay}ms, transform ${duration}ms ${easing} ${delay}ms`;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.style.opacity = '1';
            target.style.transform = 'translateY(0)';
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observerRef.current.observe(element);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [
    duration,
    delay,
    easing,
    threshold,
    rootMargin,
    accessibility.reducedMotion,
  ]);

  return elementRef;
}

export function useStaggeredAnimation(
  itemCount: number,
  options: AnimationOptions = {}
) {
  const { accessibility } = useEnhancedTheme();
  const containerRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const {
    duration = 400,
    delay = 100,
    easing = 'cubic-bezier(0.4, 0, 0.2, 1)',
    threshold = 0.1,
  } = options;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || accessibility.reducedMotion) return;

    const items = container.children;

    // Set initial state for all items
    Array.from(items).forEach((item, index) => {
      const element = item as HTMLElement;
      element.style.opacity = '0';
      element.style.transform = 'translateY(20px)';
      element.style.transition = `opacity ${duration}ms ${easing} ${index * delay}ms, transform ${duration}ms ${easing} ${index * delay}ms`;
    });

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = entry.target.children;
            Array.from(items).forEach((item) => {
              const element = item as HTMLElement;
              element.style.opacity = '1';
              element.style.transform = 'translateY(0)';
            });
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observerRef.current.observe(container);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [
    itemCount,
    duration,
    delay,
    easing,
    threshold,
    accessibility.reducedMotion,
  ]);

  return containerRef;
}

export function useRippleEffect() {
  const { accessibility } = useEnhancedTheme();

  const createRipple = useCallback(
    (event: React.MouseEvent<HTMLElement>, options: RippleOptions = {}) => {
      if (accessibility.reducedMotion) return;

      const {
        color = 'rgba(255, 255, 255, 0.3)',
        duration = 600,
        size,
      } = options;

      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const rippleSize = size || Math.max(rect.width, rect.height);
      const x = event.clientX - rect.left - rippleSize / 2;
      const y = event.clientY - rect.top - rippleSize / 2;

      const ripple = document.createElement('span');
      ripple.style.position = 'absolute';
      ripple.style.borderRadius = '50%';
      ripple.style.background = color;
      ripple.style.transform = 'scale(0)';
      ripple.style.animation = `ripple ${duration}ms ease-out`;
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      ripple.style.width = rippleSize + 'px';
      ripple.style.height = rippleSize + 'px';
      ripple.style.pointerEvents = 'none';

      // Ensure button has relative positioning
      const originalPosition = button.style.position;
      if (!originalPosition || originalPosition === 'static') {
        button.style.position = 'relative';
      }

      // Ensure button has overflow hidden
      const originalOverflow = button.style.overflow;
      button.style.overflow = 'hidden';

      button.appendChild(ripple);

      setTimeout(() => {
        ripple.remove();
        // Restore original styles
        if (!originalPosition) {
          button.style.position = '';
        }
        if (!originalOverflow) {
          button.style.overflow = '';
        }
      }, duration);
    },
    [accessibility.reducedMotion]
  );

  return createRipple;
}

export function useHoverAnimation(
  type: 'lift' | 'scale' | 'glow' | 'float' = 'lift'
) {
  const { accessibility } = useEnhancedTheme();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || accessibility.reducedMotion) return;

    const handleMouseEnter = () => {
      switch (type) {
        case 'lift':
          element.style.transform = 'translateY(-4px)';
          element.style.boxShadow = 'var(--shadow-xl)';
          break;
        case 'scale':
          element.style.transform = 'scale(1.05)';
          break;
        case 'glow':
          element.style.boxShadow = 'var(--shadow-lg), var(--color-glow)';
          break;
        case 'float':
          element.style.animation = 'float 2s ease-in-out infinite';
          break;
      }
    };

    const handleMouseLeave = () => {
      switch (type) {
        case 'lift':
          element.style.transform = 'translateY(0)';
          element.style.boxShadow = 'var(--shadow-md)';
          break;
        case 'scale':
          element.style.transform = 'scale(1)';
          break;
        case 'glow':
          element.style.boxShadow = 'var(--shadow-md)';
          break;
        case 'float':
          element.style.animation = '';
          break;
      }
    };

    // Set transition
    element.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [type, accessibility.reducedMotion]);

  return elementRef;
}

export function useLoadingAnimation() {
  const { accessibility } = useEnhancedTheme();

  const createShimmer = useCallback(
    (element: HTMLElement) => {
      if (accessibility.reducedMotion) return;

      element.style.background = `
        linear-gradient(
          90deg,
          var(--color-surface) 0%,
          var(--color-surfaceElevated) 50%,
          var(--color-surface) 100%
        )
      `;
      element.style.backgroundSize = '200% 100%';
      element.style.animation = 'shimmer 1.5s ease-in-out infinite';
    },
    [accessibility.reducedMotion]
  );

  const removeShimmer = useCallback((element: HTMLElement) => {
    element.style.background = '';
    element.style.backgroundSize = '';
    element.style.animation = '';
  }, []);

  return { createShimmer, removeShimmer };
}

export function useScrollAnimation() {
  const { accessibility } = useEnhancedTheme();

  const scrollToElement = useCallback(
    (element: HTMLElement, options: ScrollIntoViewOptions = {}) => {
      if (accessibility.reducedMotion) {
        element.scrollIntoView({ behavior: 'auto', ...options });
      } else {
        element.scrollIntoView({ behavior: 'smooth', ...options });
      }
    },
    [accessibility.reducedMotion]
  );

  const scrollToTop = useCallback(() => {
    if (accessibility.reducedMotion) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [accessibility.reducedMotion]);

  return { scrollToElement, scrollToTop };
}

export function useParallaxEffect(speed: number = 0.5) {
  const { accessibility } = useEnhancedTheme();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || accessibility.reducedMotion) return;

    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const parallax = scrolled * speed;
      element.style.transform = `translateY(${parallax}px)`;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, accessibility.reducedMotion]);

  return elementRef;
}

export function useTypewriterEffect(text: string, speed: number = 50) {
  const { accessibility } = useEnhancedTheme();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (accessibility.reducedMotion) {
      element.textContent = text;
      return;
    }

    let index = 0;
    element.textContent = '';

    const timer = setInterval(() => {
      if (index < text.length) {
        element.textContent += text.charAt(index);
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, accessibility.reducedMotion]);

  return elementRef;
}

export function useCountUpAnimation(
  endValue: number,
  duration: number = 2000,
  startValue: number = 0
) {
  const { accessibility } = useEnhancedTheme();
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (accessibility.reducedMotion) {
      element.textContent = endValue.toString();
      return;
    }

    const startTime = performance.now();
    const range = endValue - startValue;

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(startValue + range * easeOutQuart);

      element.textContent = currentValue.toString();

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [endValue, duration, startValue, accessibility.reducedMotion]);

  return elementRef;
}

// CSS keyframes for animations (to be added to global styles)
export const animationKeyframes = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -200% center;
    }
    100% {
      background-position: 200% center;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes fadeInScale {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.05);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: var(--shadow-md);
    }
    50% {
      box-shadow: var(--shadow-xl), var(--color-glow);
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }
`;

export default {
  useIntersectionAnimation,
  useStaggeredAnimation,
  useRippleEffect,
  useHoverAnimation,
  useLoadingAnimation,
  useScrollAnimation,
  useParallaxEffect,
  useTypewriterEffect,
  useCountUpAnimation,
  animationKeyframes,
};
