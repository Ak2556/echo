'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption?: string;
  createdAt: Date;
  expiresAt: Date;
  views: number;
  isViewed: boolean;
}

interface UserStories {
  userId: string;
  username: string;
  userAvatar: string;
  stories: Story[];
  hasUnviewed: boolean;
}

interface StoriesProps {
  userStories: UserStories[];
  currentUserId: string;
  onCreateStory?: () => void;
  onViewStory?: (storyId: string) => void;
}

// Story Avatar Ring Component
export function StoryAvatar({
  user,
  size = 64,
  onClick,
  showAddButton = false,
}: {
  user: { avatar: string; username: string; hasUnviewed?: boolean };
  size?: number;
  onClick?: () => void;
  showAddButton?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: size + 8,
          height: size + 8,
          borderRadius: '50%',
          background: user.hasUnviewed
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f472b6 100%)'
            : '#e5e7eb',
          padding: '3px',
          transition: 'all 0.3s ease',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'white',
            padding: '2px',
          }}
        >
          <Image
            src={user.avatar}
            alt={user.username}
            width={size}
            height={size}
            style={{
              borderRadius: '50%',
              objectFit: 'cover',
            }}
          />
        </div>
        {showAddButton && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            +
          </div>
        )}
      </div>
      <span
        style={{
          fontSize: '0.75rem',
          color: '#374151',
          maxWidth: size + 8,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {showAddButton ? 'Your story' : user.username}
      </span>
    </div>
  );
}

// Story Viewer Component
export function StoryViewer({
  stories,
  initialIndex = 0,
  onClose,
  onViewed,
}: {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onViewed?: (storyId: string) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentStory = stories[currentIndex];
  const STORY_DURATION = 5000; // 5 seconds per story

  useEffect(() => {
    if (onViewed && currentStory) {
      onViewed(currentStory.id);
    }
  }, [currentIndex, currentStory, onViewed]);

  useEffect(() => {
    if (isPaused) return;

    const interval = 50;
    const increment = (interval / STORY_DURATION) * 100;

    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
            return 0;
          } else {
            onClose();
            return prev;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current);
      }
    };
  }, [currentIndex, isPaused, stories.length, onClose]);

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  };

  const goToNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleTouchStart = () => setIsPaused(true);
  const handleTouchEnd = () => setIsPaused(false);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor(
      (new Date().getTime() - new Date(date).getTime()) / 1000
    );
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    return `${Math.floor(seconds / 3600)}h`;
  };

  if (!currentStory) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'black',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Progress bars */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          padding: '12px 16px 8px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
        }}
      >
        {stories.map((_, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: '2px',
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '1px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: 'white',
                width:
                  index < currentIndex
                    ? '100%'
                    : index === currentIndex
                      ? `${progress}%`
                      : '0%',
                transition: index === currentIndex ? 'none' : 'width 0.3s ease',
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '48px 16px 16px',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)',
        }}
      >
        <Image
          src={currentStory.userAvatar}
          alt={currentStory.username}
          width={32}
          height={32}
          style={{ borderRadius: '50%' }}
        />
        <div style={{ marginLeft: '0.75rem', flex: 1 }}>
          <div
            style={{ color: 'white', fontWeight: '600', fontSize: '0.9rem' }}
          >
            {currentStory.username}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
            {formatTimeAgo(currentStory.createdAt)}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Story content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tap zones */}
        <div
          onClick={goToPrevious}
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '30%',
            cursor: 'pointer',
          }}
        />
        <div
          onClick={goToNext}
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '70%',
            cursor: 'pointer',
          }}
        />

        {currentStory.mediaType === 'video' ? (
          <video
            ref={videoRef}
            src={currentStory.mediaUrl}
            autoPlay
            muted
            playsInline
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Image
            src={currentStory.mediaUrl}
            alt="Story"
            fill
            style={{ objectFit: 'contain' }}
          />
        )}
      </div>

      {/* Caption */}
      {currentStory.caption && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '48px 16px 24px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
            color: 'white',
            fontSize: '0.9rem',
            textAlign: 'center',
          }}
        >
          {currentStory.caption}
        </div>
      )}

      {/* View count (for own stories) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'white',
          fontSize: '0.85rem',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {currentStory.views}
      </div>
    </div>
  );
}

// Story Creation Modal
export function StoryCreator({
  onClose,
  onPublish,
}: {
  onClose: () => void;
  onPublish: (media: File, caption: string) => void;
}) {
  const [media, setMedia] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMedia(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handlePublish = () => {
    if (media) {
      onPublish(media, caption);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.9)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Cancel
        </button>
        <span style={{ color: 'white', fontWeight: '600' }}>Create Story</span>
        <button
          onClick={handlePublish}
          disabled={!media}
          style={{
            background: media
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : '#4b5563',
            border: 'none',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: media ? 'pointer' : 'not-allowed',
            fontWeight: '600',
          }}
        >
          Share
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
        }}
      >
        {preview ? (
          <div
            style={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '60vh',
            }}
          >
            {media?.type.startsWith('video') ? (
              <video
                src={preview}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  borderRadius: '12px',
                }}
              />
            ) : (
              <img
                src={preview}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '60vh',
                  borderRadius: '12px',
                  objectFit: 'contain',
                }}
              />
            )}
            <button
              onClick={() => {
                setMedia(null);
                setPreview(null);
              }}
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(0,0,0,0.6)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '200px',
              height: '200px',
              border: '2px dashed rgba(255,255,255,0.3)',
              borderRadius: '16px',
              background: 'transparent',
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              transition: 'all 0.3s ease',
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Add Photo or Video</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {preview && (
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption..."
            maxLength={150}
            style={{
              marginTop: '16px',
              width: '100%',
              maxWidth: '400px',
              padding: '12px 16px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white',
              fontSize: '0.9rem',
            }}
          />
        )}
      </div>
    </div>
  );
}

// Main Stories Component
export default function Stories({
  userStories,
  currentUserId,
  onCreateStory,
  onViewStory,
}: StoriesProps) {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedStories, setSelectedStories] = useState<Story[]>([]);
  const [creatorOpen, setCreatorOpen] = useState(false);

  const openStories = (stories: Story[]) => {
    setSelectedStories(stories);
    setViewerOpen(true);
  };

  const handlePublish = (media: File, caption: string) => {
    console.log('Publishing story:', { media, caption });
    // In production, upload to backend
  };

  // Find current user's stories
  const currentUserStories = userStories.find(
    (u) => u.userId === currentUserId
  );

  return (
    <>
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          padding: '1rem',
          overflowX: 'auto',
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        {/* Add story button */}
        <StoryAvatar
          user={{
            avatar: currentUserStories?.userAvatar || '/default-avatar.png',
            username: 'You',
            hasUnviewed: false,
          }}
          onClick={() => setCreatorOpen(true)}
          showAddButton
        />

        {/* Other users' stories */}
        {userStories
          .filter((u) => u.userId !== currentUserId)
          .sort((a, b) => (b.hasUnviewed ? 1 : 0) - (a.hasUnviewed ? 1 : 0))
          .map((user) => (
            <StoryAvatar
              key={user.userId}
              user={{
                avatar: user.userAvatar,
                username: user.username,
                hasUnviewed: user.hasUnviewed,
              }}
              onClick={() => openStories(user.stories)}
            />
          ))}
      </div>

      {/* Story Viewer */}
      {viewerOpen && selectedStories.length > 0 && (
        <StoryViewer
          stories={selectedStories}
          onClose={() => setViewerOpen(false)}
          onViewed={onViewStory}
        />
      )}

      {/* Story Creator */}
      {creatorOpen && (
        <StoryCreator
          onClose={() => setCreatorOpen(false)}
          onPublish={handlePublish}
        />
      )}
    </>
  );
}
