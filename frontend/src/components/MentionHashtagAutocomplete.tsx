'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  searchUsers,
  searchHashtags,
  mockUsers,
  mockHashtags,
} from '@/utils/textParsing';
import { formatCompactNumber } from '@/utils/internationalization';

interface AutocompleteProps {
  isOpen: boolean;
  type: 'mention' | 'hashtag';
  query: string;
  position: { top: number; left: number };
  onSelect: (value: string) => void;
  onClose: () => void;
}

export default function MentionHashtagAutocomplete({
  isOpen,
  type,
  query,
  position,
  onSelect,
  onClose,
}: AutocompleteProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get suggestions based on type
  const suggestions =
    type === 'mention' ? searchUsers(query) : searchHashtags(query);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query, type]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestions.length > 0) {
          const selected = suggestions[selectedIndex];
          if (type === 'mention') {
            onSelect((selected as (typeof mockUsers)[0]).username);
          } else {
            onSelect((selected as (typeof mockHashtags)[0]).tag);
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, suggestions, selectedIndex, type, onSelect, onClose]);

  if (!isOpen || suggestions.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        maxWidth: '320px',
        maxHeight: '280px',
        overflowY: 'auto',
        zIndex: 10000,
        padding: '4px',
      }}
    >
      {type === 'mention' ? (
        // Mention suggestions
        <div>
          {(suggestions as ReturnType<typeof searchUsers>).map(
            (user, index) => (
              <button
                key={user.username}
                onClick={() => onSelect(user.username)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  border: 'none',
                  borderRadius: '8px',
                  background:
                    selectedIndex === index
                      ? 'rgba(59, 130, 246, 0.1)'
                      : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                <Image
                  src={user.avatar}
                  alt={user.name}
                  width={40}
                  height={40}
                  style={{
                    borderRadius: '50%',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginBottom: '2px',
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        color: 'var(--nothing-text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {user.name}
                    </span>
                    {user.verified && (
                      <span style={{ color: '#3b82f6', fontSize: '14px' }}>
                        ✓
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--nothing-text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    @{user.username}
                  </div>
                </div>
              </button>
            )
          )}
        </div>
      ) : (
        // Hashtag suggestions
        <div>
          {(suggestions as ReturnType<typeof searchHashtags>).map(
            (hashtag, index) => (
              <button
                key={hashtag.tag}
                onClick={() => onSelect(hashtag.tag)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '12px 14px',
                  border: 'none',
                  borderRadius: '8px',
                  background:
                    selectedIndex === index
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '0.95rem',
                      color: 'var(--nothing-text-primary)',
                      marginBottom: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    #{hashtag.tag}
                  </div>
                  <div
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--nothing-text-secondary)',
                    }}
                  >
                    {formatCompactNumber(hashtag.postCount)} posts
                  </div>
                </div>
                <span style={{ fontSize: '1.2rem' }}>📊</span>
              </button>
            )
          )}
        </div>
      )}

      {/* Helper text */}
      <div
        style={{
          padding: '8px 12px',
          fontSize: '0.75rem',
          color: 'var(--nothing-text-secondary)',
          borderTop: '1px solid var(--border)',
          marginTop: '4px',
        }}
      >
        ↑↓ Navigate • Enter to select • Esc to close
      </div>
    </div>
  );
}
