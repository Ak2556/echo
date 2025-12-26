/**
 * @fileoverview Floating Header Component
 * @description Premium header with scroll-based transparency and blur effects
 * @version 1.0.0
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/animation-constants';
import { zIndex } from '@/lib/design-system';

interface FloatingHeaderProps {
  children?: React.ReactNode;
  className?: string;
  scrollThreshold?: number;
}

export function FloatingHeader({
  children,
  className = '',
  scrollThreshold = 20,
}: FloatingHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Detect scroll position
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > scrollThreshold;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled, scrollThreshold]);

  // GSAP animation for scroll state changes
  useGSAP(() => {
    if (!headerRef.current) return;

    gsap.to(headerRef.current, {
      backgroundColor: scrolled
        ? 'rgba(255, 255, 255, 0.85)'
        : 'rgba(255, 255, 255, 0)',
      backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(0px)',
      boxShadow: scrolled
        ? '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)'
        : 'none',
      duration: 0.2,
      ease: ANIMATION.easing.apple,
    });

    // Dark mode support
    const isDark =
      document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark && headerRef.current) {
      gsap.to(headerRef.current, {
        backgroundColor: scrolled
          ? 'rgba(10, 14, 26, 0.85)'
          : 'rgba(10, 14, 26, 0)',
        duration: 0.2,
        ease: ANIMATION.easing.apple,
      });
    }
  }, [scrolled]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 transition-all ${className}`}
      style={{
        height: scrolled ? '64px' : '72px',
        zIndex: zIndex.sticky,
        borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
        transition:
          'height 200ms cubic-bezier(0.22, 1, 0.36, 1), border-bottom 200ms cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {children}
      </div>
    </header>
  );
}

export default FloatingHeader;
