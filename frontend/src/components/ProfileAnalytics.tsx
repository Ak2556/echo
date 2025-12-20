'use client';

import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { formatCompactNumber } from '@/utils/internationalization';
import {
  TrendingUp,
  TrendingDown,
  Eye,
  Heart,
  Users,
  MessageCircle,
  Repeat2,
  Calendar,
} from 'lucide-react';

export default function ProfileAnalytics() {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>(
    '30d'
  );

  if (!user) return null;

  // Mock analytics data - in production this would come from backend
  const analytics: {
    [key: string]: {
      current: number;
      change: number;
      trend: 'up' | 'down';
    };
  } = {
    profileViews: {
      current: 12458,
      change: 15.3,
      trend: 'up',
    },
    engagementRate: {
      current: 4.8,
      change: -2.1,
      trend: 'down',
    },
    followerGrowth: {
      current: 324,
      change: 23.5,
      trend: 'up',
    },
    totalReach: {
      current: 45892,
      change: 18.7,
      trend: 'up',
    },
  };

  const topPosts = [
    {
      id: '1',
      content: 'Excited to share my latest research on AI applications...',
      likes: 1234,
      comments: 89,
      reposts: 45,
      reach: 12500,
    },
    {
      id: '2',
      content: 'Beautiful sunset from the Golden Temple today...',
      likes: 2341,
      comments: 134,
      reposts: 78,
      reach: 18700,
    },
    {
      id: '3',
      content: 'Working on some amazing new features for Echo!',
      likes: 892,
      comments: 56,
      reposts: 34,
      reach: 8900,
    },
  ];

  const followerDemographics = {
    byAge: [
      { range: '18-24', percentage: 28 },
      { range: '25-34', percentage: 42 },
      { range: '35-44', percentage: 18 },
      { range: '45+', percentage: 12 },
    ],
    byLocation: [
      { country: 'India', percentage: 45 },
      { country: 'United States', percentage: 25 },
      { country: 'United Kingdom', percentage: 12 },
      { country: 'Canada', percentage: 8 },
      { country: 'Others', percentage: 10 },
    ],
  };

  const bestTimesToPost = [
    { day: 'Monday', time: '9:00 AM', engagement: 8.5 },
    { day: 'Wednesday', time: '2:00 PM', engagement: 9.2 },
    { day: 'Friday', time: '6:00 PM', engagement: 9.8 },
    { day: 'Sunday', time: '11:00 AM', engagement: 8.8 },
  ];

  const weeklyActivity = [
    { day: 'Mon', posts: 3, engagement: 245 },
    { day: 'Tue', posts: 2, engagement: 189 },
    { day: 'Wed', posts: 4, engagement: 312 },
    { day: 'Thu', posts: 2, engagement: 178 },
    { day: 'Fri', posts: 5, engagement: 398 },
    { day: 'Sat', posts: 3, engagement: 267 },
    { day: 'Sun', posts: 2, engagement: 201 },
  ];

  const maxEngagement = Math.max(...weeklyActivity.map((d) => d.engagement));

  return (
    <section id="profile-analytics" data-route="profile-analytics">
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <h2 className="nothing-title" style={{ marginBottom: '0.5rem' }}>
            📊 Profile Analytics
          </h2>
          <p className="nothing-subtitle">
            Track your performance and audience insights
          </p>
        </div>

        {/* Time Range Selector */}
        <div
          className="nothing-widget"
          style={{ marginBottom: '2rem', padding: '1rem' }}
        >
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {(['7d', '30d', '90d', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`nothing-button ${timeRange === range ? 'primary' : ''}`}
                style={{ padding: '0.5rem 1rem' }}
              >
                {range === '7d' && 'Last 7 days'}
                {range === '30d' && 'Last 30 days'}
                {range === '90d' && 'Last 90 days'}
                {range === 'all' && 'All time'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="nothing-grid" style={{ marginBottom: '2rem' }}>
          <div className="nothing-widget">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6',
                }}
              >
                <Eye size={24} />
              </div>
              <div>
                <div
                  className="nothing-subtitle"
                  style={{ fontSize: '0.85rem' }}
                >
                  Profile Views
                </div>
                <div className="nothing-title" style={{ fontSize: '1.75rem' }}>
                  {formatCompactNumber(analytics.profileViews.current)}
                </div>
              </div>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {analytics.profileViews.trend === 'up' ? (
                <TrendingUp size={16} color="#10b981" />
              ) : (
                <TrendingDown size={16} color="#ef4444" />
              )}
              <span
                style={{
                  fontSize: '0.875rem',
                  color:
                    analytics.profileViews.trend === 'up'
                      ? '#10b981'
                      : '#ef4444',
                  fontWeight: 600,
                }}
              >
                {Math.abs(analytics.profileViews.change)}%
              </span>
              <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                vs last period
              </span>
            </div>
          </div>

          <div className="nothing-widget">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                }}
              >
                <Heart size={24} />
              </div>
              <div>
                <div
                  className="nothing-subtitle"
                  style={{ fontSize: '0.85rem' }}
                >
                  Engagement Rate
                </div>
                <div className="nothing-title" style={{ fontSize: '1.75rem' }}>
                  {analytics.engagementRate.current}%
                </div>
              </div>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {analytics.engagementRate.trend === 'up' ? (
                <TrendingUp size={16} color="#10b981" />
              ) : (
                <TrendingDown size={16} color="#ef4444" />
              )}
              <span
                style={{
                  fontSize: '0.875rem',
                  color:
                    analytics.engagementRate.trend === 'up'
                      ? '#10b981'
                      : '#ef4444',
                  fontWeight: 600,
                }}
              >
                {Math.abs(analytics.engagementRate.change)}%
              </span>
              <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                vs last period
              </span>
            </div>
          </div>

          <div className="nothing-widget">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#8b5cf6',
                }}
              >
                <Users size={24} />
              </div>
              <div>
                <div
                  className="nothing-subtitle"
                  style={{ fontSize: '0.85rem' }}
                >
                  New Followers
                </div>
                <div className="nothing-title" style={{ fontSize: '1.75rem' }}>
                  +{formatCompactNumber(analytics.followerGrowth.current)}
                </div>
              </div>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {analytics.followerGrowth.trend === 'up' ? (
                <TrendingUp size={16} color="#10b981" />
              ) : (
                <TrendingDown size={16} color="#ef4444" />
              )}
              <span
                style={{
                  fontSize: '0.875rem',
                  color:
                    analytics.followerGrowth.trend === 'up'
                      ? '#10b981'
                      : '#ef4444',
                  fontWeight: 600,
                }}
              >
                {Math.abs(analytics.followerGrowth.change)}%
              </span>
              <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                vs last period
              </span>
            </div>
          </div>

          <div className="nothing-widget">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                }}
              >
                <Repeat2 size={24} />
              </div>
              <div>
                <div
                  className="nothing-subtitle"
                  style={{ fontSize: '0.85rem' }}
                >
                  Total Reach
                </div>
                <div className="nothing-title" style={{ fontSize: '1.75rem' }}>
                  {formatCompactNumber(analytics.totalReach.current)}
                </div>
              </div>
            </div>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {analytics.totalReach.trend === 'up' ? (
                <TrendingUp size={16} color="#10b981" />
              ) : (
                <TrendingDown size={16} color="#ef4444" />
              )}
              <span
                style={{
                  fontSize: '0.875rem',
                  color:
                    analytics.totalReach.trend === 'up' ? '#10b981' : '#ef4444',
                  fontWeight: 600,
                }}
              >
                {Math.abs(analytics.totalReach.change)}%
              </span>
              <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>
                vs last period
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Activity Chart */}
        <div className="nothing-widget" style={{ marginBottom: '2rem' }}>
          <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>
            Weekly Activity
          </h3>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '1rem',
              height: '200px',
            }}
          >
            {weeklyActivity.map((item) => (
              <div
                key={item.day}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                  }}
                >
                  {item.engagement}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: `${(item.engagement / maxEngagement) * 140}px`,
                    background: `linear-gradient(to top, var(--accent), rgba(var(--accent-rgb), 0.6))`,
                    borderRadius: '8px 8px 0 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    padding: '0.5rem',
                    transition: 'all 0.3s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {item.posts} posts
                  </div>
                </div>
                <div
                  style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}
                >
                  {item.day}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="nothing-grid">
          {/* Top Posts */}
          <div className="nothing-widget">
            <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>
              🏆 Top Performing Posts
            </h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {topPosts.map((post, index) => (
                <div
                  key={post.id}
                  style={{
                    padding: '1rem',
                    background: 'var(--nothing-surface)',
                    borderRadius: '12px',
                    border: index === 0 ? '2px solid var(--accent)' : 'none',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <span style={{ fontSize: '1.5rem' }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                      Rank #{index + 1}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: '0.9rem',
                      marginBottom: '0.75rem',
                      opacity: 0.9,
                    }}
                  >
                    {post.content}
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      fontSize: '0.85rem',
                      opacity: 0.7,
                    }}
                  >
                    <span>❤️ {formatCompactNumber(post.likes)}</span>
                    <span>💬 {formatCompactNumber(post.comments)}</span>
                    <span>🔄 {formatCompactNumber(post.reposts)}</span>
                    <span>👁️ {formatCompactNumber(post.reach)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best Times to Post */}
          <div className="nothing-widget">
            <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>
              ⏰ Best Times to Post
            </h3>
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {bestTimesToPost.map((item) => (
                <div
                  key={`${item.day}-${item.time}`}
                  style={{
                    padding: '1rem',
                    background: 'var(--nothing-surface)',
                    borderRadius: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                      {item.day}
                    </div>
                    <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                      {item.time}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--accent)',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                    }}
                  >
                    {item.engagement}% engagement
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audience Demographics */}
        <div className="nothing-grid" style={{ marginTop: '2rem' }}>
          <div className="nothing-widget">
            <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>
              👥 Audience by Age
            </h3>
            {followerDemographics.byAge.map((item) => (
              <div key={item.range} style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <span>{item.range}</span>
                  <span style={{ fontWeight: 600 }}>{item.percentage}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--nothing-surface)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background: 'var(--accent)',
                      borderRadius: '4px',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="nothing-widget">
            <h3 className="nothing-title" style={{ marginBottom: '1.5rem' }}>
              🌍 Audience by Location
            </h3>
            {followerDemographics.byLocation.map((item) => (
              <div key={item.country} style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.5rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <span>{item.country}</span>
                  <span style={{ fontWeight: 600 }}>{item.percentage}%</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'var(--nothing-surface)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background:
                        'linear-gradient(90deg, var(--accent), rgba(var(--accent-rgb), 0.6))',
                      borderRadius: '4px',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
