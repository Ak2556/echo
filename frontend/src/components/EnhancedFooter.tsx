'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useEnhancedTheme } from '@/contexts/EnhancedThemeContext';
import { Card } from '@/components/ui/EnhancedCard';
import Button from '@/components/ui/EnhancedButton';
import Input from '@/components/ui/EnhancedInput';

interface FooterProps {
  onNavigate?: (route: string) => void;
}

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', href: 'feed' },
      { label: 'Discover', href: 'discover' },
      { label: 'Live Events', href: 'live' },
      { label: 'Communities', href: 'discover' },
      { label: 'Creators', href: 'discover' },
    ],
  },
  {
    title: 'Features',
    links: [
      { label: 'Mini Apps', href: 'mini-apps' },
      { label: 'AI Assistant', href: 'messages' },
      { label: 'Shopping', href: 'shop' },
      { label: 'Learning', href: 'tuition' },
      { label: 'Messaging', href: 'messages' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Help Center', href: 'settings' },
      { label: 'Developer API', href: 'https://api.echo.app', external: true },
      { label: 'Blog', href: 'https://blog.echo.app', external: true },
      { label: 'Status', href: 'https://status.echo.app', external: true },
      {
        label: 'Changelog',
        href: 'https://changelog.echo.app',
        external: true,
      },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: 'https://echo.app/about', external: true },
      { label: 'Careers', href: 'https://echo.app/careers', external: true },
      { label: 'Press', href: 'https://echo.app/press', external: true },
      { label: 'Contact', href: 'https://echo.app/contact', external: true },
      {
        label: 'Investors',
        href: 'https://echo.app/investors',
        external: true,
      },
    ],
  },
];

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/echo_platform',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/echo-platform',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/echo-platform',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/echo_platform',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
];

export default function EnhancedFooter({ onNavigate }: FooterProps) {
  const { colors, themeMode, actualColorMode } = useEnhancedTheme();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [stats, setStats] = useState({
    users: '2.5M+',
    posts: '50M+',
    countries: '150+',
    uptime: '99.9%',
  });
  const footerRef = useRef<HTMLElement>(null);

  // Scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (href: string, external = false) => {
    if (external) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate?.(href);
    }
  };

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubscribed(true);
    setEmail('');
    setIsLoading(false);

    // Reset after 3 seconds
    setTimeout(() => setIsSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="enhanced-footer" ref={footerRef}>
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
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}

      {/* Decorative Wave */}
      <div className="footer-wave">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            fill="currentColor"
          />
        </svg>
      </div>

      <div className="footer-container">
        {/* Status Bar */}
        <Card className="status-bar">
          <div className="status-content">
            <div className="status-indicator">
              <div className="status-dot operational" />
              <span className="status-text">All Systems Operational</span>
            </div>
            <div className="uptime-badge">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
              </svg>
              <span>{stats.uptime} Uptime</span>
            </div>
          </div>
        </Card>

        {/* Stats Section */}
        <Card className="stats-section">
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
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
              </div>
              <div className="stat-number">{stats.users}</div>
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
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <div className="stat-number">{stats.posts}</div>
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </div>
              <div className="stat-number">{stats.countries}</div>
              <div className="stat-label">Countries</div>
            </div>
          </div>
        </Card>

        {/* Main Footer Content */}
        <div className="footer-main">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="brand-logo">
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
              <span className="brand-text">Echo</span>
            </div>
            <p className="brand-description">
              Connect, share, and discover with the modern social platform that
              brings people together through meaningful conversations and shared
              experiences.
            </p>
            <div className="social-links">
              {socialLinks.map((social) => (
                <button
                  key={social.name}
                  onClick={() => handleNavigation(social.href, true)}
                  className="social-link"
                  aria-label={`Follow us on ${social.name}`}
                >
                  {social.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="footer-links">
            {footerSections.map((section) => (
              <div key={section.title} className="footer-section">
                <h3 className="section-title">{section.title}</h3>
                <ul className="section-links">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <button
                        onClick={() =>
                          handleNavigation(link.href, link.external)
                        }
                        className="footer-link"
                      >
                        {link.label}
                        {link.external && (
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                            <polyline points="15,3 21,3 21,9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Section */}
        <Card className="newsletter-section">
          <div className="newsletter-content">
            <h3 className="newsletter-title">Stay in the Loop</h3>
            <p className="newsletter-description">
              Get the latest updates, features, and community highlights
              delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
              />
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={isSubscribed}
              >
                {isSubscribed ? '✓ Subscribed!' : 'Subscribe'}
              </Button>
            </form>
          </div>
        </Card>

        {/* Bottom Section */}
        <div className="footer-bottom">
          <div className="bottom-content">
            <div className="legal-section">
              <p className="copyright">
                © {currentYear} Echo. All rights reserved.
              </p>
              <div className="legal-links">
                <button
                  onClick={() => handleNavigation('/privacy', true)}
                  className="legal-link"
                >
                  Privacy Policy
                </button>
                <button
                  onClick={() => handleNavigation('/terms', true)}
                  className="legal-link"
                >
                  Terms of Service
                </button>
                <button
                  onClick={() => handleNavigation('/cookies', true)}
                  className="legal-link"
                >
                  Cookie Policy
                </button>
                <button
                  onClick={() => handleNavigation('/accessibility', true)}
                  className="legal-link"
                >
                  Accessibility
                </button>
              </div>
            </div>
            <div className="badges-section">
              <div className="quality-badges">
                <span className="badge">🔒 Secure</span>
                <span className="badge">🌍 Global</span>
                <span className="badge">🚀 Fast</span>
                <span className="badge">✨ Reliable</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .enhanced-footer {
          position: relative;
          background: var(--color-surface);
          backdrop-filter: blur(20px) saturate(180%);
          border-top: 1px solid var(--color-border);
          margin-top: var(--spacing-6xl);
          overflow: hidden;
        }

        .footer-wave {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          color: var(--color-primary);
          opacity: 0.1;
          transform: translateY(-100%);
        }

        .footer-wave svg {
          width: 100%;
          height: 100%;
        }

        .scroll-to-top {
          position: fixed;
          bottom: var(--spacing-xl);
          right: var(--spacing-xl);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: var(--color-primary);
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-lg), var(--color-glow);
          transition: all var(--duration-normal) var(--ease-out);
          z-index: var(--z-fixed);
          animation: fadeInUp var(--duration-normal) var(--ease-out);
        }

        .scroll-to-top:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-xl), var(--color-glow);
        }

        .footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--spacing-4xl) var(--spacing-xl) var(--spacing-xl);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-4xl);
        }

        /* Status Bar */
        .status-bar {
          animation: fadeInUp var(--duration-slow) var(--ease-out);
        }

        .status-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .status-dot.operational {
          background: #10b981;
          box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
        }

        .status-text {
          font-size: var(--text-sm);
          font-weight: var(--font-medium);
          color: #10b981;
        }

        .uptime-badge {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          background: rgba(16, 185, 129, 0.1);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          color: #10b981;
        }

        /* Stats Section */
        .stats-section {
          animation: fadeInUp var(--duration-slow) var(--ease-out) 0.1s both;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-xl);
          text-align: center;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          background: var(--color-primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: var(--spacing-sm);
        }

        .stat-number {
          font-size: var(--text-2xl);
          font-weight: var(--font-bold);
          background: var(--color-gradientPrimary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: var(--text-sm);
          color: var(--color-textSecondary);
          font-weight: var(--font-medium);
        }

        /* Main Footer */
        .footer-main {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: var(--spacing-4xl);
          animation: fadeInUp var(--duration-slow) var(--ease-out) 0.2s both;
        }

        .footer-brand {
          max-width: 350px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          color: var(--color-primary);
        }

        .brand-text {
          font-size: var(--text-xl);
          font-weight: var(--font-bold);
          background: var(--color-gradientPrimary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .brand-description {
          color: var(--color-textSecondary);
          line-height: var(--leading-relaxed);
          margin-bottom: var(--spacing-lg);
        }

        .social-links {
          display: flex;
          gap: var(--spacing-sm);
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          background: var(--color-hover);
          color: var(--color-textSecondary);
          border: none;
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
        }

        .social-link:hover {
          background: var(--color-primary);
          color: white;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .social-link svg {
          width: 18px;
          height: 18px;
        }

        /* Footer Links */
        .footer-links {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-xl);
        }

        .footer-section {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .section-title {
          font-size: var(--text-sm);
          font-weight: var(--font-semibold);
          color: var(--color-textPrimary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin: 0;
        }

        .section-links {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .footer-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: none;
          border: none;
          color: var(--color-textSecondary);
          font-size: var(--text-sm);
          text-align: left;
          cursor: pointer;
          transition: all var(--duration-normal) var(--ease-out);
          padding: 0;
        }

        .footer-link:hover {
          color: var(--color-primary);
          transform: translateX(2px);
        }

        /* Newsletter Section */
        .newsletter-section {
          animation: fadeInUp var(--duration-slow) var(--ease-out) 0.3s both;
        }

        .newsletter-content {
          text-align: center;
          max-width: 500px;
          margin: 0 auto;
        }

        .newsletter-title {
          font-size: var(--text-xl);
          font-weight: var(--font-semibold);
          color: var(--color-textPrimary);
          margin: 0 0 var(--spacing-sm) 0;
        }

        .newsletter-description {
          color: var(--color-textSecondary);
          margin: 0 0 var(--spacing-lg) 0;
        }

        .newsletter-form {
          display: flex;
          gap: var(--spacing-md);
          max-width: 400px;
          margin: 0 auto;
        }

        /* Bottom Section */
        .footer-bottom {
          border-top: 1px solid var(--color-border);
          padding-top: var(--spacing-xl);
          animation: fadeInUp var(--duration-slow) var(--ease-out) 0.4s both;
        }

        .bottom-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: var(--spacing-lg);
        }

        .legal-section {
          display: flex;
          align-items: center;
          gap: var(--spacing-xl);
          flex-wrap: wrap;
        }

        .copyright {
          color: var(--color-textMuted);
          font-size: var(--text-sm);
          margin: 0;
        }

        .legal-links {
          display: flex;
          gap: var(--spacing-lg);
        }

        .legal-link {
          background: none;
          border: none;
          color: var(--color-textMuted);
          font-size: var(--text-sm);
          cursor: pointer;
          transition: color var(--duration-normal) var(--ease-out);
          padding: 0;
        }

        .legal-link:hover {
          color: var(--color-primary);
        }

        .quality-badges {
          display: flex;
          gap: var(--spacing-sm);
        }

        .badge {
          background: var(--color-hover);
          color: var(--color-textSecondary);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-md);
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }

        /* Theme-specific enhancements */
        .theme-electric .enhanced-footer {
          border-top-color: rgba(139, 92, 246, 0.2);
        }

        .theme-professional .enhanced-footer {
          border-top-color: rgba(59, 130, 246, 0.2);
        }

        .theme-modern .enhanced-footer {
          border-top-color: rgba(239, 68, 68, 0.2);
        }

        .theme-creator .enhanced-footer {
          border-top-color: rgba(249, 115, 22, 0.2);
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .footer-main {
            grid-template-columns: 1fr;
            gap: var(--spacing-2xl);
          }

          .footer-links {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--spacing-lg);
          }
        }

        @media (max-width: 768px) {
          .footer-container {
            padding: var(--spacing-2xl) var(--spacing-lg) var(--spacing-lg);
            gap: var(--spacing-2xl);
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: var(--spacing-lg);
          }

          .newsletter-form {
            flex-direction: column;
          }

          .bottom-content {
            flex-direction: column;
            text-align: center;
            gap: var(--spacing-md);
          }

          .legal-section {
            flex-direction: column;
            gap: var(--spacing-md);
          }

          .legal-links {
            flex-wrap: wrap;
            justify-content: center;
          }

          .quality-badges {
            flex-wrap: wrap;
            justify-content: center;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-xl);
          }

          .status-content {
            flex-direction: column;
            gap: var(--spacing-md);
            text-align: center;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .enhanced-footer,
          .scroll-to-top,
          .social-link,
          .footer-link {
            animation: none;
            transition: none;
          }

          .scroll-to-top:hover,
          .social-link:hover,
          .footer-link:hover {
            transform: none;
          }

          .status-dot {
            animation: none;
          }
        }

        @media (prefers-contrast: high) {
          .enhanced-footer {
            border-top-width: 2px;
          }

          .status-bar,
          .stats-section,
          .newsletter-section {
            border-width: 2px;
          }
        }

        /* Performance optimization */
        .enhanced-footer {
          contain: layout style paint;
        }

        .scroll-to-top,
        .social-link,
        .footer-link {
          will-change: transform;
        }
      `}</style>
    </footer>
  );
}
