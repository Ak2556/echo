/**
export const dynamic = 'force-dynamic';

 * Best-in-class Profile page with professional UX.
 * Features: Avatar display/upload, editable fields, smooth animations,
 * toast notifications, real-time validation, section layout.
 */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  AtSign,
  FileText,
  Camera,
  Save,
  ArrowLeft,
  Shield,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useModernTheme } from '@/contexts/ModernThemeContext';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .regex(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    )
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(200, 'Bio must be less than 200 characters')
    .optional()
    .or(z.literal('')),
});

type ProfileForm = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { colors, variant } = useModernTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    reset,
    watch,
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    mode: 'onTouched',
    defaultValues: {
      full_name: '',
      email: '',
      username: '',
      bio: '',
    },
  });

  // Load user data when available
  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        bio: user.bio || '',
      });
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
    }
  }, [user, reset]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [authLoading, user, router]);

  const watchedFields = watch();

  const onSubmit = async (data: ProfileForm) => {
    const toastId = toast.loading('Updating your profile...');

    try {
      // TODO: Replace with actual API call when backend endpoint is ready
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success('Profile updated successfully!', {
        id: toastId,
        duration: 3000,
        icon: '✅',
      });
      setIsEditing(false);

      // TODO: Update user context with new data
    } catch (error: any) {
      const errorMsg =
        error?.message || 'Failed to update profile. Please try again.';
      toast.error(errorMsg, { id: toastId, duration: 4000 });
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast.success('Avatar updated! Save to confirm.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = async () => {
    const toastId = toast.loading('Logging out...');
    try {
      await logout();
      toast.success('Logged out successfully', { id: toastId });
      router.push('/auth/login');
    } catch (error) {
      toast.error('Logout failed', { id: toastId });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: colors.background }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: colors.primary, borderTopColor: 'transparent' }} />
          <p style={{ color: colors.textSecondary }}>
            Loading your profile...
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

      <div className="min-h-screen p-4 py-12" style={{ background: colors.background }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between"
          >
            <Link
              href="/"
              className="flex items-center gap-2 transition-all duration-200 hover:gap-3"
              style={{ color: colors.textSecondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.textSecondary}
            >
              <ArrowLeft size={20} />
              <span>Back to Home</span>
            </Link>
          </motion.div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="backdrop-blur-xl rounded-3xl overflow-hidden"
            style={{
              background: `${colors.surface}cc`,
              boxShadow: colors.shadowLarge,
              border: `1px solid ${colors.border}80`
            }}
          >
            {/* Header Section with Avatar */}
            <div className="relative h-32 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${colors.primary}, ${colors.secondary}, ${colors.accent})` }}>
              <div className="absolute -bottom-16 left-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-4 shadow-xl overflow-hidden" style={{ borderColor: colors.surface, background: colors.surfaceElevated }}>
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br" style={{ backgroundImage: `linear-gradient(to bottom right, ${colors.primary}, ${colors.accent})` }}>
                        <User size={48} className="text-white" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-10 h-10 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: colors.primary }}
                    >
                      <Camera size={18} />
                    </motion.button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="pt-20 px-8 pb-8">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold mb-2" style={{ color: colors.text }}>
                    {user.full_name || 'Your Profile'}
                  </h1>
                  <p style={{ color: colors.textSecondary }}>
                    {user.email}
                  </p>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="primary"
                    size="md"
                    leftIcon={<User size={18} />}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        reset();
                        if (user.avatar_url) {
                          setAvatarPreview(user.avatar_url);
                        }
                      }}
                      variant="outline"
                      size="md"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSubmit(onSubmit)}
                      variant="primary"
                      size="md"
                      loading={isSubmitting}
                      disabled={!isDirty && avatarPreview === user.avatar_url}
                      leftIcon={!isSubmitting ? <Save size={18} /> : undefined}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </div>

              <AnimatePresence mode="wait">
                {isEditing ? (
                  <motion.form
                    key="edit"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        {...register('full_name')}
                        type="text"
                        label="Full Name"
                        placeholder="John Doe"
                        error={errors.full_name?.message}
                        icon={<User size={18} />}
                        disabled={isSubmitting}
                      />

                      <Input
                        {...register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="you@example.com"
                        error={errors.email?.message}
                        icon={<Mail size={18} />}
                        disabled={isSubmitting}
                      />

                      <Input
                        {...register('username')}
                        type="text"
                        label="Username"
                        placeholder="johndoe"
                        error={errors.username?.message}
                        icon={<AtSign size={18} />}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1.5" style={{ color: colors.textSecondary }}>
                        Bio
                      </label>
                      <textarea
                        {...register('bio')}
                        rows={4}
                        placeholder="Tell us about yourself..."
                        disabled={isSubmitting}
                        className="w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                        style={{
                          borderColor: colors.border,
                          background: colors.surface,
                          color: colors.text,
                          ...(isSubmitting ? {} : { ':focus': { borderColor: colors.primary, boxShadow: `0 0 0 3px ${colors.primary}20` } })
                        }}
                      />
                      {errors.bio && (
                        <p className="mt-1.5 text-sm" style={{ color: colors.error }}>
                          {errors.bio.message}
                        </p>
                      )}
                      <p className="mt-1.5 text-xs" style={{ color: colors.textTertiary }}>
                        {watchedFields.bio?.length || 0}/200 characters
                      </p>
                    </div>
                  </motion.form>
                ) : (
                  <motion.div
                    key="view"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: colors.textTertiary }}>
                          Full Name
                        </label>
                        <p className="text-lg" style={{ color: colors.text }}>
                          {user.full_name || 'Not set'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: colors.textTertiary }}>
                          Email
                        </label>
                        <p className="text-lg" style={{ color: colors.text }}>
                          {user.email}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: colors.textTertiary }}>
                          Username
                        </label>
                        <p className="text-lg" style={{ color: colors.text }}>
                          {user.username || 'Not set'}
                        </p>
                      </div>
                    </div>

                    {user.bio && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium" style={{ color: colors.textTertiary }}>
                          Bio
                        </label>
                        <p className="leading-relaxed" style={{ color: colors.text }}>
                          {user.bio}
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Actions */}
              <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${colors.border}` }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: colors.text }}>
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all group hover:scale-[1.02]"
                    style={{ borderColor: colors.border, background: colors.surfaceElevated }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${colors.primary}20` }}>
                      <Shield
                        size={20}
                        style={{ color: colors.primary }}
                      />
                    </div>
                    <div>
                      <h4 className="font-medium" style={{ color: colors.text }}>
                        Account Settings
                      </h4>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Manage security and preferences
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all group hover:scale-[1.02]"
                    style={{ borderColor: `${colors.error}40`, background: `${colors.error}10` }}
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${colors.error}20` }}>
                      <LogOut
                        size={20}
                        style={{ color: colors.error }}
                      />
                    </div>
                    <div className="text-left">
                      <h4 className="font-medium" style={{ color: colors.text }}>
                        Logout
                      </h4>
                      <p className="text-sm" style={{ color: colors.textSecondary }}>
                        Sign out of your account
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 text-center text-sm"
            style={{ color: colors.textTertiary }}
          >
            Account created on{' '}
            {new Date(user.created_at || Date.now()).toLocaleDateString(
              'en-US',
              {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
