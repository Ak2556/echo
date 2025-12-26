'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import {
  Twitter,
  Github,
  Linkedin,
  Mail,
  Loader2,
  CheckCircle2,
  ArrowUp,
} from 'lucide-react';
import { FooterColumn } from './FooterColumn';
import toast from 'react-hot-toast';

export function ImprovedFooter() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const platformLinks = [
    { label: 'Home', href: '/' },
    { label: 'Showcase', href: '/showcase' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
  ];

  const featuresLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ];

  const resourcesLinks = [
    { label: 'Help Center', href: '#help' },
    { label: 'Developer API', href: '#api' },
    { label: 'Documentation', href: '#docs' },
    { label: 'Status', href: '#status' },
  ];

  const companyLinks = [
    { label: 'Blog', href: '#blog' },
    { label: 'Press Kit', href: '#press' },
    { label: 'Contact', href: '#contact' },
    { label: 'Partners', href: '#partners' },
  ];

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);

    try {
      // Simulate API call - replace with actual API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // TODO: Replace with actual API call
      // const response = await fetch('/api/newsletter/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      setIsSubscribed(true);
      toast.success('Successfully subscribed to newsletter!', {
        icon: '🎉',
        duration: 4000,
      });
      setEmail('');

      // Reset success state after 5 seconds
      setTimeout(() => setIsSubscribed(false), 5000);
    } catch (error) {
      toast.error('Failed to subscribe. Please try again later.');
      console.error('Newsletter subscription error:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSocialClick = (platform: string) => {
    toast.success(`Opening ${platform}...`, { icon: '🔗' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.success('Scrolled to top', { icon: '⬆️', duration: 2000 });
  };

  return (
    <footer className="border-t border-[var(--echo-border-light)] mt-12 py-12 bg-[var(--echo-bg-secondary)]">
      <div className="echo-container">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          <FooterColumn title="Platform" links={platformLinks} />
          <FooterColumn title="Features" links={featuresLinks} />
          <FooterColumn title="Resources" links={resourcesLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        {/* Newsletter Section */}
        <div className="mb-12 p-6 rounded-xl bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)]">
          <div className="max-w-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">
              Stay Updated
            </h3>
            <p className="text-sm text-white/80 mb-4">
              Get the latest updates, features, and news delivered to your
              inbox.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isSubscribing || isSubscribed}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                aria-label="Email address for newsletter"
              />
              <button
                type="submit"
                disabled={isSubscribing || isSubscribed}
                className="px-6 py-2 rounded-lg bg-white text-[var(--echo-primary)] font-semibold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
                aria-label={
                  isSubscribing
                    ? 'Subscribing...'
                    : isSubscribed
                      ? 'Subscribed!'
                      : 'Subscribe to newsletter'
                }
              >
                {isSubscribing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : isSubscribed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Subscribed!</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-[var(--echo-border-light)]">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                handleSocialClick('Twitter');
                window.open(
                  'https://twitter.com',
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
              className="w-10 h-10 rounded-lg bg-[var(--echo-bg-tertiary)] hover:bg-[var(--echo-primary)] text-[var(--echo-text-secondary)] hover:text-white transition-all flex items-center justify-center hover:scale-110 active:scale-95"
              aria-label="Follow us on Twitter"
              title="Follow us on Twitter"
            >
              <Twitter className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                handleSocialClick('GitHub');
                window.open(
                  'https://github.com/Ak2556/echo',
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
              className="w-10 h-10 rounded-lg bg-[var(--echo-bg-tertiary)] hover:bg-[var(--echo-primary)] text-[var(--echo-text-secondary)] hover:text-white transition-all flex items-center justify-center hover:scale-110 active:scale-95"
              aria-label="Visit our GitHub"
              title="Visit our GitHub repository"
            >
              <Github className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                handleSocialClick('LinkedIn');
                window.open(
                  'https://linkedin.com',
                  '_blank',
                  'noopener,noreferrer'
                );
              }}
              className="w-10 h-10 rounded-lg bg-[var(--echo-bg-tertiary)] hover:bg-[var(--echo-primary)] text-[var(--echo-text-secondary)] hover:text-white transition-all flex items-center justify-center hover:scale-110 active:scale-95"
              aria-label="Connect on LinkedIn"
              title="Connect with us on LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                handleSocialClick('Email');
                window.location.href = 'mailto:hello@echo.com';
              }}
              className="w-10 h-10 rounded-lg bg-[var(--echo-bg-tertiary)] hover:bg-[var(--echo-primary)] text-[var(--echo-text-secondary)] hover:text-white transition-all flex items-center justify-center hover:scale-110 active:scale-95"
              aria-label="Email us"
              title="Send us an email"
            >
              <Mail className="w-5 h-5" />
            </button>
          </div>

          <div className="text-2xl font-bold bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] bg-clip-text text-transparent">
            Echo
          </div>
        </div>

        {/* Legal Bar */}
        <div className="pt-8 flex items-center justify-between flex-wrap gap-4 text-sm text-[var(--echo-text-tertiary)]">
          <p>&copy; {new Date().getFullYear()} Echo. All rights reserved.</p>
          <div className="flex items-center gap-6 flex-wrap">
            <Link
              href="/privacy"
              className="hover:text-[var(--echo-primary)] transition-colors hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[var(--echo-primary)] transition-colors hover:underline"
            >
              Terms of Service
            </Link>
            <button
              onClick={() => toast('Cookie preferences coming soon!')}
              className="hover:text-[var(--echo-primary)] transition-colors hover:underline"
            >
              Cookie Settings
            </button>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-full bg-[var(--echo-primary)] text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-50 animate-fade-in"
          aria-label="Scroll to top"
          title="Back to top"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
      )}
    </footer>
  );
}
