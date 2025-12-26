'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Radio,
  Users,
  TrendingUp,
  Zap,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  Send,
  Image as ImageIcon,
  Smile,
  AtSign,
  RefreshCw,
  Filter,
  Clock,
  Eye,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Types
interface FeedPost {
  id: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  content: string;
  image?: string;
  video?: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  timestamp: string;
  isLiked: boolean;
  isBookmarked: boolean;
  tags: string[];
  type: 'text' | 'image' | 'video' | 'poll';
}

interface LiveStat {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export default function LiveFeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'following'>(
    'recent'
  );
  const [activeUsers, setActiveUsers] = useState(1247);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with mock posts
  useEffect(() => {
    setPosts([
      {
        id: '1',
        author: {
          id: 'u1',
          name: 'Sarah Johnson',
          username: '@sarahjohnson',
          avatar: '👩‍💼',
          verified: true,
        },
        content:
          'Just deployed a major update to our platform! 🚀 The new features include real-time collaboration, AI-powered insights, and enhanced security. Excited to see what you all build with it!',
        likes: 342,
        comments: 56,
        shares: 23,
        views: 1542,
        timestamp: '2 minutes ago',
        isLiked: false,
        isBookmarked: false,
        tags: ['#ProductLaunch', '#Tech'],
        type: 'text',
      },
      {
        id: '2',
        author: {
          id: 'u2',
          name: 'Marcus Chen',
          username: '@marcusc',
          avatar: '👨‍💻',
          verified: false,
        },
        content:
          'Working on something exciting! Check out this new UI design for our upcoming app. What do you think? Feedback appreciated! 🎨',
        image: '🎨',
        likes: 189,
        comments: 34,
        shares: 12,
        views: 892,
        timestamp: '15 minutes ago',
        isLiked: true,
        isBookmarked: false,
        tags: ['#Design', '#UI'],
        type: 'image',
      },
      {
        id: '3',
        author: {
          id: 'u3',
          name: 'Emma Rodriguez',
          username: '@emmarodriguez',
          avatar: '👩‍🔬',
          verified: true,
        },
        content:
          'Mind-blowing research results! Our AI model achieved 98.7% accuracy on the benchmark. Full paper coming soon. This could change everything in the field! 🧠',
        likes: 567,
        comments: 89,
        shares: 45,
        views: 2341,
        timestamp: '32 minutes ago',
        isLiked: false,
        isBookmarked: true,
        tags: ['#AI', '#Research'],
        type: 'text',
      },
      {
        id: '4',
        author: {
          id: 'u4',
          name: 'Alex Turner',
          username: '@alexturner',
          avatar: '👨‍🎤',
          verified: false,
        },
        content:
          "Quick tip: Using React Server Components can dramatically improve your Next.js app performance. Here's what I learned after migrating our entire codebase...",
        likes: 234,
        comments: 45,
        shares: 19,
        views: 1123,
        timestamp: '1 hour ago',
        isLiked: false,
        isBookmarked: false,
        tags: ['#React', '#NextJS'],
        type: 'text',
      },
    ]);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  }, []);

  const handleLike = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  }, []);

  const handleBookmark = useCallback((postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? { ...post, isBookmarked: !post.isBookmarked }
          : post
      )
    );
  }, []);

  const handlePostSubmit = useCallback(() => {
    if (!newPostContent.trim()) return;

    const newPost: FeedPost = {
      id: Date.now().toString(),
      author: {
        id: 'current-user',
        name: 'You',
        username: '@you',
        avatar: '😊',
        verified: false,
      },
      content: newPostContent,
      likes: 0,
      comments: 0,
      shares: 0,
      views: 0,
      timestamp: 'Just now',
      isLiked: false,
      isBookmarked: false,
      tags: [],
      type: 'text',
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostContent('');
  }, [newPostContent]);

  const liveStats: LiveStat[] = [
    {
      label: 'Active Users',
      value: activeUsers,
      trend: 'up',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Posts Today',
      value: 8934,
      trend: 'up',
      icon: <MessageCircle className="w-4 h-4" />,
    },
    {
      label: 'Trending Topics',
      value: 24,
      trend: 'stable',
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header with Live Indicator */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Radio className="w-8 h-8 text-red-600 dark:text-red-400" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Live Feed
                  <span className="text-xs font-normal px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
                    LIVE
                  </span>
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Real-time updates from your network
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                leftIcon={
                  <RefreshCw
                    className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`}
                  />
                }
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Live Stats */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {liveStats.map((stat, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-3 border border-blue-100 dark:border-gray-600"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </span>
                  {stat.icon}
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value.toLocaleString()}
                  </span>
                  {stat.trend === 'up' && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      ↗
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sort Options */}
          <div className="mt-4 flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <div className="flex gap-2">
              {(['recent', 'popular', 'following'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    sortBy === option
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        ref={scrollRef}
      >
        {/* Create Post Card */}
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg flex-shrink-0">
              😊
            </div>
            <div className="flex-1">
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's happening?"
                className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none outline-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <Smile className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                    <AtSign className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handlePostSubmit}
                  disabled={!newPostContent.trim()}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  Post
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Posts */}
        <div className="space-y-4">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all p-6 border border-gray-200 dark:border-gray-700"
            >
              {/* Post Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl flex-shrink-0">
                    {post.author.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {post.author.name}
                      </h3>
                      {post.author.verified && (
                        <span
                          className="text-blue-600 dark:text-blue-400"
                          title="Verified"
                        >
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{post.author.username}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              {/* Post Content */}
              <div className="mb-4">
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Media */}
                {post.image && (
                  <div className="mt-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-12 flex items-center justify-center text-6xl">
                    {post.image}
                  </div>
                )}

                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-sm px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 cursor-pointer transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Post Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {post.views.toLocaleString()} views
                </span>
                <span>·</span>
                <span>{post.likes} likes</span>
                <span>·</span>
                <span>{post.comments} comments</span>
              </div>

              {/* Post Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                      post.isLiked
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`}
                    />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm font-medium">{post.shares}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleBookmark(post.id)}
                  className={`p-2 rounded-full transition-all ${
                    post.isBookmarked
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Bookmark
                    className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`}
                  />
                </button>
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="mt-6 text-center">
          <Button variant="outline" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Load More Posts
          </Button>
        </div>
      </main>
    </div>
  );
}
