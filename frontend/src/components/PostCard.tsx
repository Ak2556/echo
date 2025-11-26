'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import {
  formatCompactNumber,
  formatRelativeTime,
} from '@/utils/internationalization';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  MessageSquare,
} from 'lucide-react';
import QuoteRepostModal from './QuoteRepostModal';
import ReportModal from './ReportModal';
import CollectionsModal from './CollectionsModal';

export interface Post {
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
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  isPinned?: boolean;
}

interface PostCardProps {
  post: Post;
  showActions?: boolean;
  onClick?: () => void;
  isOwnPost?: boolean;
}

const reactions = [
  { id: 'like', emoji: '❤️', label: 'Like' },
  { id: 'love', emoji: '😍', label: 'Love' },
  { id: 'laugh', emoji: '😂', label: 'Laugh' },
  { id: 'wow', emoji: '😮', label: 'Wow' },
  { id: 'sad', emoji: '😢', label: 'Sad' },
  { id: 'angry', emoji: '😠', label: 'Angry' },
];

export default function PostCard({
  post,
  showActions = true,
  onClick,
  isOwnPost = false,
}: PostCardProps) {
  const { likePost, repostPost, bookmarkPost, pinPost, blockUser, reportPost } =
    useUser();
  const toast = useToast();

  const [liked, setLiked] = useState(post.isLiked || false);
  const [reposted, setReposted] = useState(post.isReposted || false);
  const [bookmarked, setBookmarked] = useState(post.isBookmarked || false);
  const [pinned, setPinned] = useState(post.isPinned || false);
  const [likes, setLikes] = useState(post.stats.likes);
  const [reposts, setReposts] = useState(post.stats.reposts);
  const [bookmarks, setBookmarks] = useState(post.stats.bookmarks);

  const [showReactions, setShowReactions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showRepostMenu, setShowRepostMenu] = useState(false);
  const [showQuoteRepostModal, setShowQuoteRepostModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await likePost(post.id);
    if (success) {
      setLiked(!liked);
      setLikes((prev) => (liked ? prev - 1 : prev + 1));
    }
  };

  const handleReaction = async (reactionId: string, emoji: string) => {
    const success = await likePost(post.id);
    if (success) {
      setLiked(true);
      setLikes((prev) => prev + 1);
      toast.success(`Reacted with ${emoji}`);
    }
    setShowReactions(false);
  };

  const handleRepost = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await repostPost(post.id);
    if (success) {
      setReposted(!reposted);
      setReposts((prev) => (reposted ? prev - 1 : prev + 1));
      toast.success(reposted ? 'Removed repost' : 'Post reposted!');
    }
    setShowRepostMenu(false);
  };

  const handleQuoteRepost = async (commentary: string) => {
    try {
      // In real app, would call API to create quote repost
      const success = await repostPost(post.id); // Placeholder
      if (success) {
        setReposts((prev) => prev + 1);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleBlock = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await blockUser(post.author.id);
    if (success) {
      toast.success(`Blocked @${post.author.username}`);
    } else {
      toast.error('Failed to block user');
    }
    setShowMoreMenu(false);
  };

  const handleReport = async (reason: string, details: string) => {
    try {
      const success = await reportPost(post.id, reason);
      if (success) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If already bookmarked, remove from bookmarks
    if (bookmarked) {
      const success = await bookmarkPost(post.id);
      if (success) {
        setBookmarked(false);
        setBookmarks((prev) => prev - 1);
        toast.success('Removed from bookmarks');
      }
    } else {
      // If not bookmarked, show collections modal
      setShowCollectionsModal(true);
    }
  };

  const handleAddToCollection = async (collectionId: string) => {
    try {
      const success = await bookmarkPost(post.id); // In real app, would call specific collection API
      if (success) {
        setBookmarked(true);
        setBookmarks((prev) => prev + 1);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleCreateCollection = async (
    name: string,
    description: string,
    privacy: 'public' | 'private' | 'followers'
  ) => {
    try {
      // In real app, would call API to create collection
      const collectionId = `col_${Date.now()}`;

      // Add post to the new collection
      const success = await bookmarkPost(post.id);
      if (success) {
        setBookmarked(true);
        setBookmarks((prev) => prev + 1);
        return collectionId;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handlePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await pinPost(post.id);
    if (success) {
      setPinned(!pinned);
      toast.success(
        pinned ? 'Post unpinned from profile' : 'Post pinned to profile'
      );
    }
    setShowMoreMenu(false);
  };

  const handleShare = async (platform?: string) => {
    const shareUrl = `https://echo.app/post/${post.id}`;

    if (platform === 'copy') {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      } catch {
        toast.error('Failed to copy link');
      }
    } else if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.content.substring(0, 200))}`,
        '_blank'
      );
    } else if (platform === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        '_blank'
      );
    } else if (platform === 'whatsapp') {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(post.content + ' ' + shareUrl)}`,
        '_blank'
      );
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.author.displayName} on Echo`,
          text: post.content,
          url: shareUrl,
        });
      } catch {
        // User cancelled or error
      }
    }
    setShowShareMenu(false);
  };

  return (
    <article
      className="nothing-widget"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '';
        }
      }}
    >
      {/* Pin Indicator */}
      {pinned && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'var(--accent)',
            color: 'white',
            padding: '0.25rem 0.5rem',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            zIndex: 1,
          }}
        >
          📌 Pinned
        </div>
      )}

      {/* Author Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem',
        }}
      >
        <Image
          src={post.author.avatar}
          alt={post.author.displayName}
          width={48}
          height={48}
          style={{ borderRadius: '50%', border: '2px solid var(--border)' }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              {post.author.displayName}
            </span>
            {post.author.verified && (
              <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>
                ✓
              </span>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              opacity: 0.7,
            }}
          >
            <span>@{post.author.username}</span>
            <span>·</span>
            <span>{formatRelativeTime(post.timestamp)}</span>
          </div>
        </div>
        {showActions && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMoreMenu(!showMoreMenu);
              }}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <MoreHorizontal size={18} />
            </button>

            {showMoreMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.25rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  minWidth: '180px',
                }}
              >
                {isOwnPost && (
                  <button
                    onClick={handlePin}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s',
                      color: pinned ? 'var(--accent)' : 'var(--fg)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    📌 {pinned ? 'Unpin from profile' : 'Pin to profile'}
                  </button>
                )}
                {!isOwnPost && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.info('Following feature coming soon!');
                      setShowMoreMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Follow @{post.author.username}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.info('Mute feature coming soon!');
                    setShowMoreMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  Mute @{post.author.username}
                </button>
                {!isOwnPost && (
                  <button
                    onClick={handleBlock}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: 'none',
                      background: 'transparent',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      color: '#ef4444',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    🚫 Block @{post.author.username}
                  </button>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReportModal(true);
                    setShowMoreMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: '#ef4444',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  ⚠️ Report post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p style={{ marginBottom: '1rem', lineHeight: 1.6, fontSize: '0.95rem' }}>
        {post.content}
      </p>

      {/* Media */}
      {post.image && (
        <Image
          src={post.image}
          alt="Post image"
          width={600}
          height={400}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '400px',
            objectFit: 'cover',
            borderRadius: '12px',
            marginBottom: '1rem',
          }}
        />
      )}

      {/* Actions */}
      {showActions && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border)',
          }}
        >
          {/* Like with Reactions */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleLike}
              onMouseEnter={(e) => {
                setShowReactions(true);
                if (!liked)
                  e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
              }}
              onMouseLeave={(e) => {
                setShowReactions(false);
                if (!liked) e.currentTarget.style.background = 'transparent';
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s',
                color: liked ? '#ef4444' : 'var(--fg)',
                fontWeight: liked ? 600 : 400,
              }}
            >
              <Heart size={18} fill={liked ? '#ef4444' : 'none'} />
              <span style={{ fontSize: '0.9rem' }}>
                {formatCompactNumber(likes)}
              </span>
            </button>

            {showReactions && (
              <div
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '0.5rem',
                  display: 'flex',
                  gap: '0.5rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '24px',
                  padding: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10,
                }}
              >
                {reactions.map((reaction) => (
                  <button
                    key={reaction.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReaction(reaction.id, reaction.emoji);
                    }}
                    title={reaction.label}
                    style={{
                      width: '36px',
                      height: '36px',
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      borderRadius: '50%',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Comment */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toast.info('Comments feature coming soon!');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'background 0.2s',
              color: 'var(--fg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(59,130,246,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <MessageCircle size={18} />
            <span style={{ fontSize: '0.9rem' }}>
              {formatCompactNumber(post.stats.comments)}
            </span>
          </button>

          {/* Repost */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowRepostMenu(!showRepostMenu);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'all 0.2s',
                color: reposted ? '#10b981' : 'var(--fg)',
                fontWeight: reposted ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!reposted)
                  e.currentTarget.style.background = 'rgba(16,185,129,0.1)';
              }}
              onMouseLeave={(e) => {
                if (!reposted) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Repeat2 size={18} />
              <span style={{ fontSize: '0.9rem' }}>
                {formatCompactNumber(reposts)}
              </span>
            </button>

            {showRepostMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: 0,
                  marginBottom: '0.5rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  minWidth: '160px',
                }}
              >
                <button
                  onClick={handleRepost}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Repeat2 size={16} />
                  {reposted ? 'Remove Repost' : 'Repost'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowQuoteRepostModal(true);
                    setShowRepostMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <MessageSquare size={16} />
                  Quote Repost
                </button>
              </div>
            )}
          </div>

          {/* Bookmark */}
          <button
            onClick={handleBookmark}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.75rem',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: '8px',
              transition: 'all 0.2s',
              color: bookmarked ? '#f59e0b' : 'var(--fg)',
              fontWeight: bookmarked ? 600 : 400,
            }}
            onMouseEnter={(e) => {
              if (!bookmarked)
                e.currentTarget.style.background = 'rgba(245,158,11,0.1)';
            }}
            onMouseLeave={(e) => {
              if (!bookmarked) e.currentTarget.style.background = 'transparent';
            }}
          >
            <Bookmark size={18} fill={bookmarked ? '#f59e0b' : 'none'} />
            {bookmarks > 0 && (
              <span style={{ fontSize: '0.9rem' }}>
                {formatCompactNumber(bookmarks)}
              </span>
            )}
          </button>

          {/* Share */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowShareMenu(!showShareMenu);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.75rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                borderRadius: '8px',
                transition: 'background 0.2s',
                color: 'var(--fg)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Share2 size={18} />
            </button>

            {showShareMenu && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  marginBottom: '0.5rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 10,
                  minWidth: '160px',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare('copy');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  📋 Copy link
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare('twitter');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  🐦 Share to Twitter
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare('facebook');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  📘 Share to Facebook
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare('whatsapp');
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  💬 Share to WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quote Repost Modal */}
      <QuoteRepostModal
        isOpen={showQuoteRepostModal}
        onClose={() => setShowQuoteRepostModal(false)}
        post={post}
        onQuoteRepost={handleQuoteRepost}
      />

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        type="post"
        targetId={post.id}
        targetName={`Post by @${post.author.username}`}
        onReport={handleReport}
      />

      {/* Collections Modal */}
      <CollectionsModal
        isOpen={showCollectionsModal}
        onClose={() => setShowCollectionsModal(false)}
        postId={post.id}
        postImage={post.image}
        onAddToCollection={handleAddToCollection}
        onCreateCollection={handleCreateCollection}
      />
    </article>
  );
}
