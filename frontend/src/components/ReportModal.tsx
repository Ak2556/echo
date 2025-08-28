'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Shield, Flag } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'post' | 'user';
  targetId: string;
  targetName?: string;
  onReport: (reason: string, details: string) => Promise<boolean>;
}

const postReportReasons = [
  { id: 'spam', label: 'Spam or Scam', icon: '🚫', description: 'Unwanted commercial content or fraudulent activity' },
  { id: 'harassment', label: 'Harassment or Bullying', icon: '😡', description: 'Targeting someone with abuse or threats' },
  { id: 'misinformation', label: 'False Information', icon: '❌', description: 'Content that is misleading or factually incorrect' },
  { id: 'hate', label: 'Hate Speech', icon: '⚠️', description: 'Content that attacks people based on identity' },
  { id: 'violence', label: 'Violence or Dangerous Content', icon: '💥', description: 'Content promoting violence or harmful activities' },
  { id: 'inappropriate', label: 'Inappropriate Content', icon: '🔞', description: 'Sexual, graphic, or disturbing content' },
  { id: 'copyright', label: 'Copyright Violation', icon: '©️', description: 'Unauthorized use of copyrighted material' },
  { id: 'other', label: 'Other', icon: '📝', description: 'Something else that violates our guidelines' }
];

const userReportReasons = [
  { id: 'spam', label: 'Spam Account', icon: '🚫', description: 'Account primarily posts spam or promotional content' },
  { id: 'impersonation', label: 'Impersonation', icon: '🎭', description: 'Pretending to be someone else' },
  { id: 'harassment', label: 'Harassment', icon: '😡', description: 'Repeatedly targeting others with abuse' },
  { id: 'hate', label: 'Hateful Content', icon: '⚠️', description: 'Consistently posts hate speech or discriminatory content' },
  { id: 'underage', label: 'Underage Account', icon: '👶', description: 'Account appears to belong to someone under 13' },
  { id: 'bot', label: 'Automated Bot', icon: '🤖', description: 'Account appears to be an undisclosed bot' },
  { id: 'other', label: 'Other', icon: '📝', description: 'Something else that violates our guidelines' }
];

export default function ReportModal({ 
  isOpen, 
  onClose, 
  type, 
  targetId, 
  targetName, 
  onReport 
}: ReportModalProps) {
  const toast = useToast();
  const [selectedReason, setSelectedReason] = useState('');
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasons = type === 'post' ? postReportReasons : userReportReasons;
  const selectedReasonData = reasons.find(r => r.id === selectedReason);
  const requiresDetails = selectedReason === 'other';
  const maxDetailsLength = 500;

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error('Please select a reason for reporting');
      return;
    }

    if (requiresDetails && !details.trim()) {
      toast.error('Please provide additional details');
      return;
    }

    if (details.length > maxDetailsLength) {
      toast.error(`Details must be ${maxDetailsLength} characters or less`);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onReport(selectedReason, details.trim());
      if (success) {
        toast.success('Report submitted successfully. Thank you for helping keep Echo safe.');
        setSelectedReason('');
        setDetails('');
        onClose();
      } else {
        toast.error('Failed to submit report. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDetails('');
    onClose();
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
        padding: '1rem'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: '20px',
          padding: '1.5rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          border: '1px solid var(--border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flag size={20} style={{ color: '#ef4444' }} />
            <h2 style={{ 
              margin: 0, 
              fontSize: '1.25rem', 
              fontWeight: 700,
              color: 'var(--fg)'
            }}>
              Report {type === 'post' ? 'Post' : 'User'}
            </h2>
          </div>
          
          <button
            onClick={handleClose}
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
              transition: 'background 0.2s'
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

        {/* Target Info */}
        {targetName && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '0.75rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            color: 'var(--muted)'
          }}>
            Reporting {type}: <strong style={{ color: 'var(--fg)' }}>{targetName}</strong>
          </div>
        )}

        {/* Warning */}
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} style={{ color: '#ef4444', flexShrink: 0, marginTop: '0.1rem' }} />
          <div style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>
            <strong style={{ color: '#ef4444', display: 'block', marginBottom: '0.25rem' }}>
              Important:
            </strong>
            <span style={{ color: 'var(--fg)' }}>
              False reports may result in action against your account. Only report content that genuinely violates our community guidelines.
            </span>
          </div>
        </div>

        {/* Reason Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{
            margin: '0 0 1rem 0',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--fg)'
          }}>
            Why are you reporting this {type}?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {reasons.map((reason) => (
              <label
                key={reason.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '1rem',
                  border: `2px solid ${selectedReason === reason.id ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedReason === reason.id ? 'rgba(var(--accent-rgb), 0.05)' : 'var(--surface)'
                }}
                onMouseEnter={(e) => {
                  if (selectedReason !== reason.id) {
                    e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedReason !== reason.id) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                  }
                }}
              >
                <input
                  type="radio"
                  name="reason"
                  value={reason.id}
                  checked={selectedReason === reason.id}
                  onChange={(e) => setSelectedReason(e.target.value)}
                  style={{
                    width: '18px',
                    height: '18px',
                    marginTop: '0.1rem',
                    cursor: 'pointer'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.25rem'
                  }}>
                    <span style={{ fontSize: '1rem' }}>{reason.icon}</span>
                    <span style={{
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      color: 'var(--fg)'
                    }}>
                      {reason.label}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--muted)',
                    lineHeight: 1.3
                  }}>
                    {reason.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Details */}
        {(selectedReason && (requiresDetails || selectedReasonData)) && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--fg)'
            }}>
              Additional details {requiresDetails && <span style={{ color: '#ef4444' }}>*</span>}
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={requiresDetails 
                ? "Please provide specific details about the violation..." 
                : "Any additional context that might help our review (optional)..."
              }
              style={{
                width: '100%',
                minHeight: '80px',
                maxHeight: '120px',
                padding: '0.75rem',
                border: '2px solid var(--border)',
                borderRadius: '8px',
                background: 'var(--surface)',
                color: 'var(--fg)',
                fontSize: '0.9rem',
                lineHeight: 1.4,
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: 'var(--muted)'
            }}>
              <span>
                {requiresDetails ? 'Required for this report type' : 'Optional'}
              </span>
              <span style={{
                color: details.length > maxDetailsLength * 0.9 ? '#ef4444' : 'var(--muted)'
              }}>
                {details.length}/{maxDetailsLength}
              </span>
            </div>
          </div>
        )}

        {/* What Happens Next */}
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <Shield size={16} style={{ color: '#3b82f6' }} />
            <strong style={{ fontSize: '0.85rem', color: '#3b82f6' }}>
              What happens next?
            </strong>
          </div>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            fontSize: '0.8rem',
            color: 'var(--fg)',
            lineHeight: 1.4
          }}>
            <li>Our moderation team will review your report within 24-48 hours</li>
            <li>We'll take appropriate action if violations are found</li>
            <li>Your report is anonymous and won't be shared with the reported user</li>
            <li>You may receive a follow-up if we need more information</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={handleClose}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--fg)',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.2s'
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
            disabled={!selectedReason || (requiresDetails && !details.trim()) || isSubmitting || details.length > maxDetailsLength}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              background: selectedReason && (!requiresDetails || details.trim()) && details.length <= maxDetailsLength
                ? '#ef4444' 
                : 'rgba(0, 0, 0, 0.1)',
              color: selectedReason && (!requiresDetails || details.trim()) && details.length <= maxDetailsLength
                ? 'white' 
                : 'var(--muted)',
              borderRadius: '8px',
              cursor: selectedReason && (!requiresDetails || details.trim()) && !isSubmitting && details.length <= maxDetailsLength
                ? 'pointer' 
                : 'not-allowed',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {isSubmitting ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}