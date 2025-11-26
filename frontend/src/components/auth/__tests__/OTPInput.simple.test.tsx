/**
 * Simple OTPInput Component Tests
 * Basic functionality tests without complex dependencies
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OTPInput from '@/components/auth/OTPInput';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

describe('OTPInput - Basic Functionality', () => {
  const user = userEvent.setup();
  const mockOnComplete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('renders correct number of input fields', () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(6);
    });

    it('renders with custom length', () => {
      render(<OTPInput length={4} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(4);
    });

    it('shows loading state', () => {
      render(
        <OTPInput length={6} onComplete={mockOnComplete} loading={true} />
      );

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });

      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });

    it('shows error state', () => {
      render(
        <OTPInput length={6} onComplete={mockOnComplete} error="Invalid OTP" />
      );

      expect(screen.getByText('Invalid OTP')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Input Behavior', () => {
    it('accepts only numeric input', async () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const firstInput = screen.getAllByRole('textbox')[0];

      await user.type(firstInput, 'a');
      expect(firstInput).toHaveValue('');

      await user.type(firstInput, '1');
      expect(firstInput).toHaveValue('1');
    });

    it('moves to next input after entering digit', async () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');

      await user.type(inputs[0], '1');
      expect(inputs[1]).toHaveFocus();
    });

    it('handles backspace navigation', async () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');

      // Type in first input and move to second
      await user.type(inputs[0], '1');
      expect(inputs[1]).toHaveFocus();

      // Backspace should move back to first input
      await user.keyboard('{Backspace}');
      expect(inputs[0]).toHaveFocus();
    });

    it('replaces existing digit when typing', async () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const firstInput = screen.getAllByRole('textbox')[0];

      await user.type(firstInput, '1');
      expect(firstInput).toHaveValue('1');

      // Clear and type new digit
      await user.clear(firstInput);
      await user.type(firstInput, '2');
      expect(firstInput).toHaveValue('2');
    });
  });

  describe('Completion Handling', () => {
    it('calls onComplete when all fields are filled', async () => {
      render(<OTPInput length={4} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');

      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], '3');
      await user.type(inputs[3], '4');

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith('1234');
      });
    });

    it('does not call onComplete for incomplete OTP', async () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');

      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], '3');

      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input, index) => {
        expect(input).toHaveAttribute('aria-label', `Digit ${index + 1} of 6`);
        expect(input).toHaveAttribute('inputMode', 'numeric');
      });
    });

    it('supports screen readers with live region', () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-atomic', 'true');
    });

    it('announces errors to screen readers', () => {
      render(
        <OTPInput length={6} onComplete={mockOnComplete} error="Invalid OTP" />
      );

      const errorElement = screen.getByText('Invalid OTP');
      expect(errorElement).toHaveAttribute('role', 'alert');
    });
  });

  describe('Edge Cases', () => {
    it('handles focus events correctly', async () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');

      // Focus on middle input
      inputs[2].focus();
      expect(inputs[2]).toHaveFocus();

      // Type should work from any focused input
      await user.type(inputs[2], '5');
      expect(inputs[2]).toHaveValue('5');
    });

    it('handles loading state correctly', () => {
      render(
        <OTPInput length={6} onComplete={mockOnComplete} loading={true} />
      );

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });

      expect(screen.getByText('Verifying...')).toBeInTheDocument();
    });

    it('handles error state correctly', () => {
      render(
        <OTPInput length={6} onComplete={mockOnComplete} error="Invalid code" />
      );

      expect(screen.getByText('Invalid code')).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Security', () => {
    it('does not expose OTP in DOM attributes', () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).not.toHaveAttribute('data-value');
        expect(input).not.toHaveAttribute('title');
      });
    });

    it('uses proper input mode for numeric input', () => {
      render(<OTPInput length={6} onComplete={mockOnComplete} />);

      const inputs = screen.getAllByRole('textbox');
      inputs.forEach((input) => {
        expect(input).toHaveAttribute('inputMode', 'numeric');
        expect(input).toHaveAttribute('maxLength', '1');
      });
    });
  });
});
