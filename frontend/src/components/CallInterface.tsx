'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  PhoneOff,
  Monitor,
  Settings,
  Users,
  MessageSquare,
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

type CallType = 'video' | 'audio';
type CallStatus = 'connecting' | 'ringing' | 'connected' | 'ended';

interface Participant {
  id: string;
  name: string;
  avatar: string;
  stream?: MediaStream;
}

interface CallInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  callType: CallType;
  isInitiator: boolean;
  participants: Participant[];
  onEndCall: () => void;
}

export default function CallInterface({
  isOpen,
  onClose,
  callType: initialCallType,
  isInitiator,
  participants,
  onEndCall,
}: CallInterfaceProps) {
  const toast = useToast();
  const [callType, setCallType] = useState<CallType>(initialCallType);
  const [status, setStatus] = useState<CallStatus>(
    isInitiator ? 'ringing' : 'connecting'
  );
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(callType === 'audio');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const callStartTimeRef = useRef<number>(0);

  // Format call duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize media stream
  const initializeMediaStream = useCallback(async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video:
          callType === 'video'
            ? {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                facingMode: 'user',
              }
            : false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');
      toast.error('Failed to access camera/microphone');
      return null;
    }
  }, [callType, toast]);

  // Initialize WebRTC peer connection
  const initializePeerConnection = useCallback(() => {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    // Add local stream tracks to peer connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming tracks from remote peer
    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // TODO: Send ICE candidate to remote peer via signaling server
        console.log('New ICE candidate:', event.candidate);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState);

      if (pc.connectionState === 'connected') {
        setStatus('connected');
        callStartTimeRef.current = Date.now();
        toast.success('Call connected!');
      } else if (
        pc.connectionState === 'disconnected' ||
        pc.connectionState === 'failed'
      ) {
        setStatus('ended');
        toast.error('Call disconnected');
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  }, [toast]);

  // Simulate call connection (in real app, this would use WebSocket signaling)
  useEffect(() => {
    if (!isOpen) return;

    const setupCall = async () => {
      await initializeMediaStream();
      initializePeerConnection();

      // Simulate connection after 2 seconds
      setTimeout(() => {
        if (status === 'ringing' || status === 'connecting') {
          setStatus('connected');
          callStartTimeRef.current = Date.now();
        }
      }, 2000);
    };

    setupCall();

    return () => {
      // Cleanup on unmount
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [isOpen, initializeMediaStream, initializePeerConnection, status]);

  // Update call duration timer
  useEffect(() => {
    if (status !== 'connected') return;

    const interval = setInterval(() => {
      const elapsed = Math.floor(
        (Date.now() - callStartTimeRef.current) / 1000
      );
      setCallDuration(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [status]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        toast.info(
          audioTrack.enabled ? 'Microphone unmuted' : 'Microphone muted'
        );
      }
    }
  }, [toast]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
        toast.info(videoTrack.enabled ? 'Video enabled' : 'Video disabled');
      }
    }
  }, [toast]);

  // Toggle screen sharing
  const toggleScreenShare = useCallback(async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' } as DisplayMediaStreamOptions['video'],
          audio: false,
        });

        const screenTrack = screenStream.getVideoTracks()[0];

        // Replace video track with screen track
        if (peerConnectionRef.current && localStreamRef.current) {
          const sender = peerConnectionRef.current
            .getSenders()
            .find((s) => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        // Handle screen share stop
        screenTrack.onended = () => {
          setIsScreenSharing(false);
          // Switch back to camera
          if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            const sender = peerConnectionRef.current
              ?.getSenders()
              .find((s) => s.track?.kind === 'video');
            if (sender && videoTrack) {
              sender.replaceTrack(videoTrack);
            }
          }
        };

        setIsScreenSharing(true);
        toast.success('Screen sharing started');
      } else {
        // Stop screen sharing
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          const sender = peerConnectionRef.current
            ?.getSenders()
            .find((s) => s.track?.kind === 'video');
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack);
          }
        }
        setIsScreenSharing(false);
        toast.info('Screen sharing stopped');
      }
    } catch (err) {
      console.error('Screen share error:', err);
      toast.error('Failed to share screen');
    }
  }, [isScreenSharing, toast]);

  // End call
  const handleEndCall = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setStatus('ended');
    onEndCall();
    setTimeout(() => onClose(), 500);
  }, [onClose, onEndCall]);

  // Switch between audio and video call
  const switchToVideo = useCallback(async () => {
    if (callType === 'audio') {
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const videoTrack = videoStream.getVideoTracks()[0];

        if (localStreamRef.current) {
          localStreamRef.current.addTrack(videoTrack);
        }

        const sender = peerConnectionRef.current
          ?.getSenders()
          .find((s) => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(videoTrack);
        } else {
          peerConnectionRef.current?.addTrack(
            videoTrack,
            localStreamRef.current!
          );
        }

        setCallType('video');
        setIsVideoOff(false);
        toast.success('Switched to video call');
      } catch (err) {
        toast.error('Failed to enable video');
      }
    }
  }, [callType, toast]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1rem 1.5rem',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'white',
            }}
          >
            {participants[0]?.name || 'Calling...'}
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {status === 'connecting' && '⏳ Connecting...'}
            {status === 'ringing' && '📞 Ringing...'}
            {status === 'connected' && `⏱️ ${formatDuration(callDuration)}`}
            {status === 'ended' && '❌ Call ended'}
          </p>
        </div>

        <button
          onClick={() => setShowSettings(!showSettings)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')
          }
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Video Container */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Remote Video (Main) */}
        {callType === 'video' && !isScreenSharing ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '3rem',
                marginBottom: '1rem',
              }}
            >
              {participants[0]?.name?.[0]?.toUpperCase() || '👤'}
            </div>
            <h2
              style={{
                margin: 0,
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 600,
              }}
            >
              {participants[0]?.name}
            </h2>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {callType === 'video' && (
          <div
            style={{
              position: 'absolute',
              top: '5rem',
              right: '1.5rem',
              width: '200px',
              height: '150px',
              borderRadius: '12px',
              overflow: 'hidden',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            {isVideoOff ? (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#1a1a1a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <VideoOff size={32} />
              </div>
            ) : (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)', // Mirror effect
                }}
              />
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div
        style={{
          padding: '2rem 1.5rem',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            background: isMuted ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isMuted)
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            if (!isMuted)
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {/* Video Toggle Button */}
        {callType === 'video' && (
          <button
            onClick={toggleVideo}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: isVideoOff ? '#ef4444' : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isVideoOff)
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              if (!isVideoOff)
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
          </button>
        )}

        {/* Screen Share Button (Video calls only) */}
        {callType === 'video' && (
          <button
            onClick={toggleScreenShare}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: isScreenSharing
                ? '#3b82f6'
                : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isScreenSharing)
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              if (!isScreenSharing)
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
          >
            <Monitor size={24} />
          </button>
        )}

        {/* Switch to Video (Audio calls only) */}
        {callType === 'audio' && (
          <button
            onClick={switchToVideo}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')
            }
          >
            <Video size={24} />
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={handleEndCall}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            border: 'none',
            background: '#ef4444',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#dc2626')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#ef4444')}
        >
          <PhoneOff size={28} />
        </button>

        {/* Chat Button */}
        <button
          onClick={() => setShowChat(!showChat)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            border: 'none',
            background: showChat ? '#3b82f6' : 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!showChat)
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            if (!showChat)
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <MessageSquare size={24} />
        </button>
      </div>

      {/* Call Stats Overlay */}
      {status === 'connected' && (
        <div
          style={{
            position: 'absolute',
            top: '5rem',
            left: '1.5rem',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1rem',
            borderRadius: '8px',
            fontSize: '0.8rem',
            color: 'white',
          }}
        >
          <div>📡 Connection: Excellent</div>
          <div>🎥 Quality: HD 720p</div>
          <div>⏱️ Duration: {formatDuration(callDuration)}</div>
        </div>
      )}
    </div>
  );
}
