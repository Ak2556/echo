'use client';

import React from 'react';

interface FallbackComponentProps {
  error?: Error;
  componentName?: string;
}

export default function FallbackComponent({ error, componentName = 'Component' }: FallbackComponentProps) {
  return (
    <div style={{
      padding: '2rem',
      textAlign: 'center',
      background: 'var(--surface, #f8f9fa)',
      border: '1px solid var(--border, #e0e0e0)',
      borderRadius: '8px',
      margin: '1rem'
    }}>
      <h3 style={{ color: 'var(--fg, #333)', marginBottom: '1rem' }}>
        ⚠️ {componentName} Error
      </h3>
      <p style={{ color: 'var(--muted, #666)', marginBottom: '1rem' }}>
        There was an issue loading this component.
      </p>
      {error && (
        <details style={{ textAlign: 'left', marginTop: '1rem' }}>
          <summary style={{ cursor: 'pointer', color: 'var(--accent, #007aff)' }}>
            Error Details
          </summary>
          <pre style={{
            background: 'var(--bg, #fff)',
            padding: '1rem',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.8rem',
            marginTop: '0.5rem'
          }}>
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '0.5rem 1rem',
          background: 'var(--accent, #007aff)',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        Reload Page
      </button>
    </div>
  );
}
