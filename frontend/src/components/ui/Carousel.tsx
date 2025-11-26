/**
 * @fileoverview Advanced Carousel Component
 * @description Touch-enabled, keyboard-accessible image carousel with thumbnails
 * @version 1.0.0
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  borderRadius,
  duration,
  easing,
  touchTarget,
} from '@/lib/design-system';
import { useResponsive } from '@/hooks/useResponsive';

export interface CarouselProps {
  images: string[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showThumbnails?: boolean;
  showIndicators?: boolean;
  showControls?: boolean;
  aspectRatio?: '16/9' | '4/3' | '1/1' | 'auto';
  priority?: boolean;
}

export function Carousel({
  images,
  autoPlay = false,
  autoPlayInterval = 5000,
  showThumbnails = true,
  showIndicators = true,
  showControls = true,
  aspectRatio = '16/9',
  priority = false,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { isMobile } = useResponsive();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const goToNext = () => {
    goToSlide((currentIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    goToSlide((currentIndex - 1 + images.length) % images.length);
  };

  // Auto-play
  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(goToNext, autoPlayInterval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoPlay, currentIndex, autoPlayInterval]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const aspectRatios = {
    '16/9': '56.25%',
    '4/3': '75%',
    '1/1': '100%',
    auto: 'auto',
  };

  return (
    <div
      className="carousel"
      style={{
        position: 'relative',
        width: '100%',
        userSelect: 'none',
      }}
      role="region"
      aria-label="Image carousel"
    >
      {/* Main Image */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: aspectRatios[aspectRatio],
          overflow: 'hidden',
          borderRadius: borderRadius.xl,
          background: 'var(--bg-secondary)',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            transition: `transform ${duration.normal} ${easing.easeOut}`,
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              style={{
                minWidth: '100%',
                position: 'relative',
              }}
            >
              <Image
                src={image}
                alt={`Slide ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                priority={priority && index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* Controls */}
        {showControls && images.length > 1 && !isMobile && (
          <>
            <button
              onClick={goToPrevious}
              aria-label="Previous image"
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: touchTarget.min,
                minHeight: touchTarget.min,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.5rem',
                transition: `all ${duration.fast} ${easing.easeOut}`,
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ‹
            </button>
            <button
              onClick={goToNext}
              aria-label="Next image"
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                minWidth: touchTarget.min,
                minHeight: touchTarget.min,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                border: 'none',
                borderRadius: '50%',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.5rem',
                transition: `all ${duration.fast} ${easing.easeOut}`,
                zIndex: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.5)';
                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
              }}
            >
              ›
            </button>
          </>
        )}

        {/* Indicators */}
        {showIndicators && images.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.5rem',
              zIndex: 2,
            }}
            role="tablist"
            aria-label="Carousel navigation"
          >
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={currentIndex === index ? 'true' : 'false'}
                role="tab"
                style={{
                  width: currentIndex === index ? '2rem' : '0.5rem',
                  height: '0.5rem',
                  border: 'none',
                  borderRadius: '4px',
                  background:
                    currentIndex === index
                      ? 'white'
                      : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: `all ${duration.fast} ${easing.easeOut}`,
                }}
              />
            ))}
          </div>
        )}

        {/* Image counter */}
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            padding: '0.5rem 1rem',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            borderRadius: borderRadius.full,
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: 600,
            zIndex: 2,
          }}
        >
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && !isMobile && (
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1rem',
            overflowX: 'auto',
            padding: '0.25rem',
          }}
        >
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              aria-label={`Thumbnail ${index + 1}`}
              style={{
                position: 'relative',
                minWidth: '80px',
                height: '60px',
                border:
                  currentIndex === index
                    ? '3px solid var(--accent)'
                    : '2px solid var(--border)',
                borderRadius: borderRadius.md,
                overflow: 'hidden',
                cursor: 'pointer',
                opacity: currentIndex === index ? 1 : 0.6,
                transition: `all ${duration.fast} ${easing.easeOut}`,
                background: 'var(--bg-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                if (currentIndex !== index) {
                  e.currentTarget.style.opacity = '0.6';
                }
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Carousel;
