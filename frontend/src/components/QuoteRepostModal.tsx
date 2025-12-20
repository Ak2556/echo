'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, MessageSquare } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';
import Image from 'next/image';
import { formatRelativeTime } from '@/utils/internationalization';

interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  video?: string;
  timestamp: Date;
  stats: {
    likes: number;
    comments: number;
    reposts: number;
    bookmarks: number;
  };
}

interface QuoteRepostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: Post;
  onQuoteRepost: (commentary: string) => Promise<boolean>;
}

export default function QuoteRepostModal({
  isOpen,
  onClose,
  post,
  onQuoteRepost,
}: QuoteRepostModalProps) {
  const { user } = useUser();
  const toast = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [commentary, setCommentary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxLength = 500;
  const remainingChars = maxLength - commentary.length;

  // Auto-focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, commentary]);

  const handleSubmit = async () => {
    if (!commentary.trim()) {
      toast.error('Please add your commentary');
      return;
    }

    if (commentary.length > maxLength) {
      toast.error(`Commentary must be ${maxLength} characters or less`);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onQuoteRepost(commentary.trim());
      if (success) {
        toast.success('Quote repost shared!');
        setCommentary('');
        onClose();
      } else {
        toast.error('Failed to share quote repost');
      }
    } catch (error) {
      toast.error('Failed to share quote repost');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setCommentary(value);
    }
  };

  // Auto-resize textarea
  const handleTextareaInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
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
        style={{
          background: 'var(--bg)',
          borderRadius: '20px',
          padding: '1.5rem',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={20} style={{ color: 'var(--accent)' }} />
            <h2
              style={{
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--fg)',
              }}
            >
              Quote Repost
            </h2>
          </div>

          <button
            onClick={onClose}
            style={{
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
        </div>

        {/* User Info */}
        {user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <Image
              src={user.avatar}
              alt={user.displayName}
              width={40}
              height={40}
              style={{ borderRadius: '50%', border: '2px solid var(--border)' }}
            />
            <div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  color: 'var(--fg)',
                }}
              >
                {user.displayName}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--muted)',
                }}
              >
                @{user.username}
              </div>
            </div>
          </div>
        )}

        {/* Commentary Input */}
        <div style={{ marginBottom: '1.5rem' }}>
          <textarea
            ref={textareaRef}
            value={commentary}
            onChange={handleTextareaChange}
            onInput={handleTextareaInput}
            placeholder="Add your commentary..."
            style={{
              width: '100%',
              minHeight: '100px',
              maxHeight: '200px',
              padding: '1rem',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              background: 'var(--surface)',
              color: 'var(--fg)',
              fontSize: '1rem',
              lineHeight: 1.5,
              resize: 'none',
              outline: 'none',
              transition: 'border-color 0.2s',
              fontFamily: 'inherit',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          />

          {/* Character Counter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ color: 'var(--muted)' }}>
              Press Cmd+Enter to post, Esc to cancel
            </div>
            <div
              style={{
                color: remainingChars < 50 ? '#ef4444' : 'var(--muted)',
                fontWeight: remainingChars < 50 ? 600 : 400,
              }}
            >
              {remainingChars} characters remaining
            </div>
          </div>
        </div>

        {/* Original Post Preview */}
        <div
          style={{
            border: '2px solid var(--border)',
            borderLeft: '4px solid var(--accent)',
            borderRadius: '12px',
            padding: '1rem',
            background: 'var(--surface)',
            marginBottom: '1.5rem',
          }}
        >
          {/* Original Post Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <Image
              src={post.author.avatar}
              alt={post.author.displayName}
              width={32}
              height={32}
              style={{ borderRadius: '50%', border: '1px solid var(--border)' }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {post.author.displayName}
                </span>
                {post.author.verified && (
                  <span style={{ color: 'var(--accent)', fontSize: '0.8rem' }}>
                    ✓
                  </span>
                )}
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.75rem',
                  opacity: 0.7,
                }}
              >
                <span>@{post.author.username}</span>
                <span>·</span>
                <span>{formatRelativeTime(post.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Original Post Content */}
          <p
            style={{
              margin: '0 0 0.75rem 0',
              lineHeight: 1.5,
              fontSize: '0.9rem',
              color: 'var(--fg)',
            }}
          >
            {post.content.length > 200
              ? `${post.content.substring(0, 200)}...`
              : post.content}
          </p>

          {/* Original Post Media */}
          {post.image && (
            <Image
              src={post.image}
              alt="Post image"
              width={400}
              height={200}
              style={{
                width: '100%',
                height: 'auto',
                maxHeight: '150px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '0.5rem',
              }}
            />
          )}

          {/* Original Post Stats */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              fontSize: '0.75rem',
              color: 'var(--muted)',
            }}
          >
            <span>❤️ {post.stats.likes}</span>
            <span>💬 {post.stats.comments}</span>
            <span>🔁 {post.stats.reposts}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--fg)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--surface)';
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={!commentary.trim() || isSubmitting || remainingChars < 0}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background:
                commentary.trim() && remainingChars >= 0
                  ? 'var(--accent)'
                  : 'rgba(0, 0, 0, 0.1)',
              color:
                commentary.trim() && remainingChars >= 0
                  ? 'white'
                  : 'var(--muted)',
              borderRadius: '8px',
              cursor:
                commentary.trim() && remainingChars >= 0 && !isSubmitting
                  ? 'pointer'
                  : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {isSubmitting ? (
              <>
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Posting...
              </>
            ) : (
              'Quote Repost'
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
