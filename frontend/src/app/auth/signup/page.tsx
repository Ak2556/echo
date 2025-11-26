/**
 * Best-in-class Signup page with professional UX.
 * Features: Password strength indicator, real-time validation, smooth animations,
 * toast notifications, OAuth integration, terms acceptance.
 */
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';
import { registerSchema, type RegisterForm } from '@/lib/auth-schemas';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PasswordStrength from '@/components/ui/PasswordStrength';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function SignupPage() {
  const colors = useThemeColors();
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      full_name: '',
    },
  });

  // Auto-focus name field on mount
  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const watchedPassword = watch('password');
  const watchedConfirmPassword = watch('confirmPassword');
  const watchedEmail = watch('email');
  const watchedName = watch('full_name');

  const onSubmit = async (data: RegisterForm) => {
    if (!agreedToTerms) {
      toast.error('Please accept the Terms of Service to continue');
      return;
    }

    const toastId = toast.loading('Creating your account...');

    try {
      const response = await registerUser(data);

      if (response.requiresVerification) {
        toast.success('Account created! Check your email to verify.', {
          id: toastId,
          duration: 4000,
          icon: '📧',
        });
        setTimeout(() => {
          router.push(
            `/auth/verify-email?email=${encodeURIComponent(data.email)}`
          );
        }, 1000);
      } else {
        toast.success('Welcome to Echo!', {
          id: toastId,
          duration: 2000,
          icon: '🎉',
        });
        setTimeout(() => {
          router.push('/');
        }, 500);
      }
    } catch (error: any) {
      const errorMsg =
        error?.message || 'Registration failed. Please try again.';
      toast.error(errorMsg, { id: toastId, duration: 4000 });
    }
  };

  const passwordsMatch =
    watchedPassword &&
    watchedConfirmPassword &&
    watchedPassword === watchedConfirmPassword;

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '10px',
            padding: '12px 20px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-4"
              >
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
              </motion.div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Join Echo and start connecting
              </p>
            </div>

            {/* OAuth buttons */}
            <div className="space-y-3 mb-6">
              <motion.button
                onClick={() =>
                  toast('Google OAuth coming soon!', { icon: '🚀' })
                }
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm hover:shadow-md group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Sign up with Google
                </span>
              </motion.button>

              <motion.button
                onClick={() =>
                  toast('GitHub OAuth coming soon!', { icon: '🚀' })
                }
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all shadow-sm hover:shadow-md group"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  Sign up with GitHub
                </span>
              </motion.button>
            </div>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white/80 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 font-medium">
                  Or sign up with email
                </span>
              </div>
            </div>

            {/* Signup form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Full Name */}
              <Input
                {...register('full_name')}
                ref={nameInputRef}
                type="text"
                label="Full Name"
                placeholder="John Doe"
                autoComplete="name"
                error={errors.full_name?.message}
                success={
                  touchedFields.full_name && !errors.full_name && watchedName
                    ? 'Looks good!'
                    : undefined
                }
                icon={<User size={18} />}
                disabled={isSubmitting}
              />

              {/* Email */}
              <Input
                {...register('email')}
                type="email"
                label="Email Address"
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email?.message}
                success={
                  touchedFields.email && !errors.email && watchedEmail
                    ? 'Valid email'
                    : undefined
                }
                icon={<Mail size={18} />}
                disabled={isSubmitting}
              />

              {/* Password */}
              <div>
                <Input
                  {...register('password')}
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  icon={<Lock size={18} />}
                  showPasswordToggle
                  disabled={isSubmitting}
                />
                <PasswordStrength password={watchedPassword || ''} />
              </div>

              {/* Confirm Password */}
              <Input
                {...register('confirmPassword')}
                type="password"
                label="Confirm Password"
                placeholder="••••••••"
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                success={passwordsMatch ? 'Passwords match' : undefined}
                icon={<Lock size={18} />}
                showPasswordToggle
                disabled={isSubmitting}
              />

              {/* Terms & Conditions */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500 cursor-pointer"
                />
                <label className="text-sm text-gray-600 dark:text-gray-400">
                  I agree to the{' '}
                  <Link
                    href="/terms"
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={isSubmitting}
                disabled={!agreedToTerms}
                rightIcon={!isSubmitting ? <ArrowRight size={18} /> : undefined}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            {/* Login link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400"
            >
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                Sign in
              </Link>
            </motion.p>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <span>Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-500" />
              <span>No Credit Card</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
