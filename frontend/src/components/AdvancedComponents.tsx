'use client';

import React, { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

/**
 * Advanced UI Components
 * Timeline, Tags, Tooltips, Accordion, and more
 */

// ============================================
// TIMELINE COMPONENT
// ============================================

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  icon?: React.ReactNode;
  color?: string;
  image?: string;
}

export function Timeline({
  items,
  variant = 'default',
}: {
  items: TimelineItem[];
  variant?: 'default' | 'compact' | 'minimal';
}) {
  return (
    <div style={{ position: 'relative' }}>
      {/* Timeline Line */}
      {variant !== 'minimal' && (
        <div
          style={{
            position: 'absolute',
            left: '19px',
            top: '10px',
            bottom: '10px',
            width: '2px',
            background: 'var(--gradient-primary)',
          }}
        />
      )}

      {/* Timeline Items */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: variant === 'compact' ? '1rem' : '2rem',
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className="animate-fade-in-up"
            style={{
              display: 'flex',
              gap: '1rem',
              position: 'relative',
              animationDelay: `${index * 0.1}s`,
              animationFillMode: 'backwards',
            }}
          >
            {/* Icon/Dot */}
            {variant !== 'minimal' && (
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: item.color || 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  zIndex: 1,
                }}
              >
                {item.icon || (
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'white',
                    }}
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div
              className="modern-card hover-lift"
              style={{ flex: 1, padding: '1.5rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '0.5rem',
                }}
              >
                <h4
                  style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}
                >
                  {item.title}
                </h4>
                <span
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--muted)',
                    whiteSpace: 'nowrap',
                    marginLeft: '1rem',
                  }}
                >
                  {item.time}
                </span>
              </div>

              {item.description && (
                <p
                  style={{
                    margin: '0.5rem 0 0',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    color: 'var(--muted)',
                  }}
                >
                  {item.description}
                </p>
              )}

              {item.image && (
                <img
                  src={item.image}
                  alt={item.title}
                  style={{
                    width: '100%',
                    maxHeight: '200px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    marginTop: '1rem',
                  }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// TAG/CHIP COMPONENT
// ============================================

export function Tag({
  label,
  variant = 'default',
  onRemove,
  icon,
  clickable = false,
  onClick,
}: {
  label: string;
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'gradient';
  onRemove?: () => void;
  icon?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
}) {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return { background: 'var(--accent)', color: 'white' };
      case 'success':
        return { background: '#10b981', color: 'white' };
      case 'warning':
        return { background: '#f59e0b', color: 'white' };
      case 'danger':
        return { background: '#ef4444', color: 'white' };
      case 'gradient':
        return { background: 'var(--gradient-primary)', color: 'white' };
      default:
        return {
          background: 'var(--bg-secondary)',
          color: 'var(--fg)',
          border: '1px solid var(--border)',
        };
    }
  };

  return (
    <span
      onClick={clickable ? onClick : undefined}
      className={`badge transition-smooth ${clickable ? 'hover-scale' : ''}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.375rem 0.75rem',
        fontSize: '0.875rem',
        fontWeight: 500,
        cursor: clickable || onRemove ? 'pointer' : 'default',
        ...getVariantStyle(),
      }}
    >
      {icon && <span>{icon}</span>}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            color: 'inherit',
          }}
          aria-label="Remove tag"
        >
          <X size={14} />
        </button>
      )}
    </span>
  );
}

export function TagGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {children}
    </div>
  );
}

// ============================================
// TOOLTIP COMPONENT
// ============================================

export function Tooltip({
  children,
  content,
  position = 'top',
}: {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}

      {show && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            zIndex: 9999,
            padding: '0.5rem 0.75rem',
            background: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            fontSize: '0.75rem',
            fontWeight: 500,
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            ...(position === 'top' && {
              bottom: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
            }),
            ...(position === 'bottom' && {
              top: 'calc(100% + 8px)',
              left: '50%',
              transform: 'translateX(-50%)',
            }),
            ...(position === 'left' && {
              right: 'calc(100% + 8px)',
              top: '50%',
              transform: 'translateY(-50%)',
            }),
            ...(position === 'right' && {
              left: 'calc(100% + 8px)',
              top: '50%',
              transform: 'translateY(-50%)',
            }),
          }}
        >
          {content}
        </div>
      )}
    </div>
  );
}

// ============================================
// ACCORDION COMPONENT
// ============================================

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultOpen,
}: {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultOpen?: string[];
}) {
  const [openItems, setOpenItems] = useState<string[]>(defaultOpen || []);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);

        return (
          <div
            key={item.id}
            className="modern-card"
            style={{
              overflow: 'hidden',
              transition: 'all var(--transition-base)',
            }}
          >
            {/* Header */}
            <button
              onClick={() => toggleItem(item.id)}
              className="transition-smooth"
              style={{
                width: '100%',
                padding: '1.25rem',
                background: 'none',
                border: 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'var(--fg)',
                textAlign: 'left',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                {item.icon && (
                  <span style={{ color: 'var(--accent)' }}>{item.icon}</span>
                )}
                <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                  {item.title}
                </span>
              </div>

              <ChevronDown
                size={20}
                style={{
                  transition: 'transform var(--transition-base)',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              />
            </button>

            {/* Content */}
            <div
              style={{
                maxHeight: isOpen ? '1000px' : '0',
                overflow: 'hidden',
                transition: 'max-height var(--transition-base)',
              }}
            >
              <div
                style={{ padding: '0 1.25rem 1.25rem', color: 'var(--muted)' }}
              >
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ============================================
// AVATAR GROUP
// ============================================

export function AvatarGroup({
  avatars,
  max = 5,
  size = 40,
}: {
  avatars: Array<{ id: string; src: string; name: string }>;
  max?: number;
  size?: number;
}) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {displayAvatars.map((avatar, index) => (
        <Tooltip key={avatar.id} content={avatar.name}>
          <img
            src={avatar.src}
            alt={avatar.name}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              border: '3px solid var(--bg)',
              marginLeft: index > 0 ? `-${size * 0.3}px` : 0,
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'transform var(--transition-base)',
              position: 'relative',
              zIndex: displayAvatars.length - index,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.zIndex = '999';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.zIndex = String(
                displayAvatars.length - index
              );
            }}
          />
        </Tooltip>
      ))}

      {remaining > 0 && (
        <Tooltip content={`${remaining} more`}>
          <div
            style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              border: '3px solid var(--bg)',
              marginLeft: `-${size * 0.3}px`,
              background: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 0,
            }}
          >
            +{remaining}
          </div>
        </Tooltip>
      )}
    </div>
  );
}

// ============================================
// DIVIDER
// ============================================

export function Divider({
  label,
  orientation = 'horizontal',
  variant = 'solid',
}: {
  label?: string;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'solid' | 'dashed' | 'gradient';
}) {
  if (orientation === 'vertical') {
    return (
      <div
        style={{
          width: '1px',
          height: '100%',
          background:
            variant === 'gradient'
              ? 'var(--gradient-primary)'
              : 'var(--border)',
          borderLeft:
            variant === 'dashed' ? '1px dashed var(--border)' : 'none',
        }}
      />
    );
  }

  if (label) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '1.5rem 0',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            background:
              variant === 'gradient'
                ? 'var(--gradient-primary)'
                : 'var(--border)',
            borderTop:
              variant === 'dashed' ? '1px dashed var(--border)' : 'none',
          }}
        />
        <span
          style={{
            fontSize: '0.875rem',
            color: 'var(--muted)',
            fontWeight: 500,
          }}
        >
          {label}
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            background:
              variant === 'gradient'
                ? 'var(--gradient-primary)'
                : 'var(--border)',
            borderTop:
              variant === 'dashed' ? '1px dashed var(--border)' : 'none',
          }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '1px',
        background:
          variant === 'gradient' ? 'var(--gradient-primary)' : 'var(--border)',
        borderTop: variant === 'dashed' ? '1px dashed var(--border)' : 'none',
        margin: '1.5rem 0',
      }}
    />
  );
}

export default {
  Timeline,
  Tag,
  TagGroup,
  Tooltip,
  Accordion,
  AvatarGroup,
  Divider,
};
