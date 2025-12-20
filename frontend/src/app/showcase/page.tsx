'use client';

import React, { useState } from 'react';
import {
  Star,
  Heart,
  ShoppingCart,
  Users,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Package,
  Award,
  Zap,
  Sparkles,
} from 'lucide-react';
import ThemeSelector from '@/components/ThemeSelector';
import AdvancedModal, { ConfirmModal } from '@/components/AdvancedModal';
import {
  EmptyFeed,
  EmptyCart,
  EmptySearchResults,
} from '@/components/EmptyStates';
import {
  HeroCarousel,
  TestimonialCarousel,
  ProductCarousel,
} from '@/components/AdvancedCarousel';
import {
  LinearProgress,
  CircularProgress,
  SpinnerLoader,
  StepProgress,
  SkeletonLoader,
} from '@/components/ProgressIndicators';
import {
  InputField,
  PasswordField,
  TextareaField,
  SelectField,
  Checkbox,
  RadioGroup,
  SearchInput,
} from '@/components/AdvancedForm';
import {
  StatsCard,
  StatsGrid,
  MiniStatsCard,
  ProgressStatsCard,
  ComparisonStatsCard,
} from '@/components/StatsCards';
import {
  Timeline,
  Tag,
  TagGroup,
  Tooltip,
  Accordion,
  AvatarGroup,
  Divider,
} from '@/components/AdvancedComponents';

export default function ShowcasePage() {
  const [currentTheme, setCurrentTheme] = useState('dark');
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [progress, setProgress] = useState(45);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    bio: '',
    role: '',
    notifications: false,
    plan: 'free',
  });

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          padding: '2rem',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        {/* Hero Section */}
        <div
          className="glass-premium"
          style={{
            padding: '4rem 2rem',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            className="animated-gradient"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.1,
              zIndex: 0,
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1
              className="gradient-text animate-fade-in-up"
              style={{
                fontSize: '3.5rem',
                fontWeight: 800,
                marginBottom: '1rem',
                background: 'var(--gradient-primary)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Premium UI Components
            </h1>
            <p
              className="animate-fade-in-up"
              style={{
                fontSize: '1.25rem',
                color: 'var(--muted)',
                marginBottom: '2rem',
                animationDelay: '0.1s',
                animationFillMode: 'backwards',
              }}
            >
              Discover 11 stunning themes and 40+ premium components
            </p>

            <div
              className="animate-fade-in-up"
              style={{
                animationDelay: '0.2s',
                animationFillMode: 'backwards',
              }}
            >
              <ThemeSelector
                currentTheme={currentTheme}
                onThemeChange={setCurrentTheme}
              />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div
          className="animate-fade-in-up"
          style={{
            animationDelay: '0.3s',
            animationFillMode: 'backwards',
            marginBottom: '3rem',
          }}
        >
          <h2
            style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}
          >
            Dashboard Statistics
          </h2>
          <StatsGrid>
            <StatsCard
              title="Total Users"
              value="12,345"
              change={12.5}
              changeLabel="vs last month"
              icon={<Users size={24} />}
              variant="default"
            />
            <StatsCard
              title="Total Sales"
              value="$45.2K"
              change={8.3}
              changeLabel="vs last month"
              icon={<ShoppingCart size={24} />}
              variant="gradient"
            />
            <StatsCard
              title="Engagement"
              value="89.5%"
              change={-2.4}
              changeLabel="vs last month"
              icon={<TrendingUp size={24} />}
              variant="glass"
            />
            <StatsCard
              title="New Orders"
              value="324"
              change={15.8}
              changeLabel="vs last month"
              icon={<Package size={24} />}
              variant="default"
            />
          </StatsGrid>
        </div>

        <Divider label="Interactive Components" variant="gradient" />

        {/* Two Column Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
          }}
        >
          {/* Progress Indicators */}
          <div
            className="modern-card animate-fade-in-up"
            style={{
              padding: '2rem',
              animationDelay: '0.4s',
              animationFillMode: 'backwards',
            }}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '2rem',
              }}
            >
              Progress Indicators
            </h3>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
                Linear Progress
              </p>
              <LinearProgress value={progress} variant="gradient" showLabel />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <p style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
                With Glow Effect
              </p>
              <LinearProgress value={75} variant="glow" showLabel animated />
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <p style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
                  Circular
                </p>
                <CircularProgress
                  value={progress}
                  variant="gradient"
                  size={100}
                />
              </div>
              <div>
                <p style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
                  With Label
                </p>
                <CircularProgress
                  value={85}
                  variant="default"
                  size={100}
                  showLabel
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button
                className="btn-premium"
                onClick={() => setProgress(Math.min(progress + 10, 100))}
              >
                Increase
              </button>
              <button
                className="btn-glass"
                onClick={() => setProgress(Math.max(progress - 10, 0))}
              >
                Decrease
              </button>
            </div>
          </div>

          {/* Forms */}
          <div
            className="modern-card animate-fade-in-up"
            style={{
              padding: '2rem',
              animationDelay: '0.5s',
              animationFillMode: 'backwards',
            }}
          >
            <h3
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '2rem',
              }}
            >
              Form Components
            </h3>

            <InputField
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Enter your name"
              icon={<Users size={18} />}
              required
            />

            <PasswordField
              label="Password"
              name="password"
              value={formData.password}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
              placeholder="Enter password"
              required
            />

            <SelectField
              label="Role"
              name="role"
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
                { value: 'moderator', label: 'Moderator' },
              ]}
              required
            />

            <Checkbox
              label="Enable notifications"
              checked={formData.notifications}
              onChange={(checked) =>
                setFormData({ ...formData, notifications: checked })
              }
            />

            <RadioGroup
              label="Subscription Plan"
              name="plan"
              value={formData.plan}
              onChange={(value) => setFormData({ ...formData, plan: value })}
              options={[
                { value: 'free', label: 'Free' },
                { value: 'pro', label: 'Pro - $9.99/mo' },
                { value: 'enterprise', label: 'Enterprise' },
              ]}
            />
          </div>
        </div>

        {/* Modals Section */}
        <div
          className="modern-card animate-fade-in-up"
          style={{
            padding: '2rem',
            marginBottom: '3rem',
            animationDelay: '0.6s',
            animationFillMode: 'backwards',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '2rem',
            }}
          >
            Modal Dialogs
          </h3>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              className="btn-gradient hover-scale"
              onClick={() => setShowModal(true)}
            >
              <Sparkles size={18} />
              Open Premium Modal
            </button>
            <button
              className="btn-glass hover-scale"
              onClick={() => setShowConfirm(true)}
            >
              <Bell size={18} />
              Show Confirmation
            </button>
          </div>

          <AdvancedModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            title="Premium Modal"
            size="lg"
            variant="premium"
            animation="scale"
          >
            <div style={{ padding: '1rem 0' }}>
              <p style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                This is a premium modal with beautiful animations and
                glassmorphism effects. It supports multiple sizes, variants, and
                animation types.
              </p>
              <Divider />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <MiniStatsCard
                  label="Active Users"
                  value="1,234"
                  icon={<Users size={24} />}
                />
                <MiniStatsCard
                  label="Revenue"
                  value="$12.5K"
                  icon={<TrendingUp size={24} />}
                />
              </div>
            </div>
          </AdvancedModal>

          <ConfirmModal
            isOpen={showConfirm}
            onClose={() => setShowConfirm(false)}
            onConfirm={() => {
              alert('Action confirmed!');
              setShowConfirm(false);
            }}
            title="Confirm Action"
            message="Are you sure you want to proceed with this action?"
            variant="default"
            confirmText="Yes, Continue"
            cancelText="Cancel"
          />
        </div>

        {/* Tags & Badges */}
        <div
          className="modern-card animate-fade-in-up"
          style={{
            padding: '2rem',
            marginBottom: '3rem',
            animationDelay: '0.7s',
            animationFillMode: 'backwards',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '2rem',
            }}
          >
            Tags & Badges
          </h3>

          <TagGroup>
            <Tag label="Default" variant="default" />
            <Tag label="Primary" variant="primary" icon={<Star size={14} />} />
            <Tag label="Success" variant="success" icon={<Award size={14} />} />
            <Tag label="Warning" variant="warning" />
            <Tag label="Danger" variant="danger" />
            <Tag
              label="Gradient"
              variant="gradient"
              icon={<Sparkles size={14} />}
            />
            <Tag
              label="Removable"
              variant="primary"
              onRemove={() => alert('Tag removed!')}
            />
          </TagGroup>
        </div>

        {/* Timeline */}
        <div
          className="modern-card animate-fade-in-up"
          style={{
            padding: '2rem',
            marginBottom: '3rem',
            animationDelay: '0.8s',
            animationFillMode: 'backwards',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '2rem',
            }}
          >
            Timeline Component
          </h3>

          <Timeline
            items={[
              {
                id: '1',
                title: 'Account Created',
                description:
                  'Your account was successfully created and verified.',
                time: '2 hours ago',
                icon: <Users size={20} />,
                color: '#10b981',
              },
              {
                id: '2',
                title: 'First Purchase',
                description: 'You made your first purchase on the platform.',
                time: '1 day ago',
                icon: <ShoppingCart size={20} />,
                color: '#3b82f6',
              },
              {
                id: '3',
                title: 'Achievement Unlocked',
                description: 'You earned the "Early Adopter" badge!',
                time: '3 days ago',
                icon: <Award size={20} />,
                color: '#f59e0b',
              },
            ]}
            variant="default"
          />
        </div>

        {/* Accordion */}
        <div
          className="modern-card animate-fade-in-up"
          style={{
            padding: '2rem',
            marginBottom: '3rem',
            animationDelay: '0.9s',
            animationFillMode: 'backwards',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '2rem',
            }}
          >
            Accordion / FAQ
          </h3>

          <Accordion
            items={[
              {
                id: '1',
                title: 'What are premium themes?',
                content:
                  'Premium themes are carefully crafted color schemes with unique gradients, effects, and styling. We offer 11 different themes including Ocean Breeze, Sunset Glow, Cyberpunk, and more.',
                icon: <Sparkles size={20} />,
              },
              {
                id: '2',
                title: 'How do I change themes?',
                content:
                  'Click on the "Choose Theme" button at the top of this page. You can preview and select from 11 different themes. Your choice is automatically saved.',
                icon: <Settings size={20} />,
              },
              {
                id: '3',
                title: 'Are these components responsive?',
                content:
                  'Yes! All components are built with mobile-first design principles and work perfectly on all screen sizes.',
                icon: <Zap size={20} />,
              },
            ]}
            allowMultiple={true}
            defaultOpen={['1']}
          />
        </div>

        {/* Avatar Group */}
        <div
          className="modern-card animate-fade-in-up"
          style={{
            padding: '2rem',
            marginBottom: '3rem',
            animationDelay: '1s',
            animationFillMode: 'backwards',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '2rem',
            }}
          >
            Avatar Group
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div>
              <p style={{ marginBottom: '0.5rem', color: 'var(--muted)' }}>
                Team Members
              </p>
              <AvatarGroup
                avatars={[
                  {
                    id: '1',
                    src: 'https://i.pravatar.cc/150?img=1',
                    name: 'John Doe',
                  },
                  {
                    id: '2',
                    src: 'https://i.pravatar.cc/150?img=2',
                    name: 'Jane Smith',
                  },
                  {
                    id: '3',
                    src: 'https://i.pravatar.cc/150?img=3',
                    name: 'Bob Johnson',
                  },
                  {
                    id: '4',
                    src: 'https://i.pravatar.cc/150?img=4',
                    name: 'Alice Brown',
                  },
                  {
                    id: '5',
                    src: 'https://i.pravatar.cc/150?img=5',
                    name: 'Charlie Wilson',
                  },
                  {
                    id: '6',
                    src: 'https://i.pravatar.cc/150?img=6',
                    name: 'Diana Davis',
                  },
                ]}
                max={5}
                size={50}
              />
            </div>

            <div>
              <p style={{ marginBottom: '0.5rem', color: 'var(--muted)' }}>
                Compact View
              </p>
              <AvatarGroup
                avatars={[
                  {
                    id: '1',
                    src: 'https://i.pravatar.cc/150?img=7',
                    name: 'User 1',
                  },
                  {
                    id: '2',
                    src: 'https://i.pravatar.cc/150?img=8',
                    name: 'User 2',
                  },
                  {
                    id: '3',
                    src: 'https://i.pravatar.cc/150?img=9',
                    name: 'User 3',
                  },
                ]}
                max={3}
                size={40}
              />
            </div>
          </div>
        </div>

        {/* Tooltips */}
        <div
          className="modern-card animate-fade-in-up"
          style={{
            padding: '2rem',
            marginBottom: '3rem',
            animationDelay: '1.1s',
            animationFillMode: 'backwards',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '2rem',
            }}
          >
            Tooltips
          </h3>

          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
            <Tooltip content="This is a top tooltip" position="top">
              <button className="btn-glass">Hover (Top)</button>
            </Tooltip>
            <Tooltip content="This is a bottom tooltip" position="bottom">
              <button className="btn-glass">Hover (Bottom)</button>
            </Tooltip>
            <Tooltip content="This is a left tooltip" position="left">
              <button className="btn-glass">Hover (Left)</button>
            </Tooltip>
            <Tooltip content="This is a right tooltip" position="right">
              <button className="btn-glass">Hover (Right)</button>
            </Tooltip>
          </div>
        </div>

        {/* Empty States */}
        <div style={{ marginBottom: '3rem' }}>
          <h2
            style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}
          >
            Empty States
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem',
            }}
          >
            <div className="modern-card" style={{ padding: '2rem' }}>
              <EmptyFeed onCreatePost={() => alert('Create post!')} />
            </div>
            <div className="modern-card" style={{ padding: '2rem' }}>
              <EmptyCart onBrowseProducts={() => alert('Browse products!')} />
            </div>
            <div className="modern-card" style={{ padding: '2rem' }}>
              <EmptySearchResults query="Premium Components" />
            </div>
          </div>
        </div>

        {/* Loading States */}
        <div
          className="modern-card"
          style={{ padding: '2rem', marginBottom: '3rem' }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '2rem',
            }}
          >
            Loading States
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '2rem',
            }}
          >
            <div>
              <p style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
                Gradient Spinner
              </p>
              <SpinnerLoader variant="gradient" size={48} label="Loading..." />
            </div>
            <div>
              <p style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
                Skeleton Loader
              </p>
              <SkeletonLoader count={3} height="60px" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="glass-premium"
          style={{
            padding: '2rem',
            borderRadius: 'var(--radius-xl)',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Ready to use these components?
          </h3>
          <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
            Check out the documentation and start building amazing UIs!
          </p>
          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <button className="btn-gradient hover-scale">Get Started</button>
            <button className="btn-glass hover-scale">
              View Documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
