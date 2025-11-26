'use client';

import React, { useState, useRef } from 'react';
import { X, Download, Share2, Copy } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';

interface ProfileQRCodeProps {
  isOpen: boolean;
  onClose: () => void;
  username?: string;
  displayName?: string;
  avatar?: string;
}

export default function ProfileQRCode({
  isOpen,
  onClose,
  username,
  displayName,
  avatar,
}: ProfileQRCodeProps) {
  const { user } = useUser();
  const toast = useToast();
  const qrRef = useRef<HTMLDivElement>(null);

  // Use provided props or fallback to current user
  const profileUsername = username || user?.username || 'demo_user';
  const profileDisplayName = displayName || user?.displayName || 'Demo User';
  const profileAvatar =
    avatar ||
    user?.avatar ||
    'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser';

  const profileUrl = `https://echo.app/@${profileUsername}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(profileUrl)}&bgcolor=ffffff&color=000000&margin=10`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast.success('Profile link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `echo-profile-${profileUsername}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('QR code downloaded!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profileDisplayName} on Echo`,
          text: `Check out ${profileDisplayName}'s profile on Echo!`,
          url: profileUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback to copy link
      handleCopyLink();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        ref={qrRef}
        style={{
          background: 'var(--bg)',
          borderRadius: '20px',
          padding: '2rem',
          maxWidth: '400px',
          width: '100%',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--fg)',
            }}
          >
            Share Profile
          </h2>
          <p
            style={{
              margin: 0,
              color: 'var(--muted)',
              fontSize: '0.9rem',
            }}
          >
            Scan this QR code to follow {profileDisplayName}
          </p>
        </div>

        {/* Profile Preview */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem',
            background: 'var(--surface)',
            borderRadius: '12px',
            border: '1px solid var(--border)',
          }}
        >
          <Image
            src={profileAvatar}
            alt={profileDisplayName}
            width={48}
            height={48}
            style={{ borderRadius: '50%', border: '2px solid var(--border)' }}
          />
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                color: 'var(--fg)',
                marginBottom: '0.25rem',
              }}
            >
              {profileDisplayName}
            </div>
            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--muted)',
              }}
            >
              @{profileUsername}
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '2rem',
          }}
        >
          <div
            style={{
              padding: '1rem',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid var(--border)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <img
              src={qrCodeUrl}
              alt="Profile QR Code"
              style={{
                width: '200px',
                height: '200px',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* URL Display */}
        <div
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--muted)',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
        >
          {profileUrl}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '0.75rem',
          }}
        >
          <button
            onClick={handleCopyLink}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--fg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.color = 'var(--fg)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <Copy size={20} />
            Copy Link
          </button>

          <button
            onClick={handleDownload}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--fg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.color = 'var(--fg)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <Download size={20} />
            Download
          </button>

          <button
            onClick={handleShare}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1rem 0.5rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontSize: '0.8rem',
              fontWeight: 500,
              color: 'var(--fg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
              e.currentTarget.style.color = 'var(--fg)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <Share2 size={20} />
            Share
          </button>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '1.5rem',
            fontSize: '0.75rem',
            color: 'var(--muted)',
            opacity: 0.7,
          }}
        >
          QR code works with any camera app
        </div>
      </div>
    </div>
  );
}
