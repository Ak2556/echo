'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useResponsive } from '@/hooks/useResponsive';

// Types for our social media mixture
type PostType =
  | 'text'
  | 'image'
  | 'video'
  | 'story'
  | 'reel'
  | 'thread'
  | 'poll'
  | 'live';
type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'voice'
  | 'sticker'
  | 'gif'
  | 'location'
  | 'file';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  followers: number;
  following: number;
  isOnline: boolean;
  lastSeen?: Date;
  bio?: string;
  location?: string;
}

interface Post {
  id: string;
  author: User;
  content: string;
  type: PostType;
  media?: {
    type: 'image' | 'video' | 'carousel';
    urls: string[];
    thumbnail?: string;
    duration?: string;
  };
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  isLiked: boolean;
  isBookmarked: boolean;
  hashtags: string[];
  mentions: string[];
  location?: string;
  poll?: {
    question: string;
    options: { text: string; votes: number }[];
    totalVotes: number;
    expiresAt: Date;
    userVote?: number;
  };
  thread?: Post[];
}

interface Story {
  id: string;
  author: User;
  media: {
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
  };
  timestamp: Date;
  views: number;
  isViewed: boolean;
  duration: number;
}

interface Message {
  id: string;
  sender: User;
  recipient: User;
  content: string;
  type: MessageType;
  media?: {
    type: MessageType;
    url: string;
    thumbnail?: string;
    duration?: string;
    size?: number;
  };
  timestamp: Date;
  isRead: boolean;
  isDelivered: boolean;
  replyTo?: Message;
  reactions: { emoji: string; users: User[] }[];
  isEdited: boolean;
  isDeleted: boolean;
}

interface Chat {
  id: string;
  participants: User[];
  lastMessage: Message;
  unreadCount: number;
  isGroup: boolean;
  groupName?: string;
  groupAvatar?: string;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
}

// Main Social Media Hub Component
export default function SocialMediaHub() {
  const { actualColorMode } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  // State management
  const [activeTab, setActiveTab] = useState<
    'feed' | 'stories' | 'messages' | 'explore' | 'profile'
  >('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  // Sample data initialization
  useEffect(() => {
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    // Sample users
    const users: User[] = [
      {
        id: '1',
        username: 'priya_sharma',
        displayName: 'Priya Sharma',
        avatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya&backgroundColor=b6e3f4',
        verified: true,
        followers: 12500,
        following: 890,
        isOnline: true,
        bio: '🎨 Digital Artist | 📍 Mumbai | ✨ Creating magic with pixels',
        location: 'Mumbai, India',
      },
      {
        id: '2',
        username: 'arjun_dev',
        displayName: 'Arjun Singh',
        avatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun&backgroundColor=c0aede',
        verified: false,
        followers: 3200,
        following: 1200,
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        bio: '💻 Full Stack Developer | 🚀 Building the future',
        location: 'Bangalore, India',
      },
      {
        id: '3',
        username: 'kavya_food',
        displayName: 'Kavya Iyer',
        avatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=Kavya&backgroundColor=f0e6ff',
        verified: true,
        followers: 45000,
        following: 2100,
        isOnline: true,
        bio: '🍛 Food Blogger | 📸 Recipe Creator | 🌶️ Spice Lover',
        location: 'Chennai, India',
      },
    ];

    // Sample posts
    const samplePosts: Post[] = [
      {
        id: '1',
        author: users[0],
        content:
          'Just finished this amazing digital artwork! What do you think? 🎨✨ #DigitalArt #CreativeProcess',
        type: 'image',
        media: {
          type: 'image',
          urls: [
            'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          ],
        },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 1247,
        comments: 89,
        shares: 156,
        bookmarks: 234,
        isLiked: false,
        isBookmarked: true,
        hashtags: ['#DigitalArt', '#CreativeProcess'],
        mentions: [],
        location: 'Mumbai, India',
      },
      {
        id: '2',
        author: users[1],
        content:
          'Building something amazing with React and TypeScript! The developer experience is incredible 🚀',
        type: 'text',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 567,
        comments: 45,
        shares: 78,
        bookmarks: 123,
        isLiked: true,
        isBookmarked: false,
        hashtags: ['#React', '#TypeScript', '#WebDev'],
        mentions: [],
        poll: {
          question: "What's your favorite frontend framework?",
          options: [
            { text: 'React', votes: 1234 },
            { text: 'Vue', votes: 567 },
            { text: 'Angular', votes: 345 },
            { text: 'Svelte', votes: 234 },
          ],
          totalVotes: 2380,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          userVote: 0,
        },
      },
      {
        id: '3',
        author: users[2],
        content:
          'Made this incredible South Indian feast today! Recipe thread below 👇🍛',
        type: 'video',
        media: {
          type: 'video',
          urls: [
            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          ],
          thumbnail:
            'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop',
          duration: '2:34',
        },
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 2341,
        comments: 234,
        shares: 456,
        bookmarks: 789,
        isLiked: true,
        isBookmarked: true,
        hashtags: ['#SouthIndianFood', '#Recipe', '#Cooking'],
        mentions: [],
        location: 'Chennai, India',
      },
    ];

    // Sample stories
    const sampleStories: Story[] = [
      {
        id: '1',
        author: users[0],
        media: {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=700&fit=crop',
        },
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        views: 234,
        isViewed: false,
        duration: 5000,
      },
      {
        id: '2',
        author: users[1],
        media: {
          type: 'video',
          url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail:
            'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=700&fit=crop',
        },
        timestamp: new Date(Date.now() - 60 * 60 * 1000),
        views: 567,
        isViewed: true,
        duration: 15000,
      },
    ];

    // Sample chats
    const sampleChats: Chat[] = [
      {
        id: '1',
        participants: [users[0]],
        lastMessage: {
          id: '1',
          sender: users[0],
          recipient: users[1], // Current user
          content: 'Hey! Love your latest post 🔥',
          type: 'text',
          timestamp: new Date(Date.now() - 10 * 60 * 1000),
          isRead: false,
          isDelivered: true,
          reactions: [],
          isEdited: false,
          isDeleted: false,
        },
        unreadCount: 2,
        isGroup: false,
        isPinned: true,
        isMuted: false,
        isArchived: false,
      },
      {
        id: '2',
        participants: [users[2]],
        lastMessage: {
          id: '2',
          sender: users[2],
          recipient: users[1], // Current user
          content: 'Check out this recipe! 🍛',
          type: 'image',
          media: {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop',
            thumbnail:
              'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
          },
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: true,
          isDelivered: true,
          reactions: [{ emoji: '😍', users: [users[1]] }],
          isEdited: false,
          isDeleted: false,
        },
        unreadCount: 0,
        isGroup: false,
        isPinned: false,
        isMuted: false,
        isArchived: false,
      },
    ];

    setPosts(samplePosts);
    setStories(sampleStories);
    setChats(sampleChats);
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current && messagesEndRef.current.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle message sending
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim() || !activeChat) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: {
        id: 'current_user',
        username: 'you',
        displayName: 'You',
        avatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=a7e6ff',
        verified: false,
        followers: 0,
        following: 0,
        isOnline: true,
      },
      recipient: activeChat.participants[0],
      content: newMessage,
      type: 'text',
      timestamp: new Date(),
      isRead: false,
      isDelivered: false,
      reactions: [],
      isEdited: false,
      isDeleted: false,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');

    // Simulate message delivery
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === message.id ? { ...msg, isDelivered: true } : msg
        )
      );
    }, 1000);
  }, [newMessage, activeChat]);

  // Handle typing indicator
  useEffect(() => {
    if (newMessage.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [newMessage]);

  // Render components based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedView posts={posts} setPosts={setPosts} />;
      case 'stories':
        return (
          <StoriesView
            stories={stories}
            selectedStory={selectedStory}
            setSelectedStory={setSelectedStory}
          />
        );
      case 'messages':
        return (
          <MessagesView
            chats={chats}
            activeChat={activeChat}
            setActiveChat={setActiveChat}
            messages={messages}
            setMessages={setMessages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            isTyping={isTyping}
            messagesEndRef={messagesEndRef}
            messageInputRef={messageInputRef}
          />
        );
      case 'explore':
        return <ExploreView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <FeedView posts={posts} setPosts={setPosts} />;
    }
  };

  return (
    <div
      className="social-media-hub"
      style={{
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--fg-primary)',
      }}
    >
      {/* Main Content */}
      <main
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '1rem' : '2rem',
        }}
      >
        {renderContent()}
      </main>
    </div>
  );
}

// Feed View Component
const FeedView = ({
  posts,
  setPosts,
}: {
  posts: Post[];
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>;
}) => {
  const { isMobile } = useResponsive();
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [mediaFiles, setMediaFiles] = useState<
    { type: 'image' | 'video' | 'audio'; url: string; file: File }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<
    'image' | 'video' | 'audio' | null
  >(null);

  const handleMediaSelect = (type: 'image' | 'video' | 'audio') => {
    setMediaType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        type === 'image' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const url = URL.createObjectURL(file);

    if (mediaType) {
      setMediaFiles((prev) => [...prev, { type: mediaType, url, file }]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowCreatePost(true);
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleLike = (postId: string) => {
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
  };

  const handleBookmark = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isBookmarked: !post.isBookmarked,
              bookmarks: post.isBookmarked
                ? post.bookmarks - 1
                : post.bookmarks + 1,
            }
          : post
      )
    );
  };

  const handleCreatePost = () => {
    if (!newPost.trim() && mediaFiles.length === 0) return;

    // Determine post type based on media
    let postType: PostType = 'text';
    let media: Post['media'] = undefined;

    if (mediaFiles.length > 0) {
      const firstMedia = mediaFiles[0];
      if (firstMedia.type === 'image') {
        postType = mediaFiles.length > 1 ? 'image' : 'image';
        media = {
          type: mediaFiles.length > 1 ? 'carousel' : 'image',
          urls: mediaFiles.filter((m) => m.type === 'image').map((m) => m.url),
        };
      } else if (firstMedia.type === 'video') {
        postType = 'video';
        media = {
          type: 'video',
          urls: [firstMedia.url],
          thumbnail: firstMedia.url,
        };
      }
    }

    const post: Post = {
      id: Date.now().toString(),
      author: {
        id: 'current_user',
        username: 'you',
        displayName: 'You',
        avatar:
          'https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=a7e6ff',
        verified: false,
        followers: 0,
        following: 0,
        isOnline: true,
      },
      content: newPost,
      type: postType,
      media,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      bookmarks: 0,
      isLiked: false,
      isBookmarked: false,
      hashtags: newPost.match(/#\w+/g) || [],
      mentions: newPost.match(/@\w+/g) || [],
    };

    setPosts((prev) => [post, ...prev]);
    setNewPost('');
    setMediaFiles([]);
    setShowCreatePost(false);
  };

  const handleComment = (postId: string) => {
    if (commentingPostId === postId) {
      // Submit comment
      if (commentText.trim()) {
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId ? { ...post, comments: post.comments + 1 } : post
          )
        );
        setCommentText('');
        setCommentingPostId(null);
      }
    } else {
      // Open comment input
      setCommentingPostId(postId);
      setCommentText('');
    }
  };

  const handleShare = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post
      )
    );
    // Show share confirmation
    alert('Post shared to your timeline!');
  };

  const handlePollVote = (postId: string, optionIndex: number) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId || !post.poll) return post;

        // If already voted for this option, do nothing
        if (post.poll.userVote === optionIndex) return post;

        const newPoll = { ...post.poll };
        const options = [...newPoll.options];

        // If previously voted, decrement old vote
        if (newPoll.userVote !== undefined) {
          options[newPoll.userVote] = {
            ...options[newPoll.userVote],
            votes: options[newPoll.userVote].votes - 1,
          };
        } else {
          // New vote, increment total
          newPoll.totalVotes = newPoll.totalVotes + 1;
        }

        // Increment new vote
        options[optionIndex] = {
          ...options[optionIndex],
          votes: options[optionIndex].votes + 1,
        };

        return {
          ...post,
          poll: {
            ...newPoll,
            options,
            userVote: optionIndex,
          },
        };
      })
    );
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
        gap: '2rem',
      }}
    >
      {/* Main Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Create Post */}
        <motion.div
          className="create-post-card"
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-primary)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div
            style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}
          >
            <Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=a7e6ff"
              alt="Your Avatar"
              width={48}
              height={48}
              style={{ borderRadius: '50%' }}
            />
            <div style={{ flex: 1 }}>
              {!showCreatePost ? (
                <button
                  onClick={() => setShowCreatePost(true)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '1px solid var(--border-primary)',
                    background: 'var(--bg-primary)',
                    color: 'var(--fg-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '1rem',
                  }}
                >
                  What's on your mind?
                </button>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />

                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's happening?"
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--fg-primary)',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />

                  {/* Media Preview */}
                  {mediaFiles.length > 0 && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          mediaFiles.length === 1 ? '1fr' : 'repeat(2, 1fr)',
                        gap: '0.5rem',
                      }}
                    >
                      {mediaFiles.map((media, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: 'relative',
                            borderRadius: '8px',
                            overflow: 'hidden',
                          }}
                        >
                          {media.type === 'image' && (
                            <img
                              src={media.url}
                              alt={`Upload ${idx + 1}`}
                              style={{
                                width: '100%',
                                height:
                                  mediaFiles.length === 1 ? '300px' : '150px',
                                objectFit: 'cover',
                              }}
                            />
                          )}
                          {media.type === 'video' && (
                            <video
                              src={media.url}
                              style={{
                                width: '100%',
                                height:
                                  mediaFiles.length === 1 ? '300px' : '150px',
                                objectFit: 'cover',
                              }}
                              controls
                            />
                          )}
                          {media.type === 'audio' && (
                            <div
                              style={{
                                padding: '1rem',
                                background: 'var(--bg-tertiary)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <span style={{ fontSize: '1.5rem' }}>🎵</span>
                              <audio
                                src={media.url}
                                controls
                                style={{ flex: 1 }}
                              />
                            </div>
                          )}
                          <button
                            onClick={() => removeMedia(idx)}
                            style={{
                              position: 'absolute',
                              top: '0.5rem',
                              right: '0.5rem',
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              border: 'none',
                              background: 'rgba(0, 0, 0, 0.7)',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleMediaSelect('image')}
                        title="Add Photo"
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                        }}
                      >
                        📷
                      </button>
                      <button
                        onClick={() => handleMediaSelect('video')}
                        title="Add Video"
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                        }}
                      >
                        🎥
                      </button>
                      <button
                        onClick={() => handleMediaSelect('audio')}
                        title="Add Audio"
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                        }}
                      >
                        🎵
                      </button>
                      <button
                        title="Add Poll"
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                        }}
                      >
                        📊
                      </button>
                      <button
                        title="Add Location"
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                        }}
                      >
                        📍
                      </button>
                      <button
                        title="Add Emoji"
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                        }}
                      >
                        😊
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setShowCreatePost(false);
                          setNewPost('');
                          setMediaFiles([]);
                        }}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-primary)',
                          background: 'transparent',
                          color: 'var(--fg-secondary)',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim() && mediaFiles.length === 0}
                        style={{
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          background:
                            newPost.trim() || mediaFiles.length > 0
                              ? 'var(--accent)'
                              : 'var(--bg-tertiary)',
                          color:
                            newPost.trim() || mediaFiles.length > 0
                              ? 'white'
                              : 'var(--fg-muted)',
                          cursor:
                            newPost.trim() || mediaFiles.length > 0
                              ? 'pointer'
                              : 'not-allowed',
                          fontWeight: 600,
                        }}
                      >
                        Post
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Posts */}
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              className="post-card"
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '1.5rem',
                border: '1px solid var(--border-primary)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Post Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <Image
                    src={post.author.avatar}
                    alt={post.author.displayName}
                    width={48}
                    height={48}
                    style={{ borderRadius: '50%' }}
                  />
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                        {post.author.displayName}
                      </span>
                      {post.author.verified && (
                        <span style={{ color: 'var(--accent)' }}>✓</span>
                      )}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem',
                        color: 'var(--fg-secondary)',
                      }}
                    >
                      <span>@{post.author.username}</span>
                      <span>•</span>
                      <span>
                        {new Date(post.timestamp).toLocaleDateString()}
                      </span>
                      {post.location && (
                        <>
                          <span>•</span>
                          <span>📍 {post.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  style={{
                    padding: '0.5rem',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--fg-secondary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                  }}
                >
                  ⋯
                </button>
              </div>

              {/* Post Content */}
              <div style={{ marginBottom: '1rem' }}>
                <p
                  style={{
                    fontSize: '1rem',
                    lineHeight: 1.6,
                    margin: '0 0 1rem 0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {post.content}
                </p>

                {/* Media */}
                {post.media && (
                  <div
                    style={{
                      borderRadius: '12px',
                      overflow: 'hidden',
                      marginBottom: '1rem',
                    }}
                  >
                    {post.media.type === 'image' && (
                      <Image
                        src={post.media.urls[0]}
                        alt="Post media"
                        width={800}
                        height={600}
                        style={{
                          width: '100%',
                          height: 'auto',
                          maxHeight: '500px',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                    {post.media.type === 'video' && (
                      <video
                        src={post.media.urls[0]}
                        poster={post.media.thumbnail}
                        controls
                        style={{
                          width: '100%',
                          maxHeight: '500px',
                          objectFit: 'cover',
                        }}
                      />
                    )}
                  </div>
                )}

                {/* Poll */}
                {post.poll && (
                  <div
                    style={{
                      background: 'var(--bg-primary)',
                      borderRadius: '12px',
                      padding: '1rem',
                      border: '1px solid var(--border-primary)',
                      marginBottom: '1rem',
                    }}
                  >
                    <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
                      {post.poll.question}
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      {post.poll.options.map((option, idx) => {
                        const percentage =
                          (option.votes / post.poll!.totalVotes) * 100;
                        const isSelected = post.poll!.userVote === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handlePollVote(post.id, idx)}
                            style={{
                              position: 'relative',
                              padding: '0.75rem 1rem',
                              borderRadius: '8px',
                              border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border-primary)'}`,
                              background: 'transparent',
                              color: 'var(--fg-primary)',
                              textAlign: 'left',
                              cursor: 'pointer',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: `${percentage}%`,
                                background: isSelected
                                  ? 'var(--accent)'
                                  : 'var(--bg-tertiary)',
                                opacity: 0.3,
                                transition: 'width 0.3s ease',
                              }}
                            />
                            <div
                              style={{
                                position: 'relative',
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>{option.text}</span>
                              <span style={{ fontWeight: 600 }}>
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <p
                      style={{
                        margin: '1rem 0 0 0',
                        fontSize: '0.9rem',
                        color: 'var(--fg-secondary)',
                      }}
                    >
                      {post.poll.totalVotes.toLocaleString()} votes • Ends{' '}
                      {new Date(post.poll.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Post Actions */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border-primary)',
                }}
              >
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleLike(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: post.isLiked
                        ? 'rgba(239, 68, 68, 0.1)'
                        : 'transparent',
                      color: post.isLiked ? '#ef4444' : 'var(--fg-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    <span>{post.isLiked ? '❤️' : '🤍'}</span>
                    <span>{post.likes.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={() => handleComment(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background:
                        commentingPostId === post.id
                          ? 'rgba(59, 130, 246, 0.1)'
                          : 'transparent',
                      color:
                        commentingPostId === post.id
                          ? '#3b82f6'
                          : 'var(--fg-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    <span>💬</span>
                    <span>{post.comments.toLocaleString()}</span>
                  </button>
                  <button
                    onClick={() => handleShare(post.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--fg-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                    }}
                  >
                    <span>🔄</span>
                    <span>{post.shares.toLocaleString()}</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleBookmark(post.id)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: post.isBookmarked
                        ? 'var(--accent)'
                        : 'var(--fg-secondary)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                    }}
                  >
                    {post.isBookmarked ? '🔖' : '📑'}
                  </button>
                  <button
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--fg-secondary)',
                      cursor: 'pointer',
                      fontSize: '1.1rem',
                    }}
                  >
                    📤
                  </button>
                </div>
              </div>

              {/* Comment Input */}
              {commentingPostId === post.id && (
                <div
                  style={{
                    marginTop: '1rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid var(--border-primary)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Image
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=You&backgroundColor=a7e6ff"
                      alt="Your Avatar"
                      width={36}
                      height={36}
                      style={{ borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        style={{
                          width: '100%',
                          minHeight: '60px',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid var(--border-primary)',
                          background: 'var(--bg-primary)',
                          color: 'var(--fg-primary)',
                          fontSize: '0.9rem',
                          resize: 'vertical',
                          fontFamily: 'inherit',
                        }}
                      />
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          gap: '0.5rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        <button
                          onClick={() => setCommentingPostId(null)}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: '1px solid var(--border-primary)',
                            background: 'transparent',
                            color: 'var(--fg-secondary)',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleComment(post.id)}
                          disabled={!commentText.trim()}
                          style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            background: commentText.trim()
                              ? 'var(--accent)'
                              : 'var(--bg-tertiary)',
                            color: commentText.trim()
                              ? 'white'
                              : 'var(--fg-muted)',
                            cursor: commentText.trim()
                              ? 'pointer'
                              : 'not-allowed',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                          }}
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar */}
      {!isMobile && (
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
        >
          {/* Trending */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              🔥 Trending
            </h3>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {[
                { tag: '#ReactJS', posts: '12.5K posts' },
                { tag: '#WebDev', posts: '8.3K posts' },
                { tag: '#IndianFood', posts: '5.7K posts' },
                { tag: '#DigitalArt', posts: '4.2K posts' },
              ].map((trend, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)',
                    cursor: 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--accent)' }}>
                    {trend.tag}
                  </div>
                  <div
                    style={{ fontSize: '0.9rem', color: 'var(--fg-secondary)' }}
                  >
                    {trend.posts}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Users */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid var(--border-primary)',
            }}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              👥 Suggested for you
            </h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {[
                {
                  name: 'Ravi Kumar',
                  username: 'ravi_tech',
                  avatar:
                    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ravi&backgroundColor=ffd5dc',
                  followers: '2.3K',
                },
                {
                  name: 'Sneha Patel',
                  username: 'sneha_design',
                  avatar:
                    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha&backgroundColor=ffdfba',
                  followers: '1.8K',
                },
              ].map((user, idx) => {
                const isFollowing = followingUsers.has(user.username);
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <Image
                      src={user.avatar}
                      alt={user.name}
                      width={40}
                      height={40}
                      style={{ borderRadius: '50%' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {user.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--fg-secondary)',
                        }}
                      >
                        @{user.username} • {user.followers} followers
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setFollowingUsers((prev) => {
                          const newSet = new Set(prev);
                          if (isFollowing) {
                            newSet.delete(user.username);
                          } else {
                            newSet.add(user.username);
                          }
                          return newSet;
                        });
                      }}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        border: isFollowing
                          ? 'none'
                          : '1px solid var(--accent)',
                        background: isFollowing
                          ? 'var(--accent)'
                          : 'transparent',
                        color: isFollowing ? 'white' : 'var(--accent)',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Stories View Component
const StoriesView = memo(
  ({
    stories,
    selectedStory,
    setSelectedStory,
  }: {
    stories: Story[];
    selectedStory: Story | null;
    setSelectedStory: React.Dispatch<React.SetStateAction<Story | null>>;
  }) => {
    return (
      <div>
        <h2
          style={{
            marginBottom: '1.5rem',
            fontSize: '1.5rem',
            fontWeight: 700,
          }}
        >
          📸 Stories
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1rem',
          }}
        >
          {stories.map((story) => (
            <motion.div
              key={story.id}
              onClick={() => setSelectedStory(story)}
              style={{
                position: 'relative',
                aspectRatio: '9/16',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: story.isViewed
                  ? '2px solid var(--border-primary)'
                  : '2px solid var(--accent)',
              }}
            >
              <Image
                src={story.media.thumbnail || story.media.url}
                alt={`${story.author.displayName}'s story`}
                fill
                style={{ objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  padding: '1rem 0.5rem 0.5rem',
                  color: 'white',
                }}
              >
                <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                  {story.author.displayName}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  {new Date(story.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
);

// Messages View Component
const MessagesView = memo(
  ({
    chats,
    activeChat,
    setActiveChat,
    messages,
    setMessages,
    newMessage,
    setNewMessage,
    handleSendMessage,
    isTyping,
    messagesEndRef,
    messageInputRef,
  }: {
    chats: Chat[];
    activeChat: Chat | null;
    setActiveChat: React.Dispatch<React.SetStateAction<Chat | null>>;
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
    isTyping: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    messageInputRef: React.RefObject<HTMLTextAreaElement | null>;
  }) => {
    const { isMobile } = useResponsive();

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
          height: '80vh',
          border: '1px solid var(--border-primary)',
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'var(--bg-secondary)',
        }}
      >
        {/* Chat List */}
        {(!isMobile || !activeChat) && (
          <div
            style={{
              borderRight: '1px solid var(--border-primary)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Chat List Header */}
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border-primary)',
                background: 'var(--bg-primary)',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>
                💬 Messages
              </h3>
            </div>

            {/* Chat List */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {chats.map((chat) => (
                <motion.div
                  key={chat.id}
                  onClick={() => setActiveChat(chat)}
                  style={{
                    padding: '1rem',
                    borderBottom: '1px solid var(--border-primary)',
                    cursor: 'pointer',
                    background:
                      activeChat?.id === chat.id
                        ? 'var(--bg-tertiary)'
                        : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <Image
                      src={chat.participants[0].avatar}
                      alt={chat.participants[0].displayName}
                      width={48}
                      height={48}
                      style={{ borderRadius: '50%' }}
                    />
                    {chat.participants[0].isOnline && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          right: 0,
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: '#10b981',
                          border: '2px solid var(--bg-secondary)',
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '0.25rem',
                      }}
                    >
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {chat.participants[0].displayName}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--fg-secondary)',
                        }}
                      >
                        {new Date(
                          chat.lastMessage.timestamp
                        ).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--fg-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {chat.lastMessage.type === 'text'
                        ? chat.lastMessage.content
                        : `📎 ${chat.lastMessage.type}`}
                    </div>
                  </div>
                  {chat.unreadCount > 0 && (
                    <div
                      style={{
                        background: 'var(--accent)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '20px',
                        height: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                      }}
                    >
                      {chat.unreadCount}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Window */}
        {activeChat ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <div
              style={{
                padding: '1rem',
                borderBottom: '1px solid var(--border-primary)',
                background: 'var(--bg-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                {isMobile && (
                  <button
                    onClick={() => setActiveChat(null)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--fg-primary)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                    }}
                  >
                    ←
                  </button>
                )}
                <div style={{ position: 'relative' }}>
                  <Image
                    src={activeChat.participants[0].avatar}
                    alt={activeChat.participants[0].displayName}
                    width={40}
                    height={40}
                    style={{ borderRadius: '50%' }}
                  />
                  {activeChat.participants[0].isOnline && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#10b981',
                        border: '2px solid var(--bg-primary)',
                      }}
                    />
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '1rem' }}>
                    {activeChat.participants[0].displayName}
                  </div>
                  <div
                    style={{ fontSize: '0.8rem', color: 'var(--fg-secondary)' }}
                  >
                    {activeChat.participants[0].isOnline
                      ? 'Online'
                      : `Last seen ${activeChat.participants[0].lastSeen?.toLocaleTimeString()}`}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--bg-secondary)',
                    color: 'var(--fg-primary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                  }}
                >
                  📞
                </button>
                <button
                  style={{
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--bg-secondary)',
                    color: 'var(--fg-primary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                  }}
                >
                  📹
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent:
                      message.sender.id === 'current_user'
                        ? 'flex-end'
                        : 'flex-start',
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div
                    style={{
                      maxWidth: '70%',
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      background:
                        message.sender.id === 'current_user'
                          ? 'var(--accent)'
                          : 'var(--bg-tertiary)',
                      color:
                        message.sender.id === 'current_user'
                          ? 'white'
                          : 'var(--fg-primary)',
                    }}
                  >
                    {message.media && (
                      <div style={{ marginBottom: '0.5rem' }}>
                        {message.media.type === 'image' && (
                          <Image
                            src={message.media.url}
                            alt="Shared image"
                            width={200}
                            height={150}
                            style={{
                              borderRadius: '8px',
                              objectFit: 'cover',
                              width: '100%',
                              height: 'auto',
                            }}
                          />
                        )}
                      </div>
                    )}
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                      {message.content}
                    </p>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        opacity: 0.7,
                        marginTop: '0.25rem',
                        textAlign: 'right',
                      }}
                    >
                      {new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                      {message.sender.id === 'current_user' && (
                        <span style={{ marginLeft: '0.5rem' }}>
                          {message.isDelivered ? '✓✓' : '✓'}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  style={{ display: 'flex', justifyContent: 'flex-start' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      borderRadius: '16px',
                      background: 'var(--bg-tertiary)',
                      color: 'var(--fg-secondary)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {activeChat.participants[0].displayName} is typing...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div
              style={{
                padding: '1rem',
                borderTop: '1px solid var(--border-primary)',
                background: 'var(--bg-primary)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'flex-end',
                }}
              >
                <button
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--bg-secondary)',
                    color: 'var(--fg-primary)',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                  }}
                >
                  📎
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <textarea
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type a message..."
                    style={{
                      width: '100%',
                      minHeight: '44px',
                      maxHeight: '120px',
                      padding: '0.75rem 3rem 0.75rem 1rem',
                      borderRadius: '12px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--fg-primary)',
                      fontSize: '1rem',
                      resize: 'none',
                      fontFamily: 'inherit',
                    }}
                  />
                  <button
                    style={{
                      position: 'absolute',
                      right: '0.5rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--fg-secondary)',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                    }}
                  >
                    😊
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: newMessage.trim()
                      ? 'var(--accent)'
                      : 'var(--bg-secondary)',
                    color: newMessage.trim() ? 'white' : 'var(--fg-muted)',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    fontSize: '1.2rem',
                  }}
                >
                  📤
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              color: 'var(--fg-secondary)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ margin: '0 0 0.5rem 0' }}>Select a conversation</h3>
              <p style={{ margin: 0 }}>
                Choose from your existing conversations or start a new one
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }
);

// Explore View Component
const ExploreView = memo(() => {
  return (
    <div>
      <h2
        style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}
      >
        🔍 Explore
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Trending Topics */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-primary)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1rem 0',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            🔥 Trending Topics
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {[
              { topic: 'React 18 Features', posts: '15.2K' },
              { topic: 'Indian Street Food', posts: '12.8K' },
              { topic: 'Digital Art Trends', posts: '9.4K' },
              { topic: 'Startup Stories', posts: '7.1K' },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem',
                  borderRadius: '8px',
                  background: 'var(--bg-primary)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontWeight: 600 }}>{item.topic}</div>
                <div
                  style={{ fontSize: '0.9rem', color: 'var(--fg-secondary)' }}
                >
                  {item.posts} posts
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Creators */}
        <div
          style={{
            background: 'var(--bg-secondary)',
            borderRadius: '16px',
            padding: '1.5rem',
            border: '1px solid var(--border-primary)',
          }}
        >
          <h3
            style={{
              margin: '0 0 1rem 0',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          >
            ⭐ Popular Creators
          </h3>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
          >
            {[
              {
                name: 'Tech Guru',
                username: 'techguru_in',
                followers: '125K',
                avatar:
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=TechGuru&backgroundColor=a7e6ff',
              },
              {
                name: 'Food Explorer',
                username: 'foodie_explorer',
                followers: '89K',
                avatar:
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=FoodExplorer&backgroundColor=ffdfba',
              },
            ].map((creator, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                }}
              >
                <Image
                  src={creator.avatar}
                  alt={creator.name}
                  width={48}
                  height={48}
                  style={{ borderRadius: '50%' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{creator.name}</div>
                  <div
                    style={{ fontSize: '0.9rem', color: 'var(--fg-secondary)' }}
                  >
                    @{creator.username} • {creator.followers} followers
                  </div>
                </div>
                <button
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    border: '1px solid var(--accent)',
                    background: 'var(--accent)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                  }}
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

// Profile View Component
const ProfileView = memo(() => {
  const { isMobile } = useResponsive();
  const [activeTab, setActiveTab] = useState<
    'posts' | 'media' | 'likes' | 'saved'
  >('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Your Name',
    username: 'your_username',
    bio: 'Digital creator & tech enthusiast | Building amazing experiences | Coffee addict ☕ | Open for collaborations',
    location: 'San Francisco, CA',
    website: 'https://alexjohnson.dev',
    joinDate: 'January 2024',
  });
  const [editForm, setEditForm] = useState(profile);

  const stats = {
    posts: 127,
    followers: 2847,
    following: 892,
  };

  const highlights = [
    {
      id: '1',
      name: 'Travel',
      cover:
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop',
    },
    {
      id: '2',
      name: 'Food',
      cover:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=100&h=100&fit=crop',
    },
    {
      id: '3',
      name: 'Tech',
      cover:
        'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop',
    },
    {
      id: '4',
      name: 'Art',
      cover:
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=100&h=100&fit=crop',
    },
    {
      id: '5',
      name: 'Music',
      cover:
        'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=100&h=100&fit=crop',
    },
  ];

  const userPosts = [
    {
      id: '1',
      type: 'image',
      media:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
      likes: 234,
      comments: 18,
    },
    {
      id: '2',
      type: 'image',
      media:
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
      likes: 567,
      comments: 42,
    },
    {
      id: '3',
      type: 'video',
      media:
        'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=400&fit=crop',
      likes: 891,
      comments: 67,
    },
    {
      id: '4',
      type: 'image',
      media:
        'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop',
      likes: 123,
      comments: 9,
    },
    {
      id: '5',
      type: 'image',
      media:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
      likes: 456,
      comments: 31,
    },
    {
      id: '6',
      type: 'image',
      media:
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=400&fit=crop',
      likes: 789,
      comments: 54,
    },
  ];

  const handleSaveProfile = () => {
    setProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div>
      <h2
        style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: 700 }}
      >
        👤 Profile
      </h2>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: '1rem' }}>
        {/* Profile Header */}
        <div
          style={{
            display: 'flex',
            gap: isMobile ? '1rem' : '2rem',
            alignItems: 'flex-start',
            marginBottom: '2rem',
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              flexShrink: 0,
              alignSelf: isMobile ? 'center' : 'flex-start',
            }}
          >
            <Image
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=a7e6ff"
              alt="Profile Avatar"
              width={isMobile ? 80 : 150}
              height={isMobile ? 80 : 150}
              style={{
                borderRadius: '50%',
                border: '3px solid var(--border-primary)',
              }}
            />
          </div>

          {/* Profile Info */}
          <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            {/* Username Row */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 400 }}>
                @{profile.username}
              </h2>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--bg-tertiary)',
                  color: 'var(--fg-primary)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                Edit Profile
              </button>
              <button
                style={{
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--fg-primary)',
                  cursor: 'pointer',
                  fontSize: '1.25rem',
                }}
              >
                ⚙️
              </button>
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: 'flex',
                gap: '2rem',
                marginBottom: '1rem',
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}
            >
              <div>
                <span style={{ fontWeight: 600 }}>{stats.posts}</span>
                <span
                  style={{
                    color: 'var(--fg-secondary)',
                    marginLeft: '0.25rem',
                  }}
                >
                  Posts
                </span>
              </div>
              <div style={{ cursor: 'pointer' }}>
                <span style={{ fontWeight: 600 }}>
                  {stats.followers.toLocaleString()}
                </span>
                <span
                  style={{
                    color: 'var(--fg-secondary)',
                    marginLeft: '0.25rem',
                  }}
                >
                  Followers
                </span>
              </div>
              <div style={{ cursor: 'pointer' }}>
                <span style={{ fontWeight: 600 }}>{stats.following}</span>
                <span
                  style={{
                    color: 'var(--fg-secondary)',
                    marginLeft: '0.25rem',
                  }}
                >
                  Following
                </span>
              </div>
            </div>

            {/* Name and Bio */}
            <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
              <h3
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                }}
              >
                {profile.name}
              </h3>
              <p
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  color: 'var(--fg-primary)',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {profile.bio}
              </p>
              <a
                href={profile.website}
                style={{
                  color: 'var(--accent)',
                  fontSize: '0.9rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                {profile.website.replace('https://', '')}
              </a>
            </div>
          </div>
        </div>

        {/* Story Highlights */}
        <div
          style={{
            marginBottom: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-primary)',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '1.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
            }}
          >
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    padding: '2px',
                    borderRadius: '50%',
                    border: '1px solid var(--border-primary)',
                  }}
                >
                  <Image
                    src={highlight.cover}
                    alt={highlight.name}
                    width={65}
                    height={65}
                    style={{
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  {highlight.name}
                </span>
              </div>
            ))}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '50%',
                  border: '1px solid var(--border-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  color: 'var(--fg-secondary)',
                }}
              >
                +
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  color: 'var(--fg-secondary)',
                }}
              >
                New
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid var(--border-primary)',
            gap: isMobile ? '2rem' : '4rem',
          }}
        >
          {[
            { id: 'posts', label: 'POSTS', icon: '▦' },
            { id: 'media', label: 'REELS', icon: '▶' },
            { id: 'saved', label: 'SAVED', icon: '☆' },
            { id: 'likes', label: 'TAGGED', icon: '◫' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              style={{
                padding: '1rem 0',
                border: 'none',
                borderTop:
                  activeTab === tab.id
                    ? '1px solid var(--fg-primary)'
                    : '1px solid transparent',
                marginTop: '-1px',
                background: 'transparent',
                color:
                  activeTab === tab.id
                    ? 'var(--fg-primary)'
                    : 'var(--fg-secondary)',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{tab.icon}</span>
              {!isMobile && <span>{tab.label}</span>}
            </button>
          ))}
        </div>

        {/* Content Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '3px',
            marginTop: '1px',
          }}
        >
          {userPosts.map((post) => (
            <div
              key={post.id}
              style={{
                position: 'relative',
                aspectRatio: '1',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
            >
              <Image
                src={post.media}
                alt="Post"
                fill
                style={{ objectFit: 'cover' }}
              />
              {post.type === 'video' && (
                <div
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    fontSize: '1rem',
                  }}
                >
                  ▶
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
            onClick={() => setIsEditing(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '1.5rem',
                width: '100%',
                maxWidth: '400px',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <h3
                style={{
                  margin: '0 0 1.5rem 0',
                  fontSize: '1.25rem',
                  fontWeight: 700,
                }}
              >
                Edit Profile
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--fg-primary)',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) =>
                      setEditForm({ ...editForm, username: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--fg-primary)',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    Bio
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--fg-primary)',
                      fontSize: '1rem',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) =>
                      setEditForm({ ...editForm, location: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--fg-primary)',
                      fontSize: '1rem',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                    }}
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) =>
                      setEditForm({ ...editForm, website: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--fg-primary)',
                      fontSize: '1rem',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1.5rem',
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  onClick={() => {
                    setEditForm(profile);
                    setIsEditing(false);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-primary)',
                    background: 'transparent',
                    color: 'var(--fg-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'var(--accent)',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
