/**
 * Cinematic OTP Input Component
 *
 * Features:
 * - Auto-focus on next input
 * - Paste support
 * - Keyboard navigation
 * - Animations
 * - Accessibility
 */

'use client';

import {
  useState,
  useRef,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
} from 'react';
import { motion } from 'framer-motion';

interface OTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  error?: string;
  loading?: boolean;
}

export default function OTPInput({
  length = 6,
  onComplete,
  error = '',
  loading = false,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    // Check if OTP is complete
    const code = otp.join('');
    if (code.length === length && /^\d+$/.test(code)) {
      onComplete(code);
    }
  }, [otp, length, onComplete]);

  const handleChange = (value: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];

    // Handle multiple digits (paste)
    if (value.length > 1) {
      const digits = value.slice(0, length - index).split('');
      digits.forEach((digit, i) => {
        if (index + i < length) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);

      // Focus last filled or next empty
      const nextIndex = Math.min(index + digits.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      setActiveIndex(nextIndex);
      return;
    }

    // Single digit
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input and clear it
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
        setActiveIndex(index - 1);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
      return;
    }

    // Left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setActiveIndex(index - 1);
      return;
    }

    // Right arrow
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setActiveIndex(index + 1);
      return;
    }

    // Home
    if (e.key === 'Home') {
      inputRefs.current[0]?.focus();
      setActiveIndex(0);
      return;
    }

    // End
    if (e.key === 'End') {
      inputRefs.current[length - 1]?.focus();
      setActiveIndex(length - 1);
      return;
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();

    // Only paste if all digits
    if (!/^\d+$/.test(pastedData)) return;

    const digits = pastedData.slice(0, length).split('');
    const newOtp = new Array(length).fill('');

    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });

    setOtp(newOtp);

    // Focus last input
    const lastIndex = Math.min(digits.length - 1, length - 1);
    inputRefs.current[lastIndex]?.focus();
    setActiveIndex(lastIndex);
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
    // Select text on focus
    inputRefs.current[index]?.select();
  };

  return (
    <div className="otp-input-container">
      {/* OTP Input Grid */}
      <div className="flex gap-3 justify-center mb-4">
        {otp.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <input
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={() => handleFocus(index)}
              disabled={loading}
              className={`
                w-12 h-14 text-center text-2xl font-bold
                border-2 rounded-xl
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2
                ${
                  error
                    ? 'border-red-500 focus:ring-red-500 bg-red-50'
                    : activeIndex === index
                      ? 'border-indigo-600 focus:ring-indigo-600 bg-white'
                      : digit
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                }
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
                hover:border-indigo-400
              `}
              aria-label={`Digit ${index + 1} of ${length}`}
              aria-invalid={!!error}
            />
          </motion.div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm text-center mb-2"
          role="alert"
        >
          {error}
        </motion.p>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-gray-600"
        >
          <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Verifying...</span>
        </motion.div>
      )}

      {/* Hint */}
      {!loading && !error && (
        <p className="text-gray-500 text-sm text-center">
          Enter the {length}-digit code sent to your email
        </p>
      )}

      {/* Accessibility: Hidden live region for screen readers */}
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {otp.filter((d) => d).length} of {length} digits entered
        {error && `. Error: ${error}`}
      </div>

      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          input {
            transition: none !important;
          }
        }

        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}

/**
 * Example Usage:
 *
 * <OTPInput
 *   length={6}
 *   onComplete={async (code) => {
 *     try {
 *       await verifyEmail(email, code);
 *       router.push('/auth/success');
 *     } catch (error) {
 *       setError('Invalid code. Please try again.');
 *     }
 *   }}
 *   error={error}
 *   loading={isVerifying}
 * />
 */
