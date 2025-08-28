'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Advanced Carousel Component
 * Smooth animations, touch gestures, auto-play support
 */

export interface CarouselItem {
  id: string;
  content: React.ReactNode;
}

interface AdvancedCarouselProps {
  items: CarouselItem[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showIndicators?: boolean;
  showNavigation?: boolean;
  itemsPerView?: number;
  gap?: number;
  onSlideChange?: (index: number) => void;
}

export default function AdvancedCarousel({
  items,
  autoPlay = false,
  autoPlayInterval = 5000,
  showIndicators = true,
  showNavigation = true,
  itemsPerView = 1,
  gap = 16,
  onSlideChange
}: AdvancedCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalSlides = Math.ceil(items.length / itemsPerView);

  const goToSlide = (index: number) => {
    if (isTransitioning) return;

    const newIndex = Math.max(0, Math.min(index, totalSlides - 1));
    setCurrentIndex(newIndex);
    setIsTransitioning(true);

    setTimeout(() => setIsTransitioning(false), 500);

    if (onSlideChange) {
      onSlideChange(newIndex);
    }
  };

  const goToNext = () => {
    goToSlide(currentIndex === totalSlides - 1 ? 0 : currentIndex + 1);
  };

  const goToPrev = () => {
    goToSlide(currentIndex === 0 ? totalSlides - 1 : currentIndex - 1);
  };

  // Auto-play
  useEffect(() => {
    if (autoPlay) {
      autoPlayRef.current = setInterval(goToNext, autoPlayInterval);
      return () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      };
    }
  }, [autoPlay, autoPlayInterval, currentIndex]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) {
      goToNext();
    } else if (distance < -minSwipeDistance) {
      goToPrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Carousel Track */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'flex',
          transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
          transform: `translateX(-${currentIndex * 100}%)`,
          gap: `${gap}px`
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              flex: `0 0 calc((100% - ${(itemsPerView - 1) * gap}px) / ${itemsPerView})`,
              minWidth: 0
            }}
          >
            {item.content}
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      {showNavigation && totalSlides > 1 && (
        <>
          <button
            onClick={goToPrev}
            className="glass hover-scale transition-smooth focus-ring"
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={goToNext}
            className="glass hover-scale transition-smooth focus-ring"
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10
            }}
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      {showIndicators && totalSlides > 1 && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 10
          }}
        >
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="transition-smooth hover-scale"
              style={{
                width: currentIndex === index ? '32px' : '12px',
                height: '12px',
                borderRadius: '6px',
                background: currentIndex === index ? 'var(--accent)' : 'rgba(255, 255, 255, 0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Hero Carousel Variant
 */
export function HeroCarousel({
  slides,
  height = '500px'
}: {
  slides: Array<{
    id: string;
    title: string;
    description: string;
    image: string;
    cta?: {
      label: string;
      onClick: () => void;
    };
  }>;
  height?: string;
}) {
  return (
    <div style={{ height }}>
      <AdvancedCarousel
        items={slides.map((slide) => ({
          id: slide.id,
          content: (
            <div
              style={{
                height,
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '3rem'
                }}
              >
                <h2
                  className="animate-fade-in-up"
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: '1rem'
                  }}
                >
                  {slide.title}
                </h2>
                <p
                  className="animate-fade-in-up"
                  style={{
                    fontSize: '1.125rem',
                    color: 'rgba(255,255,255,0.9)',
                    marginBottom: '2rem',
                    maxWidth: '600px',
                    animationDelay: '0.1s',
                    animationFillMode: 'backwards'
                  }}
                >
                  {slide.description}
                </p>
                {slide.cta && (
                  <button
                    onClick={slide.cta.onClick}
                    className="btn-gradient hover-lift animate-fade-in-up"
                    style={{
                      padding: '1rem 2rem',
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      alignSelf: 'flex-start',
                      animationDelay: '0.2s',
                      animationFillMode: 'backwards'
                    }}
                  >
                    {slide.cta.label}
                  </button>
                )}
              </div>
            </div>
          )
        }))}
        autoPlay
        autoPlayInterval={6000}
        showIndicators
        showNavigation
      />
    </div>
  );
}

/**
 * Testimonial Carousel
 */
export function TestimonialCarousel({
  testimonials
}: {
  testimonials: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    content: string;
    rating: number;
  }>;
}) {
  return (
    <AdvancedCarousel
      items={testimonials.map((testimonial) => ({
        id: testimonial.id,
        content: (
          <div className="modern-card glass-premium" style={{ padding: '2rem', textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  margin: '0 auto',
                  border: '3px solid var(--accent)'
                }}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    color: i < testimonial.rating ? '#fbbf24' : '#6b7280',
                    fontSize: '1.25rem'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
            <p
              style={{
                fontSize: '1.125rem',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
                fontStyle: 'italic'
              }}
            >
              "{testimonial.content}"
            </p>
            <h4 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>
              {testimonial.name}
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>{testimonial.role}</p>
          </div>
        )
      }))}
      autoPlay
      autoPlayInterval={7000}
      showIndicators
      showNavigation={false}
    />
  );
}

/**
 * Product Carousel
 */
export function ProductCarousel({
  products,
  itemsPerView = 3
}: {
  products: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    onView: () => void;
  }>;
  itemsPerView?: number;
}) {
  return (
    <AdvancedCarousel
      items={products.map((product) => ({
        id: product.id,
        content: (
          <div
            onClick={product.onView}
            className="modern-card hover-lift transition-smooth"
            style={{
              cursor: 'pointer',
              overflow: 'hidden'
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: '100%',
                aspectRatio: '1',
                objectFit: 'cover'
              }}
            />
            <div style={{ padding: '1rem' }}>
              <h4
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {product.name}
              </h4>
              <p style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>
                ₹{product.price}
              </p>
            </div>
          </div>
        )
      }))}
      itemsPerView={itemsPerView}
      showIndicators={false}
      showNavigation
      gap={16}
    />
  );
}
