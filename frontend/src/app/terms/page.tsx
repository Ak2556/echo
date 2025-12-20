'use client';
export const dynamic = 'force-dynamic';

import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function TermsPage() {
  const { colorMode } = useTheme();
  const { t } = useLanguage();

  return (
    <div
      className="terms-page"
      style={{
        minHeight: '100vh',
        background: colorMode === 'dark' ? '#000000' : '#ffffff',
        color: colorMode === 'dark' ? '#ffffff' : '#000000',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Terms of Service
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: colorMode === 'dark' ? '#a0a0a0' : '#666',
              marginBottom: '0.5rem',
            }}
          >
            Last updated: December 2024
          </p>
          <p
            style={{
              fontSize: '1.1rem',
              color: colorMode === 'dark' ? '#e0e0e0' : '#333',
              lineHeight: 1.6,
            }}
          >
            These terms govern your use of Echo and the services we provide.
          </p>
        </header>

        {/* Content */}
        <div style={{ lineHeight: 1.7 }}>
          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              1. Acceptance of Terms
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                By accessing or using Echo ("the Service"), you agree to be
                bound by these Terms of Service ("Terms"). If you disagree with
                any part of these terms, you may not access the Service.
              </p>
              <p>
                These Terms apply to all visitors, users, and others who access
                or use the Service, including users who contribute content,
                information, and other materials or services.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              2. Description of Service
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                Echo is a social networking platform that enables users to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Create profiles and connect with other users</li>
                <li>
                  Share content including text, images, videos, and other media
                </li>
                <li>Participate in communities and discussions</li>
                <li>Use AI-powered features and mini-applications</li>
                <li>Communicate through messaging and live features</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue any
                aspect of the Service at any time, with or without notice.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              3. User Accounts and Registration
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                To use certain features of Echo, you must create an account.
                When creating an account, you agree to:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li>Provide accurate, current, and complete information</li>
                <li>
                  Maintain and update your information to keep it accurate
                </li>
                <li>Keep your password secure and confidential</li>
                <li>Be responsible for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>
              <p>
                You must be at least 13 years old to create an account. Users
                under 18 should have parental consent before using the Service.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              4. User Content and Conduct
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                }}
              >
                Content Guidelines
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                You are responsible for all content you post on Echo. You agree
                not to post content that:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                <li>
                  Is illegal, harmful, threatening, abusive, or discriminatory
                </li>
                <li>Violates intellectual property rights</li>
                <li>Contains spam, malware, or phishing attempts</li>
                <li>
                  Is sexually explicit or contains nudity (except in artistic
                  contexts)
                </li>
                <li>Promotes violence, self-harm, or dangerous activities</li>
                <li>Spreads misinformation or false information</li>
                <li>Violates privacy rights of others</li>
              </ul>

              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                }}
              >
                Content Ownership and License
              </h3>
              <p style={{ marginBottom: '1rem' }}>
                You retain ownership of content you post on Echo. However, by
                posting content, you grant Echo a worldwide, non-exclusive,
                royalty-free license to use, reproduce, modify, adapt, publish,
                translate, and distribute your content in connection with the
                Service.
              </p>
              <p>
                This license ends when you delete your content or account,
                except for content that has been shared with others and they
                have not deleted.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              5. Prohibited Uses
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                You agree not to use Echo for any of the following prohibited
                activities:
              </p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Impersonating others or providing false information</li>
                <li>Harassing, bullying, or intimidating other users</li>
                <li>
                  Attempting to gain unauthorized access to accounts or systems
                </li>
                <li>Interfering with or disrupting the Service</li>
                <li>
                  Using automated tools to access or interact with the Service
                </li>
                <li>Collecting user information without consent</li>
                <li>Engaging in commercial activities without permission</li>
                <li>Violating applicable laws or regulations</li>
              </ul>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              6. Privacy and Data Protection
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                Your privacy is important to us. Our Privacy Policy explains how
                we collect, use, and protect your information when you use the
                Service. By using Echo, you agree to the collection and use of
                information in accordance with our Privacy Policy.
              </p>
              <p>
                We implement appropriate security measures to protect your
                personal information, but cannot guarantee absolute security of
                data transmitted over the internet.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              7. Intellectual Property Rights
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                The Service and its original content, features, and
                functionality are owned by Echo and are protected by
                international copyright, trademark, patent, trade secret, and
                other intellectual property laws.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                You may not copy, modify, distribute, sell, or lease any part of
                our Service or included software, nor may you reverse engineer
                or attempt to extract the source code of that software.
              </p>
              <p>
                If you believe your intellectual property rights have been
                violated, please contact us at legal@echo.com with details of
                the alleged infringement.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              8. Termination
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                We may terminate or suspend your account and access to the
                Service immediately, without prior notice or liability, for any
                reason, including if you breach these Terms.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                You may terminate your account at any time by contacting us or
                using the account deletion feature in your settings.
              </p>
              <p>
                Upon termination, your right to use the Service will cease
                immediately, and we may delete your account and all associated
                data.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              9. Disclaimers and Limitation of Liability
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                The Service is provided on an "AS IS" and "AS AVAILABLE" basis.
                Echo makes no warranties, expressed or implied, and hereby
                disclaims all other warranties including, without limitation,
                implied warranties of merchantability, fitness for a particular
                purpose, or non-infringement.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                Echo shall not be liable for any indirect, incidental, special,
                consequential, or punitive damages, including without
                limitation, loss of profits, data, use, goodwill, or other
                intangible losses.
              </p>
              <p>
                In no event shall Echo's total liability to you for all damages
                exceed the amount you paid to Echo in the last twelve months, or
                $100, whichever is greater.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              10. Governing Law and Dispute Resolution
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                These Terms shall be governed by and construed in accordance
                with the laws of the State of California, without regard to its
                conflict of law provisions.
              </p>
              <p style={{ marginBottom: '1rem' }}>
                Any disputes arising from these Terms or your use of the Service
                will be resolved through binding arbitration in accordance with
                the rules of the American Arbitration Association.
              </p>
              <p>
                You waive any right to participate in a class-action lawsuit or
                class-wide arbitration against Echo.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              11. Changes to Terms
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                We reserve the right to modify or replace these Terms at any
                time. If a revision is material, we will provide at least 30
                days notice prior to any new terms taking effect.
              </p>
              <p>
                Your continued use of the Service after any changes constitutes
                acceptance of the new Terms. If you do not agree to the new
                Terms, you must stop using the Service.
              </p>
            </div>
          </section>

          <section style={{ marginBottom: '3rem' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: '#667eea',
              }}
            >
              12. Contact Information
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                If you have any questions about these Terms, please contact us:
              </p>
              <div
                style={{
                  background:
                    colorMode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                }}
              >
                <p>
                  <strong>Email:</strong> legal@echo.com
                </p>
                <p>
                  <strong>Address:</strong> Echo Inc., 123 Terms Street, San
                  Francisco, CA 94105
                </p>
                <p>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: 'center',
            padding: '2rem',
            borderTop: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            marginTop: '3rem',
          }}
        >
          <p
            style={{
              color: colorMode === 'dark' ? '#a0a0a0' : '#666',
              fontSize: '0.9rem',
            }}
          >
            These terms are effective as of December 2024 and apply to all users
            of Echo.
          </p>
        </footer>
      </div>
    </div>
  );
}
