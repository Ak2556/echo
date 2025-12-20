'use client';

import { useBackground } from '@/contexts/BackgroundContext';

export default function Background3D() {
  const { mode } = useBackground();

  if (mode === 'off') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background:
          'linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)',
        pointerEvents: 'none',
      }}
    />
  );
}
