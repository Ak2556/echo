'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, MoreVertical, ThumbsUp, Send, Smile, X } from 'lucide-react';
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

interface CommentSectionProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

const emojis = ['❤️', '😂', '👍', '🔥', '🙏', '💯', '👏', '✨'];

export default function CommentSection({ postId, isOpen, onClose }: CommentSectionProps) {
  const toast = useToast();
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
      content: 'This is absolutely amazing! 🔥 The attention to detail is incredible. @raj_kumar you should check this out! #inspiring',
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
      content: 'Would love to collaborate on something like this! The creativity is next level 🚀',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      likes: 12,
      isLiked: false,
      replies: []
    }
  ]);

  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{commentId: string; username: string} | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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
        marginLeft: isReply ? '3rem' : '0',
        marginTop: isReply ? '1rem' : '1.5rem',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '1rem',
        borderRadius: '12px',
        background: isReply ? 'var(--surface)' : 'var(--background)',
        border: `1px solid ${isReply ? 'transparent' : 'var(--border)'}`,
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isReply ? 'var(--surface)' : 'var(--background)';
      }}
      >
        {/* Avatar */}
        <Image
          src={comment.author.avatar}
          alt={comment.author.displayName}
          width={40}
          height={40}
          style={{
            borderRadius: '50%',
            border: '2px solid var(--border)',
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
            marginBottom: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <span style={{
              fontWeight: 600,
              fontSize: '0.9rem',
              color: 'var(--nothing-text-primary)'
            }}>
              {comment.author.displayName}
            </span>
            {comment.author.verified && (
              <span style={{ color: 'var(--accent)', fontSize: '14px' }}>✓</span>
            )}
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--nothing-text-secondary)'
            }}>
              @{comment.author.username}
            </span>
            <span style={{
              fontSize: '0.75rem',
              color: 'var(--nothing-text-secondary)'
            }}>
              · {formatRelativeTime(comment.timestamp)}
            </span>
          </div>

          {/* Reply To Indicator */}
          {comment.replyTo && (
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--accent)',
              marginBottom: '0.5rem',
              fontWeight: 500
            }}>
              Replying to @{comment.replyTo}
            </div>
          )}

          {/* Comment Text */}
          <p style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            color: 'var(--nothing-text-primary)',
            wordWrap: 'break-word'
          }}>
            <LinkifiedText text={comment.content} />
          </p>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem'
          }}>
            <button
              onClick={() => handleLikeComment(comment.id, isReply, parentId)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 500,
                color: comment.isLiked ? '#ef4444' : 'var(--nothing-text-secondary)',
                transition: 'all 0.2s',
                padding: '0.25rem 0.5rem',
                borderRadius: '6px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Heart size={16} fill={comment.isLiked ? '#ef4444' : 'none'} />
              {comment.likes > 0 && <span>{comment.likes}</span>}
            </button>

            {!isReply && (
              <button
                onClick={() => handleReply(comment.id, comment.author.username)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: 'var(--nothing-text-secondary)',
                  transition: 'all 0.2s',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '6px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                  e.currentTarget.style.color = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--nothing-text-secondary)';
                }}
              >
                <MessageCircle size={16} />
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
                color: 'var(--nothing-text-secondary)',
                padding: '0.25rem',
                borderRadius: '6px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <MoreVertical size={16} />
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10001,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--background)',
          borderRadius: '20px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)'
        }}>
          <div>
            <h3 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--nothing-text-primary)',
              marginBottom: '0.25rem'
            }}>
              💬 Comments
            </h3>
            <p style={{
              margin: 0,
              fontSize: '0.85rem',
              color: 'var(--nothing-text-secondary)'
            }}>
              {comments.reduce((total, comment) => total + 1 + comment.replies.length, 0)} {comments.length === 1 && comments[0].replies.length === 0 ? 'comment' : 'comments'}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'var(--background)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
              color: 'var(--nothing-text-secondary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--background)';
              e.currentTarget.style.color = 'var(--nothing-text-secondary)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Comments List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem 1.5rem',
          background: 'var(--background)'
        }}>
          {comments.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              color: 'var(--nothing-text-secondary)'
            }}>
              <MessageCircle size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            comments.map(comment => renderComment(comment))
          )}
        </div>

        {/* Comment Input */}
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)'
        }}>
          {/* Replying To Indicator */}
          {replyingTo && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <span style={{
                fontSize: '0.85rem',
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
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-end'
          }}>
            <Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=c0aede"
              alt="Your avatar"
              width={40}
              height={40}
              style={{
                borderRadius: '50%',
                border: '2px solid var(--border)',
                flexShrink: 0
              }}
            />

            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                maxLength={1000}
                rows={1}
                style={{
                  width: '100%',
                  minHeight: '44px',
                  maxHeight: '120px',
                  padding: '0.75rem 3rem 0.75rem 1rem',
                  border: '2px solid var(--border)',
                  borderRadius: '24px',
                  background: 'var(--background)',
                  color: 'var(--nothing-text-primary)',
                  fontSize: '0.95rem',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
              />

              {/* Emoji Button */}
              <div style={{ position: 'absolute', right: '0.75rem', bottom: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--nothing-text-secondary)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--nothing-text-secondary)';
                  }}
                >
                  <Smile size={20} />
                </button>

                {commentText.trim() && (
                  <button
                    onClick={handleSubmitComment}
                    style={{
                      background: 'var(--accent)',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.35rem',
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
                    <Send size={16} />
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
                  padding: '0.75rem',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '0.5rem',
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
                        fontSize: '1.5rem',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--background)';
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
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: 'var(--nothing-text-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: '3.25rem'
          }}>
            <span>Press Cmd/Ctrl + Enter to post</span>
            <span>{commentText.length}/1000</span>
          </div>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideIn {
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
    </div>
  );
}
