'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeColors } from '@/hooks/useThemeColors';

const categories = [
  { id: 'all', name: 'All', icon: '🌟' },
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '✨' },
  { id: 'food', name: 'Food', icon: '🍔' },
  { id: 'travel', name: 'Travel', icon: '✈️' },
  { id: 'fitness', name: 'Fitness', icon: '💪' },
  { id: 'education', name: 'Education', icon: '📚' },
  { id: 'business', name: 'Business', icon: '💼' },
  { id: 'art', name: 'Art & Design', icon: '🎨' },
  { id: 'music', name: 'Music', icon: '🎵' },
  { id: 'gaming', name: 'Gaming', icon: '🎮' },
];

const trendingHashtags = [
  { tag: '#TechTalk', posts: '2.4M', growth: '+15%' },
  { tag: '#FitnessGoals', posts: '1.8M', growth: '+22%' },
  { tag: '#FoodieLife', posts: '3.2M', growth: '+18%' },
  { tag: '#TravelDiaries', posts: '1.5M', growth: '+12%' },
  { tag: '#StartupLife', posts: '987K', growth: '+30%' },
  { tag: '#LearnWithMe', posts: '2.1M', growth: '+25%' },
];

// Stories data
const stories = [
  {
    id: 1,
    username: 'ananya',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    hasNew: true,
    isLive: false,
  },
  {
    id: 2,
    username: 'techraj',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    hasNew: true,
    isLive: true,
  },
  {
    id: 3,
    username: 'priyacooks',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    hasNew: true,
    isLive: false,
  },
  {
    id: 4,
    username: 'arjunart',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    hasNew: true,
    isLive: false,
  },
  {
    id: 5,
    username: 'fitneha',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    hasNew: false,
    isLive: false,
  },
  {
    id: 6,
    username: 'devpatel',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    hasNew: true,
    isLive: false,
  },
  {
    id: 7,
    username: 'shreya',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    hasNew: true,
    isLive: true,
  },
  {
    id: 8,
    username: 'rohan',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    hasNew: false,
    isLive: false,
  },
  {
    id: 9,
    username: 'meera',
    avatar:
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face',
    hasNew: true,
    isLive: false,
  },
  {
    id: 10,
    username: 'gaming',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    hasNew: true,
    isLive: true,
  },
];

// Echoes data (short-form video content)
const echoes = [
  {
    id: 1,
    thumbnail:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=500&fit=crop',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    username: 'ananya',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    views: '2.3M',
    likes: '456K',
    duration: '0:15',
    caption: 'Morning vibes',
  },
  {
    id: 2,
    thumbnail:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=500&fit=crop',
    video: 'https://www.w3schools.com/html/movie.mp4',
    username: 'techraj',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    views: '1.8M',
    likes: '324K',
    duration: '0:30',
    caption: 'New gadget unboxing!',
  },
  {
    id: 3,
    thumbnail:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=500&fit=crop',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    username: 'priyacooks',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    views: '3.1M',
    likes: '567K',
    duration: '0:22',
    caption: 'Quick recipe',
  },
  {
    id: 4,
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop',
    video: 'https://www.w3schools.com/html/movie.mp4',
    username: 'rohan',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face',
    views: '987K',
    likes: '189K',
    duration: '0:18',
    caption: 'Mountain sunset',
  },
  {
    id: 5,
    thumbnail:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=500&fit=crop',
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    username: 'fitneha',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    views: '2.7M',
    likes: '432K',
    duration: '0:45',
    caption: '5-min workout',
  },
  {
    id: 6,
    thumbnail:
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=500&fit=crop',
    video: 'https://www.w3schools.com/html/movie.mp4',
    username: 'shreya',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    views: '4.2M',
    likes: '876K',
    duration: '0:28',
    caption: 'New song cover',
  },
];

// Live creators
const liveCreators = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    username: '@techrajesh',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    viewers: 12400,
    title: 'Building a React App from Scratch',
    category: 'Technology',
  },
  {
    id: 2,
    name: 'Shreya Music',
    username: '@shreyasings',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    viewers: 8700,
    title: 'Live Music Session - Bollywood Hits',
    category: 'Music',
  },
  {
    id: 3,
    name: 'Gaming Raj',
    username: '@gamingraj',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    viewers: 23500,
    title: 'BGMI Tournament Finals',
    category: 'Gaming',
  },
];

// Upcoming events
const upcomingEvents = [
  {
    id: 1,
    title: 'Tech Conference 2024',
    host: 'Dev Patel',
    date: 'Dec 15',
    time: '7:00 PM',
    attendees: 2340,
    category: 'Technology',
    thumbnail:
      'https://images.unsplash.com/photo-1540575467063-178a50c8b292?w=400&h=200&fit=crop',
  },
  {
    id: 2,
    title: 'Fitness Challenge Kickoff',
    host: 'Fitness Neha',
    date: 'Dec 18',
    time: '6:00 AM',
    attendees: 1890,
    category: 'Fitness',
    thumbnail:
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=200&fit=crop',
  },
  {
    id: 3,
    title: 'Cooking Masterclass',
    host: 'Priya Singh',
    date: 'Dec 20',
    time: '5:00 PM',
    attendees: 3200,
    category: 'Food',
    thumbnail:
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
  },
];

// For You recommendations
const forYouRecommendations = [
  {
    id: 1,
    type: 'creator',
    name: 'Aisha Khan',
    username: '@aishacodes',
    avatar:
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&h=150&fit=crop&crop=face',
    reason: 'Similar to creators you follow',
    followers: '234K',
    category: 'Technology',
  },
  {
    id: 2,
    type: 'topic',
    name: 'AI & Machine Learning',
    icon: '🤖',
    posts: '1.2M',
    reason: 'Based on your interests',
  },
  {
    id: 3,
    type: 'creator',
    name: 'Vikram Travel',
    username: '@vikramtravels',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    reason: 'Popular in Travel',
    followers: '567K',
    category: 'Travel',
  },
  {
    id: 4,
    type: 'topic',
    name: 'Startup Stories',
    icon: '🚀',
    posts: '890K',
    reason: 'Trending this week',
  },
];

const creators = [
  {
    id: 1,
    name: 'Ananya Panday',
    username: '@ananyapanday',
    avatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    followers: '2.4M',
    category: 'lifestyle',
    categoryName: 'Lifestyle & Fashion',
    verified: true,
    bio: 'Fashion & Lifestyle Creator | Bollywood Enthusiast',
    posts: 245,
  },
  {
    id: 2,
    name: 'Rajesh Kumar',
    username: '@techrajesh',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    followers: '856K',
    category: 'tech',
    categoryName: 'Technology',
    verified: true,
    bio: 'Tech Reviewer | Gadget Guru | YouTuber',
    posts: 432,
  },
  {
    id: 3,
    name: 'Priya Singh',
    username: '@priyacooks',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    followers: '1.2M',
    category: 'food',
    categoryName: 'Food & Travel',
    verified: true,
    bio: 'Chef | Food Blogger | Travel Enthusiast',
    posts: 567,
  },
  {
    id: 4,
    name: 'Arjun Sharma',
    username: '@arjunclicks',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    followers: '645K',
    category: 'art',
    categoryName: 'Photography & Art',
    verified: true,
    bio: 'Professional Photographer | Visual Artist',
    posts: 389,
  },
  {
    id: 5,
    name: 'Fitness with Neha',
    username: '@fitneha',
    avatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    followers: '923K',
    category: 'fitness',
    categoryName: 'Fitness & Wellness',
    verified: true,
    bio: 'Certified Fitness Trainer | Yoga Instructor',
    posts: 512,
  },
  {
    id: 6,
    name: 'Dev Patel',
    username: '@devtalks',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    followers: '567K',
    category: 'tech',
    categoryName: 'Software Development',
    verified: true,
    bio: 'Full Stack Developer | Tech Educator',
    posts: 298,
  },
  {
    id: 7,
    name: 'Shreya Music',
    username: '@shreyasings',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    followers: '1.5M',
    category: 'music',
    categoryName: 'Music & Entertainment',
    verified: true,
    bio: 'Singer | Music Producer | Composer',
    posts: 678,
  },
  {
    id: 8,
    name: 'Rohan Mehra',
    username: '@rohanwanders',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    followers: '789K',
    category: 'travel',
    categoryName: 'Travel & Adventure',
    verified: true,
    bio: 'Travel Vlogger | Adventure Seeker',
    posts: 445,
  },
  {
    id: 9,
    name: 'Aditya',
    username: '@profaditya',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    followers: '432K',
    category: 'education',
    categoryName: 'Education & Learning',
    verified: true,
    bio: 'IIT Professor | Online Educator',
    posts: 234,
  },
  {
    id: 10,
    name: 'Startup Sagar',
    username: '@startupsagar',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    followers: '678K',
    category: 'business',
    categoryName: 'Business & Startups',
    verified: true,
    bio: 'Entrepreneur | Startup Mentor | Investor',
    posts: 356,
  },
  {
    id: 11,
    name: 'Gaming with Raj',
    username: '@gamingraj',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    followers: '1.8M',
    category: 'gaming',
    categoryName: 'Gaming & Esports',
    verified: true,
    bio: 'Pro Gamer | Streamer | Esports',
    posts: 892,
  },
  {
    id: 12,
    name: 'Meera Design',
    username: '@meeradesigns',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    followers: '534K',
    category: 'art',
    categoryName: 'UI/UX Design',
    verified: true,
    bio: 'UI/UX Designer | Digital Artist',
    posts: 423,
  },
];

export default function DiscoverPage() {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const { colorMode } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [followedCreators, setFollowedCreators] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<
    'foryou' | 'creators' | 'live' | 'hashtags'
  >('foryou');

  // Story viewer state
  const [viewingStory, setViewingStory] = useState<number | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Echo player state
  const [viewingEcho, setViewingEcho] = useState<(typeof echoes)[0] | null>(
    null
  );
  const [echoLiked, setEchoLiked] = useState(false);
  const [echoProgress, setEchoProgress] = useState(0);
  const [isEchoPaused, setIsEchoPaused] = useState(false);

  // Creation modal state
  const [showStoryCreator, setShowStoryCreator] = useState(false);
  const [showEchoCreator, setShowEchoCreator] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [storyCaption, setStoryCaption] = useState('');
  const [echoCaption, setEchoCaption] = useState('');
  const storyFileInputRef = useRef<HTMLInputElement>(null);
  const echoFileInputRef = useRef<HTMLInputElement>(null);

  // Touch gesture state
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const storyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const echoTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Story progress effect
  useEffect(() => {
    if (viewingStory !== null && !isPaused) {
      storyTimerRef.current = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            // Move to next story
            const currentIndex = stories.findIndex(
              (s) => s.id === viewingStory
            );
            if (currentIndex < stories.length - 1) {
              setViewingStory(stories[currentIndex + 1].id);
              return 0;
            } else {
              setViewingStory(null);
              return 0;
            }
          }
          return prev + 2;
        });
      }, 100);
    }
    return () => {
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
    };
  }, [viewingStory, isPaused]);

  // Echo progress effect
  useEffect(() => {
    if (viewingEcho && !isEchoPaused) {
      echoTimerRef.current = setInterval(() => {
        setEchoProgress((prev) => {
          if (prev >= 100) {
            return 0; // Loop the echo
          }
          return prev + 0.5;
        });
      }, 100);
    }
    return () => {
      if (echoTimerRef.current) clearInterval(echoTimerRef.current);
    };
  }, [viewingEcho, isEchoPaused]);

  // Story gesture handlers
  const handleStoryTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  }, []);

  const handleStoryTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      setIsPaused(false);

      // Swipe detection
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        const currentIndex = stories.findIndex((s) => s.id === viewingStory);
        if (deltaX < 0 && currentIndex < stories.length - 1) {
          // Swipe left - next story
          setViewingStory(stories[currentIndex + 1].id);
          setStoryProgress(0);
        } else if (deltaX > 0 && currentIndex > 0) {
          // Swipe right - previous story
          setViewingStory(stories[currentIndex - 1].id);
          setStoryProgress(0);
        }
      } else if (deltaY > 100) {
        // Swipe down - close
        setViewingStory(null);
        setStoryProgress(0);
      }
    },
    [viewingStory]
  );

  const handleStoryClick = useCallback(
    (e: React.MouseEvent) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const currentIndex = stories.findIndex((s) => s.id === viewingStory);

      if (clickX < rect.width / 3) {
        // Left third - previous
        if (currentIndex > 0) {
          setViewingStory(stories[currentIndex - 1].id);
          setStoryProgress(0);
        }
      } else if (clickX > (rect.width * 2) / 3) {
        // Right third - next
        if (currentIndex < stories.length - 1) {
          setViewingStory(stories[currentIndex + 1].id);
          setStoryProgress(0);
        } else {
          setViewingStory(null);
          setStoryProgress(0);
        }
      }
    },
    [viewingStory]
  );

  // Echo gesture handlers
  const handleEchoTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleEchoTouchEnd = useCallback((e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY.current;

    if (deltaY > 100) {
      // Swipe down - close
      setViewingEcho(null);
      setEchoProgress(0);
      setEchoLiked(false);
    }
  }, []);

  const handleEchoDoubleTap = useCallback(() => {
    setEchoLiked(true);
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || creator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFollowToggle = (creatorId: number) => {
    setFollowedCreators((prev) =>
      prev.includes(creatorId)
        ? prev.filter((id) => id !== creatorId)
        : [...prev, creatorId]
    );
  };

  const formatViewers = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <section
      id="discover"
      data-route="discover"
      className="active"
      style={{
        minHeight: '100vh',
        background: colorMode === 'dark' ? '#000' : '#f8f9fa',
        padding: '2rem 1rem',
      }}
    >
      <div
        className="container"
        style={{ maxWidth: '1400px', margin: '0 auto' }}
      >
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              background:
                'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Discover Amazing Creators
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '1.1rem' }}>
            Find and follow talented creators from around the world
          </p>
        </div>

        {/* Stories Carousel */}
        <div
          style={{
            background:
              colorMode === 'dark'
                ? 'rgba(26, 26, 26, 0.8)'
                : 'rgba(255, 255, 255, 0.9)',
            borderRadius: '20px',
            padding: '1.25rem',
            marginBottom: '1.5rem',
            border: `1px solid ${colorMode === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)'}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {/* Add Story Button */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                flexShrink: 0,
              }}
              onClick={() => setShowStoryCreator(true)}
            >
              <div
                style={{
                  width: '68px',
                  height: '68px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                }}
              >
                +
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                Add Story
              </span>
            </div>
            {/* Stories */}
            {stories.map((story) => (
              <div
                key={story.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
                onClick={() => setViewingStory(story.id)}
              >
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    padding: '3px',
                    background: story.isLive
                      ? 'linear-gradient(135deg, colors.status.error 0%, colors.brand.secondary 100%)'
                      : story.hasNew
                        ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                        : colorMode === 'dark'
                          ? '#333'
                          : '#e0e0e0',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={story.avatar}
                    alt={story.username}
                    width={62}
                    height={62}
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `3px solid ${colorMode === 'dark' ? '#000' : '#fff'}`,
                    }}
                  />
                  {story.isLive && (
                    <span
                      style={{
                        position: 'absolute',
                        bottom: '-2px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background:
                          'linear-gradient(135deg, colors.status.error 0%, colors.brand.secondary 100%)',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                      }}
                    >
                      Live
                    </span>
                  )}
                </div>
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: story.hasNew ? 'var(--fg)' : 'var(--muted)',
                    maxWidth: '68px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {story.username}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div
          style={{
            background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
            padding: '1.5rem',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            border: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
          }}
        >
          <input
            type="search"
            placeholder="Search creators, topics, hashtags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem',
              border: `2px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
              borderRadius: '12px',
              background: colorMode === 'dark' ? '#0a0a0a' : '#f8f9fa',
              color: colorMode === 'dark' ? '#fff' : '#000',
              fontSize: '1rem',
              outline: 'none',
              transition: 'all 0.2s',
            }}
            onFocus={(e) =>
              (e.currentTarget.style.borderColor = 'colors.brand.primary')
            }
            onBlur={(e) =>
              (e.currentTarget.style.borderColor =
                colorMode === 'dark' ? '#333' : '#e0e0e0')
            }
          />
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '2rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {[
            { id: 'foryou', label: 'For You', icon: '✨' },
            { id: 'creators', label: 'Creators', icon: '👥' },
            { id: 'live', label: 'Live', icon: '🔴' },
            { id: 'hashtags', label: 'Trending', icon: '#' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '0.75rem 1.5rem',
                background:
                  activeTab === tab.id
                    ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                    : colorMode === 'dark'
                      ? 'rgba(26, 26, 26, 0.8)'
                      : 'rgba(255, 255, 255, 0.9)',
                border: `2px solid ${activeTab === tab.id ? 'transparent' : colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                borderRadius: '999px',
                color: activeTab === tab.id ? 'white' : 'var(--fg)',
                fontSize: '0.95rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap',
                boxShadow:
                  activeTab === tab.id
                    ? '0 4px 15px rgba(102, 126, 234, 0.4)'
                    : 'none',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* For You Tab */}
        {activeTab === 'foryou' && (
          <>
            {/* Echoes Section */}
            <div style={{ marginBottom: '2.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      background:
                        'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    📢
                  </span>{' '}
                  Echoes
                </h2>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  See All →
                </button>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  overflowX: 'auto',
                  paddingBottom: '0.5rem',
                }}
              >
                {/* Create Echo Button */}
                <div
                  onClick={() => setShowEchoCreator(true)}
                  style={{
                    flexShrink: 0,
                    width: '160px',
                    height: '280px',
                    borderRadius: '16px',
                    background:
                      'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '0.75rem',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow =
                      '0 8px 25px rgba(102, 126, 234, 0.6)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow =
                      '0 4px 15px rgba(102, 126, 234, 0.4)';
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      color: 'white',
                    }}
                  >
                    +
                  </div>
                  <span
                    style={{
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    Create Echo
                  </span>
                  <span
                    style={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '0.75rem',
                      textAlign: 'center',
                      padding: '0 0.5rem',
                    }}
                  >
                    Share a moment
                  </span>
                </div>
                {echoes.map((echo) => (
                  <div
                    key={echo.id}
                    style={{
                      flexShrink: 0,
                      width: '160px',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'transform 0.3s',
                    }}
                    onClick={() => {
                      setViewingEcho(echo);
                      setEchoProgress(0);
                      setEchoLiked(false);
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = 'scale(1.05)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = 'scale(1)')
                    }
                  >
                    <Image
                      src={echo.thumbnail}
                      alt={echo.username}
                      width={160}
                      height={280}
                      style={{
                        objectFit: 'cover',
                        width: '100%',
                        height: '280px',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background:
                          'linear-gradient(transparent, rgba(0,0,0,0.8))',
                        padding: '2rem 0.75rem 0.75rem',
                        color: 'white',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                        @{echo.username}
                      </div>
                      <div
                        style={{
                          fontSize: '0.7rem',
                          opacity: 0.8,
                          display: 'flex',
                          gap: '0.5rem',
                        }}
                      >
                        <span>▶ {echo.views}</span>
                        <span>♥ {echo.likes}</span>
                      </div>
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 600,
                      }}
                    >
                      {echo.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* For You Recommendations */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                ✨ Recommended For You
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}
              >
                {forYouRecommendations.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 24px rgba(102, 126, 234, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {item.type === 'creator' ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <Image
                          src={item.avatar!}
                          alt={item.name}
                          width={56}
                          height={56}
                          style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: 'var(--muted)',
                            }}
                          >
                            {item.username}
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'var(--accent)',
                              marginTop: '0.25rem',
                            }}
                          >
                            {item.followers} followers
                          </div>
                        </div>
                        <button
                          style={{
                            background:
                              'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                            border: 'none',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Follow
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                        }}
                      >
                        <div
                          style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background:
                              'linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                          }}
                        >
                          {item.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                            {item.name}
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: 'var(--muted)',
                            }}
                          >
                            {item.posts} posts
                          </div>
                        </div>
                        <button
                          style={{
                            background:
                              colorMode === 'dark' ? '#333' : '#f0f0f0',
                            border: 'none',
                            color: 'var(--fg)',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Explore
                        </button>
                      </div>
                    )}
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--accent)',
                        marginTop: '0.75rem',
                        paddingTop: '0.75rem',
                        borderTop: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                      }}
                    >
                      💡 {item.reason}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div style={{ marginBottom: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem',
                }}
              >
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  📅 Upcoming Events
                </h2>
                <button
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  View Calendar →
                </button>
              </div>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1rem',
                }}
              >
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <Image
                        src={event.thumbnail}
                        alt={event.title}
                        width={400}
                        height={160}
                        style={{
                          width: '100%',
                          height: '140px',
                          objectFit: 'cover',
                        }}
                      />
                      <span
                        style={{
                          position: 'absolute',
                          top: '0.75rem',
                          right: '0.75rem',
                          background: 'rgba(102, 126, 234, 0.9)',
                          color: 'white',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {event.category}
                      </span>
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <h3
                        style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                        }}
                      >
                        {event.title}
                      </h3>
                      <div
                        style={{
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                          marginBottom: '0.75rem',
                        }}
                      >
                        Hosted by {event.host}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div style={{ fontSize: '0.85rem' }}>
                          <span
                            style={{ color: 'var(--accent)', fontWeight: 600 }}
                          >
                            {event.date}
                          </span>{' '}
                          • {event.time}
                        </div>
                        <div
                          style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
                        >
                          {event.attendees.toLocaleString()} interested
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Live Tab */}
        {activeTab === 'live' && (
          <>
            {/* Live Now */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    background: 'colors.status.error',
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite',
                  }}
                ></span>
                Live Now
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                  gap: '1.5rem',
                }}
              >
                {liveCreators.map((creator) => (
                  <div
                    key={creator.id}
                    style={{
                      background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                      border: `2px solid ${colorMode === 'dark' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                      borderRadius: '20px',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow =
                        '0 12px 32px rgba(239, 68, 68, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        background:
                          'linear-gradient(90deg, colors.status.error 0%, colors.brand.secondary 100%)',
                      }}
                    ></div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1rem',
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <Image
                          src={creator.avatar}
                          alt={creator.name}
                          width={60}
                          height={60}
                          style={{
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid colors.status.error',
                          }}
                        />
                        <span
                          style={{
                            position: 'absolute',
                            bottom: '-4px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'colors.status.error',
                            color: 'white',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                          }}
                        >
                          LIVE
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                          {creator.name}
                        </div>
                        <div
                          style={{ fontSize: '0.85rem', color: 'var(--muted)' }}
                        >
                          {creator.username}
                        </div>
                      </div>
                      <div
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: 'colors.status.error',
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        👁 {formatViewers(creator.viewers)}
                      </div>
                    </div>
                    <h3
                      style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        marginBottom: '0.75rem',
                        lineHeight: 1.4,
                      }}
                    >
                      {creator.title}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          background: 'rgba(102, 126, 234, 0.1)',
                          color: 'colors.brand.primary',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '999px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {creator.category}
                      </span>
                      <button
                        style={{
                          background:
                            'linear-gradient(135deg, colors.status.error 0%, colors.brand.secondary 100%)',
                          border: 'none',
                          color: 'white',
                          padding: '0.6rem 1.25rem',
                          borderRadius: '10px',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                        }}
                      >
                        Watch Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                📅 Coming Up Next
              </h2>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '1rem',
                }}
              >
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    style={{
                      background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow =
                        '0 8px 24px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            marginBottom: '0.25rem',
                          }}
                        >
                          {event.title}
                        </h3>
                        <div
                          style={{ fontSize: '0.85rem', color: 'var(--muted)' }}
                        >
                          by {event.host}
                        </div>
                      </div>
                      <span
                        style={{
                          background:
                            'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                          color: 'white',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.7rem',
                          fontWeight: 600,
                        }}
                      >
                        {event.category}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div style={{ fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: 600 }}>{event.date}</span> •{' '}
                        {event.time}
                      </div>
                      <button
                        style={{
                          background: colorMode === 'dark' ? '#333' : '#f0f0f0',
                          border: 'none',
                          color: 'var(--fg)',
                          padding: '0.5rem 1rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        Set Reminder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'creators' && (
          <>
            {/* Categories */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
              }}
            >
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.5rem 1.25rem',
                    background:
                      selectedCategory === cat.id
                        ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                        : colorMode === 'dark'
                          ? '#1a1a1a'
                          : '#fff',
                    color:
                      selectedCategory === cat.id
                        ? '#fff'
                        : colorMode === 'dark'
                          ? '#fff'
                          : '#000',
                    border: `2px solid ${selectedCategory === cat.id ? 'transparent' : colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.borderColor =
                        'colors.brand.primary';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.borderColor =
                        colorMode === 'dark' ? '#333' : '#e0e0e0';
                    }
                  }}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>

            {/* Creators Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem',
              }}
            >
              {filteredCreators.map((creator) => (
                <div
                  key={creator.id}
                  style={{
                    background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                    border: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                    borderRadius: '16px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow =
                      '0 12px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Image
                    src={creator.avatar}
                    alt={creator.name}
                    width={100}
                    height={100}
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                      margin: '0 auto 1rem',
                      border: '4px solid var(--accent)',
                    }}
                  />
                  <h3
                    style={{
                      margin: '0 0 0.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      fontSize: '1.25rem',
                      fontWeight: 700,
                    }}
                  >
                    {creator.name}
                    {creator.verified && (
                      <span
                        style={{ color: 'var(--accent)', fontSize: '1.1rem' }}
                      >
                        ✓
                      </span>
                    )}
                  </h3>
                  <p
                    style={{
                      color: 'var(--muted)',
                      margin: '0 0 0.75rem',
                      fontSize: '0.9rem',
                    }}
                  >
                    {creator.username}
                  </p>
                  <p
                    style={{
                      color: 'var(--muted)',
                      margin: '0 0 0.5rem',
                      fontSize: '0.85rem',
                    }}
                  >
                    {creator.bio}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      justifyContent: 'center',
                      margin: '1rem 0',
                      padding: '1rem 0',
                      borderTop: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                      borderBottom: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'var(--accent)',
                        }}
                      >
                        {creator.followers}
                      </div>
                      <div
                        style={{ fontSize: '0.75rem', color: 'var(--muted)' }}
                      >
                        Followers
                      </div>
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '1.25rem',
                          fontWeight: 700,
                          color: 'var(--accent)',
                        }}
                      >
                        {creator.posts}
                      </div>
                      <div
                        style={{ fontSize: '0.75rem', color: 'var(--muted)' }}
                      >
                        Posts
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      display: 'inline-block',
                      background: 'rgba(102, 126, 234, 0.1)',
                      color: 'colors.brand.primary',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '999px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      marginBottom: '1rem',
                    }}
                  >
                    {creator.categoryName}
                  </span>
                  <button
                    onClick={() => handleFollowToggle(creator.id)}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1.5rem',
                      background: followedCreators.includes(creator.id)
                        ? 'var(--muted)'
                        : 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (!followedCreators.includes(creator.id)) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow =
                          '0 4px 12px rgba(102, 126, 234, 0.4)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {followedCreators.includes(creator.id)
                      ? '✓ Following'
                      : '+ Follow'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'hashtags' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {trendingHashtags.map((hashtag, idx) => (
              <div
                key={idx}
                style={{
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  border: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`,
                  borderRadius: '16px',
                  padding: '2rem',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow =
                    '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {hashtag.tag}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {hashtag.posts}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                      Posts
                    </div>
                  </div>
                  <div
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      color: '#10b981',
                      padding: '0.5rem 1rem',
                      borderRadius: '999px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    {hashtag.growth} ↗
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: '2px solid var(--accent)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--accent)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                >
                  Explore Posts
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {viewingStory !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
          }}
          onTouchStart={handleStoryTouchStart}
          onTouchEnd={handleStoryTouchEnd}
          onClick={handleStoryClick}
        >
          {/* Progress bars */}
          <div
            style={{
              display: 'flex',
              gap: '4px',
              padding: '12px 12px 8px',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            {stories.map((story, i) => {
              const currentIndex = stories.findIndex(
                (s) => s.id === viewingStory
              );
              return (
                <div
                  key={story.id}
                  style={{
                    flex: 1,
                    height: '3px',
                    background: 'rgba(255,255,255,0.3)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'white',
                      borderRadius: '2px',
                      width:
                        i < currentIndex
                          ? '100%'
                          : i === currentIndex
                            ? `${storyProgress}%`
                            : '0%',
                      transition: 'width 0.1s linear',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Story header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '48px 16px 16px',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 10,
            }}
          >
            <Image
              src={stories.find((s) => s.id === viewingStory)?.avatar || ''}
              alt=""
              width={40}
              height={40}
              style={{ borderRadius: '50%', border: '2px solid white' }}
            />
            <span style={{ color: 'white', fontWeight: 600, flex: 1 }}>
              {stories.find((s) => s.id === viewingStory)?.username}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewingStory(null);
                setStoryProgress(0);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '8px',
              }}
            >
              ✕
            </button>
          </div>

          {/* Story content */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `url(${stories.find((s) => s.id === viewingStory)?.avatar})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(30px)',
              position: 'absolute',
              inset: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src={stories.find((s) => s.id === viewingStory)?.avatar || ''}
              alt=""
              width={300}
              height={300}
              style={{ borderRadius: '20px', objectFit: 'cover' }}
            />
          </div>

          {/* Navigation hint */}
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
              textAlign: 'center',
            }}
          >
            Tap sides to navigate • Swipe down to close
          </div>
        </div>
      )}

      {/* Echo Player Modal */}
      {viewingEcho && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
          }}
          onTouchStart={handleEchoTouchStart}
          onTouchEnd={handleEchoTouchEnd}
          onDoubleClick={handleEchoDoubleTap}
        >
          {/* Echo content */}
          <div
            style={{
              flex: 1,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <video
              src={viewingEcho.video}
              autoPlay
              loop
              muted
              playsInline
              poster={viewingEcho.thumbnail}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Like animation */}
            {echoLiked && (
              <div
                style={{
                  position: 'absolute',
                  fontSize: '5rem',
                  animation: 'likePopup 0.6s ease-out forwards',
                  pointerEvents: 'none',
                }}
              >
                ❤️
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => {
                setViewingEcho(null);
                setEchoProgress(0);
                setEchoLiked(false);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: 'white',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '50%',
              }}
            >
              ✕
            </button>

            {/* Side actions */}
            <div
              style={{
                position: 'absolute',
                right: '16px',
                bottom: '120px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                alignItems: 'center',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEchoLiked(!echoLiked);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>
                  {echoLiked ? '❤️' : '🤍'}
                </span>
                <span style={{ color: 'white', fontSize: '0.75rem' }}>
                  {viewingEcho.likes}
                </span>
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>💬</span>
                <span style={{ color: 'white', fontSize: '0.75rem' }}>
                  Comment
                </span>
              </button>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span style={{ fontSize: '1.75rem' }}>📤</span>
                <span style={{ color: 'white', fontSize: '0.75rem' }}>
                  Share
                </span>
              </button>
            </div>

            {/* Bottom info */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                padding: '60px 16px 24px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                }}
              >
                <Image
                  src={viewingEcho.avatar}
                  alt={viewingEcho.username}
                  width={40}
                  height={40}
                  style={{ borderRadius: '50%', border: '2px solid white' }}
                />
                <span style={{ color: 'white', fontWeight: 600 }}>
                  @{viewingEcho.username}
                </span>
                <button
                  style={{
                    background: 'transparent',
                    border: '1px solid white',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Follow
                </button>
              </div>
              <p style={{ color: 'white', fontSize: '0.9rem', margin: 0 }}>
                {viewingEcho.caption}
              </p>
            </div>

            {/* Progress bar */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'rgba(255,255,255,0.3)',
              }}
            >
              <div
                style={{
                  height: '100%',
                  background: 'white',
                  width: `${echoProgress}%`,
                  transition: 'width 0.1s linear',
                }}
              />
            </div>
          </div>

          {/* Gesture hint */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '0.75rem',
              textAlign: 'center',
            }}
          >
            Double-tap to like • Swipe down to close
          </div>
        </div>
      )}

      {/* Story Creator Modal */}
      {showStoryCreator && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: colorMode === 'dark' ? '#1a1a2e' : '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Create Story
              </h2>
              <button
                onClick={() => {
                  setShowStoryCreator(false);
                  setSelectedMedia(null);
                  setStoryCaption('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                }}
              >
                x
              </button>
            </div>

            {!selectedMedia ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {/* Gallery Option */}
                <input
                  type="file"
                  ref={storyFileInputRef}
                  accept="image/*,video/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setSelectedMedia(url);
                      setMediaType(
                        file.type.startsWith('video') ? 'video' : 'image'
                      );
                    }
                  }}
                />
                <button
                  onClick={() => storyFileInputRef.current?.click()}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: `2px dashed ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                    background:
                      colorMode === 'dark'
                        ? 'rgba(167, 139, 250, 0.1)'
                        : 'rgba(139, 92, 246, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>🖼️</span>
                  <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
                    Choose from Gallery
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Select photo or video
                  </span>
                </button>

                {/* Camera Option */}
                <button
                  onClick={() => {
                    // Camera capture
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setSelectedMedia(url);
                        setMediaType('image');
                      }
                    };
                    input.click();
                  }}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: `2px dashed ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                    background:
                      colorMode === 'dark'
                        ? 'rgba(167, 139, 250, 0.1)'
                        : 'rgba(139, 92, 246, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>📸</span>
                  <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
                    Take Photo
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Use camera
                  </span>
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {/* Preview */}
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: '9/16',
                    maxHeight: '300px',
                    background: '#000',
                  }}
                >
                  {mediaType === 'video' ? (
                    <video
                      src={selectedMedia}
                      controls
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <img
                      src={selectedMedia}
                      alt="Preview"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  )}
                </div>

                {/* Caption */}
                <textarea
                  value={storyCaption}
                  onChange={(e) => setStoryCaption(e.target.value)}
                  placeholder="Add a caption..."
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `1px solid ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                    background:
                      colorMode === 'dark'
                        ? 'rgba(30, 20, 50, 0.8)'
                        : 'rgba(255, 255, 255, 0.9)',
                    color: 'var(--fg)',
                    resize: 'none',
                    height: '80px',
                    fontSize: '0.9rem',
                  }}
                />

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: `1px solid ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                      background: 'transparent',
                      color: 'var(--fg)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Change
                  </button>
                  <button
                    onClick={() => {
                      // Here you would upload the story
                      alert('Story created! (Demo mode)');
                      setShowStoryCreator(false);
                      setSelectedMedia(null);
                      setStoryCaption('');
                    }}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: 'none',
                      background:
                        'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    Share Story
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Echo Creator Modal */}
      {showEchoCreator && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: colorMode === 'dark' ? '#1a1a2e' : '#ffffff',
              borderRadius: '20px',
              padding: '2rem',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '90vh',
              overflow: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Create Echo
              </h2>
              <button
                onClick={() => {
                  setShowEchoCreator(false);
                  setSelectedMedia(null);
                  setEchoCaption('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: 'var(--muted)',
                }}
              >
                x
              </button>
            </div>

            {!selectedMedia ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {/* Video from Gallery */}
                <input
                  type="file"
                  ref={echoFileInputRef}
                  accept="video/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      setSelectedMedia(url);
                      setMediaType('video');
                    }
                  }}
                />
                <button
                  onClick={() => echoFileInputRef.current?.click()}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: `2px dashed ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                    background:
                      colorMode === 'dark'
                        ? 'rgba(167, 139, 250, 0.1)'
                        : 'rgba(139, 92, 246, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>🎬</span>
                  <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
                    Choose Video
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Select from gallery
                  </span>
                </button>

                {/* Record Video */}
                <button
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'video/*';
                    input.capture = 'environment';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setSelectedMedia(url);
                        setMediaType('video');
                      }
                    };
                    input.click();
                  }}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    border: `2px dashed ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.3)'}`,
                    background:
                      colorMode === 'dark'
                        ? 'rgba(167, 139, 250, 0.1)'
                        : 'rgba(139, 92, 246, 0.05)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.75rem',
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>🎥</span>
                  <span style={{ fontWeight: 600, color: 'var(--fg)' }}>
                    Record Video
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    Use camera
                  </span>
                </button>

                {/* Tips */}
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background:
                      colorMode === 'dark'
                        ? 'rgba(102, 126, 234, 0.1)'
                        : 'rgba(102, 126, 234, 0.05)',
                    border: `1px solid ${colorMode === 'dark' ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.1)'}`,
                  }}
                >
                  <p
                    style={{
                      fontSize: '0.8rem',
                      color: 'var(--muted)',
                      margin: 0,
                    }}
                  >
                    <strong style={{ color: 'var(--accent)' }}>Tips:</strong>{' '}
                    Best echoes are 15-60 seconds. Vertical videos work best!
                  </p>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {/* Video Preview */}
                <div
                  style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    aspectRatio: '9/16',
                    maxHeight: '300px',
                    background: '#000',
                  }}
                >
                  <video
                    src={selectedMedia}
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Caption */}
                <textarea
                  value={echoCaption}
                  onChange={(e) => setEchoCaption(e.target.value)}
                  placeholder="Write a caption..."
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: `1px solid ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                    background:
                      colorMode === 'dark'
                        ? 'rgba(30, 20, 50, 0.8)'
                        : 'rgba(255, 255, 255, 0.9)',
                    color: 'var(--fg)',
                    resize: 'none',
                    height: '80px',
                    fontSize: '0.9rem',
                  }}
                />

                {/* Tags Suggestion */}
                <div
                  style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}
                >
                  {['#trending', '#viral', '#fyp', '#echo'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setEchoCaption((prev) => prev + ' ' + tag)}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '20px',
                        border: 'none',
                        background:
                          colorMode === 'dark'
                            ? 'rgba(167, 139, 250, 0.2)'
                            : 'rgba(139, 92, 246, 0.1)',
                        color: 'var(--accent)',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: `1px solid ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                      background: 'transparent',
                      color: 'var(--fg)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Change
                  </button>
                  <button
                    onClick={() => {
                      alert('Echo created! (Demo mode)');
                      setShowEchoCreator(false);
                      setSelectedMedia(null);
                      setEchoCaption('');
                    }}
                    style={{
                      flex: 2,
                      padding: '0.75rem',
                      borderRadius: '12px',
                      border: 'none',
                      background:
                        'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                    }}
                  >
                    Post Echo
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes likePopup {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
