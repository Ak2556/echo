/**
 * @fileoverview Interaction Hooks & Utilities
 * @description Custom hooks for enhanced user interactions
 * @version 1.0.0
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Ripple Effect Hook
 * Creates Material Design-like ripple effect on click
 */
export function useRipple() {
  const [ripples, setRipples] = useState<
    Array<{ x: number; y: number; id: number }>
  >([]);

  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now();

    setRipples((prev) => [...prev, { x, y, id }]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
    }, 600);
  }, []);

  const rippleElements = ripples.map((ripple) => (
    <span
      key={ripple.id}
      style={{
        position: 'absolute',
        left: ripple.x,
        top: ripple.y,
        width: '0',
        height: '0',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.5)',
        transform: 'translate(-50%, -50%)',
        animation: 'ripple-animation 600ms ease-out',
        pointerEvents: 'none',
      }}
    />
  ));

  return { createRipple, rippleElements };
}

/**
 * Haptic Feedback Utility
 * Provides vibration feedback on supported devices
 */
export function useHaptic() {
  const trigger = useCallback(
    (type: 'light' | 'medium' | 'heavy' = 'light') => {
      if ('vibrate' in navigator) {
        const patterns = {
          light: 10,
          medium: 20,
          heavy: 30,
        };
        navigator.vibrate(patterns[type]);
      }
    },
    []
  );

  return trigger;
}

/**
 * Long Press Hook
 * Detects long press gestures
 */
export function useLongPress(
  callback: () => void,
  { delay = 500, shouldPreventDefault = true } = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);
  const target = useRef<EventTarget | undefined>(undefined);

  const start = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (shouldPreventDefault && 'preventDefault' in event.target) {
        event.target.addEventListener('touchend', preventDefault, {
          passive: false,
        });
        target.current = event.target;
      }

      timeout.current = setTimeout(() => {
        callback();
        setLongPressTriggered(true);
      }, delay);
    },
    [callback, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event: React.MouseEvent | React.TouchEvent, shouldTriggerClick = true) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick && !longPressTriggered && callback();

      setLongPressTriggered(false);

      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [callback, longPressTriggered, shouldPreventDefault]
  );

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  };
}

function preventDefault(event: Event) {
  if (!('touches' in event)) {
    return;
  }
  const touchEvent = event as TouchEvent;
  if (touchEvent.touches.length < 2 && event.preventDefault) {
    event.preventDefault();
  }
}

/**
 * Swipe Detection Hook
 * Detects swipe gestures in all directions
 */
export function useSwipe(
  onSwipe: (direction: 'left' | 'right' | 'up' | 'down') => void,
  threshold = 50
) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const deltaX = e.changedTouches[0].clientX - touchStart.current.x;
      const deltaY = e.changedTouches[0].clientY - touchStart.current.y;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (Math.abs(deltaX) > threshold) {
          onSwipe(deltaX > 0 ? 'right' : 'left');
        }
      } else {
        if (Math.abs(deltaY) > threshold) {
          onSwipe(deltaY > 0 ? 'down' : 'up');
        }
      }

      touchStart.current = null;
    },
    [onSwipe, threshold]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * Double Tap Hook
 * Detects double tap gestures
 */
export function useDoubleTap(callback: () => void, { delay = 300 } = {}) {
  const lastTap = useRef<number>(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < delay) {
      callback();
      lastTap.current = 0;
    } else {
      lastTap.current = now;
    }
  }, [callback, delay]);

  return {
    onClick: handleTap,
    onTouchEnd: handleTap,
  };
}

/**
 * Scroll Lock Hook
 * Prevents body scrolling (useful for modals)
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [locked]);
}

/**
 * Click Outside Hook
 * Detects clicks outside of an element
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  callback: () => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback]);

  return ref;
}

/**
 * Hover Intent Hook
 * Only triggers after hovering for a specified duration
 */
export function useHoverIntent(
  onHover: () => void,
  onLeave?: () => void,
  delay = 300
) {
  const timeout = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleMouseEnter = useCallback(() => {
    timeout.current = setTimeout(onHover, delay);
  }, [onHover, delay]);

  const handleMouseLeave = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    onLeave?.();
  }, [onLeave]);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
}

/**
 * Scroll Direction Hook
 * Detects scroll direction
 */
export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(
    null
  );
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current) {
        setScrollDirection('down');
      } else if (currentScrollY < lastScrollY.current) {
        setScrollDirection('up');
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollDirection;
}

/**
 * Intersection Observer Hook
 * Detects when element enters viewport
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
      if (entry.isIntersecting && !hasBeenInView) {
        setHasBeenInView(true);
      }
    }, options);

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [options, hasBeenInView]);

  return { ref, isInView, hasBeenInView };
}

export default {
  useRipple,
  useHaptic,
  useLongPress,
  useSwipe,
  useDoubleTap,
  useScrollLock,
  useClickOutside,
  useHoverIntent,
  useScrollDirection,
  useInView,
};
