/**
 * OAuth success page - handles OAuth callback and token storage.
 */
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { apiClient } from '@/lib/api-client';

type PageState = 'processing' | 'success' | 'error';

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PageState>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuth = async () => {
      try {
        // Get tokens from URL parameters
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const errorParam = searchParams.get('error');

        // Check for OAuth error
        if (errorParam) {
          setError(decodeURIComponent(errorParam));
          setState('error');
          return;
        }

        // Check for tokens
        if (!accessToken) {
          setError('Missing access token');
          setState('error');
          return;
        }

        // Store tokens
        apiClient.setAccessToken(accessToken);

        // Store refresh token in cookie (done by backend)
        // The backend sets the refresh token as an httpOnly cookie

        setState('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'OAuth authentication failed'
        );
        setState('error');
      }
    };

    processOAuth();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Processing state */}
          {state === 'processing' && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Completing Sign In...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we set up your account
              </p>
            </div>
          )}

          {/* Success state */}
          {state === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
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
                Sign In Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Redirecting to your dashboard...
              </p>

              {/* Loading dots */}
              <div className="flex justify-center gap-2 mt-6">
                <motion.div
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 bg-blue-600 rounded-full"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </motion.div>
          )}

          {/* Error state */}
          {state === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-4xl mb-6">
                ✕
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error || 'Something went wrong during sign in'}
              </p>

              {/* Error details */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Try Again
                </button>

                <button
                  onClick={() => router.push('/')}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
                >
                  Go to Home
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <OAuthSuccessContent />
    </Suspense>
  );
}
