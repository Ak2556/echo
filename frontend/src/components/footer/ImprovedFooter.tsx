'use client';

import React from 'react';
import Link from 'next/link';
import { Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { FooterColumn } from './FooterColumn';

export function ImprovedFooter() {
  const platformLinks = [
    { label: 'Home', href: '/' },
    { label: 'Feed', href: '/feed' },
    { label: 'Discover', href: '/discover' },
    { label: 'Live', href: '/live' },
    { label: 'Messages', href: '/messages' },
  ];

  const featuresLinks = [
    { label: 'Mini Apps', href: '/miniapps' },
    { label: 'AI Assistant', href: '/ai' },
    { label: 'Communities', href: '/communities' },
    { label: 'Creators', href: '/creators' },
    { label: 'Live Events', href: '/events' },
  ];

  const resourcesLinks = [
    { label: 'Help Center', href: '/help' },
    { label: 'Developer API', href: '/api' },
    { label: 'Blog', href: '/blog' },
    { label: 'User Guides', href: '/guides' },
    { label: 'System Status', href: '/status' },
  ];

  const companyLinks = [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press Kit', href: '/press' },
    { label: 'Contact', href: '/contact' },
    { label: 'Investors', href: '/investors' },
  ];

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
              Get the latest updates, features, and news delivered to your inbox.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
              />
              <button className="px-6 py-2 rounded-lg bg-white text-[var(--echo-primary)] font-semibold hover:bg-white/90 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-[var(--echo-border-light)]">
          <div className="flex items-center gap-4">
            <Link
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[var(--echo-bg-tertiary)] hover:bg-[var(--echo-primary)] text-[var(--echo-text-secondary)] hover:text-white transition-all flex items-center justify-center"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </Link>
            <Link
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[var(--echo-bg-tertiary)] hover:bg-[var(--echo-primary)] text-[var(--echo-text-secondary)] hover:text-white transition-all flex items-center justify-center"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-[var(--echo-bg-tertiary)] hover:bg-[var(--echo-primary)] text-[var(--echo-text-secondary)] hover:text-white transition-all flex items-center justify-center"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </Link>
            <Link
              href="mailto:hello@echo.com"
              className="w-10 h-10 rounded-lg bg-[var(--echo-bg-tertiary)] hover:bg-[var(--echo-primary)] text-[var(--echo-text-secondary)] hover:text-white transition-all flex items-center justify-center"
              aria-label="Email"
            >
              <Mail className="w-5 h-5" />
            </Link>
          </div>

          <div className="text-2xl font-bold bg-gradient-to-r from-[var(--echo-primary)] to-[var(--echo-accent)] bg-clip-text text-transparent">
            Echo
          </div>
        </div>

        {/* Legal Bar */}
        <div className="pt-8 flex items-center justify-between flex-wrap gap-4 text-sm text-[var(--echo-text-tertiary)]">
          <p>&copy; {new Date().getFullYear()} Echo. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-[var(--echo-primary)] transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="hover:text-[var(--echo-primary)] transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              href="/cookies"
              className="hover:text-[var(--echo-primary)] transition-colors"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
