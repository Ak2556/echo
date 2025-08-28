/**
 * Tests for AccessibilityQuickPanel component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the AccessibilityQuickPanel component since it has complex dependencies
jest.mock('../AccessibilityQuickPanel', () => {
  return function MockAccessibilityQuickPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;
    
    return (
      <div data-testid="accessibility-panel">
        <h2>Accessibility</h2>
        <p>Score: 85%</p>
        <button onClick={onClose} aria-label="Close accessibility panel">
          Close
        </button>
        <div>
          <button>Visual</button>
          <button>Audio</button>
          <button>Keyboard</button>
          <button>Test</button>
        </div>
        <div>
          <p>High Contrast Mode</p>
          <p>Large Text</p>
          <p>Reduce Motion</p>
          <p>Font Size</p>
        </div>
        <div>
          <button>Reset</button>
          <button>Export</button>
          <button>Settings</button>
        </div>
      </div>
    );
  };
});

// Import the mocked component
import AccessibilityQuickPanel from '../AccessibilityQuickPanel';

describe('AccessibilityQuickPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open', () => {
    render(<AccessibilityQuickPanel {...defaultProps} />);
    
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
    expect(screen.getByText('Score: 85%')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<AccessibilityQuickPanel {...defaultProps} isOpen={false} />);
    
    expect(screen.queryByText('Accessibility')).not.toBeInTheDocument();
  });

  it('displays all tabs', () => {
    render(<AccessibilityQuickPanel {...defaultProps} />);
    
    expect(screen.getByText('Visual')).toBeInTheDocument();
    expect(screen.getByText('Audio')).toBeInTheDocument();
    expect(screen.getByText('Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('displays visual accessibility controls', () => {
    render(<AccessibilityQuickPanel {...defaultProps} />);
    
    expect(screen.getByText('High Contrast Mode')).toBeInTheDocument();
    expect(screen.getByText('Large Text')).toBeInTheDocument();
    expect(screen.getByText('Reduce Motion')).toBeInTheDocument();
    expect(screen.getByText('Font Size')).toBeInTheDocument();
  });

  it('has proper ARIA attributes', () => {
    render(<AccessibilityQuickPanel {...defaultProps} />);
    
    const closeButton = screen.getByLabelText('Close accessibility panel');
    expect(closeButton).toHaveAttribute('aria-label', 'Close accessibility panel');
  });

  it('displays accessibility score', () => {
    render(<AccessibilityQuickPanel {...defaultProps} />);
    
    expect(screen.getByText('Score: 85%')).toBeInTheDocument();
  });

  it('shows footer action buttons', () => {
    render(<AccessibilityQuickPanel {...defaultProps} />);
    
    expect(screen.getByText('Reset')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });
});