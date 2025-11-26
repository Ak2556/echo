'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useThemeColors } from '@/hooks/useThemeColors';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: string;
  genre: string;
}

interface MediaPlayerAppProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function MediaPlayerApp({
  isVisible,
  onClose,
}: MediaPlayerAppProps) {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState<'audio' | 'video' | 'suggestions'>(
    'audio'
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [volume, setVolume] = useState(75);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<'off' | 'all' | 'one'>('off');
  const [videoUrl, setVideoUrl] = useState('');
  const [showVisualizer, setShowVisualizer] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const playlist: Track[] = [
    {
      id: '1',
      title: 'Midnight Dreams',
      artist: 'Luna Wave',
      album: 'Nocturne',
      duration: '3:45',
      genre: 'Electronic',
    },
    {
      id: '2',
      title: 'Summer Breeze',
      artist: 'Coastal Sound',
      album: 'Ocean Views',
      duration: '4:12',
      genre: 'Chill',
    },
    {
      id: '3',
      title: 'City Lights',
      artist: 'Urban Echo',
      album: 'Metropolis',
      duration: '3:28',
      genre: 'Pop',
    },
    {
      id: '4',
      title: 'Mountain High',
      artist: 'Nature Beats',
      album: 'Elevation',
      duration: '5:02',
      genre: 'Ambient',
    },
    {
      id: '5',
      title: 'Rhythm Flow',
      artist: 'Beat Master',
      album: 'Groove Theory',
      duration: '4:33',
      genre: 'Jazz',
    },
  ];

  const aiSuggestions = useMemo(() => {
    const hour = new Date().getHours();
    return [
      {
        title:
          hour < 12
            ? 'Morning Energy'
            : hour < 18
              ? 'Afternoon Focus'
              : 'Evening Relax',
        tracks: playlist.filter(
          (t) =>
            (hour < 12 && t.genre === 'Pop') ||
            (hour >= 12 && hour < 18 && t.genre === 'Electronic') ||
            (hour >= 18 && (t.genre === 'Chill' || t.genre === 'Ambient'))
        ),
        reason:
          hour < 12
            ? 'Upbeat tracks to start your day'
            : hour < 18
              ? 'Focus-enhancing music'
              : 'Wind down with calm tunes',
      },
      {
        title: 'Based on Your Listening',
        tracks: playlist.slice(0, 3),
        reason: 'Similar to tracks you enjoy',
      },
    ];
  }, []);

  const current = playlist[currentTrack];

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoUrl(URL.createObjectURL(file));
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        color: '#ffffff',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 24px',
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span>🎵</span> Media Player Pro
          </h2>
          <p
            style={{
              margin: '4px 0 0 0',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            AI-powered playlist suggestions
          </p>
        </div>
        <button
          onClick={() => setShowVisualizer(!showVisualizer)}
          style={{
            background: showVisualizer
              ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
              : 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '10px',
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          📊 Visualizer
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '12px 24px', gap: '8px' }}>
        {[
          { id: 'audio', label: 'Audio', icon: '🎵' },
          { id: 'video', label: 'Video', icon: '🎬' },
          { id: 'suggestions', label: 'AI Picks', icon: '🤖' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background:
                activeTab === tab.id
                  ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                  : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {activeTab === 'audio' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {/* Now Playing */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '100px',
                  height: '100px',
                  margin: '0 auto 16px',
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                }}
              >
                🎵
              </div>
              <div
                style={{
                  fontWeight: '600',
                  fontSize: '1.1rem',
                  marginBottom: '4px',
                }}
              >
                {current.title}
              </div>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '4px',
                }}
              >
                {current.artist}
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.4)',
                }}
              >
                {current.album}
              </div>
            </div>

            {/* Visualizer */}
            {showVisualizer && isPlaying && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: '4px',
                  height: '60px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '12px',
                  padding: '12px',
                }}
              >
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: '4px',
                      height: `${20 + Math.random() * 80}%`,
                      background: `linear-gradient(180deg, colors.brand.primary, colors.brand.tertiary)`,
                      borderRadius: '2px',
                      animation: 'pulse 0.5s infinite alternate',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Progress */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                  marginBottom: '8px',
                }}
              >
                <span>1:23</span>
                <span>{current.duration}</span>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '35%',
                    height: '100%',
                    background:
                      'linear-gradient(90deg, colors.brand.primary, colors.brand.tertiary)',
                    borderRadius: '3px',
                  }}
                />
              </div>
            </div>

            {/* Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <button
                onClick={() => setShuffle(!shuffle)}
                style={{
                  background: shuffle
                    ? 'rgba(102, 126, 234, 0.3)'
                    : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: shuffle ? 'colors.brand.primary' : 'white',
                }}
              >
                🔀
              </button>
              <button
                onClick={() =>
                  setCurrentTrack((prev) =>
                    prev > 0 ? prev - 1 : playlist.length - 1
                  )
                }
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: 'white',
                }}
              >
                ⏮️
              </button>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: 'white',
                }}
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={() =>
                  setCurrentTrack((prev) =>
                    prev < playlist.length - 1 ? prev + 1 : 0
                  )
                }
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: 'white',
                }}
              >
                ⏭️
              </button>
              <button
                onClick={() =>
                  setRepeat((prev) =>
                    prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off'
                  )
                }
                style={{
                  background:
                    repeat !== 'off'
                      ? 'rgba(102, 126, 234, 0.3)'
                      : 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: repeat !== 'off' ? 'colors.brand.primary' : 'white',
                }}
              >
                {repeat === 'one' ? '🔂' : '🔁'}
              </button>
            </div>

            {/* Volume */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '0 12px',
              }}
            >
              <span>🔊</span>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                style={{ flex: 1 }}
              />
              <span
                style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  minWidth: '40px',
                }}
              >
                {volume}%
              </span>
            </div>

            {/* Playlist */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                }}
              >
                Playlist
              </div>
              {playlist.map((track, idx) => (
                <div
                  key={track.id}
                  onClick={() => setCurrentTrack(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    background:
                      idx === currentTrack
                        ? 'rgba(102, 126, 234, 0.2)'
                        : 'transparent',
                    cursor: 'pointer',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {idx === currentTrack && isPlaying ? '🎵' : idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: idx === currentTrack ? '600' : '400',
                        fontSize: '0.85rem',
                      }}
                    >
                      {track.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {track.artist}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {track.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'video' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {!videoUrl ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '48px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎬</div>
                <p
                  style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '20px',
                  }}
                >
                  Select a video file to play
                </p>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  style={{ display: 'none' }}
                  id="video-input"
                />
                <label
                  htmlFor="video-input"
                  style={{
                    background:
                      'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                    padding: '12px 24px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Choose Video
                </label>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    marginBottom: '16px',
                  }}
                >
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    style={{ width: '100%', maxHeight: '300px' }}
                  />
                </div>
                <button
                  onClick={() => setVideoUrl('')}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  Close Video
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {aiSuggestions.map((suggestion, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    fontWeight: '600',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span>🤖</span> {suggestion.title}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '12px',
                  }}
                >
                  {suggestion.reason}
                </div>
                {suggestion.tracks.map((track) => (
                  <div
                    key={track.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      marginBottom: '6px',
                      cursor: 'pointer',
                    }}
                    onClick={() => {
                      setCurrentTrack(
                        playlist.findIndex((p) => p.id === track.id)
                      );
                      setActiveTab('audio');
                    }}
                  >
                    <span>🎵</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>
                        {track.title}
                      </div>
                      <div
                        style={{
                          fontSize: '0.75rem',
                          color: 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {track.artist}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.5)',
                      }}
                    >
                      {track.duration}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
