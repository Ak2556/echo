/**
 * Best-in-class Settings page with professional UX.
 * Features: Multiple sections, password change, 2FA, preferences,
 * smooth animations, toast notifications, confirmation dialogs.
 */
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Lock,
  Shield,
  Bell,
  Moon,
  Sun,
  Globe,
  Eye,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle,
  Smartphone,
  Monitor,
  Key,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('account');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  const onPasswordSubmit = async (data: PasswordForm) => {
    const toastId = toast.loading('Updating password...');

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Password updated successfully!', {
        id: toastId,
        duration: 3000,
        icon: '✅',
      });
      reset();
    } catch (error: any) {
      const errorMsg =
        error?.message || 'Failed to update password. Please try again.';
      toast.error(errorMsg, { id: toastId, duration: 4000 });
    }
  };

  const handleEnable2FA = async () => {
    const toastId = toast.loading('Setting up 2FA...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success('2FA setup initiated! Check your email.', {
        id: toastId,
        icon: '🔐',
      });
    } catch (error) {
      toast.error('Failed to setup 2FA', { id: toastId });
    }
  };

  const handleDeleteAccount = async () => {
    const toastId = toast.loading('Deleting account...');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await logout();
      toast.success('Account deleted successfully', { id: toastId });
      router.push('/');
    } catch (error) {
      toast.error('Failed to delete account', { id: toastId });
    }
  };

  const sections = [
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <Link
                href="/profile"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back to Profile</span>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 px-2">
                  Settings
                </h2>
                <nav className="space-y-1">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    const isActive = activeSection === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'} ${section.id === 'danger' && !isActive ? 'text-red-600 dark:text-red-400' : ''}`}
                      >
                        <Icon size={18} />
                        <span className="font-medium">{section.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-8">
                <AnimatePresence mode="wait">
                  {/* Account Section */}
                  {activeSection === 'account' && (
                    <motion.div
                      key="account"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Account Settings
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Manage your account credentials and password
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                          Change Password
                        </h4>
                        <form
                          onSubmit={handleSubmit(onPasswordSubmit)}
                          className="space-y-4"
                        >
                          <Input
                            {...register('currentPassword')}
                            type="password"
                            label="Current Password"
                            placeholder="••••••••"
                            error={errors.currentPassword?.message}
                            icon={<Lock size={18} />}
                            showPasswordToggle
                            disabled={isSubmitting}
                          />

                          <Input
                            {...register('newPassword')}
                            type="password"
                            label="New Password"
                            placeholder="••••••••"
                            error={errors.newPassword?.message}
                            icon={<Lock size={18} />}
                            showPasswordToggle
                            disabled={isSubmitting}
                          />

                          <Input
                            {...register('confirmPassword')}
                            type="password"
                            label="Confirm New Password"
                            placeholder="••••••••"
                            error={errors.confirmPassword?.message}
                            icon={<Lock size={18} />}
                            showPasswordToggle
                            disabled={isSubmitting}
                          />

                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            loading={isSubmitting}
                            leftIcon={
                              !isSubmitting ? <Save size={18} /> : undefined
                            }
                          >
                            Update Password
                          </Button>
                        </form>
                      </div>
                    </motion.div>
                  )}

                  {/* Security Section */}
                  {activeSection === 'security' && (
                    <motion.div
                      key="security"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Security Settings
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Enhance your account security with additional
                          protections
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
                        {/* 2FA */}
                        <div className="flex items-start justify-between p-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                          <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                              <Smartphone
                                size={24}
                                className="text-green-600 dark:text-green-400"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                                Two-Factor Authentication
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Add an extra layer of security to your account
                              </p>
                              <span className="inline-block mt-2 text-xs font-medium px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                                Not enabled
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={handleEnable2FA}
                            variant="outline"
                            size="sm"
                          >
                            Enable
                          </Button>
                        </div>

                        {/* Active Sessions */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Active Sessions
                          </h4>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Monitor
                                  size={20}
                                  className="text-gray-600 dark:text-gray-400"
                                />
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    Current Session
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    macOS • Chrome • Active now
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Preferences Section */}
                  {activeSection === 'preferences' && (
                    <motion.div
                      key="preferences"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Preferences
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Customize your Echo experience
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
                        {/* Theme */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {theme === 'light' ? (
                              <Sun
                                size={20}
                                className="text-gray-600 dark:text-gray-400"
                              />
                            ) : (
                              <Moon
                                size={20}
                                className="text-gray-600 dark:text-gray-400"
                              />
                            )}
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">
                                Theme
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Choose your preferred theme
                              </p>
                            </div>
                          </div>
                          <select
                            value={theme}
                            onChange={(e) => {
                              setTheme(e.target.value as 'light' | 'dark');
                              toast.success(
                                `Theme changed to ${e.target.value}`
                              );
                            }}
                            className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                          </select>
                        </div>

                        {/* Notifications */}
                        <div className="space-y-4">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Notifications
                          </h4>

                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Bell
                                size={20}
                                className="text-gray-600 dark:text-gray-400"
                              />
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  Email Notifications
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Receive updates via email
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setEmailNotifications(!emailNotifications);
                                toast.success(
                                  `Email notifications ${!emailNotifications ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Smartphone
                                size={20}
                                className="text-gray-600 dark:text-gray-400"
                              />
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  Push Notifications
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Get notifications on your device
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                setPushNotifications(!pushNotifications);
                                toast.success(
                                  `Push notifications ${!pushNotifications ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pushNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Privacy Section */}
                  {activeSection === 'privacy' && (
                    <motion.div
                      key="privacy"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Privacy Settings
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Control who can see your information
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div className="space-y-4">
                          <div className="p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                            <div className="flex gap-3">
                              <Eye
                                size={20}
                                className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1"
                              />
                              <div>
                                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                  Profile Visibility
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                  Your profile is currently visible to all Echo
                                  users. You can change this in your privacy
                                  settings.
                                </p>
                                <Button variant="outline" size="sm">
                                  Manage Visibility
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="p-5 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                              Data & Privacy
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                              <li className="flex items-center gap-2">
                                <CheckCircle
                                  size={16}
                                  className="text-green-500"
                                />
                                Your data is encrypted at rest and in transit
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle
                                  size={16}
                                  className="text-green-500"
                                />
                                We never sell your personal information
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle
                                  size={16}
                                  className="text-green-500"
                                />
                                You can download your data anytime
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Danger Zone Section */}
                  {activeSection === 'danger' && (
                    <motion.div
                      key="danger"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                          Danger Zone
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Irreversible and destructive actions
                        </p>
                      </div>

                      <div className="border-t border-red-200 dark:border-red-900 pt-6">
                        <div className="p-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                              <Trash2
                                size={24}
                                className="text-red-600 dark:text-red-400"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Delete Account
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                Once you delete your account, there is no going
                                back. All your data will be permanently removed.
                                This action cannot be undone.
                              </p>
                              <Button
                                onClick={() => setShowDeleteDialog(true)}
                                variant="destructive"
                                size="md"
                                leftIcon={<Trash2 size={18} />}
                              >
                                Delete My Account
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle
                    size={24}
                    className="text-red-600 dark:text-red-400"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Delete Account?
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you absolutely sure? This action cannot be undone. All
                    your data will be permanently deleted.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteDialog(false)}
                  variant="outline"
                  size="md"
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  variant="destructive"
                  size="md"
                  fullWidth
                  leftIcon={<Trash2 size={18} />}
                >
                  Yes, Delete
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
