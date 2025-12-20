'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

interface HoverCard3DProps {
  children: React.ReactNode;
  intensity?: number;
  perspective?: number;
  glowColor?: string;
  enableGlow?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * HoverCard3D - Adds 3D tilt effect to cards on hover
 * Perfect for product cards, feature cards, etc.
 */
export default function HoverCard3D({
  children,
  intensity = 15,
  perspective = 1000,
  glowColor = 'rgba(77, 171, 247, 0.3)',
  enableGlow = true,
  className = '',
  style = {},
}: HoverCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * intensity;
      const rotateY = ((x - centerX) / centerX) * -intensity;

      setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseEnter = () => {
      setIsHovering(true);
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      setRotation({ x: 0, y: 0 });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [intensity]);

  return (
    <div
      ref={cardRef}
      className={className}
      style={{
        perspective: `${perspective}px`,
        transition: 'transform 0.1s ease-out',
        position: 'relative',
        ...style,
      }}
    >
      <div
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${isHovering ? 1.02 : 1})`,
          transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out',
          transformStyle: 'preserve-3d',
          position: 'relative',
          boxShadow: isHovering && enableGlow
            ? `0 10px 30px ${glowColor}, 0 0 20px ${glowColor}`
            : '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        {children}
      </div>
    </div>
  );
}
