'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export type LoadingSize = 'sm' | 'md' | 'lg' | 'xl';

interface LoadingProps {
  size?: LoadingSize;
  text?: string;
  fullscreen?: boolean;
}

const sizeMap = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };

export function Loading({ size = 'md', text, fullscreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <Loader2 className={`${sizeMap[size]} animate-spin text-blue-600`} />
      {text && <p className="text-sm text-gray-600 animate-pulse">{text}</p>}
    </div>
  );

  return fullscreen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      {content}
    </div>
  ) : content;
}

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  count?: number;
}

export function Skeleton({ className = '', width, height, count = 1 }: SkeletonProps) {
  const skeletonClass = `animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`;
  const style = { width, height };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={skeletonClass} style={style} />
        ))}
      </div>
    );
  }

  return <div className={skeletonClass} style={style} />;
}

export default Loading;
