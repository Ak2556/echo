/**
 * Custom Image Loader for Next.js
 * Handles CDN optimization for images
 */

export interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

/**
 * Custom image loader for CDN integration
 * In production, this would route images through a CDN
 * In development, it uses the default Next.js image optimization
 */
export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // If the image is already a full URL (external), return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // For development, use Next.js default image optimization
  if (process.env.NODE_ENV === 'development') {
    const params = new URLSearchParams();
    params.set('url', src);
    params.set('w', width.toString());
    if (quality) {
      params.set('q', quality.toString());
    }
    return `/_next/image?${params.toString()}`;
  }

  // For production, use CDN (adjust this URL based on your CDN setup)
  const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.echo.com';
  const params = new URLSearchParams();
  params.set('width', width.toString());
  if (quality) {
    params.set('quality', quality.toString());
  }

  return `${cdnUrl}${src}?${params.toString()}`;
}
