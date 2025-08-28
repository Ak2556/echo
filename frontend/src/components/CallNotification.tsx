'use client';

import { useState, useEffect } from 'react';
import { Phone, Video, X } from 'lucide-react';

interface CallNotificationProps {
  isOpen: boolean;
  callerName: string;
  callerAvatar?: string;
  callType: 'video' | 'audio';
  onAccept: () => void;
  onDecline: () => void;
}

export default function CallNotification({
  isOpen,
  callerName,
  callerAvatar,
  callType,
  onAccept,
  onDecline
}: CallNotificationProps) {
  const [ringCount, setRingCount] = useState(0);

  // Auto-decline after 30 seconds
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onDecline();
    }, 30000);

    return () => clearTimeout(timer);
  }, [isOpen, onDecline]);

  // Ring animation
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setRingCount(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10002,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '24px',
          padding: '3rem 2rem',
          maxWidth: '400px',
          width: '90%',
          textAlign: 'center',
          animation: 'slideUp 0.4s ease-out',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Caller Avatar */}
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          margin: '0 auto 1.5rem',
          background: callerAvatar ? `url(${callerAvatar})` : 'rgba(255, 255, 255, 0.2)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '3rem',
          color: 'white',
          border: '4px solid rgba(255, 255, 255, 0.3)',
          position: 'relative',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          {!callerAvatar && (callerName?.[0]?.toUpperCase() || '👤')}

          {/* Ring indicator */}
          <div
            style={{
              position: 'absolute',
              inset: '-8px',
              border: '3px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '50%',
              animation: 'ripple 1.5s ease-out infinite'
            }}
          />
        </div>

        {/* Caller Name */}
        <h2 style={{
          margin: '0 0 0.5rem 0',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: 'white'
        }}>
          {callerName}
        </h2>

        {/* Call Type */}
        <p style={{
          margin: '0 0 2rem 0',
          fontSize: '1.1rem',
          color: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem'
        }}>
          {callType === 'video' ? <Video size={20} /> : <Phone size={20} />}
          Incoming {callType} call...
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          justifyContent: 'center'
        }}>
          {/* Decline Button */}
          <button
            onClick={onDecline}
            style={{
              width: '70px',
              height: '70px',
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
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
            }}
          >
            <X size={32} strokeWidth={3} />
            <div style={{
              position: 'absolute',
              bottom: '-2rem',
              fontSize: '0.85rem',
              color: 'white',
              whiteSpace: 'nowrap'
            }}>
              Decline
            </div>
          </button>

          {/* Accept Button */}
          <button
            onClick={onAccept}
            style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              border: 'none',
              background: '#22c55e',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
              position: 'relative',
              animation: 'pulse 2s ease-in-out infinite'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
            }}
          >
            <Phone size={32} strokeWidth={3} />
            <div style={{
              position: 'absolute',
              bottom: '-2rem',
              fontSize: '0.85rem',
              color: 'white',
              whiteSpace: 'nowrap'
            }}>
              Accept
            </div>
          </button>
        </div>

        {/* Ring Count */}
        <p style={{
          marginTop: '3rem',
          fontSize: '0.8rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          {Array(Math.min(ringCount, 3)).fill('🔔').join(' ')}
        </p>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(30px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
