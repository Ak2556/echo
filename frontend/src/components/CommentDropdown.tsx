'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, MoreVertical, Send, Smile, X, ChevronDown, ChevronUp } from 'lucide-react';
import { formatRelativeTime } from '@/utils/internationalization';
import { useToast } from '@/contexts/ToastContext';
import LinkifiedText from './LinkifiedText';

interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  timestamp: Date;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  replyTo?: string; // username being replied to
}

interface CommentDropdownProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

const emojis = ['❤️', '😂', '👍', '🔥', '🙏', '💯', '👏', '✨'];

export default function CommentDropdown({ postId, isOpen, onClose, buttonRef }: CommentDropdownProps) {
  const toast = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      author: {
        id: '1',
        username: 'priya_sharma',
        displayName: 'Priya Sharma',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=b6e3f4',
        verified: true
      },
      content: 'This is absolutely amazing! 🔥 The attention to detail is incredible.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      likes: 24,
      isLiked: false,
      replies: [
        {
          id: '1-1',
          author: {
            id: '2',
            username: 'raj_kumar',
            displayName: 'Raj Kumar',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj&backgroundColor=ffd5dc',
            verified: false
          },
          content: 'Thanks for the tag! This is really inspiring 💡',
          timestamp: new Date(Date.now() - 1000 * 60 * 25),
          likes: 8,
          isLiked: true,
          replies: [],
          replyTo: 'priya_sharma'
        }
      ]
    },
    {
      id: '2',
      author: {
        id: '3',
        username: 'sarah_jones',
        displayName: 'Sarah Jones',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=e6f3ff',
        verified: true
      },
      content: 'Would love to collaborate on something like this! 🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      likes: 12,
      isLiked: false,
      replies: []
    }
  ]);

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{commentId: string; username: string} | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  const handleSubmitComment = useCallback(() => {
    if (!commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      author: {
        id: 'me',
        username: 'you',
        displayName: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=c0aede',
        verified: false
      },
      content: commentText.trim(),
      timestamp: new Date(),
      likes: 0,
      isLiked: false,
      replies: replyingTo ? [] : [],
      replyTo: replyingTo?.username
    };

    if (replyingTo) {
      // Add as reply
      setComments(prev => prev.map(comment => {
        if (comment.id === replyingTo.commentId) {
          return {
            ...comment,
            replies: [...comment.replies, newComment]
          };
        }
        return comment;
      }));
      toast.success(`Replied to @${replyingTo.username}`);
    } else {
      // Add as top-level comment
      setComments(prev => [newComment, ...prev]);
      toast.success('Comment posted!');
    }

    setCommentText('');
    setReplyingTo(null);
  }, [commentText, replyingTo, toast]);

  const handleLikeComment = useCallback((commentId: string, isReply: boolean, parentId?: string) => {
    if (isReply && parentId) {
      setComments(prev => prev.map(comment => {
        if (comment.id === parentId) {
          return {
            ...comment,
            replies: comment.replies.map(reply => {
              if (reply.id === commentId) {
                return {
                  ...reply,
                  isLiked: !reply.isLiked,
                  likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
                };
              }
              return reply;
            })
          };
        }
        return comment;
      }));
    } else {
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
          };
        }
        return comment;
      }));
    }
  }, []);

  const handleReply = useCallback((commentId: string, username: string) => {
    setReplyingTo({ commentId, username });
    setCommentText(`@${username} `);
  }, []);

  const renderComment = (comment: Comment, isReply: boolean = false, parentId?: string) => (
    <div
      key={comment.id}
      style={{
        marginLeft: isReply ? '2rem' : '0',
        marginTop: isReply ? '0.75rem' : '1rem',
        padding: '0.75rem',
        borderRadius: '8px',
        background: isReply ? 'var(--bg-secondary)' : 'transparent',
        border: isReply ? '1px solid var(--border-secondary)' : 'none',
        transition: 'all 0.2s'
      }}
    >
      <div style={{
        display: 'flex',
        gap: '0.5rem'
      }}>
        {/* Avatar */}
        <Image
          src={comment.author.avatar}
          alt={comment.author.displayName}
          width={32}
          height={32}
          style={{
            borderRadius: '50%',
            border: '1px solid var(--border-primary)',
            flexShrink: 0
          }}
        />

        {/* Comment Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Author Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontWeight: 600,
              fontSize: '0.85rem',
              color: 'var(--text-primary)'
            }}>
              {comment.author.displayName}
            </span>
            {comment.author.verified && (
              <span style={{ color: 'var(--color-primary)', fontSize: '12px' }}>✓</span>
            )}
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-tertiary)'
            }}>
              @{comment.author.username}
            </span>
            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-tertiary)'
            }}>
              · {formatRelativeTime(comment.timestamp)}
            </span>
          </div>

          {/* Reply To Indicator */}
          {comment.replyTo && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--color-primary)',
              marginBottom: '0.25rem',
              fontWeight: 500
            }}>
              Replying to @{comment.replyTo}
            </div>
          )}

          {/* Comment Text */}
          <p style={{
            margin: '0 0 0.5rem 0',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            color: 'var(--text-primary)',
            wordWrap: 'break-word'
          }}>
            <LinkifiedText text={comment.content} />
          </p>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 500,
                color: comment.isLiked ? '#ef4444' : 'var(--text-tertiary)',
                transition: 'all 0.2s',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Heart size={12} fill={comment.isLiked ? '#ef4444' : 'none'} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {!isReply && (
              <button
                onClick={() => handleReply(comment.id, comment.author.username)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  transition: 'all 0.2s',
                  padding: '0.2rem 0.4rem',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <MessageCircle size={12} />
                Reply
              </button>
            )}

            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                padding: '0.2rem',
                borderRadius: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-tertiary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <MoreVertical size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          {comment.replies.map(reply => renderComment(reply, true, comment.id))}
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  const totalComments = comments.reduce((total, comment) => total + 1 + comment.replies.length, 0);
  const displayedComments = isExpanded ? comments : comments.slice(0, 2);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '0.5rem',
        width: '320px',
        maxWidth: '90vw',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-primary)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        zIndex: 1000,
        maxHeight: isExpanded ? '500px' : '300px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideDown 0.2s ease-out'
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--border-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-secondary)'
      }}>
        <div>
          <h4 style={{
            margin: 0,
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '0.2rem'
          }}>
            💬 Comments
          </h4>
          <p style={{
            margin: 0,
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)'
          }}>
            {totalComments} {totalComments === 1 ? 'comment' : 'comments'}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: 'none',
            background: 'var(--bg-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            color: 'var(--text-tertiary)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-tertiary)';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Comments List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.75rem',
        background: 'var(--bg-elevated)'
      }}>
        {comments.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--text-tertiary)'
          }}>
            <MessageCircle size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <>
            {displayedComments.map(comment => renderComment(comment))}
            
            {/* Show More/Less Button */}
            {comments.length > 2 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  margin: '0.5rem 0',
                  border: '1px solid var(--border-secondary)',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={16} />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Show {comments.length - 2} More Comments
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Comment Input */}
      <div style={{
        padding: '0.75rem',
        borderTop: '1px solid var(--border-secondary)',
        background: 'var(--bg-secondary)'
      }}>
        {/* Replying To Indicator */}
        {replyingTo && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.5rem',
            padding: '0.4rem 0.6rem',
            background: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '6px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            <span style={{
              fontSize: '0.75rem',
              color: '#3b82f6',
              fontWeight: 500
            }}>
              Replying to @{replyingTo.username}
            </span>
            <button
              onClick={() => {
                setReplyingTo(null);
                setCommentText('');
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#3b82f6',
                padding: '0.2rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={12} />
            </button>
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'flex-end'
        }}>
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=c0aede"
            alt="Your avatar"
            width={32}
            height={32}
            style={{
              borderRadius: '50%',
              border: '1px solid var(--border-primary)',
              flexShrink: 0
            }}
          />

          <div style={{ flex: 1, position: 'relative' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              maxLength={500}
              rows={1}
              style={{
                width: '100%',
                minHeight: '36px',
                maxHeight: '80px',
                padding: '0.5rem 2.5rem 0.5rem 0.75rem',
                border: '1px solid var(--border-secondary)',
                borderRadius: '18px',
                background: 'var(--bg-elevated)',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                resize: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.4,
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-secondary)';
              }}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmitComment();
                }
              }}
            />

            {/* Emoji Button and Send Button */}
            <div style={{ position: 'absolute', right: '0.5rem', bottom: '0.5rem', display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'var(--text-tertiary)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-tertiary)';
                }}
              >
                <Smile size={16} />
              </button>

              {commentText.trim() && (
                <button
                  onClick={handleSubmitComment}
                  style={{
                    background: 'var(--color-primary)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.3rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    color: 'white',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Send size={12} />
                </button>
              )}
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                right: 0,
                marginBottom: '0.5rem',
                padding: '0.5rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.25rem',
                zIndex: 10
              }}>
                {emojis.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      setCommentText(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: '0.3rem',
                      borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                      e.currentTarget.style.transform = 'scale(1.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Helper Text */}
        <div style={{
          marginTop: '0.4rem',
          fontSize: '0.7rem',
          color: 'var(--text-tertiary)',
          display: 'flex',
          justifyContent: 'space-between',
          paddingLeft: '2.5rem'
        }}>
          <span>Press Cmd/Ctrl + Enter to post</span>
          <span>{commentText.length}/500</span>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );

  return (
    <div style={{ position: 'relative' }}>
      {dropdownContent}
    </div>
  );
}