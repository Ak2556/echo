'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface MiniAppPopoverProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function MiniAppPopover({
  isVisible,
  onClose,
  children,
}: MiniAppPopoverProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isVisible || !mounted) return null;

  const modalContent = (
    <>
      {/* Background overlay for closing */}
      <div className="miniapp-backdrop" onClick={onClose} />

      {/* Popover content - centered modal */}
      <div className="miniapp-popover-wrapper" onClick={onClose}>
        <div
          className="miniapp-popover-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="miniapp-close-button"
            aria-label="Close"
          >
            ×
          </button>
          {children}
        </div>
      </div>

      <style jsx>{`
        .miniapp-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          z-index: 99998;
          animation: fadeIn 0.2s ease;
        }

        .miniapp-popover-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          z-index: 99999;
          overflow-y: auto;
        }

        .miniapp-popover-content {
          position: relative;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 16px;
          padding: 2rem;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .miniapp-close-button {
          position: absolute;
          top: 1rem;
          right: 1rem;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: none;
          background: var(--accent);
          color: white;
          font-size: 1.5rem;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          z-index: 10;
        }

        .miniapp-close-button:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* Custom scrollbar for the popover content */
        .miniapp-popover-content::-webkit-scrollbar {
          width: 6px;
        }

        .miniapp-popover-content::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }

        .miniapp-popover-content::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }

        .miniapp-popover-content::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </>
  );

  return createPortal(modalContent, document.body);
}
