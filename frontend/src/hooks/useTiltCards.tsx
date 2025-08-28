'use client';

import { useEffect } from 'react';

export function useTiltCards() {
  useEffect(() => {
    // Utility function to check reduced motion preference
    const prefersReducedMotion = () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 3D tilt interaction for cards - EXACT COPY FROM answer.html
    function enableTilt() {
      if (prefersReducedMotion()) return;
      const cards = document.querySelectorAll('.tilt-card');
      cards.forEach(card => {
        const element = card as HTMLElement;
        if (element.dataset.tiltBound) return;
        element.dataset.tiltBound = 'true';
        const maxRot = 10; // max degrees of rotation
        element.addEventListener('mousemove', (e) => {
          const rect = element.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          const rotX = (y * maxRot).toFixed(2);
          const rotY = (-x * maxRot).toFixed(2);
          element.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
          // Slightly elevate and brighten on hover
          element.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
        });
        element.addEventListener('mouseleave', () => {
          element.style.transform = '';
          element.style.boxShadow = '';
        });
      });
    }

    // Initial setup
    enableTilt();

    // Re-enable for dynamically added cards
    const observer = new MutationObserver(() => {
      enableTilt();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
}