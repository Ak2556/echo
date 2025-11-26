'use client';

import Image from 'next/image';
import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';

type LiveTab = 'live' | 'upcoming' | 'replays';

interface LiveStream {
  id: number;
  title: string;
  streamer: string;
  viewers: number;
  thumbnail: string;
  avatar: string;
  duration: string;
  category: string;
  isLive: boolean;
  scheduledFor?: string;
  views?: number;
  likes?: number;
  description?: string;
  tags?: string[];
}

export default function LivePage() {
  const { t } = useLanguage();
  const { colorMode } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState<LiveTab>('live');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchingStream, setWatchingStream] = useState<LiveStream | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<
    { user: string; message: string; time: string }[]
  >([
    { user: 'Rahul K', message: 'Great stream! 🔥', time: '2m ago' },
    { user: 'Priya S', message: 'Love this content!', time: '1m ago' },
    { user: 'Amit J', message: 'Can you explain that again?', time: '30s ago' },
  ]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);

  // Live streams data
  const liveStreams: LiveStream[] = [
    {
      id: 1,
      title: 'Advanced React Hooks & State Management Tutorial',
      streamer: 'Prateek Singh',
      viewers: 3456,
      thumbnail:
        'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
      duration: '1:23:45',
      category: 'Education',
      isLive: true,
      likes: 1234,
      description:
        'Learn advanced React patterns and state management techniques',
      tags: ['React', 'JavaScript', 'WebDev'],
    },
    {
      id: 2,
      title: 'BGMI Tournament Finals - ₹50,000 Prize Pool',
      streamer: 'GamerXtreme',
      viewers: 12453,
      thumbnail:
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face',
      duration: '2:45:12',
      category: 'Gaming',
      isLive: true,
      likes: 4521,
      description: 'Watch the most intense BGMI tournament of the season',
      tags: ['BGMI', 'Tournament', 'Gaming'],
    },
    {
      id: 3,
      title: 'Morning Yoga Flow for Beginners',
      streamer: 'Anjali Mehta',
      viewers: 2341,
      thumbnail:
        'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face',
      duration: '0:45:32',
      category: 'Fitness',
      isLive: true,
      likes: 892,
      description: 'Start your day with energizing yoga practice',
      tags: ['Yoga', 'Fitness', 'Wellness'],
    },
    {
      id: 4,
      title: 'Indian Classical Music - Raag Bhairavi',
      streamer: 'Pandit Arjun Sharma',
      viewers: 1876,
      thumbnail:
        'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
      duration: '3:12:08',
      category: 'Music',
      isLive: true,
      likes: 654,
      description: 'Experience the beauty of classical Indian raag',
      tags: ['Classical', 'Music', 'Live'],
    },
    {
      id: 5,
      title: 'Live Stock Market Analysis & Trading Tips',
      streamer: 'Vikram Patel',
      viewers: 5432,
      thumbnail:
        'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face',
      duration: '1:56:23',
      category: 'Business',
      isLive: true,
      likes: 2134,
      description: 'Real-time market analysis and investment strategies',
      tags: ['Trading', 'Finance', 'Stocks'],
    },
    {
      id: 6,
      title: 'Authentic Butter Chicken Recipe - Restaurant Style',
      streamer: 'Chef Sanjeev Kapoor',
      viewers: 4234,
      thumbnail:
        'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=40&h=40&fit=crop&crop=face',
      duration: '1:12:34',
      category: 'Food',
      isLive: true,
      likes: 1876,
      description: 'Learn to cook the perfect butter chicken at home',
      tags: ['Cooking', 'Recipe', 'Indian'],
    },
    {
      id: 7,
      title: 'Digital Art Speed Paint - Fantasy Landscape',
      streamer: 'Artista Priya',
      viewers: 1543,
      thumbnail:
        'https://images.unsplash.com/photo-1561998338-13ad7883b20f?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
      duration: '2:23:45',
      category: 'Art',
      isLive: true,
      likes: 743,
      description: 'Watch me create a stunning fantasy landscape from scratch',
      tags: ['Art', 'Digital', 'Painting'],
    },
    {
      id: 8,
      title: 'JEE Advanced Math - Calculus Problem Solving',
      streamer: 'Sharma Classes',
      viewers: 6789,
      thumbnail:
        'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face',
      duration: '2:00:00',
      category: 'Education',
      isLive: true,
      likes: 3245,
      description: 'Master calculus for JEE Advanced with solved examples',
      tags: ['JEE', 'Math', 'Education'],
    },
    {
      id: 9,
      title: 'Travel Vlog: Exploring Ladakh - Day 3',
      streamer: 'Nomadic Rahul',
      viewers: 3421,
      thumbnail:
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop&crop=face',
      duration: '1:34:21',
      category: 'Travel',
      isLive: true,
      likes: 1432,
      description: 'Live from the beautiful mountains of Ladakh',
      tags: ['Travel', 'Adventure', 'Ladakh'],
    },
    {
      id: 10,
      title: 'Bollywood Dance Workout - 500 Calorie Burn',
      streamer: 'Nisha Fitness',
      viewers: 2987,
      thumbnail:
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=40&h=40&fit=crop&crop=face',
      duration: '0:52:15',
      category: 'Fitness',
      isLive: true,
      likes: 1234,
      description: 'High-energy Bollywood dance fitness session',
      tags: ['Dance', 'Workout', 'Bollywood'],
    },
  ];

  // Upcoming sessions
  const upcomingStreams: LiveStream[] = [
    {
      id: 11,
      title: 'Python for Data Science - Complete Bootcamp',
      streamer: 'CodeWithHarry',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop&crop=face',
      duration: '',
      category: 'Education',
      isLive: false,
      scheduledFor: 'Today at 6:00 PM',
      description: 'Complete Python bootcamp for data science beginners',
    },
    {
      id: 12,
      title: 'PUBG Mobile Scrims - Competitive Practice',
      streamer: 'MortaL',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=40&h=40&fit=crop&crop=face',
      duration: '',
      category: 'Gaming',
      isLive: false,
      scheduledFor: 'Today at 8:00 PM',
    },
    {
      id: 13,
      title: 'Investment Strategies for 2025',
      streamer: 'Zerodha Varsity',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1556157382-97eda2d62296?w=40&h=40&fit=crop&crop=face',
      duration: '',
      category: 'Business',
      isLive: false,
      scheduledFor: 'Tomorrow at 10:00 AM',
    },
    {
      id: 14,
      title: 'Evening Meditation & Mindfulness',
      streamer: 'Zen Master Ravi',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=40&h=40&fit=crop&crop=face',
      duration: '',
      category: 'Wellness',
      isLive: false,
      scheduledFor: 'Tomorrow at 7:00 PM',
    },
    {
      id: 15,
      title: 'Guitar Masterclass - Fingerstyle Techniques',
      streamer: 'Siddharth Arora',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=40&h=40&fit=crop&crop=face',
      duration: '',
      category: 'Music',
      isLive: false,
      scheduledFor: 'Dec 25 at 5:00 PM',
    },
  ];

  // Past recordings/replays
  const replays: LiveStream[] = [
    {
      id: 21,
      title: 'Complete Web Development Roadmap 2025',
      streamer: 'Tanay Pratap',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1539571639894-cc40c5c1aa04?w=40&h=40&fit=crop&crop=face',
      duration: '3:24:12',
      category: 'Education',
      isLive: false,
      views: 145230,
      likes: 12453,
      description: 'Complete roadmap to become a full-stack developer',
    },
    {
      id: 22,
      title: 'IPL Auction 2025 - Live Analysis & Reactions',
      streamer: 'Cricket Crazy',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=40&h=40&fit=crop&crop=face',
      duration: '5:12:45',
      category: 'Sports',
      isLive: false,
      views: 234567,
      likes: 23456,
    },
    {
      id: 23,
      title: 'Traditional Rajasthani Thali Cooking',
      streamer: 'Cooking with Nisha',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face',
      duration: '2:15:30',
      category: 'Food',
      isLive: false,
      views: 98765,
      likes: 8976,
    },
    {
      id: 24,
      title: 'Full Body HIIT Workout - No Equipment',
      streamer: 'Fit India Movement',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=40&h=40&fit=crop&crop=face',
      duration: '0:45:00',
      category: 'Fitness',
      isLive: false,
      views: 67543,
      likes: 5432,
    },
    {
      id: 25,
      title: 'Photoshop CC 2025 - Complete Tutorial',
      streamer: 'Design School',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1546820389-44d77e1f3b31?w=40&h=40&fit=crop&crop=face',
      duration: '4:30:15',
      category: 'Art',
      isLive: false,
      views: 156789,
      likes: 14567,
    },
    {
      id: 26,
      title: 'NEET Biology - Human Physiology Marathon',
      streamer: 'Unacademy NEET',
      viewers: 0,
      thumbnail:
        'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&h=225&fit=crop',
      avatar:
        'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=40&h=40&fit=crop&crop=face',
      duration: '6:00:00',
      category: 'Education',
      isLive: false,
      views: 234890,
      likes: 21345,
    },
  ];

  const categories = [
    'All',
    'Education',
    'Gaming',
    'Music',
    'Food',
    'Fitness',
    'Business',
    'Art',
    'Travel',
    'Sports',
    'Wellness',
  ];

  // Get current data based on active tab
  const getCurrentStreams = () => {
    switch (activeTab) {
      case 'live':
        return liveStreams;
      case 'upcoming':
        return upcomingStreams;
      case 'replays':
        return replays;
      default:
        return liveStreams;
    }
  };

  // Filter streams
  const filteredStreams = useMemo(() => {
    let streams = getCurrentStreams();

    // Filter by category
    if (selectedCategory !== 'All') {
      streams = streams.filter(
        (stream) => stream.category === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      streams = streams.filter(
        (stream) =>
          stream.title.toLowerCase().includes(query) ||
          stream.streamer.toLowerCase().includes(query) ||
          stream.category.toLowerCase().includes(query)
      );
    }

    return streams;
  }, [activeTab, selectedCategory, searchQuery]);

  return (
    <section id="live" data-route="live" className="active">
      <div
        className="container"
        style={{ maxWidth: '1400px', margin: '0 auto', padding: '1rem' }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: '0 0 0.5rem',
                fontSize: '2rem',
                fontWeight: 700,
                background:
                  'linear-gradient(135deg, var(--accent) 0%, #E91E63 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {activeTab === 'live'
                ? '🔴 Live Now'
                : activeTab === 'upcoming'
                  ? '📅 Upcoming Sessions'
                  : '🎬 Replays'}
            </h2>
            <p
              style={{
                margin: 0,
                color: colorMode === 'dark' ? '#999' : '#666',
                fontSize: '0.95rem',
              }}
            >
              {activeTab === 'live' &&
                `${filteredStreams.length} live streams • ${liveStreams.reduce((acc, s) => acc + s.viewers, 0).toLocaleString()} watching now`}
              {activeTab === 'upcoming' &&
                `${filteredStreams.length} upcoming sessions scheduled`}
              {activeTab === 'replays' &&
                `${filteredStreams.length} past recordings available`}
            </p>
          </div>

          <button
            className="btn glass"
            onClick={async () => {
              try {
                if (
                  !navigator.mediaDevices ||
                  !navigator.mediaDevices.getUserMedia
                ) {
                  alert(
                    'Your browser does not support camera/microphone access. Please use a modern browser like Chrome, Firefox, or Safari.'
                  );
                  return;
                }

                const title = prompt('Enter stream title:');
                if (!title) return;

                const stream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                  audio: true,
                });

                stream.getTracks().forEach((track) => track.stop());

                alert(
                  `🔴 Ready to go live: "${title}"\n\nIn a production app, this would:\n• Start your live stream\n• Enable real-time chat\n• Notify your followers\n• Show viewer analytics`
                );
              } catch (error) {
                alert(
                  'Could not access camera/microphone. Please ensure:\n• You granted permission\n• No other app is using your camera\n• Your device has a camera and microphone'
                );
              }
            }}
            style={{
              padding: '0.875rem 1.75rem',
              background: 'linear-gradient(135deg, #FF4136 0%, #FF851B 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(255, 65, 54, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow =
                '0 6px 20px rgba(255, 65, 54, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 15px rgba(255, 65, 54, 0.3)';
            }}
          >
            🔴 Go Live
          </button>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            borderBottom: `2px solid ${colorMode === 'dark' ? '#333' : '#eee'}`,
            overflowX: 'auto',
          }}
        >
          {(['live', 'upcoming', 'replays'] as LiveTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'transparent',
                color:
                  activeTab === tab
                    ? 'var(--accent)'
                    : colorMode === 'dark'
                      ? '#999'
                      : '#666',
                border: 'none',
                borderBottom:
                  activeTab === tab
                    ? '3px solid var(--accent)'
                    : '3px solid transparent',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 600 : 400,
                fontSize: '1rem',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                marginBottom: '-2px',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color =
                    colorMode === 'dark' ? '#ccc' : '#333';
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab) {
                  e.currentTarget.style.color =
                    colorMode === 'dark' ? '#999' : '#666';
                }
              }}
            >
              {tab === 'live' && '🔴 Live Now'}
              {tab === 'upcoming' && '📅 Upcoming'}
              {tab === 'replays' && '🎬 Replays'}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            placeholder="Search streams, creators, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: '1 1 300px',
              padding: '0.875rem 1.25rem',
              border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
              borderRadius: '12px',
              background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
              color: 'var(--fg)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.2s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.boxShadow =
                '0 0 0 3px rgba(124, 58, 237, 0.1)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor =
                colorMode === 'dark' ? '#333' : '#ddd';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap',
              flex: '1 1 auto',
            }}
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: '0.625rem 1.125rem',
                  background:
                    selectedCategory === category
                      ? 'linear-gradient(135deg, var(--accent) 0%, #E91E63 100%)'
                      : colorMode === 'dark'
                        ? '#1a1a1a'
                        : '#f5f5f5',
                  color: selectedCategory === category ? 'white' : 'var(--fg)',
                  border: 'none',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: selectedCategory === category ? 600 : 400,
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background =
                      colorMode === 'dark' ? '#252525' : '#eee';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category) {
                    e.currentTarget.style.background =
                      colorMode === 'dark' ? '#1a1a1a' : '#f5f5f5';
                  }
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Streams Grid */}
        {filteredStreams.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: colorMode === 'dark' ? '#666' : '#999',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ margin: '0 0 0.5rem', color: 'var(--fg)' }}>
              No streams found
            </h3>
            <p>Try adjusting your filters or search query</p>
          </div>
        ) : (
          <div
            className="live-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {filteredStreams.map((stream) => (
              <div
                key={stream.id}
                className="live-card glass"
                onClick={() => {
                  setWatchingStream(stream);
                  setViewerCount(stream.viewers);
                  setIsFollowing(false);
                }}
                style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                  border: `1px solid ${colorMode === 'dark' ? '#252525' : '#eee'}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow =
                    colorMode === 'dark'
                      ? '0 12px 30px rgba(0, 0, 0, 0.5)'
                      : '0 12px 30px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Thumbnail */}
                <div
                  style={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    background: '#000',
                  }}
                >
                  <Image
                    src={stream.thumbnail}
                    alt={stream.title}
                    width={400}
                    height={225}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />

                  {/* Live Badge */}
                  {stream.isLive && activeTab === 'live' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        left: '0.75rem',
                        background:
                          'linear-gradient(135deg, #FF4136 0%, #FF851B 100%)',
                        color: 'white',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        boxShadow: '0 2px 8px rgba(255, 65, 54, 0.4)',
                      }}
                    >
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'white',
                          animation: 'pulse 2s infinite',
                        }}
                      />
                      LIVE
                    </div>
                  )}

                  {/* Duration/Scheduled Time */}
                  {stream.duration && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.85)',
                        color: 'white',
                        padding: '0.375rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {stream.duration}
                    </div>
                  )}

                  {stream.scheduledFor && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '0.75rem',
                        left: '0.75rem',
                        background: 'rgba(124, 58, 237, 0.95)',
                        color: 'white',
                        padding: '0.375rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      📅 {stream.scheduledFor}
                    </div>
                  )}

                  {/* Viewers/Views */}
                  {stream.isLive && stream.viewers > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.85)',
                        color: 'white',
                        padding: '0.375rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                      }}
                    >
                      👥 {stream.viewers.toLocaleString()}
                    </div>
                  )}

                  {stream.views !== undefined && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '0.75rem',
                        right: '0.75rem',
                        background: 'rgba(0, 0, 0, 0.85)',
                        color: 'white',
                        padding: '0.375rem 0.625rem',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      👁 {stream.views.toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div style={{ padding: '1.25rem' }}>
                  {/* Title */}
                  <h3
                    style={{
                      margin: '0 0 0.75rem',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      lineHeight: 1.4,
                      color: 'var(--fg)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {stream.title}
                  </h3>

                  {/* Streamer */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '0.75rem',
                    }}
                  >
                    <Image
                      src={stream.avatar}
                      alt={stream.streamer}
                      width={32}
                      height={32}
                      style={{
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `2px solid ${colorMode === 'dark' ? '#333' : '#eee'}`,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          color: 'var(--fg)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {stream.streamer}
                      </div>
                    </div>
                  </div>

                  {/* Stats & Category */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.75rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        background:
                          colorMode === 'dark'
                            ? 'rgba(124, 58, 237, 0.2)'
                            : 'rgba(124, 58, 237, 0.1)',
                        color: 'var(--accent)',
                        padding: '0.375rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {stream.category}
                    </span>

                    {stream.likes !== undefined && (
                      <span
                        style={{
                          fontSize: '0.85rem',
                          color: colorMode === 'dark' ? '#999' : '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                        }}
                      >
                        ❤️ {stream.likes.toLocaleString()}
                      </span>
                    )}
                  </div>

                  {/* Tags */}
                  {stream.tags && stream.tags.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                        flexWrap: 'wrap',
                      }}
                    >
                      {stream.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.75rem',
                            color: colorMode === 'dark' ? '#999' : '#666',
                            background:
                              colorMode === 'dark' ? '#252525' : '#f5f5f5',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '6px',
                          }}
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stream Viewer Modal */}
      {watchingStream && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Image
                src={watchingStream.avatar}
                alt={watchingStream.streamer}
                width={40}
                height={40}
                style={{ borderRadius: '50%' }}
              />
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>
                  {watchingStream.streamer}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#999' }}>
                  {watchingStream.category}
                </span>
              </div>
              <button
                onClick={() => setIsFollowing(!isFollowing)}
                style={{
                  padding: '0.5rem 1rem',
                  background: isFollowing
                    ? 'rgba(139, 92, 246, 0.2)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: isFollowing
                    ? '1px solid rgba(139, 92, 246, 0.5)'
                    : 'none',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isFollowing ? '✓ Following' : '+ Follow'}
              </button>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}
            >
              <span
                style={{
                  color: '#fff',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                👥 {viewerCount.toLocaleString()} watching
              </span>
              <button
                onClick={() => setWatchingStream(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Video Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Video Player */}
              <div
                style={{
                  flex: 1,
                  background: '#000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                <Image
                  src={watchingStream.thumbnail}
                  alt={watchingStream.title}
                  fill
                  style={{ objectFit: 'cover', opacity: 0.3 }}
                />
                <div
                  style={{
                    position: 'absolute',
                    textAlign: 'center',
                    color: '#fff',
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background:
                        'linear-gradient(135deg, #FF4136 0%, #FF851B 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1rem',
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '24px solid white',
                        borderTop: '14px solid transparent',
                        borderBottom: '14px solid transparent',
                        marginLeft: '6px',
                      }}
                    />
                  </div>
                  <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>
                    {watchingStream.title}
                  </h2>
                  <p style={{ margin: 0, opacity: 0.8, fontSize: '0.9rem' }}>
                    {activeTab === 'live'
                      ? '🔴 LIVE NOW'
                      : activeTab === 'upcoming'
                        ? `📅 Starts ${watchingStream.scheduledFor}`
                        : '🎬 Replay'}
                  </p>
                  {watchingStream.description && (
                    <p
                      style={{
                        margin: '1rem 0 0',
                        opacity: 0.7,
                        fontSize: '0.85rem',
                        maxWidth: '500px',
                      }}
                    >
                      {watchingStream.description}
                    </p>
                  )}
                </div>

                {/* Live Badge */}
                {activeTab === 'live' && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '1rem',
                      background:
                        'linear-gradient(135deg, #FF4136 0%, #FF851B 100%)',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'white',
                        animation: 'pulse 1s infinite',
                      }}
                    />
                    LIVE • {watchingStream.duration}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div
                style={{
                  padding: '1rem 1.5rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    ❤️ {watchingStream.likes?.toLocaleString() || 0}
                  </button>
                  <button
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    ↗️ Share
                  </button>
                  <button
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: '#fff',
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                    }}
                  >
                    🎁 Gift
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {watchingStream.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        color: '#999',
                        background: 'rgba(255, 255, 255, 0.1)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '6px',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Sidebar */}
            <div
              style={{
                width: '350px',
                borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(0, 0, 0, 0.3)',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                  fontWeight: 600,
                  color: '#fff',
                }}
              >
                Live Chat
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      padding: '0.75rem',
                      borderRadius: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span
                        style={{
                          color: '#a78bfa',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        {msg.user}
                      </span>
                      <span style={{ color: '#666', fontSize: '0.75rem' }}>
                        {msg.time}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: '#fff', fontSize: '0.9rem' }}>
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <div
                style={{
                  padding: '1rem',
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="Send a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && chatMessage.trim()) {
                        setChatMessages((prev) => [
                          ...prev,
                          {
                            user: 'You',
                            message: chatMessage,
                            time: 'now',
                          },
                        ]);
                        setChatMessage('');
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => {
                      if (chatMessage.trim()) {
                        setChatMessages((prev) => [
                          ...prev,
                          {
                            user: 'You',
                            message: chatMessage,
                            time: 'now',
                          },
                        ]);
                        setChatMessage('');
                      }
                    }}
                    style={{
                      padding: '0.75rem 1rem',
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
}
