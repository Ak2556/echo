/**
 * @fileoverview Advanced Video Player Component
 * @description Accessible video player with custom controls and quality selection
 * @version 1.0.0
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { borderRadius, touchTarget, duration, easing } from '@/lib/design-system';

export interface VideoQuality {
  label: string;
  height: number;
  src: string;
}

export interface VideoPlayerProps {
  src: string | { [quality: string]: string };
  poster?: string;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  aspectRatio?: '16/9' | '4/3' | '1/1';
  enableQualitySelector?: boolean;
  defaultQuality?: string;
  onEnded?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onQualityChange?: (quality: string) => void;
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  muted = false,
  loop = false,
  controls = true,
  aspectRatio = '16/9',
  enableQualitySelector = true,
  defaultQuality = 'auto',
  onEnded,
  onPlay,
  onPause,
  onQualityChange,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [currentQuality, setCurrentQuality] = useState(defaultQuality);
  const [availableQualities, setAvailableQualities] = useState<VideoQuality[]>([]);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isQualityChanging, setIsQualityChanging] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const qualityMenuRef = useRef<HTMLDivElement>(null);
  const maxRetries = 3;

  // Quality definitions
  const qualityOptions: { [key: string]: { label: string; height: number } } = {
    '144p': { label: '144p', height: 144 },
    '240p': { label: '240p', height: 240 },
    '360p': { label: '360p', height: 360 },
    '480p': { label: '480p', height: 480 },
    '720p': { label: '720p HD', height: 720 },
    '1080p': { label: '1080p Full HD', height: 1080 },
    '1440p': { label: '1440p 2K', height: 1440 },
    '2160p': { label: '2160p 4K', height: 2160 },
    'auto': { label: 'Auto', height: 0 }
  };

  const aspectRatios = {
    '16/9': '56.25%',
    '4/3': '75%',
    '1/1': '100%',
  };

  // Get current video source based on quality
  const getCurrentVideoSrc = (): string => {
    if (typeof src === 'string') {
      return src;
    }
    
    if (currentQuality === 'auto') {
      // Auto-select best quality based on network/device
      const autoQuality = getAutoQuality();
      return src[autoQuality] || src[Object.keys(src)[0]] || '';
    }
    
    return src[currentQuality] || src[Object.keys(src)[0]] || '';
  };

  // Auto-quality selection based on network and device capabilities
  const getAutoQuality = (): string => {
    if (typeof src === 'string') return 'auto';
    
    const connection = (navigator as any).connection;
    const availableKeys = Object.keys(src);
    
    // Sort qualities by resolution (highest first)
    const sortedQualities = availableKeys.sort((a, b) => {
      const heightA = qualityOptions[a]?.height || 0;
      const heightB = qualityOptions[b]?.height || 0;
      return heightB - heightA;
    });
    
    // Simple auto-selection logic
    if (connection) {
      const effectiveType = connection.effectiveType;
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          return sortedQualities.find(q => qualityOptions[q]?.height <= 240) || sortedQualities[sortedQualities.length - 1];
        case '3g':
          return sortedQualities.find(q => qualityOptions[q]?.height <= 480) || sortedQualities[sortedQualities.length - 1];
        case '4g':
        default:
          return sortedQualities.find(q => qualityOptions[q]?.height <= 1080) || sortedQualities[0];
      }
    }
    
    // Default to 720p if no connection info
    return sortedQualities.find(q => qualityOptions[q]?.height <= 720) || sortedQualities[0];
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!videoRef.current?.paused || false);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
      setHasError(false);
    }
  };

  const handleError = (event?: Event) => {
    const video = videoRef.current;
    let errorMsg = 'Failed to load video. Please try again later.';
    
    if (video?.error) {
      switch (video.error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
          errorMsg = 'Video loading was aborted.';
          break;
        case MediaError.MEDIA_ERR_NETWORK:
          errorMsg = 'Network error occurred while loading video.';
          break;
        case MediaError.MEDIA_ERR_DECODE:
          errorMsg = 'Video format is not supported or corrupted.';
          break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMsg = 'Video format is not supported by your browser.';
          break;
        default:
          errorMsg = 'An unknown error occurred while loading video.';
      }
    }
    
    setIsLoading(false);
    setHasError(true);
    setErrorMessage(errorMsg);
    setIsRetrying(false);
    console.error('Video error:', video?.error, event);
  };

  const handleLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    setIsRetrying(false);
  };

  const handleCanPlay = () => {
    setIsLoading(false);
    setHasError(false);
    setRetryCount(0);
  };

  const retryLoad = () => {
    if (retryCount < maxRetries) {
      setIsRetrying(true);
      setHasError(false);
      setRetryCount(prev => prev + 1);
      
      if (videoRef.current) {
        // Force reload the video
        const currentSrc = videoRef.current.src;
        videoRef.current.src = '';
        videoRef.current.load();
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.src = currentSrc;
            videoRef.current.load();
          }
        }, 100);
      }
    }
  };

  const isVideoSupported = (src: string): boolean => {
    const video = document.createElement('video');
    const supportedFormats = [
      'video/mp4',
      'video/webm',
      'video/ogg'
    ];
    
    // Check if browser supports the video element
    if (!video.canPlayType) {
      return false;
    }
    
    // Check file extension
    const extension = src.split('.').pop()?.toLowerCase();
    const formatMap: { [key: string]: string } = {
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'ogg': 'video/ogg',
      'ogv': 'video/ogg'
    };
    
    if (extension && formatMap[extension]) {
      const canPlay = video.canPlayType(formatMap[extension]);
      return canPlay === 'probably' || canPlay === 'maybe';
    }
    
    return true; // Assume supported if we can't determine
  };

  // Handle quality change
  const handleQualityChange = async (newQuality: string) => {
    if (newQuality === currentQuality || !videoRef.current) return;
    
    setIsQualityChanging(true);
    setSavedTime(videoRef.current.currentTime);
    const wasPlaying = !videoRef.current.paused;
    
    try {
      setCurrentQuality(newQuality);
      onQualityChange?.(newQuality);
      
      // Wait for new source to load
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current;
        if (!video) {
          reject(new Error('Video element not found'));
          return;
        }
        
        const handleLoadedData = () => {
          video.removeEventListener('loadeddata', handleLoadedData);
          video.removeEventListener('error', handleError);
          
          // Restore playback position
          video.currentTime = savedTime;
          
          if (wasPlaying) {
            video.play().catch(console.error);
          }
          
          resolve();
        };
        
        const handleError = () => {
          video.removeEventListener('loadeddata', handleLoadedData);
          video.removeEventListener('error', handleError);
          reject(new Error('Failed to load new quality'));
        };
        
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);
        
        // Trigger reload with new source
        video.load();
      });
    } catch (error) {
      console.error('Quality change failed:', error);
      // Revert to previous quality on error
      setCurrentQuality(currentQuality);
    } finally {
      setIsQualityChanging(false);
      setShowQualityMenu(false);
    }
  };

  // Close quality menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target as Node)) {
        setShowQualityMenu(false);
      }
    };

    if (showQualityMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showQualityMenu]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (videoRef.current) {
      videoRef.current.volume = vol;
      setIsMuted(vol === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      onPlay?.();
    };

    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadstart', handleLoadStart);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('loadeddata', handleCanPlay);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadstart', handleLoadStart);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('loadeddata', handleCanPlay);
    };
  }, [onPlay, onPause, onEnded]);

  // Initialize available qualities and check format support
  useEffect(() => {
    const currentSrc = getCurrentVideoSrc();
    
    if (currentSrc && !isVideoSupported(currentSrc)) {
      setHasError(true);
      setIsLoading(false);
      setErrorMessage('Video format is not supported by your browser.');
      return;
    }
    
    // Set available qualities
    if (typeof src === 'object') {
      const qualities: VideoQuality[] = Object.entries(src).map(([quality, url]) => ({
        label: qualityOptions[quality]?.label || quality,
        height: qualityOptions[quality]?.height || 0,
        src: url
      }));
      
      // Sort by height (lowest to highest)
      qualities.sort((a, b) => a.height - b.height);
      
      // Add auto option
      qualities.unshift({
        label: 'Auto',
        height: 0,
        src: ''
      });
      
      setAvailableQualities(qualities);
    } else {
      setAvailableQualities([]);
    }
  }, [src]);

  // Update video source when quality changes
  useEffect(() => {
    if (videoRef.current) {
      const newSrc = getCurrentVideoSrc();
      if (videoRef.current.src !== newSrc) {
        videoRef.current.src = newSrc;
      }
    }
  }, [currentQuality, src]);

  return (
    <div
      className="video-player"
      style={{
        position: 'relative',
        width: '100%',
        paddingBottom: aspectRatios[aspectRatio],
        background: '#000',
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={getCurrentVideoSrc()}
        poster={poster}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleError}
        onLoadStart={handleLoadStart}
        onCanPlay={handleCanPlay}
        onLoadedData={handleCanPlay}
        crossOrigin="anonymous"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
        onClick={togglePlay}
      />

      {/* Loading Indicator */}
      {(isLoading || isRetrying || isQualityChanging) && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            color: 'white',
            zIndex: 2,
            textAlign: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTopColor: 'white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <span style={{ fontSize: '0.875rem' }}>
            {isQualityChanging ? 'Changing quality...' : 
             isRetrying ? `Retrying... (${retryCount}/${maxRetries})` : 'Loading video...'}
          </span>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            color: 'white',
            textAlign: 'center',
            padding: '2rem',
            zIndex: 2,
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '0.5rem',
            }}
          >
            ⚠️
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>Video Unavailable</div>
          <div style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>{errorMessage}</div>
          {retryCount > 0 && (
            <div style={{ fontSize: '0.75rem', opacity: 0.7, marginBottom: '0.5rem' }}>
              Retry attempts: {retryCount}/{maxRetries}
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {retryCount < maxRetries && (
              <button
                onClick={retryLoad}
                disabled={isRetrying}
                style={{
                  padding: '0.5rem 1rem',
                  background: isRetrying ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'white',
                  cursor: isRetrying ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  opacity: isRetrying ? 0.6 : 1
                }}
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            )}
            <button
              onClick={() => {
                setHasError(false);
                setIsLoading(true);
                setRetryCount(0);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Reload
            </button>
          </div>
        </div>
      )}

      {/* Play/Pause Overlay */}
      {!isPlaying && !isLoading && !hasError && (
        <button
          onClick={togglePlay}
          aria-label="Play video"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '80px',
            height: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.9)',
            border: 'none',
            borderRadius: '50%',
            color: '#000',
            fontSize: '2rem',
            cursor: 'pointer',
            transition: `all ${duration.fast} ${easing.easeOut}`,
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
          }}
        >
          ▶
        </button>
      )}

      {/* Custom Controls */}
      {controls && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '1rem',
            background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.8))',
            opacity: showControls ? 1 : 0,
            transition: `opacity ${duration.fast} ${easing.easeOut}`,
            zIndex: 3,
          }}
        >
          {/* Progress Bar */}
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            aria-label="Video progress"
            style={{
              width: '100%',
              height: '4px',
              marginBottom: '0.75rem',
              cursor: 'pointer',
              accentColor: 'var(--accent)',
            }}
          />

          {/* Controls Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              color: 'white',
            }}
          >
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              style={{
                minWidth: touchTarget.min,
                minHeight: touchTarget.min,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>

            {/* Time */}
            <span style={{ fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Volume */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginLeft: 'auto',
              }}
            >
              <button
                onClick={toggleMute}
                aria-label={isMuted ? 'Unmute' : 'Mute'}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {isMuted || volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
                style={{
                  width: '80px',
                  height: '4px',
                  cursor: 'pointer',
                  accentColor: 'var(--accent)',
                }}
              />
            </div>

            {/* Quality Selector */}
            {enableQualitySelector && availableQualities.length > 1 && (
              <div style={{ position: 'relative' }} ref={qualityMenuRef}>
                <button
                  onClick={() => setShowQualityMenu(!showQualityMenu)}
                  aria-label="Video quality"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'white',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span>⚙️</span>
                  <span>{qualityOptions[currentQuality]?.label || currentQuality}</span>
                  <span style={{ transform: showQualityMenu ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                </button>

                {/* Quality Menu */}
                {showQualityMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '100%',
                      right: 0,
                      marginBottom: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.9)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      padding: '0.5rem 0',
                      minWidth: '150px',
                      zIndex: 10,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    {availableQualities.map((quality) => {
                      const qualityKey = Object.keys(qualityOptions).find(
                        key => qualityOptions[key].label === quality.label
                      ) || 'auto';
                      
                      return (
                        <button
                          key={qualityKey}
                          onClick={() => handleQualityChange(qualityKey)}
                          disabled={isQualityChanging}
                          style={{
                            width: '100%',
                            padding: '0.5rem 1rem',
                            background: currentQuality === qualityKey ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.875rem',
                            cursor: isQualityChanging ? 'not-allowed' : 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            opacity: isQualityChanging ? 0.6 : 1,
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            if (!isQualityChanging && currentQuality !== qualityKey) {
                              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentQuality !== qualityKey) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span>{quality.label}</span>
                          {currentQuality === qualityKey && <span>✓</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isFullscreen ? '⛶' : '⛶'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoPlayer;

// Add CSS for spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
