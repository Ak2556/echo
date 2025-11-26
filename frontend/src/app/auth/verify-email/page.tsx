/**
 * Email verification page with OTP input.
 */
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import OTPInput from '@/components/auth/OTPInput';
import { apiClient, APIError } from '@/lib/api-client';
import Link from 'next/link';

type VerificationState = 'input' | 'verifying' | 'success' | 'error';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';

  const [state, setState] = useState<VerificationState>('input');
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerify = async (code: string) => {
    if (!email) {
      setError('Email address is missing');
      throw new Error('Email address is missing');
    }

    setState('verifying');
    setError(null);

    try {
      await apiClient.verifyEmail({ email, code });
      setState('success');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push(`/auth/login?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      const message =
        err instanceof APIError ? err.message : 'Verification failed';
      setError(message);
      setState('error');
      throw err;
    }
  };

  const handleResend = async () => {
    if (!email || resendCooldown > 0) return;

    setError(null);

    try {
      // Resend verification code
      // Note: Backend would need a dedicated resend endpoint
      // For now, we'll just use the register endpoint again
      // await apiClient.resendVerificationCode({ email });

      // Set cooldown
      setResendCooldown(60);
    } catch (err) {
      const message =
        err instanceof APIError ? err.message : 'Failed to resend code';
      setError(message);
    }
  };

  // Redirect if no email
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Email Address Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please provide an email address to verify
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const isLoading = state === 'verifying';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {/* Input State */}
            {(state === 'input' || state === 'error') && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Header */}
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-3xl mb-4">
                    📧
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Verify Your Email
                  </h1>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    We sent a verification code to
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {email}
                  </p>
                </div>

                {/* OTP Input */}
                <OTPInput
                  length={6}
                  onComplete={handleVerify}
                  error={error || undefined}
                  loading={isLoading}
                />

                {/* Resend link */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Didn't receive the code?{' '}
                    <button
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : 'Resend code'}
                    </button>
                  </p>
                </div>

                {/* Back to signup */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link
                    href="/auth/signup"
                    className="block text-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    ← Back to sign up
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Verifying State */}
            {state === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Verifying your email...
                </p>
              </motion.div>
            )}

            {/* Success State */}
            {state === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="mx-auto w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-4xl mb-6"
                >
                  ✓
                </motion.div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Verified!
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Redirecting to login...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
