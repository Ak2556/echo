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
import { useModernTheme } from '@/contexts/ModernThemeContext';
import { useSettings } from '@/hooks/useSettings';
import {
  changePassword,
  enable2FA,
  verify2FA,
  deleteAccount,
} from '@/lib/api/settings';
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
  const {
    colors,
    colorMode,
    setColorMode,
    variant,
    setVariant,
    THEME_VARIANTS,
  } = useModernTheme() as any;
  const { settings, updateNotifications, updateSecurity } = useSettings();
  const [activeSection, setActiveSection] = useState('account');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [show2FADialog, setShow2FADialog] = useState(false);
  const [twoFactorQR, setTwoFactorQR] = useState<string>('');
  const [twoFactorSecret, setTwoFactorSecret] = useState<string>('');
  const [verificationCode, setVerificationCode] = useState('');

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
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

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
      const response = await enable2FA();
      setTwoFactorQR(response.qrCode);
      setTwoFactorSecret(response.secret);
      setShow2FADialog(true);
      toast.success('Scan the QR code with your authenticator app', {
        id: toastId,
        icon: '🔐',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to setup 2FA', { id: toastId });
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    const toastId = toast.loading('Verifying code...');
    try {
      await verify2FA(verificationCode);
      updateSecurity({ twoFactorEnabled: true });
      setShow2FADialog(false);
      setVerificationCode('');
      toast.success('2FA enabled successfully!', { id: toastId });
    } catch (error: any) {
      toast.error(error.message || 'Invalid verification code', {
        id: toastId,
      });
    }
  };

  const handleDeleteAccount = async (password: string) => {
    const toastId = toast.loading('Deleting account...');
    try {
      await deleteAccount(password);
      await logout();
      localStorage.clear(); // Clear all stored data
      toast.success('Account deleted successfully', { id: toastId });
      router.push('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete account', { id: toastId });
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: colors.background }}
      >
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-4 rounded-full animate-spin"
            style={{
              borderColor: colors.primary,
              borderTopColor: 'transparent',
            }}
          />
          <p style={{ color: colors.textSecondary }}>Loading settings...</p>
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
            background: colors.surface,
            color: colors.text,
            fontSize: '14px',
            borderRadius: '12px',
            padding: '12px 20px',
            border: `1px solid ${colors.border}`,
            boxShadow: colors.shadowLarge,
          },
          success: {
            iconTheme: {
              primary: colors.success,
              secondary: colors.surface,
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: colors.error,
              secondary: colors.surface,
            },
          },
        }}
      />

      <div
        className="min-h-screen p-4 py-12"
        style={{ background: colors.background }}
      >
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
                className="flex items-center gap-2 transition-all duration-200 hover:gap-3"
                style={{ color: colors.textSecondary }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = colors.text)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = colors.textSecondary)
                }
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
              <div
                className="backdrop-blur-xl rounded-2xl p-4"
                style={{
                  background: `${colors.surface}cc`,
                  boxShadow: colors.shadowLarge,
                  border: `1px solid ${colors.border}80`,
                }}
              >
                <h2
                  className="text-xl font-bold mb-4 px-2"
                  style={{ color: colors.text }}
                >
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
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all hover:scale-[1.02]"
                        style={{
                          background: isActive ? colors.primary : 'transparent',
                          color: isActive
                            ? colors.textInverse
                            : section.id === 'danger' && !isActive
                              ? colors.error
                              : colors.textSecondary,
                          boxShadow: isActive ? colors.shadow : 'none',
                        }}
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
              <div
                className="backdrop-blur-xl rounded-2xl p-8"
                style={{
                  background: `${colors.surface}cc`,
                  boxShadow: colors.shadowLarge,
                  border: `1px solid ${colors.border}80`,
                }}
              >
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
                        <h3
                          className="text-2xl font-bold mb-2"
                          style={{ color: colors.text }}
                        >
                          Account Settings
                        </h3>
                        <p style={{ color: colors.textSecondary }}>
                          Manage your account credentials and password
                        </p>
                      </div>

                      <div
                        className="pt-6"
                        style={{ borderTop: `1px solid ${colors.border}` }}
                      >
                        <h4
                          className="text-lg font-semibold mb-4"
                          style={{ color: colors.text }}
                        >
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
                        <h3
                          className="text-2xl font-bold mb-2"
                          style={{ color: colors.text }}
                        >
                          Security Settings
                        </h3>
                        <p style={{ color: colors.textSecondary }}>
                          Enhance your account security with additional
                          protections
                        </p>
                      </div>

                      <div
                        className="pt-6 space-y-6"
                        style={{ borderTop: `1px solid ${colors.border}` }}
                      >
                        {/* 2FA */}
                        <div
                          className="flex items-start justify-between p-5 rounded-xl"
                          style={{ background: colors.surfaceElevated }}
                        >
                          <div className="flex gap-4">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{ background: `${colors.success}20` }}
                            >
                              <Smartphone
                                size={24}
                                style={{ color: colors.success }}
                              />
                            </div>
                            <div>
                              <h4
                                className="font-semibold mb-1"
                                style={{ color: colors.text }}
                              >
                                Two-Factor Authentication
                              </h4>
                              <p
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                              >
                                Add an extra layer of security to your account
                              </p>
                              <span
                                className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded"
                                style={{
                                  background: settings.security.twoFactorEnabled
                                    ? `${colors.success}20`
                                    : colors.border,
                                  color: settings.security.twoFactorEnabled
                                    ? colors.success
                                    : colors.textSecondary,
                                }}
                              >
                                {settings.security.twoFactorEnabled
                                  ? 'Enabled'
                                  : 'Not enabled'}
                              </span>
                            </div>
                          </div>
                          {!settings.security.twoFactorEnabled ? (
                            <Button
                              onClick={handleEnable2FA}
                              variant="primary"
                              size="sm"
                            >
                              Enable
                            </Button>
                          ) : (
                            <Button
                              onClick={() => {
                                updateSecurity({ twoFactorEnabled: false });
                                toast.success('2FA disabled');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Disable
                            </Button>
                          )}
                        </div>

                        {/* Active Sessions */}
                        <div>
                          <h4
                            className="text-lg font-semibold mb-4"
                            style={{ color: colors.text }}
                          >
                            Active Sessions
                          </h4>
                          <div className="space-y-3">
                            <div
                              className="flex items-center justify-between p-4 rounded-lg"
                              style={{ border: `1px solid ${colors.border}` }}
                            >
                              <div className="flex items-center gap-3">
                                <Monitor
                                  size={20}
                                  style={{ color: colors.textSecondary }}
                                />
                                <div>
                                  <p
                                    className="font-medium"
                                    style={{ color: colors.text }}
                                  >
                                    Current Session
                                  </p>
                                  <p
                                    className="text-sm"
                                    style={{ color: colors.textTertiary }}
                                  >
                                    macOS • Chrome • Active now
                                  </p>
                                </div>
                              </div>
                              <span
                                className="text-xs font-medium px-2 py-1 rounded"
                                style={{
                                  background: `${colors.success}20`,
                                  color: colors.success,
                                }}
                              >
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
                        <h3
                          className="text-2xl font-bold mb-2"
                          style={{ color: colors.text }}
                        >
                          Preferences
                        </h3>
                        <p style={{ color: colors.textSecondary }}>
                          Customize your Echo experience
                        </p>
                      </div>

                      <div
                        className="pt-6 space-y-6"
                        style={{ borderTop: `1px solid ${colors.border}` }}
                      >
                        {/* Color Mode */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {colorMode === 'light' ? (
                              <Sun
                                size={20}
                                style={{ color: colors.textSecondary }}
                              />
                            ) : colorMode === 'dark' ? (
                              <Moon
                                size={20}
                                style={{ color: colors.textSecondary }}
                              />
                            ) : (
                              <Globe
                                size={20}
                                style={{ color: colors.textSecondary }}
                              />
                            )}
                            <div>
                              <h4
                                className="font-semibold"
                                style={{ color: colors.text }}
                              >
                                Color Mode
                              </h4>
                              <p
                                className="text-sm"
                                style={{ color: colors.textSecondary }}
                              >
                                Choose light, dark, or auto mode
                              </p>
                            </div>
                          </div>
                          <select
                            value={colorMode}
                            onChange={(e) => {
                              setColorMode(e.target.value as any);
                              toast.success(
                                `Color mode changed to ${e.target.value}`
                              );
                            }}
                            className="px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{
                              borderColor: colors.border,
                              background: colors.surface,
                              color: colors.text,
                            }}
                          >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                          </select>
                        </div>

                        {/* Theme Variant */}
                        <div className="flex items-center justify-between">
                          <div>
                            <h4
                              className="font-semibold"
                              style={{ color: colors.text }}
                            >
                              Theme Variant
                            </h4>
                            <p
                              className="text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              Choose your color palette
                            </p>
                          </div>
                          <select
                            value={variant}
                            onChange={(e) => {
                              setVariant(e.target.value as any);
                              toast.success(
                                `Theme changed to ${e.target.value}`
                              );
                            }}
                            className="px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all capitalize"
                            style={{
                              borderColor: colors.border,
                              background: colors.surface,
                              color: colors.text,
                            }}
                          >
                            <option value="default">Default</option>
                            <option value="ocean">Ocean</option>
                            <option value="sunset">Sunset</option>
                            <option value="forest">Forest</option>
                            <option value="lavender">Lavender</option>
                            <option value="rose">Rose</option>
                          </select>
                        </div>

                        {/* Notifications */}
                        <div className="space-y-4">
                          <h4
                            className="text-lg font-semibold"
                            style={{ color: colors.text }}
                          >
                            Notifications
                          </h4>

                          <div
                            className="flex items-center justify-between p-4 rounded-lg"
                            style={{ background: colors.surfaceElevated }}
                          >
                            <div className="flex items-center gap-3">
                              <Bell
                                size={20}
                                style={{ color: colors.textSecondary }}
                              />
                              <div>
                                <h5
                                  className="font-medium"
                                  style={{ color: colors.text }}
                                >
                                  Email Notifications
                                </h5>
                                <p
                                  className="text-sm"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Receive updates via email
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newValue = !settings.notifications.email;
                                updateNotifications({ email: newValue });
                                toast.success(
                                  `Email notifications ${newValue ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                              style={{
                                background: settings.notifications.email
                                  ? colors.primary
                                  : colors.border,
                              }}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.email ? 'translate-x-6' : 'translate-x-1'}`}
                              />
                            </button>
                          </div>

                          <div
                            className="flex items-center justify-between p-4 rounded-lg"
                            style={{ background: colors.surfaceElevated }}
                          >
                            <div className="flex items-center gap-3">
                              <Smartphone
                                size={20}
                                style={{ color: colors.textSecondary }}
                              />
                              <div>
                                <h5
                                  className="font-medium"
                                  style={{ color: colors.text }}
                                >
                                  Push Notifications
                                </h5>
                                <p
                                  className="text-sm"
                                  style={{ color: colors.textSecondary }}
                                >
                                  Get notifications on your device
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const newValue = !settings.notifications.push;
                                updateNotifications({ push: newValue });
                                toast.success(
                                  `Push notifications ${newValue ? 'enabled' : 'disabled'}`
                                );
                              }}
                              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                              style={{
                                background: settings.notifications.push
                                  ? colors.primary
                                  : colors.border,
                              }}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notifications.push ? 'translate-x-6' : 'translate-x-1'}`}
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
                        <h3
                          className="text-2xl font-bold mb-2"
                          style={{ color: colors.text }}
                        >
                          Privacy Settings
                        </h3>
                        <p style={{ color: colors.textSecondary }}>
                          Control who can see your information
                        </p>
                      </div>

                      <div
                        className="pt-6"
                        style={{ borderTop: `1px solid ${colors.border}` }}
                      >
                        <div className="space-y-4">
                          <div
                            className="p-5 rounded-xl"
                            style={{
                              background: `${colors.info}10`,
                              border: `1px solid ${colors.info}40`,
                            }}
                          >
                            <div className="flex gap-3">
                              <Eye
                                size={20}
                                className="flex-shrink-0 mt-1"
                                style={{ color: colors.info }}
                              />
                              <div>
                                <h4
                                  className="font-semibold mb-2"
                                  style={{ color: colors.text }}
                                >
                                  Profile Visibility
                                </h4>
                                <p
                                  className="text-sm mb-4"
                                  style={{ color: colors.textSecondary }}
                                >
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

                          <div
                            className="p-5 rounded-xl"
                            style={{ background: colors.surfaceElevated }}
                          >
                            <h4
                              className="font-semibold mb-3"
                              style={{ color: colors.text }}
                            >
                              Data & Privacy
                            </h4>
                            <ul
                              className="space-y-2 text-sm"
                              style={{ color: colors.textSecondary }}
                            >
                              <li className="flex items-center gap-2">
                                <CheckCircle
                                  size={16}
                                  style={{ color: colors.success }}
                                />
                                Your data is encrypted at rest and in transit
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle
                                  size={16}
                                  style={{ color: colors.success }}
                                />
                                We never sell your personal information
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle
                                  size={16}
                                  style={{ color: colors.success }}
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
                        <h3
                          className="text-2xl font-bold mb-2"
                          style={{ color: colors.error }}
                        >
                          Danger Zone
                        </h3>
                        <p style={{ color: colors.textSecondary }}>
                          Irreversible and destructive actions
                        </p>
                      </div>

                      <div
                        className="pt-6"
                        style={{ borderTop: `1px solid ${colors.error}40` }}
                      >
                        <div
                          className="p-6 border-2 rounded-xl"
                          style={{
                            background: `${colors.error}10`,
                            borderColor: `${colors.error}40`,
                          }}
                        >
                          <div className="flex items-start gap-4">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: `${colors.error}20` }}
                            >
                              <Trash2
                                size={24}
                                style={{ color: colors.error }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4
                                className="text-lg font-semibold mb-2"
                                style={{ color: colors.text }}
                              >
                                Delete Account
                              </h4>
                              <p
                                className="text-sm mb-4"
                                style={{ color: colors.textSecondary }}
                              >
                                Once you delete your account, there is no going
                                back. All your data will be permanently removed.
                                This action cannot be undone.
                              </p>
                              <Button
                                onClick={() => setShowDeleteDialog(true)}
                                variant="error"
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
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShowDeleteDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 max-w-md w-full"
              style={{
                background: colors.surface,
                boxShadow: colors.shadowLarge,
              }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: `${colors.error}20` }}
                >
                  <AlertTriangle size={24} style={{ color: colors.error }} />
                </div>
                <div>
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: colors.text }}
                  >
                    Delete Account?
                  </h3>
                  <p
                    className="text-sm"
                    style={{ color: colors.textSecondary }}
                  >
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
                  onClick={async () => {
                    // For demo purposes - in production, add password input field
                    const password = prompt('Enter your password to confirm:');
                    if (password) {
                      await handleDeleteAccount(password);
                    }
                  }}
                  variant="error"
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

      {/* 2FA Setup Dialog */}
      <AnimatePresence>
        {show2FADialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setShow2FADialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="rounded-2xl p-6 max-w-md w-full"
              style={{
                background: colors.surface,
                boxShadow: colors.shadowLarge,
              }}
            >
              <div className="mb-6">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.text }}
                >
                  Setup Two-Factor Authentication
                </h3>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                  Scan this QR code with your authenticator app (Google
                  Authenticator, Authy, etc.)
                </p>
              </div>

              {/* QR Code Display */}
              <div className="flex flex-col items-center gap-4 mb-6">
                {twoFactorQR && (
                  <div
                    className="p-4 rounded-lg"
                    style={{ background: colors.surfaceElevated }}
                  >
                    <img
                      src={twoFactorQR}
                      alt="2FA QR Code"
                      className="w-48 h-48"
                    />
                  </div>
                )}

                {twoFactorSecret && (
                  <div className="w-full">
                    <p
                      className="text-xs mb-2"
                      style={{ color: colors.textTertiary }}
                    >
                      Manual entry code:
                    </p>
                    <code
                      className="block p-3 rounded text-sm break-all"
                      style={{
                        background: colors.surfaceElevated,
                        color: colors.text,
                        fontFamily: 'monospace',
                      }}
                    >
                      {twoFactorSecret}
                    </code>
                  </div>
                )}
              </div>

              {/* Verification Input */}
              <div className="mb-6">
                <Input
                  type="text"
                  label="Enter 6-digit code"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, '').slice(0, 6)
                    )
                  }
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShow2FADialog(false);
                    setVerificationCode('');
                  }}
                  variant="outline"
                  size="md"
                  fullWidth
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerify2FA}
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={verificationCode.length !== 6}
                >
                  Verify & Enable
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
