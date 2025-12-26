'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/contexts/ToastContext';

interface FooterProps {
  onNavigate?: (route: string) => void;
}

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

export default function Footer({ onNavigate }: FooterProps) {
  const { colorMode } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { user } = useUser();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isNewsletterLoading, setIsNewsletterLoading] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [systemStatus, setSystemStatus] = useState({
    status: 'operational',
    uptime: '99.9%',
    lastChecked: new Date(),
  });
  const [appStats, setAppStats] = useState<{
    users: string | number;
    posts: string | number;
    countries: string | number;
  }>({
    users: 0,
    posts: 0,
    countries: 0,
  });
  const [animatedStats, setAnimatedStats] = useState({
    users: '0',
    posts: '0',
    countries: '0',
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  // Animated counter function
  const animateCounter = useCallback(
    (
      start: number,
      end: number,
      duration: number,
      suffix: string,
      setter: (val: string) => void
    ) => {
      const startTime = performance.now();
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);

        if (end >= 1000000) {
          setter((current / 1000000).toFixed(1) + 'M' + suffix);
        } else if (end >= 1000) {
          setter((current / 1000).toFixed(0) + 'K' + suffix);
        } else {
          setter(current.toString() + suffix);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    },
    []
  );

  // Intersection observer for stats animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            // Trigger animations
            animateCounter(0, 2500000, 2000, '+', (val) =>
              setAnimatedStats((prev) => ({ ...prev, users: val }))
            );
            animateCounter(0, 50000000, 2000, '+', (val) =>
              setAnimatedStats((prev) => ({ ...prev, posts: val }))
            );
            animateCounter(0, 150, 1500, '+', (val) =>
              setAnimatedStats((prev) => ({ ...prev, countries: val }))
            );
          }
        });
      },
      { threshold: 0.3 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [animateCounter]);

  // Scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close language selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.language-selector-container')) {
        setShowLanguageSelector(false);
      }
    };

    if (showLanguageSelector) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLanguageSelector]);

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showLanguageSelector) {
        setShowLanguageSelector(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showLanguageSelector]);

  // Simulate live status updates with more realistic behavior
  useEffect(() => {
    const checkStatus = async () => {
      // Simulate API call to status endpoint
      try {
        // In production, this would be: const res = await fetch('https://status.echo.app/api/status');
        const uptime = (99.8 + Math.random() * 0.2).toFixed(1);
        setSystemStatus({
          status: 'operational',
          uptime: uptime + '%',
          lastChecked: new Date(),
        });
      } catch {
        setSystemStatus((prev) => ({
          ...prev,
          status: 'degraded',
          lastChecked: new Date(),
        }));
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch real app stats (simulated)
  useEffect(() => {
    const fetchStats = async () => {
      // In production: const res = await fetch('/api/stats');
      // Simulate growing numbers
      setAppStats({
        users: '2.5M+',
        posts: '50M+',
        countries: '150+',
      });
    };
    fetchStats();
  }, []);

  const handleLanguageChange = (langCode: string) => {
    try {
      setLanguage(langCode as any);
      setShowLanguageSelector(false);
      const lang = languages.find((l) => l.code === langCode);
      toast.success(`Language changed to ${lang?.name}`);
    } catch {
      toast.error('Failed to change language');
    }
  };

  // Enhanced newsletter subscription with validation and local storage
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsNewsletterLoading(true);

    try {
      // In production, this would call your backend API
      // const res = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email })
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store subscription locally for demo
      const subscriptions = JSON.parse(
        localStorage.getItem('echo-newsletter-subs') || '[]'
      );
      if (!subscriptions.includes(email)) {
        subscriptions.push(email);
        localStorage.setItem(
          'echo-newsletter-subs',
          JSON.stringify(subscriptions)
        );
      }

      setSubscribed(true);
      setEmail('');
      toast.success('Successfully subscribed to our newsletter!');

      // Reset subscription state after 5 seconds
      setTimeout(() => setSubscribed(false), 5000);
    } catch (error) {
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsNewsletterLoading(false);
    }
  };

  // Navigation handler - dispatches custom event that NavigationProvider listens for
  const handleNavigation = (route: string, external = false) => {
    if (external) {
      window.open(route, '_blank', 'noopener,noreferrer');
    } else {
      // Use onNavigate prop if provided
      if (onNavigate) {
        onNavigate(route);
      } else {
        // Dispatch custom navigation event that NavigationProvider listens for
        window.dispatchEvent(new CustomEvent('navigate', { detail: route }));
      }
      // Scroll to top after navigation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Social media sharing
  const handleSocialShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(
      'Check out Echo - the modern social platform!'
    );

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      instagram: 'https://www.instagram.com/echo_platform',
      github: 'https://github.com/echo-platform',
    };

    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(
        shareUrl,
        '_blank',
        'width=600,height=400,noopener,noreferrer'
      );
      toast.success(
        `Opening ${platform.charAt(0).toUpperCase() + platform.slice(1)}...`
      );
    }
  };

  // Quick actions for authenticated users with keyboard shortcuts
  const quickActions = [
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      ),
      label: 'Create Post',
      shortcut: 'N',
      action: () => {
        handleNavigation('feed');
        toast.info('Ready to create a new post!');
      },
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
      label: 'Discover',
      shortcut: 'D',
      action: () => handleNavigation('discover'),
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      label: 'Messages',
      shortcut: 'M',
      action: () => handleNavigation('messages'),
    },
    {
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
      label: 'Settings',
      shortcut: 'S',
      action: () => handleNavigation('settings'),
    },
  ];

  const currentLang =
    languages.find((l) => l.code === language) || languages[0];

  return (
    <footer className="modern-footer" ref={footerRef}>
      {/* Animated Gradient Border */}
      <div className="footer-gradient-border"></div>

      {/* Wave Animation */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}

      <div className="footer-container">
        {/* Live Status Indicator */}
        <div className={`footer-status-bar ${systemStatus.status}`}>
          <div className="status-indicator">
            <span className={`status-dot ${systemStatus.status}`}></span>
            <span className="status-text">
              {systemStatus.status === 'operational'
                ? 'All Systems Operational'
                : systemStatus.status === 'degraded'
                  ? 'Some Systems Degraded'
                  : 'System Issues Detected'}
            </span>
          </div>
          <div className="uptime-badge">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
            </svg>
            <span>{systemStatus.uptime} Uptime</span>
          </div>
        </div>

        {/* App Download Section */}
        <div className="footer-app-download">
          <div className="download-content">
            <h3>Get the Echo App</h3>
            <p>Download our mobile app for the best experience</p>
          </div>
          <div className="download-buttons">
            <button
              className="download-btn app-store"
              onClick={() => {
                toast.info('App Store link coming soon!');
                handleNavigation('https://apps.apple.com/app/echo', true);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="btn-text">
                <span className="small">Download on the</span>
                <span className="large">App Store</span>
              </div>
            </button>
            <button
              className="download-btn play-store"
              onClick={() => {
                toast.info('Play Store link coming soon!');
                handleNavigation(
                  'https://play.google.com/store/apps/details?id=com.echo',
                  true
                );
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
              </svg>
              <div className="btn-text">
                <span className="small">Get it on</span>
                <span className="large">Google Play</span>
              </div>
            </button>
          </div>
        </div>

        {/* Quick Actions for Authenticated Users */}
        {user && (
          <div className="footer-quick-actions">
            <h3>Quick Actions</h3>
            <div className="quick-actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="quick-action-btn"
                  aria-label={action.label}
                  title={`${action.label} (${action.shortcut})`}
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-label">{action.label}</span>
                  <span className="action-shortcut">{action.shortcut}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* App Statistics */}
        <div className="footer-stats" ref={statsRef}>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <div className="stat-number">{animatedStats.users}</div>
              <div className="stat-label">Active Users</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div className="stat-number">{animatedStats.posts}</div>
              <div className="stat-label">Posts Shared</div>
            </div>
            <div className="stat-item">
              <div className="stat-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
              </div>
              <div className="stat-number">{animatedStats.countries}</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div
              className="footer-logo"
              onClick={() => handleNavigation('home')}
              style={{ cursor: 'pointer' }}
            >
              <div className="logo-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="logo-text">Echo</span>
            </div>
            <p className="footer-description">
              Connect, share, and discover with the modern social platform that
              brings people together through meaningful conversations and shared
              experiences.
            </p>
            <div className="social-links">
              <button
                onClick={() => handleSocialShare('twitter')}
                aria-label="Share on Twitter"
                className="social-link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                onClick={() => handleSocialShare('github')}
                aria-label="View on GitHub"
                className="social-link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </button>
              <button
                onClick={() => handleSocialShare('linkedin')}
                aria-label="Share on LinkedIn"
                className="social-link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button
                onClick={() => handleSocialShare('instagram')}
                aria-label="Follow on Instagram"
                className="social-link"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="footer-links">
            <div className="footer-section">
              <h3>Platform</h3>
              <ul>
                <li>
                  <button
                    onClick={() => handleNavigation('feed')}
                    className="footer-link"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('feed')}
                    className="footer-link"
                  >
                    Feed
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('discover')}
                    className="footer-link"
                  >
                    Discover
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('live')}
                    className="footer-link"
                  >
                    Live
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('messages')}
                    className="footer-link"
                  >
                    Messages
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Features</h3>
              <ul>
                <li>
                  <button
                    onClick={() => {
                      // Dispatch event to open mini apps
                      window.dispatchEvent(
                        new CustomEvent('openMiniApp', { detail: 'mini-apps' })
                      );
                      toast.info('Opening Mini Apps...');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="footer-link"
                  >
                    Mini Apps
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      // Navigate to messages where AI Assistant is available
                      handleNavigation('messages');
                      // Dispatch event to open AI chat
                      setTimeout(() => {
                        window.dispatchEvent(new CustomEvent('openAiChat'));
                        toast.info('AI Assistant ready in Messages');
                      }, 300);
                    }}
                    className="footer-link"
                  >
                    AI Assistant
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('discover')}
                    className="footer-link"
                  >
                    Communities
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('discover')}
                    className="footer-link"
                  >
                    Creators
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('live')}
                    className="footer-link"
                  >
                    Live Events
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Resources</h3>
              <ul>
                <li>
                  <button
                    onClick={() => handleNavigation('settings')}
                    className="footer-link"
                  >
                    Help Center
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      handleNavigation(
                        'https://github.com/echo-platform/api-docs',
                        true
                      )
                    }
                    className="footer-link"
                  >
                    Developer API
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('discover')}
                    className="footer-link"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleNavigation('settings')}
                    className="footer-link"
                  >
                    User Guides
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      toast.info(
                        `System Status: ${systemStatus.status === 'operational' ? 'All systems operational' : 'Some issues detected'} - ${systemStatus.uptime} uptime`
                      )
                    }
                    className="footer-link"
                  >
                    System Status
                  </button>
                </li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Company</h3>
              <ul>
                <li>
                  <button
                    onClick={() =>
                      toast.info(
                        'Echo - Connecting people worldwide since 2024'
                      )
                    }
                    className="footer-link"
                  >
                    About Us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      toast.info(
                        'We are hiring! Send your resume to careers@echo.app'
                      )
                    }
                    className="footer-link"
                  >
                    Careers
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      toast.info('Press kit available at press@echo.app')
                    }
                    className="footer-link"
                  >
                    Press Kit
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => toast.info('Contact us at support@echo.app')}
                    className="footer-link"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    onClick={() =>
                      toast.info('Investor inquiries: investors@echo.app')
                    }
                    className="footer-link"
                  >
                    Investors
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h3>Stay Updated</h3>
            <p>
              Get the latest updates, features, and community highlights
              delivered to your inbox.
            </p>
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                className="newsletter-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="newsletter-button"
                disabled={isNewsletterLoading || subscribed}
              >
                {isNewsletterLoading ? (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <span className="loading-spinner"></span>
                    Subscribing...
                  </span>
                ) : subscribed ? (
                  '✓ Subscribed!'
                ) : (
                  'Subscribe'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-legal">
              <p>© {currentYear} Echo. All rights reserved.</p>
              <div className="legal-links">
                <button
                  onClick={() => handleNavigation('/privacy', true)}
                  className="footer-link"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => handleNavigation('/terms', true)}
                  className="footer-link"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() =>
                    toast.info('Cookie preferences can be managed in settings')
                  }
                  className="footer-link"
                >
                  Cookie Policy
                </button>
                <button
                  onClick={() =>
                    toast.info(
                      'Echo is committed to accessibility for all users'
                    )
                  }
                  className="footer-link"
                >
                  Accessibility
                </button>
              </div>
            </div>
            <div className="footer-meta">
              {/* Language Selector */}
              <div className="language-selector-container">
                <button
                  className="language-selector-btn"
                  onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                >
                  <span className="lang-flag">{currentLang?.flag}</span>
                  <span className="lang-name">{currentLang?.name}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {showLanguageSelector && (
                  <div className="language-dropdown">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`lang-option ${language === lang.code ? 'active' : ''}`}
                        onClick={() => handleLanguageChange(lang.code)}
                      >
                        <span className="lang-flag">{lang.flag}</span>
                        <span className="lang-name">{lang.name}</span>
                        {language === lang.code && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="footer-badges">
                <span className="badge" title="End-to-end encryption">
                  🔒 Secure
                </span>
                <span className="badge" title="Available in 150+ countries">
                  🌍 Global
                </span>
                <span className="badge" title="Optimized for speed">
                  🚀 Fast
                </span>
                <span className="badge" title="99.9% uptime">
                  ✨ Reliable
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .modern-footer {
          background: rgba(248, 250, 252, 0.95);
          backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          margin-top: 4rem;
          position: relative;
          overflow: hidden;
        }

        .modern-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent, #007aff), transparent);
          opacity: 0.6;
        }

        [data-theme='dark'] .modern-footer {
          background: rgba(15, 17, 21, 0.95);
          border-top-color: rgba(255, 255, 255, 0.08);
        }

        /* Animated Gradient Border */
        .footer-gradient-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #667eea);
          background-size: 300% 100%;
          animation: gradientFlow 4s ease infinite;
        }

        @keyframes gradientFlow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Wave Animation */
        .footer-wave {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          color: rgba(102, 126, 234, 0.08);
          transform: translateY(-100%);
        }

        .footer-wave svg {
          width: 100%;
          height: 100%;
        }

        [data-theme='dark'] .footer-wave {
          color: rgba(167, 139, 250, 0.1);
        }

        /* Scroll to Top Button */
        .scroll-to-top {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
          z-index: 1000;
          animation: fadeInUp 0.3s ease;
        }

        .scroll-to-top:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(102, 126, 234, 0.5);
        }

        .scroll-to-top:active {
          transform: translateY(-1px);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Live Status Bar */
        .footer-status-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%);
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid rgba(16, 185, 129, 0.2);
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        .status-dot.operational {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }

        .status-dot.degraded {
          background: #f59e0b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        }

        .status-dot.down {
          background: #ef4444;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
        }

        .status-text {
          font-size: 0.875rem;
          font-weight: 500;
          color: #10b981;
        }

        .footer-status-bar.degraded .status-text {
          color: #f59e0b;
        }

        .footer-status-bar.down .status-text {
          color: #ef4444;
        }

        .footer-status-bar.degraded {
          background: linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%);
          border-color: rgba(245, 158, 11, 0.2);
        }

        .footer-status-bar.degraded .uptime-badge {
          background: rgba(245, 158, 11, 0.15);
          color: #f59e0b;
        }

        .uptime-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #10b981;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        /* App Download Section */
        .footer-app-download {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
          border-radius: 16px;
          margin-bottom: 2rem;
          border: 1px solid rgba(102, 126, 234, 0.2);
        }

        .download-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--fg, #1b1b1f);
          margin: 0 0 0.5rem 0;
        }

        .download-content p {
          color: var(--muted, #6b7280);
          margin: 0;
          font-size: 0.875rem;
        }

        [data-theme='dark'] .download-content h3 {
          color: #e7e9ee;
        }

        .download-buttons {
          display: flex;
          gap: 1rem;
        }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
        }

        .download-btn.app-store {
          background: linear-gradient(135deg, #1a1a1a 0%, #333333 100%);
        }

        .download-btn.play-store {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .download-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .download-btn svg {
          width: 24px;
          height: 24px;
        }

        .btn-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .btn-text .small {
          font-size: 0.65rem;
          opacity: 0.8;
        }

        .btn-text .large {
          font-size: 0.95rem;
          font-weight: 600;
        }

        /* Language Selector */
        .language-selector-container {
          position: relative;
        }

        .language-selector-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.75rem;
          background: rgba(0, 0, 0, 0.04);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.85rem;
          color: var(--fg, #1b1b1f);
        }

        .language-selector-btn:hover {
          background: rgba(0, 0, 0, 0.08);
          border-color: var(--accent, #007aff);
        }

        [data-theme='dark'] .language-selector-btn {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          color: #e7e9ee;
        }

        [data-theme='dark'] .language-selector-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .lang-flag {
          font-size: 1rem;
        }

        .lang-name {
          font-weight: 500;
        }

        .language-dropdown {
          position: absolute;
          bottom: 100%;
          right: 0;
          margin-bottom: 0.5rem;
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          padding: 0.5rem;
          min-width: 180px;
          max-height: 300px;
          overflow-y: auto;
          z-index: 100;
        }

        [data-theme='dark'] .language-dropdown {
          background: #1a1a1f;
          border-color: rgba(255, 255, 255, 0.12);
        }

        .lang-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.625rem 0.75rem;
          border: none;
          background: transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.85rem;
          color: var(--fg, #1b1b1f);
          text-align: left;
        }

        .lang-option:hover {
          background: rgba(102, 126, 234, 0.1);
        }

        .lang-option.active {
          background: rgba(102, 126, 234, 0.15);
          color: #667eea;
        }

        .lang-option svg {
          margin-left: auto;
          color: #667eea;
        }

        [data-theme='dark'] .lang-option {
          color: #e7e9ee;
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1rem 1rem;
        }

        /* Quick Actions */
        .footer-quick-actions {
          background: linear-gradient(135deg, var(--accent, #007aff), #4ea8ff);
          color: white;
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
          text-align: center;
        }

        .footer-quick-actions h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1rem;
        }

        .quick-action-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          padding: 1rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
        }

        .quick-action-btn:hover {
          background: rgba(255, 255, 255, 0.25);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .action-icon {
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .action-shortcut {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(255, 255, 255, 0.2);
          padding: 0.125rem 0.375rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 600;
          opacity: 0.8;
        }

        /* App Statistics */
        .footer-stats {
          background: var(--nothing-surface, rgba(0, 0, 0, 0.02));
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        [data-theme='dark'] .footer-stats {
          background: rgba(255, 255, 255, 0.03);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          text-align: center;
        }

        .stat-item {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 0.75rem;
          color: #667eea;
        }

        [data-theme='dark'] .stat-icon {
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%);
          color: #a78bfa;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--accent, #007aff);
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-variant-numeric: tabular-nums;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--muted, #6b7280);
          font-weight: 500;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-brand {
          max-width: 350px;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .footer-logo .logo-icon {
          width: 32px;
          height: 32px;
          color: var(--accent, #007aff);
        }

        .footer-logo .logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--fg, #1b1b1f);
        }

        [data-theme='dark'] .footer-logo .logo-text {
          color: #e7e9ee;
        }

        .footer-description {
          color: var(--muted, #6b7280);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 0.75rem;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.04);
          color: var(--muted, #6b7280);
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .social-link:hover {
          background: var(--accent, #007aff);
          color: #fff;
          transform: translateY(-2px);
        }

        [data-theme='dark'] .social-link {
          background: rgba(255, 255, 255, 0.06);
        }

        [data-theme='dark'] .social-link:hover {
          background: var(--accent, #007aff);
        }

        .social-link svg {
          width: 18px;
          height: 18px;
        }

        .footer-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .footer-section h3 {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--fg, #1b1b1f);
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        [data-theme='dark'] .footer-section h3 {
          color: #e7e9ee;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section ul li {
          margin-bottom: 0.5rem;
        }

        .footer-link {
          background: none;
          border: none;
          color: var(--muted, #6b7280);
          text-decoration: none;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          cursor: pointer;
          padding: 0;
          text-align: left;
          font-family: inherit;
        }

        .footer-link:hover {
          color: var(--accent, #007aff);
          transform: translateX(2px);
        }

        .footer-section ul li a {
          color: var(--muted, #6b7280);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .footer-section ul li a:hover {
          color: var(--accent, #007aff);
        }

        .footer-newsletter {
          background: rgba(0, 0, 0, 0.02);
          border-radius: 16px;
          padding: 2rem;
          margin-bottom: 3rem;
        }

        [data-theme='dark'] .footer-newsletter {
          background: rgba(255, 255, 255, 0.03);
        }

        .newsletter-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--fg, #1b1b1f);
          margin-bottom: 0.5rem;
        }

        [data-theme='dark'] .newsletter-content h3 {
          color: #e7e9ee;
        }

        .newsletter-content p {
          color: var(--muted, #6b7280);
          margin-bottom: 1.5rem;
        }

        .newsletter-form {
          display: flex;
          gap: 0.75rem;
          max-width: 400px;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.75rem 1rem;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 12px;
          background: #fff;
          color: var(--fg, #1b1b1f);
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .newsletter-input:focus {
          outline: none;
          border-color: var(--accent, #007aff);
          box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.1);
        }

        [data-theme='dark'] .newsletter-input {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          color: #e7e9ee;
        }

        [data-theme='dark'] .newsletter-input:focus {
          border-color: var(--accent, #007aff);
          box-shadow: 0 0 0 3px rgba(78, 168, 255, 0.2);
        }

        .newsletter-button {
          padding: 0.75rem 1.5rem;
          background: var(--accent, #007aff);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .newsletter-button:hover:not(:disabled) {
          background: #0056cc;
          transform: translateY(-1px);
        }

        .newsletter-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .footer-bottom {
          border-top: 1px solid rgba(0, 0, 0, 0.08);
          padding-top: 2rem;
        }

        [data-theme='dark'] .footer-bottom {
          border-top-color: rgba(255, 255, 255, 0.08);
        }

        .footer-bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .footer-legal {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .footer-legal p {
          color: var(--muted, #6b7280);
          font-size: 0.875rem;
          margin: 0;
        }

        .legal-links {
          display: flex;
          gap: 1.5rem;
        }

        .legal-links a {
          color: var(--muted, #6b7280);
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s ease;
        }

        .legal-links a:hover {
          color: var(--accent, #007aff);
        }

        .footer-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .footer-meta p {
          color: var(--muted, #6b7280);
          font-size: 0.875rem;
          margin: 0;
        }

        .footer-badges {
          display: flex;
          gap: 0.5rem;
        }

        .badge {
          background: rgba(0, 122, 255, 0.1);
          color: var(--accent, #007aff);
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        [data-theme='dark'] .badge {
          background: rgba(78, 168, 255, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .footer-main {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 1rem;
          }

          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .footer-app-download {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .download-buttons {
            justify-content: center;
          }
        }

        @media (max-width: 768px) {
          .footer-container {
            padding: 2rem 1rem 1rem;
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .newsletter-form {
            flex-direction: column;
          }

          .footer-bottom-content {
            flex-direction: column;
            text-align: center;
            gap: 1rem;
          }

          .footer-legal {
            flex-direction: column;
            gap: 1rem;
          }

          .legal-links {
            justify-content: center;
          }

          .footer-meta {
            flex-direction: column;
            justify-content: center;
            gap: 1rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }

          .footer-quick-actions,
          .footer-stats {
            padding: 1.5rem;
          }

          .footer-status-bar {
            flex-direction: column;
            gap: 0.75rem;
            text-align: center;
          }

          .download-buttons {
            flex-direction: column;
            width: 100%;
          }

          .download-btn {
            justify-content: center;
            width: 100%;
          }

          .footer-app-download {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .footer-newsletter {
            padding: 1.5rem;
          }

          .social-links {
            justify-content: center;
          }

          .legal-links {
            flex-wrap: wrap;
            gap: 1rem;
          }

          .footer-badges {
            flex-wrap: wrap;
            justify-content: center;
          }

          .language-dropdown {
            left: 50%;
            right: auto;
            transform: translateX(-50%);
          }
        }
      `}</style>
    </footer>
  );
}
