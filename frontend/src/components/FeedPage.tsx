'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';
import { spacing, borderRadius } from '@/lib/design-system';
import { Carousel } from './ui/Carousel';
import { VideoPlayer } from './ui/VideoPlayer';
import { NoPostsEmptyState } from './ui/EmptyState';
import { useRipple, useHaptic, useInView } from '@/hooks/useInteractions';
import PollCard from './PollCard';
import CommentDropdown from './CommentDropdown';
import { useThemeColors } from '@/hooks/useThemeColors';

// Stories data for Feed
const feedStories = [
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
];

// Echoes data for Feed (short-form video content)
const feedEchoes = [
  {
    id: 1,
    thumbnail:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=300&h=500&fit=crop',
    username: 'ananya',
    views: '2.3M',
    likes: '456K',
    duration: '0:15',
  },
  {
    id: 2,
    thumbnail:
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&h=500&fit=crop',
    username: 'techraj',
    views: '1.8M',
    likes: '324K',
    duration: '0:30',
  },
  {
    id: 3,
    thumbnail:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300&h=500&fit=crop',
    username: 'priyacooks',
    views: '3.1M',
    likes: '567K',
    duration: '0:22',
  },
  {
    id: 4,
    thumbnail:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=500&fit=crop',
    username: 'rohan',
    views: '987K',
    likes: '189K',
    duration: '0:18',
  },
];

// Post card component with animations - Memoized for performance
const PostCard = memo(function PostCard({
  post,
  onLike,
  onComment,
  onShare,
  onOptions,
  index,
}: {
  post: any;
  onLike: () => void;
  onComment: () => void;
  onShare: () => void;
  onOptions: () => void;
  index: number;
}) {
  const colors = useThemeColors();
  const { ref, isInView, hasBeenInView } = useInView({ threshold: 0.1 });
  const haptic = useHaptic();
  const { createRipple: likeRipple, rippleElements: likeRippleElements } =
    useRipple();
  const { createRipple: commentRipple, rippleElements: commentRippleElements } =
    useRipple();
  const { createRipple: shareRipple, rippleElements: shareRippleElements } =
    useRipple();
  const [isCommentDropdownOpen, setIsCommentDropdownOpen] = useState(false);
  const commentButtonRef = useRef<HTMLButtonElement>(null);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    likeRipple(e);
    haptic('light');
    onLike();
  };

  const handleComment = (e: React.MouseEvent<HTMLButtonElement>) => {
    commentRipple(e);
    haptic('light');
    setIsCommentDropdownOpen(!isCommentDropdownOpen);
  };

  const handleShare = (e: React.MouseEvent<HTMLButtonElement>) => {
    shareRipple(e);
    haptic('light');
    onShare();
  };

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="nothing-widget modern-card hover-lift transition-smooth"
      style={{
        opacity: hasBeenInView ? 1 : 0,
        transform: hasBeenInView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        transitionDelay: `${index * 0.1}s`,
      }}
    >
      {/* Feed Header */}
      <div className="feed-header">
        <Image
          src={post.avatar}
          alt={post.author}
          className="feed-avatar"
          width={40}
          height={40}
          sizes="40px"
        />
        <div className="feed-author-info">
          <h4>{post.author}</h4>
          <div>
            <span className="feed-location">{post.location}</span>
            <span className="feed-time">{post.time}</span>
          </div>
        </div>
        <button className="feed-options" onClick={onOptions}>
          ⋯
        </button>
      </div>

      {/* Feed Content */}
      <div className="feed-content">
        <p>{post.content}</p>

        {/* Enhanced Media Display */}
        {post.media && (
          <div style={{ marginTop: '1rem' }}>
            {/* Carousel for multiple images */}
            {post.media.type === 'carousel' &&
              'images' in post.media &&
              post.media.images && (
                <Carousel
                  images={post.media.images as string[]}
                  showThumbnails={true}
                  showIndicators={true}
                  showControls={true}
                  aspectRatio="16/9"
                  priority={post.id <= 3}
                />
              )}

            {/* Video Player */}
            {post.media.type === 'video' && post.media.src && (
              <VideoPlayer
                src={post.media.src as string | { [quality: string]: string }}
                poster={post.media.poster as string}
                aspectRatio="16/9"
                controls={true}
                enableQualitySelector={true}
                defaultQuality="auto"
                onQualityChange={(quality) => {
                  console.log(`Quality changed to: ${quality}`);
                  // You could add a toast notification here
                  // toast.info(`Video quality changed to ${quality}`);
                }}
              />
            )}

            {/* Single Image */}
            {post.media.type === 'image' && post.media.src && (
              <div
                style={{
                  position: 'relative',
                  borderRadius: borderRadius.xl,
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}
              >
                <Image
                  src={post.media.src as string}
                  alt={(post.media.alt as string) || 'Post media'}
                  width={1200}
                  height={800}
                  quality={95}
                  priority={post.id === 1}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 600px"
                  style={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '600px',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}

            {/* Audio */}
            {post.media.type === 'audio' && post.media.src && (
              <div
                style={{
                  background: 'var(--nothing-surface)',
                  borderRadius: borderRadius.xl,
                  padding: '1rem',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--nothing-glyph)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                    }}
                  >
                    🎵
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      Audio File
                    </div>
                  </div>
                </div>
                <audio controls style={{ width: '100%' }}>
                  <source src={post.media.src as string} />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            )}
          </div>
        )}

        {/* Poll */}
        {post.poll && (
          <PollCard
            poll={post.poll}
            onVote={async (pollId, optionId) => {
              // In real app, would call API to vote
              console.log(`Voting for option ${optionId} in poll ${pollId}`);
              return true;
            }}
          />
        )}

        {/* Tags */}
        <div className="post-tags">
          {post.tags.map((tag: string, tagIndex: number) => (
            <span key={tagIndex} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Feed Stats */}
      <div className="feed-stats">
        <span className="stat">
          ❤️ {post.stats.likes.toLocaleString()} likes
        </span>
        <span className="stat">💬 {post.stats.comments} comments</span>
        <span className="stat">🔄 {post.stats.shares} shares</span>
      </div>

      {/* Feed Actions - Enhanced with ripple effects */}
      <div
        className="feed-actions"
        style={{
          display: 'flex',
          gap: '0.75rem',
          paddingTop: '1rem',
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <button
          className={`action-btn transition-smooth hover-scale focus-ring ${post.liked ? 'liked' : ''}`}
          onClick={handleLike}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: post.liked
              ? colors.bgSecondary
              : colors.bgSecondary,
            border: post.liked
              ? `2px solid ${colors.status.error}`
              : '2px solid transparent',
            color: post.liked ? colors.status.error : 'var(--fg)',
            fontWeight: 600,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {likeRippleElements}
          ❤️ Like
        </button>
        <div style={{ position: 'relative', flex: 1 }}>
          <button
            ref={commentButtonRef}
            className="action-btn transition-smooth hover-scale focus-ring"
            onClick={handleComment}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '2px solid transparent',
              fontWeight: 600,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {commentRippleElements}
            💬 Comment
          </button>

          {/* Comment Dropdown */}
          <CommentDropdown
            isOpen={isCommentDropdownOpen}
            onClose={() => setIsCommentDropdownOpen(false)}
            postId={post.id.toString()}
            buttonRef={commentButtonRef}
          />
        </div>
        <button
          className="action-btn transition-smooth hover-scale focus-ring"
          onClick={handleShare}
          style={{
            flex: 1,
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)',
            border: '2px solid transparent',
            fontWeight: 600,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {shareRippleElements}
          🔄 Share
        </button>
      </div>
    </div>
  );
});

const feedPosts = [
  {
    id: 1,
    author: 'Priya Sharma',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=b6e3f4&eyes=happy&mouth=smile',
    location: '📍 Chandigarh, Punjab',
    time: '3 hours ago',
    content:
      "Just got back from the most incredible coding bootcamp at @TechMahindra! 💻 Met so many brilliant minds working on sustainable tech solutions. The energy was unreal - from AI-powered farming apps to green energy platforms. India's tech future is looking brighter than ever! Who else is building something amazing? 🚀✨",
    media: {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=800&fit=crop&crop=center&q=90',
      alt: 'Tech conference presentation stage with sustainable technology theme',
    },
    tags: ['#TechIndia', '#Coding', '#Innovation', '#SustainableTech'],
    stats: { likes: 1247, comments: 189, shares: 312 },
    liked: true,
  },
  {
    id: 2,
    author: 'Arjun Singh',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=c0aede&eyes=default&mouth=smile',
    location: '📍 Golden Temple, Amritsar',
    time: '6 hours ago',
    content:
      "Morning seva at the Golden Temple hits different every single time 🙏 There's something magical about starting your day in service to others. Whether it's helping in the langar kitchen or just being present in this sacred space, it reminds you what really matters. Guru Nanak's teachings of equality and compassion feel so relevant today. ✨",
    media: {
      type: 'carousel',
      images: [
        'https://images.unsplash.com/photo-1583395824913-db17a1dad6e8?w=1200&h=800&fit=crop&crop=center&q=90',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center&q=90',
        'https://images.unsplash.com/photo-1586040140378-b2b6d7bf8c0b?w=1200&h=800&fit=crop&crop=center&q=90',
      ],
    },
    tags: ['#GoldenTemple', '#Seva', '#Gratitude', '#SikhValues'],
    stats: { likes: 2103, comments: 156, shares: 298 },
    liked: false,
  },
  {
    id: 3,
    author: 'Ravi Kumar',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi&backgroundColor=ffd5dc&eyes=wink&mouth=smile',
    location: '📍 Bangalore, Karnataka',
    time: '8 hours ago',
    content:
      "Street food adventures in Bangalore never disappoint! 🌮 Just discovered this incredible dosa cart near Koramangala - the guy makes 47 different types of dosas and each one is pure art. The masala dosa was crispy perfection and don't even get me started on their filter coffee ☕ Sometimes the best meals come from the most unexpected places!",
    media: {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1630383249896-424e482df921?w=1200&h=800&fit=crop&crop=center&q=90',
      alt: 'Crispy masala dosa with coconut chutney and sambar',
    },
    tags: ['#BangaloreEats', '#StreetFood', '#Dosa', '#FilterCoffee'],
    stats: { likes: 892, comments: 73, shares: 145 },
    liked: true,
  },
  {
    id: 4,
    author: 'Sneha Patel',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha&backgroundColor=ffdfba&eyes=happy&mouth=smile',
    location: '📍 Ahmedabad, Gujarat',
    time: '12 hours ago',
    content:
      "Navratri prep is in full swing and I am SO ready! 💃 Been practicing garba steps for weeks and finally nailed that complex sequence my grandmother taught me. There's something beautiful about carrying forward traditions while adding your own modern twist. This year I'm wearing my great-grandmother's chaniya choli - it still fits perfectly! Who else is celebrating?",
    media: {
      type: 'video',
      src: {
        '144p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        '240p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        '360p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        '480p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        '720p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        '1080p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        '1440p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        '2160p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
      poster:
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=1200&h=800&fit=crop&crop=center&q=90',
      duration: '1:23',
    },
    tags: ['#Navratri', '#Garba', '#Tradition', '#Gujarat'],
    stats: { likes: 1567, comments: 234, shares: 189 },
    liked: false,
  },
  {
    id: 5,
    author: 'Vikram Reddy',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram&backgroundColor=d1c4e9&eyes=default&mouth=smile',
    location: '📍 Hyderabad, Telangana',
    time: '1 day ago',
    content:
      "Monsoon magic in the city of pearls! 🌧️ Nothing beats the smell of wet earth and the sight of Hussain Sagar lake during the rains. Stopped by for some authentic Hyderabadi biryani at Paradise - every grain of rice was perfection. Sometimes you need to slow down and appreciate the simple pleasures. The sound of rain on the terrace takes me back to childhood summers at my nani's house ❤️",
    media: {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1200&h=800&fit=crop&crop=center&q=90',
      alt: 'Monsoon evening with city lights reflecting in water',
    },
    tags: ['#HyderabadDiaries', '#Monsoon', '#Biryani', '#Memories'],
    stats: { likes: 743, comments: 67, shares: 92 },
    liked: true,
  },
  {
    id: 6,
    author: 'Meera Krishnan',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Meera&backgroundColor=e6f3ff&eyes=happy&mouth=smile',
    location: '📍 Kochi, Kerala',
    time: '1 day ago',
    content:
      "Morning boat ride through the backwaters was absolutely magical 🛶 The fishermen teaching me traditional casting techniques, the sound of water lapping against the canoe, and those incredible sunset colors reflecting off the water. Kerala's backwaters hold so many stories - some passed down through generations of families who've lived here. Grateful for these moments of pure connection with nature and culture ✨",
    media: {
      type: 'carousel',
      images: [
        'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=1200&h=800&fit=crop&crop=center&q=90',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center&q=90',
        'https://images.unsplash.com/photo-1516815232560-55ff0c2c2eaa?w=1200&h=800&fit=crop&crop=center&q=90',
      ],
    },
    tags: ['#Kerala', '#Backwaters', '#TraditionMeetsNature', '#Storytelling'],
    stats: { likes: 1834, comments: 142, shares: 267 },
    liked: false,
  },
  {
    id: 7,
    author: 'Rohit Malhotra',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohit&backgroundColor=fff2cc&eyes=default&mouth=smile',
    location: '📍 Gurgaon, Haryana',
    time: '2 days ago',
    content:
      'Finally launched our edtech startup after 18 months of grinding! 🚀 From coding in my bedroom to having 10K+ students on the platform - the journey has been wild. Special shoutout to my co-founder @Priya_Dev for believing in the vision when everyone said "education tech is too crowded." Sometimes you just have to build what you wish existed when you were learning. Here\'s to democratizing quality education! 💪',
    media: {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1200&h=800&fit=crop&crop=center&q=90',
      alt: 'Startup team celebrating product launch with laptops and screens',
    },
    tags: ['#StartupJourney', '#EdTech', '#Innovation', '#Entrepreneurship'],
    stats: { likes: 2847, comments: 312, shares: 578 },
    liked: true,
  },
  {
    id: 8,
    author: 'Kavya Iyer',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya&backgroundColor=f0e6ff&eyes=wink&mouth=smile',
    location: '📍 Chennai, Tamil Nadu',
    time: '2 days ago',
    content:
      "Spent the entire weekend learning Bharatanatyam from my 78-year-old guru 💃 Her stories about performing for legends like MS Subbulakshmi gave me goosebumps. There's something profound about how classical dance connects your body, mind and soul to centuries of tradition. Every mudra tells a story, every expression carries emotion. In our digital age, these art forms remind us of the beauty in patience and practice 🎭✨",
    media: {
      type: 'video',
      src: {
        '144p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        '240p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        '360p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        '480p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        '720p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        '1080p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        '1440p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        '2160p':
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      },
      poster:
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&h=800&fit=crop&crop=center&q=90',
      duration: '2:15',
    },
    tags: [
      '#Bharatanatyam',
      '#ClassicalDance',
      '#Tradition',
      '#ArtPreservation',
    ],
    stats: { likes: 1456, comments: 189, shares: 234 },
    liked: false,
  },
  {
    id: 9,
    author: 'Aditya Sharma',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Aditya&backgroundColor=e8f5e8&eyes=happy&mouth=smile',
    location: '📍 Rishikesh, Uttarakhand',
    time: '3 days ago',
    content:
      'Day 7 of my meditation retreat in the Himalayas 🏔️ Waking up to the sound of the Ganges, practicing yoga as the sun rises over the mountains, and sitting in silence for hours has been life-changing. Met a 85-year-old sadhu who shared wisdom about finding peace in chaos. "The mind is like water - when agitated, you cannot see clearly. When calm, everything becomes clear." Taking this back to city life 🧘‍♂️',
    media: {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=800&fit=crop&crop=center&q=90',
      alt: 'Sunrise meditation in Rishikesh',
    },
    tags: [
      '#MeditationRetreat',
      '#Himalayas',
      '#Mindfulness',
      '#SpiritualJourney',
    ],
    stats: { likes: 3247, comments: 456, shares: 689 },
    liked: true,
  },
  {
    id: 10,
    author: 'Nisha Gupta',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=Nisha&backgroundColor=ffe6f2&eyes=default&mouth=smile',
    location: '📍 Jaipur, Rajasthan',
    time: '3 days ago',
    content:
      "Block printing workshop with master craftsmen in the old city was incredible! 🎨 Learning how these intricate patterns are carved by hand, how natural dyes are made from flowers and roots, and watching generations of knowledge passed down through families. Every fabric tells a story of Rajasthani heritage. Supporting local artisans isn't just shopping - it's preserving culture for future generations 🌸",
    media: {
      type: 'carousel',
      images: [
        'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=1200&h=800&fit=crop&crop=center&q=90',
        'https://images.unsplash.com/photo-1604514628550-37477afdf4e3?w=1200&h=800&fit=crop&crop=center&q=90',
        'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=1200&h=800&fit=crop&crop=center&q=90',
      ],
    },
    tags: ['#BlockPrinting', '#Rajasthan', '#Handicrafts', '#CulturalHeritage'],
    stats: { likes: 1987, comments: 234, shares: 345 },
    liked: false,
  },
  {
    id: 11,
    author: 'Tech Poll India',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=TechPoll&backgroundColor=a7e6ff&eyes=default&mouth=smile',
    location: '📍 India',
    time: '4 hours ago',
    content:
      "Quick poll for all the developers out there! What's your preferred programming language for building web applications in 2024? 💻",
    poll: {
      id: 'poll_1',
      question:
        "What's your preferred programming language for web development in 2024?",
      options: [
        { id: 'js', text: 'JavaScript/TypeScript', votes: 1247 },
        { id: 'python', text: 'Python', votes: 892 },
        { id: 'java', text: 'Java', votes: 634 },
        { id: 'go', text: 'Go', votes: 423 },
      ],
      totalVotes: 3196,
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      userVote: undefined,
    },
    tags: ['#Programming', '#WebDev', '#TechPoll', '#Coding'],
    stats: { likes: 456, comments: 89, shares: 123 },
    liked: false,
  },
  {
    id: 12,
    author: 'Food Explorer',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=FoodExplorer&backgroundColor=ffdfba&eyes=happy&mouth=smile',
    location: '📍 Mumbai, Maharashtra',
    time: '6 hours ago',
    content:
      "Settling a debate with friends! What's the ultimate Indian street food? Let's see what the community thinks! 🍛",
    poll: {
      id: 'poll_2',
      question: "What's the ultimate Indian street food?",
      options: [
        { id: 'pavbhaji', text: 'Pav Bhaji', votes: 2341 },
        { id: 'chaatpapri', text: 'Chaat Papri', votes: 1876 },
        { id: 'vadapav', text: 'Vada Pav', votes: 1654 },
        { id: 'dosai', text: 'Dosa', votes: 2109 },
      ],
      totalVotes: 7980,
      expiresAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
      userVote: 'pavbhaji',
    },
    tags: ['#StreetFood', '#IndianFood', '#FoodPoll', '#Mumbai'],
    stats: { likes: 1234, comments: 267, shares: 189 },
    liked: true,
  },
  {
    id: 13,
    author: 'Travel Enthusiast',
    avatar:
      'https://api.dicebear.com/7.x/avataaars/svg?seed=TravelEnthusiast&backgroundColor=d1f5d3&eyes=wink&mouth=smile',
    location: '📍 Delhi, India',
    time: '1 day ago',
    content:
      'Planning my next adventure! Help me decide where to go for my winter vacation. All these places are on my bucket list! ✈️',
    poll: {
      id: 'poll_3',
      question: 'Best winter destination in India?',
      options: [
        { id: 'goa', text: 'Goa Beaches', votes: 567 },
        { id: 'rajasthan', text: 'Rajasthan Desert', votes: 423 },
        { id: 'kerala', text: 'Kerala Backwaters', votes: 389 },
        { id: 'himachal', text: 'Himachal Mountains', votes: 612 },
      ],
      totalVotes: 1991,
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      userVote: undefined,
    },
    tags: ['#Travel', '#WinterVacation', '#India', '#TravelPoll'],
    stats: { likes: 789, comments: 156, shares: 234 },
    liked: false,
  },
];

// Sample poll for testing
const samplePoll = {
  id: 'poll_sample',
  question: "What's your favorite time to code?",
  options: [
    { id: 'morning', text: 'Early Morning (6-9 AM)', votes: 234 },
    { id: 'afternoon', text: 'Afternoon (12-3 PM)', votes: 156 },
    { id: 'evening', text: 'Evening (6-9 PM)', votes: 445 },
    { id: 'night', text: 'Late Night (9 PM-12 AM)', votes: 567 },
  ],
  totalVotes: 1402,
  expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  userVote: undefined,
};

export default function FeedPage() {
  const colors = useThemeColors();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const [newPost, setNewPost] = useState('');
  const [posts, setPosts] = useState(feedPosts);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [uploadedMedia, setUploadedMedia] = useState<
    Array<{
      type: 'image' | 'video' | 'audio';
      file: File;
      preview: string;
      size: string;
      duration?: string;
      resolution?: string;
      quality?: string;
      metadata?: any;
    }>
  >([]);
  const [isUploading, setIsUploading] = useState(false);

  // Pull-to-refresh state
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll state
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Interaction hooks
  const haptic = useHaptic();

  const removeMedia = (index: number) => {
    setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreatePost = () => {
    if (newPost.trim() || uploadedMedia.length > 0) {
      const post: any = {
        id: posts.length + 1,
        author: 'Rajesh Kumar',
        avatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh&backgroundColor=a7e6ff&eyes=happy&mouth=smile',
        location: '📍 Punjab, India',
        time: 'Just now',
        content: newPost,
        tags: [],
        stats: { likes: 0, comments: 0, shares: 0 },
        liked: false,
      };

      // Add media to post if available
      if (uploadedMedia.length > 0) {
        if (uploadedMedia.length === 1) {
          const media = uploadedMedia[0];
          if (media.type === 'video') {
            // For uploaded videos, create a quality map with the same source
            // In a real app, you'd generate different quality versions
            post.media = {
              type: media.type,
              src: {
                '144p': media.preview,
                '240p': media.preview,
                '360p': media.preview,
                '480p': media.preview,
                '720p': media.preview,
                '1080p': media.preview,
                '1440p': media.preview,
                '2160p': media.preview,
              },
              alt: media.file.name,
              duration: media.duration,
              size: media.size,
              fileName: media.file.name,
            };
          } else {
            post.media = {
              type: media.type,
              src: media.preview,
              alt: media.file.name,
              duration: media.duration,
              size: media.size,
              fileName: media.file.name,
            };
          }
        } else {
          // Multiple media items
          post.media = {
            type: 'carousel',
            items: uploadedMedia.map((media) => ({
              type: media.type,
              src: media.preview,
              alt: media.file.name,
              duration: media.duration,
              size: media.size,
              fileName: media.file.name,
            })),
          };
        }
      }

      setPosts([post, ...posts]);
      setNewPost('');
      setUploadedMedia([]);
      setShowCreatePost(false);
    }
  };

  const handleLikePost = useCallback(
    (postId: number) => {
      setPosts(
        posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                liked: !post.liked,
                stats: {
                  ...post.stats,
                  likes: post.liked
                    ? post.stats.likes - 1
                    : post.stats.likes + 1,
                },
              }
            : post
        )
      );
    },
    [posts]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVideoDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const getVideoMetadata = (
    file: File
  ): Promise<{ duration: string; resolution: string; quality: string }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      const timeout = setTimeout(() => {
        reject(new Error('Video metadata loading timeout'));
      }, 10000); // 10 second timeout

      video.onloadedmetadata = () => {
        clearTimeout(timeout);

        if (isNaN(video.duration) || video.duration === 0) {
          reject(new Error('Invalid video duration'));
          return;
        }

        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const durationStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;

        const width = video.videoWidth;
        const height = video.videoHeight;

        if (width === 0 || height === 0) {
          reject(new Error('Invalid video dimensions'));
          return;
        }

        const resolution = `${width}x${height}`;

        let quality = 'SD';
        if (width >= 3840) quality = '4K UHD';
        else if (width >= 2560) quality = '2K QHD';
        else if (width >= 1920) quality = 'Full HD';
        else if (width >= 1280) quality = 'HD';

        resolve({ duration: durationStr, resolution, quality });
      };

      video.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Failed to load video metadata'));
      };

      try {
        video.src = URL.createObjectURL(file);
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error('Failed to create video URL'));
      }
    });
  };

  const getImageMetadata = (
    file: File
  ): Promise<{ resolution: string; quality: string }> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') {
        resolve({ resolution: 'Unknown', quality: 'Unknown' });
        return;
      }
      const img = new window.Image();
      img.onload = () => {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const resolution = `${width}x${height}`;
        const megapixels = (width * height) / 1000000;

        let quality = 'Standard';
        if (megapixels >= 50) quality = 'Ultra High';
        else if (megapixels >= 20) quality = 'Very High';
        else if (megapixels >= 8) quality = 'High';
        else if (megapixels >= 2) quality = 'Medium';

        resolve({ resolution, quality });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const getAudioDuration = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const audio = document.createElement('audio');
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        const duration = audio.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    // Set high-quality file type restrictions
    switch (type) {
      case 'Photo':
        input.accept =
          'image/png,image/jpeg,image/webp,image/tiff,image/bmp,image/svg+xml';
        break;
      case 'Video':
        input.accept =
          'video/mp4,video/mov,video/avi,video/mkv,video/webm,video/m4v';
        break;
      case 'Audio':
        input.accept =
          'audio/wav,audio/flac,audio/aiff,audio/mp3,audio/aac,audio/ogg,audio/m4a';
        break;
      default:
        input.accept = '*/*';
    }

    input.onchange = async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length === 0) return;

      setIsUploading(true);
      setShowCreatePost(true);

      const newMedia: Array<{
        type: 'image' | 'video' | 'audio';
        file: File;
        preview: string;
        size: string;
        duration?: string;
        resolution?: string;
        quality?: string;
        metadata?: any;
      }> = [];

      for (const file of files) {
        try {
          let preview = '';
          let duration: string | undefined;
          const mediaType = file.type.startsWith('image/')
            ? 'image'
            : file.type.startsWith('video/')
              ? 'video'
              : 'audio';

          let resolution: string | undefined;
          let quality: string | undefined;

          if (mediaType === 'image') {
            preview = URL.createObjectURL(file);
            const imageMetadata = await getImageMetadata(file);
            resolution = imageMetadata.resolution;
            quality = imageMetadata.quality;
          } else if (mediaType === 'video') {
            // Validate video file size (max 100MB)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
              throw new Error(
                `Video file too large. Maximum size is 100MB, but file is ${formatFileSize(file.size)}.`
              );
            }

            // Create video thumbnail
            try {
              const video = document.createElement('video');
              video.src = URL.createObjectURL(file);
              video.currentTime = 1; // Get frame at 1 second

              await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(new Error('Video thumbnail generation timeout'));
                }, 15000); // 15 second timeout

                video.onloadedmetadata = () => {
                  // Ensure video has valid dimensions
                  if (video.videoWidth === 0 || video.videoHeight === 0) {
                    clearTimeout(timeout);
                    reject(new Error('Invalid video dimensions'));
                    return;
                  }

                  video.onseeked = () => {
                    try {
                      const canvas = document.createElement('canvas');
                      canvas.width = Math.min(video.videoWidth, 1920); // Limit canvas size
                      canvas.height = Math.min(video.videoHeight, 1080);
                      const ctx = canvas.getContext('2d');

                      if (!ctx) {
                        clearTimeout(timeout);
                        reject(new Error('Failed to create canvas context'));
                        return;
                      }

                      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                      preview = canvas.toDataURL('image/jpeg', 0.8);
                      clearTimeout(timeout);
                      resolve(null);
                    } catch (error) {
                      clearTimeout(timeout);
                      reject(error);
                    }
                  };

                  video.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error('Video seek error'));
                  };
                };

                video.onerror = () => {
                  clearTimeout(timeout);
                  reject(new Error('Video loading error'));
                };
              });

              const videoMetadata = await getVideoMetadata(file);
              duration = videoMetadata.duration;
              resolution = videoMetadata.resolution;
              quality = videoMetadata.quality;

              // Clean up video element
              URL.revokeObjectURL(video.src);
            } catch (error) {
              console.error('Video processing error:', error);
              // Use a default video icon if thumbnail generation fails
              preview =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMzMzIi8+Cjxwb2x5Z29uIHBvaW50cz0iNDAsMzAgNDAsNzAgNzAsNTAiIGZpbGw9IndoaXRlIi8+Cjx0ZXh0IHg9IjUwIiB5PSI5MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VklERU88L3RleHQ+Cjwvc3ZnPg==';

              // Try to get basic metadata even if thumbnail fails
              try {
                const videoMetadata = await getVideoMetadata(file);
                duration = videoMetadata.duration;
                resolution = videoMetadata.resolution;
                quality = videoMetadata.quality;
              } catch (metadataError) {
                console.error('Video metadata error:', metadataError);
                duration = 'Unknown';
                resolution = 'Unknown';
                quality = 'Unknown';
              }
            }
          } else if (mediaType === 'audio') {
            // Use a music note icon for audio preview
            preview = '🎵';
            duration = await getAudioDuration(file);

            // Audio quality detection based on file extension and size
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'flac' || ext === 'wav' || ext === 'aiff') {
              quality = 'Lossless';
            } else if (ext === 'mp3' || ext === 'aac') {
              // Estimate quality based on bitrate (file size / duration approximation)
              const bitrate =
                (file.size * 8) /
                (parseFloat(duration.split(':')[0]) * 60 +
                  parseFloat(duration.split(':')[1]));
              if (bitrate > 256000) quality = 'High (320+kbps)';
              else if (bitrate > 192000) quality = 'Medium (256kbps)';
              else quality = 'Standard (192kbps)';
            } else {
              quality = 'Standard';
            }
          }

          newMedia.push({
            type: mediaType as 'image' | 'video' | 'audio',
            file,
            preview,
            size: formatFileSize(file.size),
            duration,
            resolution,
            quality,
          });
        } catch (error) {
          console.error(`Error processing ${file.name}:`, error);
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          alert(`Error processing ${file.name}: ${errorMessage}`);
          continue; // Skip this file and continue with others
        }
      }

      setUploadedMedia((prev) => [...prev, ...newMedia]);
      setIsUploading(false);
    };

    input.click();
  };

  const handleCommentPost = useCallback((postId: number) => {
    // Comment functionality is now handled by the CommentDropdown component
    // This function is kept for compatibility but doesn't need to do anything
  }, []);

  const handleSharePost = useCallback(
    (postId: number) => {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        if (navigator.share) {
          navigator
            .share({
              title: `Post by ${post.author}`,
              text: post.content,
              url: window.location.href,
            })
            .catch(() => {
              // Fallback if share fails
              navigator.clipboard.writeText(
                `${post.content} - ${window.location.href}`
              );
              alert('Post link copied to clipboard!');
            });
        } else {
          navigator.clipboard.writeText(
            `${post.content} - ${window.location.href}`
          );
          alert('Post link copied to clipboard!');
        }

        setPosts(
          posts.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  stats: {
                    ...p.stats,
                    shares: p.stats.shares + 1,
                  },
                }
              : p
          )
        );
      }
    },
    [posts]
  );

  const handlePostOptions = useCallback(
    (postId: number) => {
      const post = posts.find((p) => p.id === postId);
      if (post) {
        const action = prompt(
          `Post by ${post.author}\n\nChoose an action:\n1. Copy link\n2. Report post\n3. Hide post\n4. Follow ${post.author}\n\nEnter number (1-4):`
        );

        switch (action) {
          case '1':
            navigator.clipboard.writeText(
              window.location.href + '#post-' + postId
            );
            alert('Post link copied!');
            break;
          case '2':
            alert(
              'Post reported. Thank you for helping keep our community safe.'
            );
            break;
          case '3':
            setPosts(posts.filter((p) => p.id !== postId));
            alert('Post hidden from your feed.');
            break;
          case '4':
            alert(`You are now following ${post.author}!`);
            break;
          default:
            if (action) alert('Invalid option. Please try again.');
        }
      }
    },
    [posts]
  );

  // Pull-to-refresh handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      pullStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (
        !isPulling ||
        !containerRef.current ||
        containerRef.current.scrollTop > 0
      )
        return;

      const touchY = e.touches[0].clientY;
      const distance = touchY - pullStartY.current;

      if (distance > 0 && distance < 120) {
        setPullDistance(distance);
        e.preventDefault();
      }
    },
    [isPulling]
  );

  const handleTouchEnd = useCallback(async () => {
    setIsPulling(false);

    if (pullDistance > 80) {
      setIsRefreshing(true);
      haptic('medium');

      // Simulate refresh
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Reload posts (in real app, fetch from API)
      setPosts([...feedPosts]);
      setPage(1);
      setHasMore(true);

      setIsRefreshing(false);
      haptic('light');
    }

    setPullDistance(0);
  }, [pullDistance, haptic]);

  // Infinite scroll handler
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    haptic('light');

    // Simulate loading more posts
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // In real app, fetch from API with page number
    const morePosts = feedPosts.map((post, index) => ({
      ...post,
      id: posts.length + index + 1,
      time: `${Math.floor(Math.random() * 24)} hours ago`,
    }));

    setPosts((prev) => [...prev, ...morePosts]);
    setPage((prev) => prev + 1);

    // Simulate end of feed after 3 pages
    if (page >= 3) {
      setHasMore(false);
    }

    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, page, posts.length, haptic]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loadMorePosts]);

  const containerPadding = isMobile ? spacing[3] : spacing[6];
  const titleSize = isMobile ? '1.5rem' : '2rem';

  return (
    <section
      id="feed"
      data-route="feed"
      className="active animate-fade-in"
      style={{ position: 'relative' }}
    >
      {/* Pull-to-refresh indicator */}
      {(isPulling || isRefreshing) && (
        <div
          style={{
            position: 'fixed',
            top: Math.min(pullDistance, 80),
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            opacity: Math.min(pullDistance / 80, 1),
            transition: isRefreshing ? 'top 0.3s ease-out' : 'none',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}
          >
            {isRefreshing ? '⟳' : '↓'}
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="container"
        style={{
          position: 'relative',
          zIndex: 1,
          padding: `${spacing[6]} ${containerPadding}`,
          maxWidth: isTablet ? '720px' : isMobile ? '100%' : '680px',
          margin: '0 auto',
          transform: `translateY(${Math.min(pullDistance, 80)}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <h2
          className="nothing-title animate-fade-in-down"
          style={{
            marginBottom: isMobile ? spacing[4] : spacing[8],
            fontSize: titleSize,
            padding: isMobile ? `0 ${spacing[2]}` : 0,
          }}
        >
          {t('feed.yourFeed')}
        </h2>

        {/* Stories Carousel */}
        <div
          className="nothing-widget modern-card animate-fade-in-up"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
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
                gap: '0.4rem',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.secondary 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                  color: colors.text.white,
                  boxShadow: colors.shadowLg,
                }}
              >
                +
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                Your Story
              </span>
            </div>
            {/* Stories */}
            {feedStories.map((story) => (
              <div
                key={story.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    padding: '2px',
                    background: story.isLive
                      ? 'linear-gradient(135deg, colors.status.error 0%, #f97316 100%)'
                      : story.hasNew
                        ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.secondary 100%)'
                        : 'var(--border)',
                    position: 'relative',
                  }}
                >
                  <Image
                    src={story.avatar}
                    alt={story.username}
                    width={56}
                    height={56}
                    sizes="56px"
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--bg)',
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
                          'linear-gradient(135deg, colors.status.error 0%, #f97316 100%)',
                        color: colors.text.white,
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.35rem',
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
                    fontSize: '0.7rem',
                    color: story.hasNew ? 'var(--fg)' : 'var(--muted)',
                    maxWidth: '60px',
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

        {/* Echoes Section */}
        <div
          className="nothing-widget modern-card animate-fade-in-up"
          style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '1rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span
                style={{
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.secondary 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                📢
              </span>{' '}
              Echoes
            </h3>
            <button
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--accent)',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              See All →
            </button>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {feedEchoes.map((echo) => (
              <div
                key={echo.id}
                style={{
                  flexShrink: 0,
                  width: '120px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'transform 0.3s',
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
                  width={120}
                  height={200}
                  sizes="(max-width: 640px) 100px, 120px"
                  style={{ objectFit: 'cover', width: '100%', height: '200px' }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: `linear-gradient(transparent, rgba(0,0,0,0.8))`,
                    padding: '1.5rem 0.5rem 0.5rem',
                    color: colors.text.white,
                  }}
                >
                  <div style={{ fontSize: '0.65rem', fontWeight: 600 }}>
                    @{echo.username}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6rem',
                      opacity: 0.8,
                      display: 'flex',
                      gap: '0.4rem',
                    }}
                  >
                    <span>▶ {echo.views}</span>
                  </div>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: '0.4rem',
                    right: '0.4rem',
                    background: 'rgba(0,0,0,0.6)',
                    color: colors.text.white,
                    padding: '0.15rem 0.3rem',
                    borderRadius: '4px',
                    fontSize: '0.55rem',
                    fontWeight: 600,
                  }}
                >
                  {echo.duration}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Nothing Phone Create Post Widget - Enhanced with sticky behavior */}
        <div
          className="nothing-widget modern-card animate-fade-in-up"
          style={{
            marginBottom: '2rem',
            position: 'sticky',
            top: '5rem',
            zIndex: 100,
            backdropFilter: 'blur(10px)',
            background: 'var(--bg-secondary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem',
            }}
          >
            <Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh&backgroundColor=a7e6ff&eyes=happy&mouth=smile"
              alt="Your Avatar"
              width={48}
              height={48}
              sizes="48px"
              style={{ borderRadius: '50%' }}
            />
            {!showCreatePost ? (
              <button
                onClick={() => setShowCreatePost(true)}
                className="nothing-button"
                style={{
                  flex: 1,
                  textAlign: 'left',
                  background: 'var(--nothing-surface)',
                  color: 'var(--nothing-text-secondary)',
                  justifyContent: 'flex-start',
                }}
              >
                {t('feed.whatsOnMind', { name: 'Rajesh' })}
              </button>
            ) : (
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={t('feed.shareThoughts')}
                  className="nothing-button"
                  style={{
                    minHeight: '100px',
                    resize: 'vertical',
                    textAlign: 'left',
                    background: 'var(--nothing-surface)',
                    fontFamily: 'inherit',
                  }}
                />

                {/* Media Upload Preview */}
                {uploadedMedia.length > 0 && (
                  <div
                    style={{
                      background: 'var(--nothing-surface)',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          fontWeight: 600,
                        }}
                      >
                        📎 Attached Media ({uploadedMedia.length})
                      </h4>
                      <button
                        onClick={() => setUploadedMedia([])}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--nothing-glyph)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Clear All
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fill, minmax(120px, 1fr))',
                        gap: '0.75rem',
                        maxHeight: '200px',
                        overflowY: 'auto',
                      }}
                    >
                      {uploadedMedia.map((media, index) => (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            background: 'var(--bg)',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {/* Remove Button */}
                          <button
                            onClick={() => removeMedia(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(0,0,0,0.7)',
                              color: colors.text.white,
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              zIndex: 2,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            ✕
                          </button>

                          {/* Media Preview */}
                          {media.type === 'image' ? (
                            <div style={{ position: 'relative' }}>
                              <img
                                src={media.preview}
                                alt={media.file.name}
                                style={{
                                  width: '100%',
                                  height: '80px',
                                  objectFit: 'cover',
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'rgba(0,0,0,0.7)',
                                  color: colors.text.white,
                                  fontSize: '0.7rem',
                                  padding: '2px 4px',
                                }}
                              >
                                📷{' '}
                                {media.resolution && `${media.resolution} • `}
                                {media.quality && `${media.quality} • `}
                                {media.size}
                              </div>
                            </div>
                          ) : media.type === 'video' ? (
                            <div style={{ position: 'relative' }}>
                              <img
                                src={media.preview}
                                alt={media.file.name}
                                style={{
                                  width: '100%',
                                  height: '80px',
                                  objectFit: 'cover',
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  background: 'rgba(0,0,0,0.7)',
                                  color: colors.text.white,
                                  borderRadius: '50%',
                                  width: '24px',
                                  height: '24px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                }}
                              >
                                ▶️
                              </div>
                              <div
                                style={{
                                  position: 'absolute',
                                  bottom: 0,
                                  left: 0,
                                  right: 0,
                                  background: 'rgba(0,0,0,0.7)',
                                  color: colors.text.white,
                                  fontSize: '0.7rem',
                                  padding: '2px 4px',
                                }}
                              >
                                🎥{' '}
                                {media.resolution && `${media.resolution} • `}
                                {media.quality && `${media.quality} • `}
                                {media.duration} • {media.size}
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                height: '80px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'var(--nothing-glyph)',
                                color: colors.text.white,
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '24px',
                                  marginBottom: '4px',
                                }}
                              >
                                🎵
                              </div>
                              <div
                                style={{
                                  fontSize: '0.7rem',
                                  textAlign: 'center',
                                  padding: '0 4px',
                                }}
                              >
                                {media.quality && `${media.quality} • `}
                                {media.duration} • {media.size}
                              </div>
                            </div>
                          )}

                          {/* File Name */}
                          <div
                            style={{
                              padding: '4px',
                              fontSize: '0.65rem',
                              color: 'var(--nothing-text-secondary)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {media.file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Progress */}
                {isUploading && (
                  <div
                    style={{
                      background: 'var(--nothing-surface)',
                      borderRadius: '12px',
                      padding: '1rem',
                      textAlign: 'center',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      📤
                    </div>
                    <div
                      style={{
                        fontSize: '0.9rem',
                        color: 'var(--nothing-text-secondary)',
                      }}
                    >
                      Processing media files...
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div
                  style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
                >
                  <button
                    onClick={handleCreatePost}
                    className="btn-gradient hover-lift transition-smooth focus-ring"
                    disabled={!newPost.trim() && uploadedMedia.length === 0}
                    style={{
                      opacity:
                        !newPost.trim() && uploadedMedia.length === 0 ? 0.5 : 1,
                      cursor:
                        !newPost.trim() && uploadedMedia.length === 0
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    📝 {t('post')}
                  </button>
                  <button
                    onClick={() => {
                      setShowCreatePost(false);
                      setNewPost('');
                      setUploadedMedia([]);
                    }}
                    className="nothing-button"
                  >
                    {t('cancel')}
                  </button>

                  {/* Media Upload Buttons */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.25rem',
                      marginLeft: 'auto',
                    }}
                  >
                    {[
                      {
                        icon: '📷',
                        label: t('feed.photo'),
                        color: 'colors.status.success',
                        tooltip: t('feed.uploadTooltips.photo'),
                      },
                      {
                        icon: '🎥',
                        label: t('feed.video'),
                        color: 'colors.brand.accent',
                        tooltip: t('feed.uploadTooltips.video'),
                      },
                      {
                        icon: '🎵',
                        label: t('feed.audio'),
                        color: 'colors.status.warning',
                        tooltip: t('feed.uploadTooltips.audio'),
                      },
                    ].map((action) => (
                      <button
                        key={action.label}
                        className="nothing-button"
                        onClick={() => handleFileUpload(action.label)}
                        style={{
                          fontSize: '0.8rem',
                          minWidth: 'auto',
                          padding: '0.5rem',
                          background: action.color,
                          color: colors.text.white,
                        }}
                        title={action.tooltip}
                      >
                        {action.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {!showCreatePost && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {[
                { icon: '📷', label: 'Photo' },
                { icon: '🎥', label: 'Video' },
                { icon: '🎵', label: 'Audio' },
                { icon: '📡', label: 'Go Live' },
              ].map((action) => (
                <button
                  key={action.label}
                  className="nothing-button"
                  style={{ fontSize: '0.85rem' }}
                  onClick={() => handleFileUpload(action.label)}
                >
                  <span>{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="nothing-grid custom-scrollbar"
          style={{ gridTemplateColumns: '1fr', gap: '1.5rem' }}
        >
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              index={index}
              onLike={() => handleLikePost(post.id)}
              onComment={() => handleCommentPost(post.id)}
              onShare={() => handleSharePost(post.id)}
              onOptions={() => handlePostOptions(post.id)}
            />
          ))}

          {/* Infinite Scroll Sentinel */}
          <div ref={sentinelRef} style={{ height: '1px', width: '100%' }} />

          {/* Loading More Indicator */}
          {isLoadingMore && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--nothing-text-secondary)',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  border: '3px solid var(--border)',
                  borderTopColor: 'var(--accent)',
                  animation: 'spin 1s linear infinite',
                }}
              />
              <p style={{ marginTop: '1rem' }}>Loading more posts...</p>
            </div>
          )}

          {/* End of Feed */}
          {!hasMore && posts.length > 0 && (
            <div
              style={{
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--nothing-text-secondary)',
                borderTop: '1px solid var(--border)',
              }}
            >
              <p>You're all caught up! 🎉</p>
              <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Come back later for more updates
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
