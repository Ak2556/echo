/**
 * Reset password page - set new password with token.
 */
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordForm } from '@/lib/auth-schemas';
import { apiClient, APIError } from '@/lib/api-client';
import PasswordStrength from '@/components/auth/PasswordStrength';
import Link from 'next/link';

type PageState = 'loading' | 'input' | 'success' | 'expired';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [state, setState] = useState<PageState>('loading');
  const [tokenInfo, setTokenInfo] = useState<{
    email?: string;
    expiresIn?: number;
  }>({});

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token,
    },
  });

  const newPassword = watch('new_password', '');

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setState('expired');
        return;
      }

      try {
        const info = await apiClient.verifyResetToken(token);

        if (info.valid) {
          setTokenInfo({
            email: info.email,
            expiresIn: info.expires_in,
          });
          setState('input');
        } else {
          setState('expired');
        }
      } catch (error) {
        setState('expired');
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    try {
      await apiClient.resetPassword(data);
      setState('success');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      // Error is displayed by the form
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <AnimatePresence mode="wait">
            {/* Loading State */}
            {state === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  Verifying reset link...
                </p>
              </motion.div>
            )}

            {/* Input State */}
            {state === 'input' && (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-3xl mb-4">
                    🔒
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reset Your Password
                  </h1>
                  {tokenInfo.email && (
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      for <strong>{tokenInfo.email}</strong>
                    </p>
                  )}
                </div>

                {/* Expiry warning */}
                {tokenInfo.expiresIn && tokenInfo.expiresIn < 300 && (
                  <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      ⚠️ This link expires in {Math.floor(tokenInfo.expiresIn / 60)} minutes
                    </p>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Hidden token field */}
                  <input type="hidden" {...register('token')} />

                  {/* New Password */}
                  <div>
                    <label htmlFor="new_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      id="new_password"
                      type="password"
                      {...register('new_password')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      autoFocus
                    />
                    {errors.new_password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.new_password.message}
                      </p>
                    )}
                    <PasswordStrength password={newPassword} className="mt-3" />
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      id="confirm_password"
                      type="password"
                      {...register('confirm_password')}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    {errors.confirm_password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Resetting password...' : 'Reset Password'}
                  </button>
                </form>

                {/* Back to login */}
                <div className="mt-6 text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  >
                    ← Back to login
                  </Link>
                </div>
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
                  Password Reset Successfully!
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  You can now sign in with your new password
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Redirecting to login...
                </p>
              </motion.div>
            )}

            {/* Expired State */}
            {state === 'expired' && (
              <motion.div
                key="expired"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-4xl mb-6">
                  ⚠️
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Invalid or Expired Link
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  This password reset link is no longer valid. It may have expired or already been used.
                </p>

                <div className="space-y-3">
                  <Link
                    href="/auth/forgot-password"
                    className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-center"
                  >
                    Request New Reset Link
                  </Link>

                  <Link
                    href="/auth/login"
                    className="block w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors text-center"
                  >
                    Back to Login
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
