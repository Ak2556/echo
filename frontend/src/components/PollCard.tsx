'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Clock } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from '@/contexts/UserContext';

interface PollOption {
  id: string;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiresAt: Date;
  userVote?: string; // Option ID that user voted for
  allowMultiple?: boolean;
  isExpired?: boolean;
}

interface PollCardProps {
  poll: Poll;
  onVote?: (pollId: string, optionId: string) => Promise<boolean>;
}

export default function PollCard({ poll, onVote }: PollCardProps) {
  const { user } = useUser();
  const toast = useToast();

  const [selectedOption, setSelectedOption] = useState<string>(
    poll.userVote || ''
  );
  const [isVoting, setIsVoting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isExpired, setIsExpired] = useState(poll.isExpired || false);

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const expires = new Date(poll.expiresAt);
      const diff = expires.getTime() - now.getTime();

      if (diff <= 0) {
        setIsExpired(true);
        setTimeRemaining('Poll ended');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`);
      } else {
        setTimeRemaining(`${minutes}m remaining`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [poll.expiresAt]);

  const handleVote = async (optionId: string) => {
    if (isExpired || !user) {
      return;
    }

    if (poll.userVote) {
      toast.info('You have already voted in this poll');
      return;
    }

    setIsVoting(true);

    try {
      const success = onVote ? await onVote(poll.id, optionId) : true;
      if (success) {
        setSelectedOption(optionId);
        toast.success('Vote recorded!');
      } else {
        toast.error('Failed to record vote');
      }
    } catch (error) {
      toast.error('Failed to record vote');
    } finally {
      setIsVoting(false);
    }
  };

  // Calculate percentages
  const getPercentage = (votes: number) => {
    if (poll.totalVotes === 0) return 0;
    return Math.round((votes / poll.totalVotes) * 100);
  };

  // Find winning option
  const winningOption = poll.options.reduce((prev, current) =>
    current.votes > prev.votes ? current : prev
  );

  const hasVoted = !!poll.userVote || !!selectedOption;

  return (
    <div
      style={{
        border: '2px solid var(--border)',
        borderRadius: '16px',
        padding: '1.5rem',
        background: 'var(--surface)',
        margin: '1rem 0',
      }}
    >
      {/* Poll Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}
      >
        <BarChart3 size={20} style={{ color: 'var(--accent)' }} />
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--accent)',
          }}
        >
          Poll
        </span>
      </div>

      {/* Poll Question */}
      <h3
        style={{
          margin: '0 0 1.5rem 0',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: 'var(--fg)',
          lineHeight: 1.4,
        }}
      >
        {poll.question}
      </h3>

      {/* Poll Options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        {poll.options.map((option) => {
          const percentage = getPercentage(option.votes);
          const isWinner =
            hasVoted && option.id === winningOption.id && poll.totalVotes > 0;
          const isUserChoice = option.id === (poll.userVote || selectedOption);
          const canVote = !hasVoted && !isExpired && user;

          return (
            <div
              key={option.id}
              style={{
                position: 'relative',
                border: `2px solid ${
                  isUserChoice
                    ? 'var(--accent)'
                    : canVote
                      ? 'var(--border)'
                      : 'transparent'
                }`,
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: canVote ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                background: 'var(--bg)',
              }}
              onClick={() => canVote && handleVote(option.id)}
              onMouseEnter={(e) => {
                if (canVote) {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={(e) => {
                if (canVote && !isUserChoice) {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {/* Progress Bar Background */}
              {hasVoted && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${percentage}%`,
                    background: isUserChoice
                      ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1))'
                      : isWinner
                        ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))'
                        : 'linear-gradient(90deg, rgba(156, 163, 175, 0.2), rgba(156, 163, 175, 0.1))',
                    transition: 'width 0.5s ease',
                    zIndex: 1,
                  }}
                />
              )}

              {/* Option Content */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    flex: 1,
                  }}
                >
                  {/* Vote Indicator */}
                  {canVote ? (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid var(--border)',
                        borderRadius: '50%',
                        background: 'var(--bg)',
                        transition: 'all 0.2s',
                      }}
                    />
                  ) : isUserChoice ? (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        background: 'var(--accent)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                      }}
                    >
                      ✓
                    </div>
                  ) : (
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid var(--border)',
                        borderRadius: '50%',
                        background: 'var(--surface)',
                      }}
                    />
                  )}

                  {/* Option Text */}
                  <span
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: isUserChoice ? 600 : 500,
                      color: 'var(--fg)',
                      flex: 1,
                    }}
                  >
                    {option.text}
                  </span>

                  {/* Winner Crown */}
                  {isWinner && poll.totalVotes > 0 && (
                    <span
                      style={{
                        fontSize: '1.1rem',
                        marginLeft: '0.5rem',
                      }}
                    >
                      👑
                    </span>
                  )}
                </div>

                {/* Percentage */}
                {hasVoted && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      color: isUserChoice ? 'var(--accent)' : 'var(--muted)',
                    }}
                  >
                    <span>{percentage}%</span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                      ({option.votes})
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Poll Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          fontSize: '0.85rem',
          color: 'var(--muted)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Users size={14} />
            <span>{poll.totalVotes} votes</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <Clock size={14} />
            <span
              style={{
                color: isExpired ? '#ef4444' : 'var(--muted)',
                fontWeight: isExpired ? 600 : 400,
              }}
            >
              {timeRemaining}
            </span>
          </div>
        </div>

        {/* Helper Text */}
        {!hasVoted && !isExpired && user && (
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--accent)',
              fontStyle: 'italic',
            }}
          >
            Click to vote
          </span>
        )}

        {!user && (
          <span
            style={{
              fontSize: '0.8rem',
              color: 'var(--muted)',
              fontStyle: 'italic',
            }}
          >
            Login to vote
          </span>
        )}
      </div>

      {/* Loading Overlay */}
      {isVoting && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '16px',
            zIndex: 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--accent)',
            }}
          >
            <div
              style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                borderTopColor: 'var(--accent)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }}
            />
            Recording vote...
          </div>
        </div>
      )}

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
