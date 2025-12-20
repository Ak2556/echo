'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VoiceMessageProps {
  audioUrl?: string;
  duration?: number;
  onSend?: (audioBlob: Blob, duration: number) => void;
  isRecording?: boolean;
  mode?: 'record' | 'playback';
}

interface WaveformData {
  peaks: number[];
}

export default function VoiceMessage({
  audioUrl,
  duration = 0,
  onSend,
  mode = 'playback',
}: VoiceMessageProps) {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [waveform, setWaveform] = useState<number[]>([]);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const MAX_DURATION = 120; // 2 minutes max

  // Generate waveform visualization
  useEffect(() => {
    if (audioUrl || recordedUrl) {
      // Generate random waveform for demo (in production, analyze actual audio)
      const peaks = Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2);
      setWaveform(peaks);
    }
  }, [audioUrl, recordedUrl]);

  // Update current time during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Timer for recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Cancel recording
  const cancelRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setRecordedUrl(null);
    setRecordingTime(0);
  };

  // Send voice message
  const sendVoiceMessage = () => {
    if (audioBlob && onSend) {
      onSend(audioBlob, recordingTime);
      cancelRecording();
    }
  };

  // Toggle playback
  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Seek to position
  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * audio.duration;
  };

  // Change playback speed
  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Recording mode UI
  if (mode === 'record') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem',
          background: isRecording
            ? 'rgba(239, 68, 68, 0.1)'
            : 'rgba(102, 126, 234, 0.1)',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
        }}
      >
        {!recordedUrl ? (
          <>
            {/* Record/Stop Button */}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: 'none',
                background: isRecording
                  ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                boxShadow: isRecording
                  ? '0 4px 12px rgba(239, 68, 68, 0.4)'
                  : '0 4px 12px rgba(102, 126, 234, 0.4)',
              }}
            >
              {isRecording ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>

            {/* Recording indicator */}
            {isRecording && (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    animation: 'pulse 1s ease-in-out infinite',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: '#ef4444',
                  }}
                >
                  {formatTime(recordingTime)}
                </span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: '#6b7280',
                  }}
                >
                  / {formatTime(MAX_DURATION)}
                </span>
              </div>
            )}

            {!isRecording && (
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Tap to record (max 2 min)
              </span>
            )}
          </>
        ) : (
          <>
            {/* Preview recorded audio */}
            <audio ref={audioRef} src={recordedUrl} />

            <button
              onClick={togglePlayback}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPlaying ? (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
              )}
            </button>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '0.85rem',
                  color: '#374151',
                  marginBottom: '0.25rem',
                }}
              >
                {formatTime(recordingTime)}
              </div>
              {/* Mini waveform */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1px',
                  height: '20px',
                }}
              >
                {waveform.slice(0, 30).map((peak, i) => (
                  <div
                    key={i}
                    style={{
                      width: '2px',
                      height: `${peak * 20}px`,
                      background: '#667eea',
                      borderRadius: '1px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Cancel */}
            <button
              onClick={cancelRecording}
              style={{
                padding: '0.5rem',
                border: 'none',
                background: 'transparent',
                color: '#6b7280',
                cursor: 'pointer',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Send */}
            <button
              onClick={sendVoiceMessage}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.85rem',
              }}
            >
              Send
            </button>
          </>
        )}

        <style jsx>{`
          @keyframes pulse {
            0%,
            100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `}</style>
      </div>
    );
  }

  // Playback mode UI
  const playbackUrl = audioUrl || recordedUrl;
  const totalDuration = duration || recordingTime;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        background:
          'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderRadius: '16px',
        maxWidth: '280px',
      }}
    >
      <audio ref={audioRef} src={playbackUrl || ''} />

      {/* Play/Pause Button */}
      <button
        onClick={togglePlayback}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
        }}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
      </button>

      {/* Waveform & Progress */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          onClick={seekTo}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1px',
            height: '32px',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          {waveform.map((peak, i) => {
            const progress =
              totalDuration > 0 ? currentTime / totalDuration : 0;
            const barProgress = i / waveform.length;
            const isActive = barProgress <= progress;

            return (
              <div
                key={i}
                style={{
                  width: '3px',
                  height: `${peak * 32}px`,
                  background: isActive ? '#667eea' : '#d1d5db',
                  borderRadius: '1.5px',
                  transition: 'background 0.1s ease',
                }}
              />
            );
          })}
        </div>

        {/* Time display */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.7rem',
            color: '#6b7280',
            marginTop: '0.25rem',
          }}
        >
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
      </div>

      {/* Speed control */}
      <button
        onClick={cycleSpeed}
        style={{
          padding: '0.25rem 0.5rem',
          border: '1px solid #e5e7eb',
          background: 'white',
          borderRadius: '6px',
          fontSize: '0.7rem',
          fontWeight: '600',
          color: '#667eea',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {playbackSpeed}x
      </button>
    </div>
  );
}
