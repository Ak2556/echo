'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  TrendingUp,
  Users,
  Hash,
  Sparkles,
  Search,
  Filter,
  Grid3x3,
  List,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  UserPlus,
  Bookmark,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

// Types
interface TrendingTopic {
  id: string;
  tag: string;
  posts: number;
  growth: number;
}

interface SuggestedUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  followers: number;
  isFollowing: boolean;
}

interface DiscoverPost {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  views: number;
  timestamp: string;
  tags: string[];
}

export default function DiscoverPage() {
  const [activeTab, setActiveTab] = useState<'trending' | 'people' | 'topics'>(
    'trending'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'images' | 'videos' | 'articles'
  >('all');

  // Mock data
  const trendingTopics: TrendingTopic[] = useMemo(
    () => [
      { id: '1', tag: '#WebDevelopment', posts: 15420, growth: 23.5 },
      { id: '2', tag: '#AI', posts: 28900, growth: 45.2 },
      { id: '3', tag: '#React', posts: 12100, growth: 18.7 },
      { id: '4', tag: '#Design', posts: 19800, growth: 31.4 },
      { id: '5', tag: '#Startups', posts: 8500, growth: 12.3 },
    ],
    []
  );

  const suggestedUsers: SuggestedUser[] = useMemo(
    () => [
      {
        id: '1',
        name: 'Sarah Chen',
        username: '@sarahchen',
        avatar: '👩‍💻',
        bio: 'Full-stack developer | React enthusiast | Building in public',
        followers: 12500,
        isFollowing: false,
      },
      {
        id: '2',
        name: 'Alex Kumar',
        username: '@alexkumar',
        avatar: '👨‍🎨',
        bio: 'UI/UX Designer | Creating delightful experiences',
        followers: 8900,
        isFollowing: false,
      },
      {
        id: '3',
        name: 'Maria Garcia',
        username: '@mariagarcia',
        avatar: '👩‍🔬',
        bio: 'AI Researcher | ML Engineer | Tech for good',
        followers: 15200,
        isFollowing: false,
      },
    ],
    []
  );

  const discoverPosts: DiscoverPost[] = useMemo(
    () => [
      {
        id: '1',
        author: { name: 'John Doe', username: '@johndoe', avatar: '👨‍💼' },
        content:
          'Just launched my new project! Check out this amazing React component library 🚀',
        image: '🎨',
        likes: 234,
        comments: 45,
        views: 1200,
        timestamp: '2h ago',
        tags: ['#React', '#OpenSource'],
      },
      {
        id: '2',
        author: { name: 'Jane Smith', username: '@janesmith', avatar: '👩‍🚀' },
        content:
          "AI is transforming the way we build products. Here's what I learned this week...",
        likes: 567,
        comments: 89,
        views: 2400,
        timestamp: '4h ago',
        tags: ['#AI', '#MachineLearning'],
      },
      {
        id: '3',
        author: { name: 'Mike Johnson', username: '@mikej', avatar: '👨‍🎓' },
        content: 'New blog post: 10 Tips for Better Code Reviews 📝',
        likes: 189,
        comments: 23,
        views: 890,
        timestamp: '6h ago',
        tags: ['#Coding', '#BestPractices'],
      },
    ],
    []
  );

  const handleFollow = useCallback((userId: string) => {
    // Implement follow logic
    console.log('Following user:', userId);
  }, []);

  const handleLike = useCallback((postId: string) => {
    // Implement like logic
    console.log('Liking post:', postId);
  }, []);

  const filteredPosts = useMemo(() => {
    return discoverPosts.filter((post) => {
      const matchesSearch =
        searchQuery === '' ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return matchesSearch;
    });
  }, [discoverPosts, searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-gray-900 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Discover
                </h1>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Explore trending content and people
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search posts, topics, or people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="w-4 h-4" />}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={selectedFilter}
                onChange={(e) =>
                  setSelectedFilter(e.target.value as typeof selectedFilter)
                }
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Content</option>
                <option value="images">Images</option>
                <option value="videos">Videos</option>
                <option value="articles">Articles</option>
              </select>
              <Button variant="outline" size="md">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-1 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'trending'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trending
              </div>
            </button>
            <button
              onClick={() => setActiveTab('people')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'people'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                People
              </div>
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === 'topics'
                  ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Topics
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'trending' && (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all p-6 border border-gray-200 dark:border-gray-700"
              >
                {/* Author */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-lg">
                      {post.author.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">
                        {post.author.name}
                      </h3>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        {post.author.username} · {post.timestamp}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <p className="text-gray-900 dark:text-gray-100 font-medium mb-3 line-clamp-3 leading-relaxed">
                  {post.content}
                </p>

                {/* Image */}
                {post.image && (
                  <div className="mb-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 flex items-center justify-center text-4xl">
                    {post.image}
                  </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <button
                      onClick={() => handleLike(post.id)}
                      className="flex items-center gap-1 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      {post.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      {post.comments}
                    </button>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {post.views}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors">
                      <Bookmark className="w-4 h-4" />
                    </button>
                    <button className="text-gray-500 dark:text-gray-400 hover:text-green-500 dark:hover:text-green-400 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {activeTab === 'people' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl mb-4">
                    {user.avatar}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {user.username}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {user.bio}
                  </p>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {user.followers.toLocaleString()}
                    </span>{' '}
                    followers
                  </div>
                  <Button
                    variant={user.isFollowing ? 'secondary' : 'primary'}
                    size="sm"
                    fullWidth
                    leftIcon={<UserPlus className="w-4 h-4" />}
                    onClick={() => handleFollow(user.id)}
                  >
                    {user.isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'topics' && (
          <div className="space-y-3">
            {trendingTopics.map((topic) => (
              <div
                key={topic.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Hash className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {topic.tag}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {topic.posts.toLocaleString()} posts
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <TrendingUp className="w-5 h-5" />
                      <span className="font-semibold">+{topic.growth}%</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      vs last week
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredPosts.length === 0 && activeTab === 'trending' && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No results found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
