'use client';

import { useMemo, useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';
import { formatCompactNumber, formatRelativeTime } from '@/utils/internationalization';
import ProfileAnalytics from './ProfileAnalytics';
import { useThemeColors } from '@/hooks/useThemeColors';

export default function ProfilePage() {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const { user, updateProfile } = useUser();
  const toast = useToast();

  const userPosts = [
    {
      id: 1,
      content: 'Excited to share my latest research on AI applications in rural healthcare! 🏥🤖',
      image: 'https://picsum.photos/600/400?random=1',
      likes: 234,
      comments: 45,
      shares: 12,
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      id: 2,
      content: 'Beautiful sunset from the Golden Temple today. Punjab never fails to amaze me! 🌅',
      image: 'https://picsum.photos/600/400?random=2',
      likes: 567,
      comments: 89,
      shares: 34,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      id: 3,
      content: 'Working on some amazing new features for Echo! The Nothing Phone UI integration is looking fantastic 📱✨',
      likes: 123,
      comments: 23,
      shares: 8,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    }
  ];

  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'likes' | 'about' | 'analytics' | 'activity' | 'achievements' | 'photos' | 'settings'>('posts');
  const [profileTheme, setProfileTheme] = useState<'default' | 'minimal' | 'vibrant' | 'dark'>('default');
  const [copied, setCopied] = useState(false);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedPhotoTab, setSelectedPhotoTab] = useState<'upload' | 'camera' | 'gallery'>('upload');
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastSeen, setLastSeen] = useState(new Date());
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public' as 'public' | 'friends' | 'private',
    showOnlineStatus: true,
    allowMessages: true,
    showEmail: false,
    showPhone: false
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    displayName: user?.displayName || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        displayName: user.displayName,
        bio: user.bio,
        location: user.location,
        website: user.website
      });
    }
  }, [user]);

  const fmt = useMemo(() => new Intl.NumberFormat('en-IN'), []);

  const onShare = async () => {
    try {
      const shareUrl = `https://echo.app/@${user?.username}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Profile URL copied to clipboard!');
      setTimeout(() => setCopied(false), 1500);
    } catch (_) {
      // Fallback for clipboard API
      toast.info(`Profile URL: https://echo.app/@${user?.username}`, 0);
    }
  };

  const mediaOnly = useMemo(() => userPosts.filter(p => Boolean(p.image)), []);

  // Photo gallery data
  const photoGallery = [
    {
      id: 'photo_001',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      caption: 'Professional headshot',
      uploadDate: new Date('2024-01-15'),
      isProfilePhoto: false,
      likes: 45,
      comments: 12
    },
    {
      id: 'photo_002', 
      url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      caption: 'Casual outdoor photo',
      uploadDate: new Date('2024-02-20'),
      isProfilePhoto: false,
      likes: 67,
      comments: 23
    },
    {
      id: 'photo_003',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face',
      caption: 'Conference presentation',
      uploadDate: new Date('2024-03-10'),
      isProfilePhoto: false,
      likes: 89,
      comments: 34
    },
    {
      id: 'photo_004',
      url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face',
      caption: 'Team building event',
      uploadDate: new Date('2024-04-05'),
      isProfilePhoto: false,
      likes: 123,
      comments: 45
    },
    {
      id: 'photo_005',
      url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face',
      caption: 'Graduation day',
      uploadDate: new Date('2024-05-15'),
      isProfilePhoto: true,
      likes: 234,
      comments: 67
    },
    {
      id: 'photo_006',
      url: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&h=400&fit=crop&crop=face',
      caption: 'Vacation memories',
      uploadDate: new Date('2024-06-20'),
      isProfilePhoto: false,
      likes: 156,
      comments: 28
    }
  ];

  // Cover photo options
  const coverPhotoOptions = [
    {
      id: 'cover_001',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
      name: 'Mountain Landscape'
    },
    {
      id: 'cover_002',
      url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&h=400&fit=crop',
      name: 'Nature Scene'
    },
    {
      id: 'cover_003',
      url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
      name: 'Forest Path'
    },
    {
      id: 'cover_004',
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
      name: 'Ocean View'
    }
  ];



  // Achievement system
  const achievements = [
    {
      id: 'early_adopter',
      title: 'Early Adopter',
      description: 'Joined Echo in its first year',
      icon: '🌟',
      earned: true,
      earnedDate: new Date('2024-01-15'),
      rarity: 'legendary'
    },
    {
      id: 'content_creator',
      title: 'Content Creator',
      description: 'Posted 100+ times',
      icon: '✍️',
      earned: true,
      earnedDate: new Date('2024-03-20'),
      rarity: 'epic'
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Have 1000+ followers',
      icon: '🦋',
      earned: true,
      earnedDate: new Date('2024-05-10'),
      rarity: 'rare'
    },
    {
      id: 'verified_user',
      title: 'Verified User',
      description: 'Account verified by Echo',
      icon: '✅',
      earned: user?.verified || false,
      earnedDate: new Date('2024-02-01'),
      rarity: 'epic'
    },
    {
      id: 'trendsetter',
      title: 'Trendsetter',
      description: 'Post reached 10K+ views',
      icon: '🔥',
      earned: false,
      rarity: 'legendary'
    },
    {
      id: 'community_builder',
      title: 'Community Builder',
      description: 'Help 50+ users with replies',
      icon: '🤝',
      earned: false,
      rarity: 'rare'
    }
  ];

  // Activity timeline
  const recentActivity = [
    {
      id: 'act_001',
      type: 'post',
      action: 'Posted a new update',
      content: 'Working on some amazing new features for Echo!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
      icon: '📝'
    },
    {
      id: 'act_002',
      type: 'like',
      action: 'Liked 5 posts',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
      icon: '❤️'
    },
    {
      id: 'act_003',
      type: 'follow',
      action: 'Started following 3 new users',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
      icon: '👥'
    },
    {
      id: 'act_004',
      type: 'achievement',
      action: 'Earned "Social Butterfly" achievement',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      icon: '🏆'
    },
    {
      id: 'act_005',
      type: 'post',
      action: 'Shared a photo from Golden Temple',
      content: 'Beautiful sunset from the Golden Temple today.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      icon: '📸'
    }
  ];

  // Profile insights
  const profileInsights = {
    profileViews: {
      thisWeek: 1247,
      lastWeek: 1089,
      change: 14.5
    },
    engagementRate: {
      current: 4.8,
      average: 3.2
    },
    topHashtags: ['#tech', '#ai', '#development', '#echo', '#innovation'],
    bestPostTime: '2:00 PM - 4:00 PM',
    audienceGrowth: '+12.3% this month'
  };

  const handleLikePost = (postId: number) => {
    setLikedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const success = await updateProfile({
      displayName: editForm.displayName,
      bio: editForm.bio,
      location: editForm.location,
      website: editForm.website
    });

    if (success) {
      setIsEditModalOpen(false);
      toast.success('Profile updated successfully!', 3000);
    } else {
      toast.error('Failed to update profile. Please try again.', 4000);
    }
  };

  // Photo handling functions
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfilePhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverPhotoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetProfilePhoto = (photoUrl: string) => {
    updateProfile({ avatar: photoUrl });
    setIsPhotoModalOpen(false);
    toast.success('Profile photo updated!', 2000);
  };

  const handleSetCoverPhoto = (photoUrl: string) => {
    // In a real app, this would update the cover photo in user context
    setCoverPhotoPreview(photoUrl);
    setIsCoverModalOpen(false);
    toast.success('Cover photo updated!', 2000);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // In a real app, you'd implement camera capture functionality
      toast.info('Camera feature would be implemented here', 3000);
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast.error('Camera access denied or not available', 3000);
    }
  };

  const handlePrivacySettingChange = (setting: string, value: any) => {
    setPrivacySettings(prev => ({ ...prev, [setting]: value }));
    toast.success('Privacy setting updated', 2000);
  };

  if (!user) {
    return (
      <section id="profile" data-route="profile" className="active">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
          <h2>Please log in to view your profile</h2>
        </div>
      </section>
    );
  }

  const joinedDate = new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <section id="profile" data-route="profile" className="active animate-fade-in">
      <style jsx>{`
        @keyframes statusPulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6), 0 4px 8px rgba(0, 0, 0, 0.2);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(16, 185, 129, 0), 0 4px 12px rgba(0, 0, 0, 0.3);
          }
        }

        .premium-cover-button:hover {
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25), 0 3px 10px rgba(0, 0, 0, 0.18);
        }

        .premium-avatar-container {
          position: relative;
          width: 140px;
          height: 140px;
          display: inline-block;
        }

        .premium-avatar-container::before {
          content: '';
          position: absolute;
          top: -4px;
          left: -4px;
          right: -4px;
          bottom: -4px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
          opacity: 0.8;
          z-index: 0;
          transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        .premium-avatar-container:hover::before {
          opacity: 1;
        }

        .premium-avatar-container:hover {
          filter: drop-shadow(0 0 20px rgba(102, 126, 234, 0.3));
        }

        /* Responsive Layout Fixes */
        @media (max-width: 768px) {
          .profile-action-buttons {
            position: static !important;
            width: 100%;
            margin-top: 1rem !important;
            justify-content: stretch;
          }

          .profile-action-buttons button {
            flex: 1;
          }

          .profile-cover {
            height: 200px !important;
          }

          .premium-avatar-container {
            width: 100px !important;
            height: 100px !important;
          }

          .premium-avatar-container img {
            width: 100px !important;
            height: 100px !important;
          }

          .profile-name {
            font-size: 1.75rem !important;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }

        @media (max-width: 480px) {
          .profile-info-section {
            padding: 1.5rem !important;
          }

          .profile-name {
            font-size: 1.5rem !important;
          }

          .stats-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      <div className="container">
        {/* Profile Header with Cover - Premium Enhanced */}
        <div className="nothing-widget nothing-glyph-effect modern-card elevation-3 animate-fade-in-down" style={{
          marginBottom: '2rem',
          padding: 0,
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08)',
          borderRadius: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Cover Image with premium gradient overlay */}
          <div className="transition-smooth profile-cover" style={{
            height: '280px',
            backgroundImage: coverPhotoPreview ? `url(${coverPhotoPreview})` : `linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-end',
            padding: '2rem'
          }}>
            {/* Premium overlay gradient */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.4) 100%)',
              pointerEvents: 'none'
            }} />
            {!coverPhotoPreview && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '24px 24px',
                opacity: 0.5
              }} />
            )}
            {/* Cover Photo Edit Button - Premium Enhanced */}
            <button
              onClick={() => setIsCoverModalOpen(true)}
              className="glass hover-scale transition-smooth focus-ring premium-cover-button"
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.95) 100%)',
                color: colors.brand.primary,
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.25rem',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(102, 126, 234, 0.2)',
                border: '2px solid rgba(255, 255, 255, 0.6)',
                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                backdropFilter: 'blur(20px)',
                overflow: 'hidden'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0) 0%, rgba(102, 126, 234, 0.1) 100%)',
                borderRadius: '50%',
                pointerEvents: 'none'
              }} />
            </button>
          </div>

          {/* Profile Info */}
          <div className="profile-info-section" style={{
            padding: '2rem 2.5rem',
            paddingTop: '0',
            position: 'relative',
            background: 'var(--card)'
          }}>
            {/* Avatar Container - Overlaps Cover */}
            <div style={{
              marginTop: '-70px',
              marginBottom: '1rem'
            }}>
              {/* Avatar - Premium Enhanced */}
              <div className="nothing-glyph-ring" style={{
                position: 'relative',
                flexShrink: 0
              }}>
                <div className="premium-avatar-container" style={{
                  position: 'relative',
                  display: 'inline-block',
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)'
                }}>
                  <Image
                    src={profilePhotoPreview || user.avatar}
                    alt={user.displayName}
                    width={140}
                    height={140}
                    style={{
                      borderRadius: '50%',
                      border: '5px solid var(--card)',
                      background: 'var(--card)',
                      cursor: 'pointer',
                      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25), 0 6px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0,0,0,0.05)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      position: 'relative',
                      zIndex: 10
                    }}
                    onClick={() => setIsPhotoModalOpen(true)}
                  />
                  {/* Premium Online Status Indicator with pulse animation */}
                  {privacySettings.showOnlineStatus && (
                    <div className="online-status-pulse" style={{
                      position: 'absolute',
                      bottom: '16px',
                      left: '12px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: isOnline ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)' : colors.text.tertiary,
                      border: '4px solid white',
                      boxShadow: isOnline ? '0 0 0 4px rgba(16, 185, 129, 0.2), 0 4px 8px rgba(0, 0, 0, 0.2)' : '0 4px 8px rgba(0, 0, 0, 0.2)',
                      zIndex: 11,
                      animation: isOnline ? 'statusPulse 2s ease-in-out infinite' : 'none'
                    }} />
                  )}
                  {/* Premium Photo Edit Button */}
                  <button
                    onClick={() => setIsPhotoModalOpen(true)}
                    className="premium-edit-btn"
                    style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: user.verified ? '48px' : '12px',
                      background: 'colors.gradient.primary',
                      color: 'white',
                      border: '3px solid white',
                      borderRadius: '50%',
                      width: '42px',
                      height: '42px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5), 0 3px 8px rgba(0, 0, 0, 0.25)',
                      zIndex: 11,
                      position: 'relative' as 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
                      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <div style={{
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                      pointerEvents: 'none'
                    }} />
                  </button>
                  {user.verified && (
                    <div style={{
                      position: 'absolute',
                      bottom: '12px',
                      right: '12px',
                      background: 'colors.gradient.primary',
                      color: 'white',
                      borderRadius: '50%',
                      width: '42px',
                      height: '42px',
                      border: '3px solid white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.5), 0 3px 8px rgba(0, 0, 0, 0.25)',
                      zIndex: 11,
                      position: 'relative' as 'relative',
                      overflow: 'hidden'
                    }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <div style={{
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
                        pointerEvents: 'none'
                      }} />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions - Positioned Top Right */}
            <div className="profile-action-buttons" style={{
              position: 'absolute',
              top: '1.5rem',
              right: '2.5rem',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
                <button
                  className="nothing-button primary premium-action-btn"
                  onClick={handleEditProfile}
                  style={{
                    padding: '14px 28px',
                    background: 'colors.gradient.primary',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(102, 126, 234, 0.3), 0 2px 8px rgba(102, 126, 234, 0.2)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M18.5 2.50001C18.8978 2.10219 19.4374 1.87869 20 1.87869C20.5626 1.87869 21.1022 2.10219 21.5 2.50001C21.8978 2.89784 22.1213 3.4374 22.1213 4.00001C22.1213 4.56262 21.8978 5.10219 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit Profile
                </button>
                <button
                  className="nothing-button premium-action-btn-secondary"
                  onClick={onShare}
                  style={{
                    padding: '14px 28px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    color: colors.brand.primary,
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    fontWeight: '600',
                    fontSize: '15px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {copied ? (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8.59 13.51L15.42 17.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M15.41 6.51L8.59 10.49" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span>Share Profile</span>
                    </>
                  )}
                </button>
              </div>

            {/* User Details - Premium Enhanced */}
            <div style={{
              marginBottom: '2rem',
              maxWidth: '100%'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <h1 className="profile-name" style={{
                  fontSize: '2.25rem',
                  fontWeight: '700',
                  margin: 0,
                  color: 'var(--fg)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2
                }}>
                  {user.displayName}
                </h1>
                {user.verified && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: 'colors.gradient.primary',
                    color: 'white',
                    padding: '0.45rem 0.85rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.35), 0 2px 6px rgba(0, 0, 0, 0.15)',
                    position: 'relative' as 'relative',
                    overflow: 'hidden'
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Verified</span>
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 100%)',
                      pointerEvents: 'none'
                    }} />
                  </div>
                )}
                {privacySettings.showOnlineStatus && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: isOnline
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)'
                      : 'rgba(107, 114, 128, 0.1)',
                    color: isOnline ? '#059669' : colors.text.tertiary,
                    padding: '0.4rem 0.9rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    border: isOnline ? '1.5px solid rgba(16, 185, 129, 0.3)' : '1.5px solid rgba(107, 114, 128, 0.2)',
                    boxShadow: isOnline ? '0 2px 8px rgba(16, 185, 129, 0.15)' : 'none'
                  }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: isOnline ? colors.status.success : colors.text.tertiary,
                      boxShadow: isOnline ? '0 0 6px rgba(16, 185, 129, 0.6)' : 'none'
                    }} />
                    {isOnline ? 'Online Now' : `Last seen ${formatRelativeTime(lastSeen)}`}
                  </div>
                )}
              </div>

              <p style={{
                fontSize: '1.05rem',
                marginBottom: '1.25rem',
                color: colors.brand.primary,
                fontWeight: '500',
                letterSpacing: '0.01em'
              }}>
                @{user.username}
              </p>

              <p style={{
                fontSize: '1.05rem',
                lineHeight: 1.7,
                marginBottom: '1.5rem',
                color: 'var(--fg)',
                maxWidth: '600px'
              }}>
                {user.bio}
              </p>

              {/* Profile Facts - Premium Enhanced */}
              <div style={{
                display: 'flex',
                gap: '1.75rem',
                flexWrap: 'wrap',
                marginBottom: '1rem'
              }}>
                {user.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.85rem',
                    background: 'rgba(248,250,252,0.8)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(248,250,252,0.8)';
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                  }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.brand.primary, flexShrink: 0 }}>
                      <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--fg)' }}>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    padding: '0.5rem 0.85rem',
                    background: 'rgba(248,250,252,0.8)',
                    borderRadius: '10px',
                    border: '1px solid rgba(0,0,0,0.04)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(248,250,252,0.8)';
                    e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                  }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.brand.primary, flexShrink: 0 }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2V2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        color: colors.brand.primary,
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = 'underline';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = 'none';
                      }}
                    >
                      {user.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  padding: '0.5rem 0.85rem',
                  background: 'rgba(248,250,252,0.8)',
                  borderRadius: '10px',
                  border: '1px solid rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(248,250,252,0.8)';
                  e.currentTarget.style.borderColor = 'rgba(0,0,0,0.04)';
                }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: colors.brand.primary, flexShrink: 0 }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--fg)' }}>Joined {joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid - Premium Enhanced */}
            <div className="stats-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '1.25rem',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              borderRadius: '20px',
              padding: '2rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)',
              border: '1px solid rgba(255,255,255,0.8)'
            }}>
              {[
                { value: user.stats.posts, label: t('posts'), color: colors.brand.primary, icon: '📝' },
                { value: user.stats.following, label: t('following'), color: colors.chart[4], icon: '👥' },
                { value: user.stats.followers, label: t('followers'), color: '#4facfe', icon: '❤️' },
                { value: user.stats.likes, label: 'Likes', color: '#fa709a', icon: '⭐' }
              ].map((stat, index) => (
                <div
                  key={index}
                  className="premium-stat-card"
                  style={{
                    textAlign: 'center',
                    padding: '1.25rem 1rem',
                    borderRadius: '16px',
                    background: 'var(--card)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    fontSize: '1.5rem',
                    marginBottom: '0.5rem',
                    opacity: 0.8
                  }}>
                    {stat.icon}
                  </div>
                  {/* Value */}
                  <div className="nothing-title" style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    marginBottom: '0.25rem'
                  }}>
                    {formatCompactNumber(stat.value)}
                  </div>
                  {/* Label */}
                  <div className="nothing-subtitle" style={{
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: 'var(--muted)'
                  }}>
                    {stat.label}
                  </div>
                  {/* Gradient accent */}
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: `linear-gradient(90deg, ${stat.color} 0%, ${stat.color}80 100%)`,
                    opacity: 0.6
                  }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Insights Banner - Premium Enhanced */}
        <div className="nothing-widget premium-insights-banner" style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          color: 'white',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 12px 40px rgba(102, 126, 234, 0.3), 0 6px 20px rgba(118, 75, 162, 0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-10%',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-30%',
            left: '-5%',
            width: '250px',
            height: '250px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.5rem',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1
          }}>
            {[
              {
                value: formatCompactNumber(profileInsights.profileViews.thisWeek),
                label: 'Profile Views',
                sublabel: `+${profileInsights.profileViews.change}% this week`,
                icon: '👁️'
              },
              {
                value: `${profileInsights.engagementRate.current}%`,
                label: 'Engagement Rate',
                sublabel: `Above average (${profileInsights.engagementRate.average}%)`,
                icon: '📊'
              },
              {
                value: achievements.filter(a => a.earned).length,
                label: 'Achievements',
                sublabel: `of ${achievements.length} total`,
                icon: '🏆'
              },
              {
                value: profileInsights.audienceGrowth,
                label: 'Growth',
                sublabel: 'this month',
                icon: '📈'
              }
            ].map((insight, index) => (
              <div
                key={index}
                className="premium-insight-card"
                style={{
                  padding: '1.5rem 1rem',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{insight.icon}</div>
                <div style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                  {insight.value}
                </div>
                <div style={{ fontSize: '1rem', opacity: 0.95, fontWeight: '500' }}>{insight.label}</div>
                <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '0.25rem' }}>{insight.sublabel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs - Premium Enhanced */}
        <div className="nothing-widget premium-tabs-container" style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.04)',
          border: '1px solid rgba(255,255,255,0.8)'
        }}>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {[
              { key: 'posts', label: 'Posts', icon: '📝', color: colors.brand.primary },
              { key: 'media', label: 'Media', icon: '🖼️', color: colors.chart[4] },
              { key: 'photos', label: 'Photos', icon: '📸', color: '#4facfe' },
              { key: 'achievements', label: 'Achievements', icon: '🏆', color: '#feca57' },
              { key: 'activity', label: 'Activity', icon: '📈', color: '#48dbfb' },
              { key: 'analytics', label: 'Analytics', icon: '📊', color: '#ff6b6b' },
              { key: 'settings', label: 'Settings', icon: '⚙️', color: '#95afc0' },
              { key: 'likes', label: 'Likes', icon: '❤️', color: '#fa709a' },
              { key: 'about', label: 'About', icon: 'ℹ️', color: '#5f27cd' }
            ].map(({ key, label, icon, color }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`premium-tab-btn ${isActive ? 'active' : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '12px',
                    border: isActive ? `2px solid ${color}` : '2px solid transparent',
                    background: isActive
                      ? `linear-gradient(135deg, ${color}15 0%, ${color}08 100%)`
                      : 'white',
                    color: isActive ? color : colors.text.tertiary,
                    fontWeight: isActive ? '600' : '500',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                    boxShadow: isActive
                      ? `0 4px 12px ${color}25, 0 2px 6px ${color}15`
                      : '0 2px 6px rgba(0,0,0,0.04)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                  <span>{label}</span>
                  {/* Active indicator */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
                      borderRadius: '3px 3px 0 0'
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {activeTab === 'posts' && (
          <div className="nothing-grid">
            {userPosts.map((post) => (
              <article
                key={post.id}
                className="nothing-widget premium-post-card"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  borderRadius: '20px',
                  background: 'var(--card)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)',
                  border: '1px solid rgba(0,0,0,0.04)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                {post.image && (
                  <div style={{
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '20px 20px 0 0'
                  }}>
                    <Image
                      src={post.image}
                      alt="Post image"
                      width={600}
                      height={400}
                      style={{
                        width: '100%',
                        height: '250px',
                        objectFit: 'cover',
                      }}
                    />
                    {/* Gradient overlay */}
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '80px',
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%)',
                      pointerEvents: 'none'
                    }} />
                  </div>
                )}
                <div style={{ padding: '1.5rem' }}>
                  <p className="nothing-subtitle" style={{
                    marginBottom: '1.5rem',
                    lineHeight: 1.7,
                    fontSize: '1rem',
                    color: 'var(--fg)'
                  }}>
                    {post.content}
                  </p>

                  {/* Post Stats - Premium Enhanced */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.8) 100%)',
                    borderRadius: '14px',
                    padding: '1rem 1.25rem',
                    fontSize: '0.95rem',
                    border: '1px solid rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="premium-post-action"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: likedPosts.includes(post.id) ? '#fa709a' : colors.text.tertiary,
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
                        }}
                      >
                        ❤️ {fmt.format(post.likes + (likedPosts.includes(post.id) ? 1 : 0))}
                      </button>
                      <button
                        onClick={() => alert(`Commenting on "${post.content.slice(0, 50)}..."`)}
                        className="premium-post-action"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--muted)',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
                        }}
                      >
                        💬 {fmt.format(post.comments)}
                      </button>
                      <button
                        onClick={() => alert(`Sharing "${post.content.slice(0, 50)}..."`)}
                        className="premium-post-action"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--muted)',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          transition: 'all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
                        }}
                      >
                        🔄 {fmt.format(post.shares)}
                      </button>
                    </div>
                    <span className="nothing-subtitle" style={{
                      fontSize: '0.85rem',
                      color: '#9ca3af',
                      fontWeight: '500'
                    }}>
                      {formatRelativeTime(post.timestamp)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'media' && (
          <div className="nothing-grid">
            {mediaOnly.length ? (
              mediaOnly.map((post) => (
                <div key={post.id} className="nothing-widget">
                  <Image
                    src={post.image!}
                    alt="Media"
                    width={600}
                    height={400}
                    style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: '12px', marginBottom: '1rem' }}
                  />
                  <p className="nothing-subtitle" style={{ fontSize: '0.9rem' }}>
                    {post.content}
                  </p>
                  <p className="nothing-subtitle" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
                    {formatRelativeTime(post.timestamp)}
                  </p>
                </div>
              ))
            ) : (
              <div className="nothing-widget" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                <h3 className="nothing-title">No media yet</h3>
                <p className="nothing-subtitle">Media posts will appear here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'likes' && (
          <div className="nothing-widget" style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
            <h3 className="nothing-title">No liked posts yet</h3>
            <p className="nothing-subtitle">Posts you like will appear here</p>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="nothing-grid">
            <div className="nothing-widget">
              <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>🏆 Achievements ({achievements.filter(a => a.earned).length}/{achievements.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {achievements.map((achievement) => {
                  const rarityColors = {
                    common: colors.text.tertiary,
                    rare: '#3b82f6',
                    epic: '#8b5cf6',
                    legendary: '#f59e0b'
                  };
                  
                  return (
                    <div
                      key={achievement.id}
                      style={{
                        padding: '1.5rem',
                        background: achievement.earned ? 'var(--nothing-surface)' : 'rgba(var(--nothing-surface-rgb), 0.5)',
                        borderRadius: '16px',
                        border: achievement.earned ? `2px solid ${rarityColors[achievement.rarity as keyof typeof rarityColors]}` : '2px solid var(--border)',
                        opacity: achievement.earned ? 1 : 0.6,
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {achievement.earned && (
                        <div style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: rarityColors[achievement.rarity as keyof typeof rarityColors],
                          color: 'white',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase'
                        }}>
                          {achievement.rarity}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <div style={{
                          fontSize: '3rem',
                          filter: achievement.earned ? 'none' : 'grayscale(100%)'
                        }}>
                          {achievement.icon}
                        </div>
                        <div>
                          <h4 className="nothing-title" style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                            {achievement.title}
                          </h4>
                          <p className="nothing-subtitle" style={{ fontSize: '0.9rem' }}>
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                      {achievement.earned && achievement.earnedDate && (
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                          Earned on {achievement.earnedDate.toLocaleDateString()}
                        </div>
                      )}
                      {!achievement.earned && (
                        <div style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0,0,0,0.1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '2rem'
                        }}>
                          🔒
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="nothing-grid">
            <div className="nothing-widget">
              <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>📈 Recent Activity</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'var(--nothing-surface)',
                      borderRadius: '12px',
                      border: '1px solid var(--border)'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      flexShrink: 0
                    }}>
                      {activity.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="nothing-title" style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>
                        {activity.action}
                      </div>
                      {activity.content && (
                        <p className="nothing-subtitle" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                          "{activity.content}"
                        </p>
                      )}
                      <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Summary */}
            <div className="nothing-widget">
              <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>Activity Summary</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div style={{
                  textAlign: 'center',
                  background: 'var(--nothing-surface)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                  <div className="nothing-title" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>12</div>
                  <div className="nothing-subtitle">Posts This Week</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  background: 'var(--nothing-surface)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>❤️</div>
                  <div className="nothing-title" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>89</div>
                  <div className="nothing-subtitle">Likes Given</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  background: 'var(--nothing-surface)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>👥</div>
                  <div className="nothing-title" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>7</div>
                  <div className="nothing-subtitle">New Connections</div>
                </div>
                <div style={{
                  textAlign: 'center',
                  background: 'var(--nothing-surface)',
                  borderRadius: '12px',
                  padding: '1.5rem'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔥</div>
                  <div className="nothing-title" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>4.8</div>
                  <div className="nothing-subtitle">Avg Engagement</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="nothing-grid">
            <div className="nothing-widget">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="nothing-title">📸 Photo Gallery ({photoGallery.length} photos)</h3>
                <button 
                  className="nothing-button primary"
                  onClick={() => setIsPhotoModalOpen(true)}
                  style={{ padding: '0.75rem 1.5rem' }}
                >
                  + Add Photo
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {photoGallery.map((photo) => (
                  <div
                    key={photo.id}
                    style={{
                      position: 'relative',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      background: 'var(--nothing-surface)',
                      border: photo.isProfilePhoto ? '3px solid var(--accent)' : '1px solid var(--border)',
                      transition: 'all 0.3s'
                    }}
                  >
                    {photo.isProfilePhoto && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        background: 'var(--accent)',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        zIndex: 2
                      }}>
                        Current
                      </div>
                    )}
                    <Image
                      src={photo.url}
                      alt={photo.caption}
                      width={200}
                      height={200}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSetProfilePhoto(photo.url)}
                    />
                    <div style={{ padding: '1rem' }}>
                      <p style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                        {photo.caption}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', opacity: 0.7 }}>
                        <span>{formatRelativeTime(photo.uploadDate)}</span>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                          <span>❤️ {photo.likes}</span>
                          <span>💬 {photo.comments}</span>
                        </div>
                      </div>
                      {!photo.isProfilePhoto && (
                        <button
                          onClick={() => handleSetProfilePhoto(photo.url)}
                          style={{
                            width: '100%',
                            marginTop: '0.75rem',
                            padding: '0.5rem',
                            background: 'var(--accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.opacity = '0.8';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.opacity = '1';
                          }}
                        >
                          Set as Profile Photo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="nothing-grid">
            <div className="nothing-widget">
              <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>⚙️ Privacy & Settings</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Profile Visibility */}
                <div style={{ padding: '1.5rem', background: 'var(--nothing-surface)', borderRadius: '12px' }}>
                  <h4 className="nothing-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Profile Visibility</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['public', 'friends', 'private'].map((option) => (
                      <label key={option} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option}
                          checked={privacySettings.profileVisibility === option}
                          onChange={(e) => handlePrivacySettingChange('profileVisibility', e.target.value)}
                          style={{ accentColor: 'var(--accent)' }}
                        />
                        <div>
                          <div style={{ fontWeight: '500', textTransform: 'capitalize' }}>{option}</div>
                          <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                            {option === 'public' && 'Anyone can see your profile'}
                            {option === 'friends' && 'Only your connections can see your profile'}
                            {option === 'private' && 'Only you can see your profile'}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Online Status */}
                <div style={{ padding: '1.5rem', background: 'var(--nothing-surface)', borderRadius: '12px' }}>
                  <h4 className="nothing-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Online Status</h4>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={privacySettings.showOnlineStatus}
                      onChange={(e) => handlePrivacySettingChange('showOnlineStatus', e.target.checked)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    <div>
                      <div style={{ fontWeight: '500' }}>Show when I'm online</div>
                      <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Let others see when you're active</div>
                    </div>
                  </label>
                </div>

                {/* Contact Settings */}
                <div style={{ padding: '1.5rem', background: 'var(--nothing-surface)', borderRadius: '12px' }}>
                  <h4 className="nothing-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Contact Information</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={privacySettings.allowMessages}
                        onChange={(e) => handlePrivacySettingChange('allowMessages', e.target.checked)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <div>
                        <div style={{ fontWeight: '500' }}>Allow messages from anyone</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Let anyone send you messages</div>
                      </div>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={privacySettings.showEmail}
                        onChange={(e) => handlePrivacySettingChange('showEmail', e.target.checked)}
                        style={{ accentColor: 'var(--accent)' }}
                      />
                      <div>
                        <div style={{ fontWeight: '500' }}>Show email address</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>Display your email on your profile</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Profile Theme */}
                <div style={{ padding: '1.5rem', background: 'var(--nothing-surface)', borderRadius: '12px' }}>
                  <h4 className="nothing-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Profile Theme</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem' }}>
                    {['default', 'minimal', 'vibrant', 'dark'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setProfileTheme(theme as any)}
                        style={{
                          padding: '1rem',
                          border: profileTheme === theme ? '2px solid var(--accent)' : '1px solid var(--border)',
                          borderRadius: '8px',
                          background: profileTheme === theme ? 'rgba(var(--accent-rgb), 0.1)' : 'var(--bg)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          textTransform: 'capitalize',
                          fontWeight: profileTheme === theme ? '600' : '400',
                          transition: 'all 0.3s'
                        }}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <ProfileAnalytics />
        )}

        {activeTab === 'about' && (
          <div className="nothing-grid">
            <div className="nothing-widget">
              <h3 className="nothing-title" style={{ marginBottom: '1rem' }}>{t('profile.about', { name: user.displayName })}</h3>
              <div style={{ background: 'var(--nothing-surface)', borderRadius: '12px', overflow: 'hidden' }}>
                <div className="nothing-list-item">
                  <div>
                    <div className="nothing-title" style={{ fontSize: '1rem' }}>Bio</div>
                    <div className="nothing-subtitle">{user.bio}</div>
                  </div>
                </div>
                {user.location && (
                  <div className="nothing-list-item">
                    <div>
                      <div className="nothing-title" style={{ fontSize: '1rem' }}>Location</div>
                      <div className="nothing-subtitle">{user.location}</div>
                    </div>
                  </div>
                )}
                {user.website && (
                  <div className="nothing-list-item">
                    <div>
                      <div className="nothing-title" style={{ fontSize: '1rem' }}>Website</div>
                      <a href={user.website} target="_blank" rel="noreferrer" className="nothing-subtitle" style={{ textDecoration: 'underline' }}>
                        {user.website}
                      </a>
                    </div>
                  </div>
                )}
                <div className="nothing-list-item">
                  <div>
                    <div className="nothing-title" style={{ fontSize: '1rem' }}>Member Since</div>
                    <div className="nothing-subtitle">{joinedDate}</div>
                  </div>
                </div>
                <div className="nothing-list-item">
                  <div>
                    <div className="nothing-title" style={{ fontSize: '1rem' }}>Email</div>
                    <div className="nothing-subtitle">{user.email}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="nothing-widget">
              <h3 className="nothing-title" style={{ marginBottom: '1rem' }}>Profile Insights</h3>
              <div style={{ background: 'var(--nothing-surface)', borderRadius: '12px', padding: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div className="nothing-title" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>{user.stats.posts}</div>
                    <div className="nothing-subtitle">Total Posts</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div className="nothing-title" style={{ fontSize: '1.5rem', color: 'var(--accent)' }}>{user.stats.likes}</div>
                    <div className="nothing-subtitle">Total Likes</div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <h4 className="nothing-title" style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Top Hashtags</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {profileInsights.topHashtags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          background: 'var(--accent)',
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '16px',
                          fontSize: '0.85rem',
                          fontWeight: '500'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <div className="nothing-subtitle" style={{ fontSize: '0.9rem' }}>
                    🕰️ Best time to post: <strong>{profileInsights.bestPostTime}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Profile Modal */}
        {isEditModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }} onClick={() => setIsEditModalOpen(false)}>
            <div className="nothing-widget" style={{
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 className="nothing-title">Edit Profile</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--fg)'
                  }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label className="nothing-subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--bg)',
                      color: 'var(--fg)'
                    }}
                  />
                </div>

                <div>
                  <label className="nothing-subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--bg)',
                      color: 'var(--fg)',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div>
                  <label className="nothing-subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--bg)',
                      color: 'var(--fg)'
                    }}
                  />
                </div>

                <div>
                  <label className="nothing-subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      background: 'var(--bg)',
                      color: 'var(--fg)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button
                    className="nothing-button"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="nothing-button primary"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Photo Modal */}
        {isPhotoModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }} onClick={() => setIsPhotoModalOpen(false)}>
            <div className="nothing-widget" style={{
              width: '90%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 className="nothing-title">📷 Update Profile Photo</h3>
                <button
                  onClick={() => setIsPhotoModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--fg)'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Photo Options Tabs */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[
                  { key: 'upload', label: 'Upload', icon: '📁' },
                  { key: 'camera', label: 'Camera', icon: '📷' },
                  { key: 'gallery', label: 'Gallery', icon: '🖼️' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedPhotoTab(key as any)}
                    className={`nothing-button ${selectedPhotoTab === key ? 'primary' : ''}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Upload Tab */}
              {selectedPhotoTab === 'upload' && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{
                    border: '2px dashed var(--border)',
                    borderRadius: '12px',
                    padding: '3rem 2rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
                    <p className="nothing-subtitle" style={{ marginBottom: '1rem' }}>Drag and drop your photo here</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      style={{ display: 'none' }}
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="nothing-button primary" style={{ cursor: 'pointer' }}>
                      Choose File
                    </label>
                  </div>
                  {profilePhotoPreview && (
                    <div style={{ marginTop: '1rem' }}>
                      <Image
                        src={profilePhotoPreview}
                        alt="Preview"
                        width={120}
                        height={120}
                        style={{ borderRadius: '50%', border: '2px solid var(--accent)' }}
                      />
                      <div style={{ marginTop: '1rem' }}>
                        <button
                          className="nothing-button primary"
                          onClick={() => handleSetProfilePhoto(profilePhotoPreview)}
                          style={{ marginRight: '0.5rem' }}
                        >
                          Set as Profile Photo
                        </button>
                        <button
                          className="nothing-button"
                          onClick={() => setProfilePhotoPreview(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Camera Tab */}
              {selectedPhotoTab === 'camera' && (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📷</div>
                  <p className="nothing-subtitle" style={{ marginBottom: '1.5rem' }}>Take a new photo with your camera</p>
                  <button
                    className="nothing-button primary"
                    onClick={handleCameraCapture}
                    style={{ padding: '1rem 2rem' }}
                  >
                    Open Camera
                  </button>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '1rem' }}>
                    Camera access required. Please allow camera permissions when prompted.
                  </p>
                </div>
              )}

              {/* Gallery Tab */}
              {selectedPhotoTab === 'gallery' && (
                <div>
                  <p className="nothing-subtitle" style={{ marginBottom: '1rem' }}>Choose from your existing photos:</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.75rem' }}>
                    {photoGallery.map((photo) => (
                      <div
                        key={photo.id}
                        style={{
                          position: 'relative',
                          cursor: 'pointer',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: photo.isProfilePhoto ? '3px solid var(--accent)' : '1px solid var(--border)'
                        }}
                        onClick={() => handleSetProfilePhoto(photo.url)}
                      >
                        <Image
                          src={photo.url}
                          alt={photo.caption}
                          width={100}
                          height={100}
                          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                        />
                        {photo.isProfilePhoto && (
                          <div style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: 'var(--accent)',
                            color: 'white',
                            borderRadius: '50%',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                          }}>
                            ✓
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cover Photo Modal */}
        {isCoverModalOpen && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }} onClick={() => setIsCoverModalOpen(false)}>
            <div className="nothing-widget" style={{
              width: '90%',
              maxWidth: '700px',
              maxHeight: '80vh',
              overflow: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 className="nothing-title">🆼️ Update Cover Photo</h3>
                <button
                  onClick={() => setIsCoverModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--fg)'
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Upload Cover Photo */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 className="nothing-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Upload Custom Cover</h4>
                <div style={{
                  border: '2px dashed var(--border)',
                  borderRadius: '12px',
                  padding: '2rem',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🖼️</div>
                  <p className="nothing-subtitle" style={{ marginBottom: '1rem' }}>Upload a cover photo (1200x400 recommended)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverPhotoUpload}
                    style={{ display: 'none' }}
                    id="cover-upload"
                  />
                  <label htmlFor="cover-upload" className="nothing-button primary" style={{ cursor: 'pointer' }}>
                    Choose Cover Photo
                  </label>
                </div>
              </div>

              {/* Preset Cover Photos */}
              <div>
                <h4 className="nothing-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Choose from Presets</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {coverPhotoOptions.map((cover) => (
                    <div
                      key={cover.id}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid var(--border)',
                        transition: 'all 0.3s'
                      }}
                      onClick={() => handleSetCoverPhoto(cover.url)}
                    >
                      <Image
                        src={cover.url}
                        alt={cover.name}
                        width={200}
                        height={80}
                        style={{ width: '100%', height: '80px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '0.75rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{cover.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
