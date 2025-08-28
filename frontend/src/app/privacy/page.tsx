'use client';
export const dynamic = 'force-dynamic';


import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PrivacyPage() {
  const { colorMode } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="privacy-page" style={{
      minHeight: '100vh',
      background: colorMode === 'dark' ? '#000000' : '#ffffff',
      color: colorMode === 'dark' ? '#ffffff' : '#000000',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Privacy Policy
          </h1>
          <p style={{
            fontSize: '1rem',
            color: colorMode === 'dark' ? '#a0a0a0' : '#666',
            marginBottom: '0.5rem'
          }}>
            Last updated: December 2024
          </p>
          <p style={{
            fontSize: '1.1rem',
            color: colorMode === 'dark' ? '#e0e0e0' : '#333',
            lineHeight: 1.6
          }}>
            Your privacy is important to us. This policy explains how Echo collects, uses, and protects your information.
          </p>
        </header>

        {/* Table of Contents */}
        <section style={{
          background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '3rem',
          border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: '#667eea'
          }}>
            Table of Contents
          </h2>
          <ol style={{
            color: colorMode === 'dark' ? '#b0b0b0' : '#555',
            lineHeight: 1.8,
            paddingLeft: '1.5rem'
          }}>
            <li><a href="#information-we-collect" style={{ color: '#667eea', textDecoration: 'none' }}>Information We Collect</a></li>
            <li><a href="#how-we-use" style={{ color: '#667eea', textDecoration: 'none' }}>How We Use Your Information</a></li>
            <li><a href="#information-sharing" style={{ color: '#667eea', textDecoration: 'none' }}>Information Sharing</a></li>
            <li><a href="#data-security" style={{ color: '#667eea', textDecoration: 'none' }}>Data Security</a></li>
            <li><a href="#your-rights" style={{ color: '#667eea', textDecoration: 'none' }}>Your Rights and Choices</a></li>
            <li><a href="#cookies" style={{ color: '#667eea', textDecoration: 'none' }}>Cookies and Tracking</a></li>
            <li><a href="#international-transfers" style={{ color: '#667eea', textDecoration: 'none' }}>International Data Transfers</a></li>
            <li><a href="#children" style={{ color: '#667eea', textDecoration: 'none' }}>Children's Privacy</a></li>
            <li><a href="#changes" style={{ color: '#667eea', textDecoration: 'none' }}>Changes to This Policy</a></li>
            <li><a href="#contact" style={{ color: '#667eea', textDecoration: 'none' }}>Contact Us</a></li>
          </ol>
        </section>

        {/* Content Sections */}
        <div style={{ lineHeight: 1.7 }}>
          <section id="information-we-collect" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              1. Information We Collect
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Information You Provide
              </h3>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li>Account information (username, email, password)</li>
                <li>Profile information (bio, profile picture, preferences)</li>
                <li>Content you create (posts, messages, comments, media)</li>
                <li>Communication with us (support requests, feedback)</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Information We Collect Automatically
              </h3>
              <ul style={{ marginBottom: '1.5rem', paddingLeft: '1.5rem' }}>
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Location information (if you enable location services)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                Information from Third Parties
              </h3>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Social media platforms (if you connect your accounts)</li>
                <li>Analytics providers and advertising partners</li>
                <li>Public databases and data brokers (where legally permitted)</li>
              </ul>
            </div>
          </section>

          <section id="how-we-use" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              2. How We Use Your Information
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                We use your information to provide, improve, and personalize our services:
              </p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>Provide and maintain Echo's features and functionality</li>
                <li>Personalize your experience and content recommendations</li>
                <li>Facilitate communication between users</li>
                <li>Ensure platform safety and security</li>
                <li>Analyze usage patterns to improve our services</li>
                <li>Send important updates and notifications</li>
                <li>Comply with legal obligations</li>
                <li>Prevent fraud and abuse</li>
              </ul>
            </div>
          </section>

          <section id="information-sharing" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              3. Information Sharing
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                We do not sell your personal information. We may share information in these limited circumstances:
              </p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
                <li><strong>Service providers:</strong> Trusted partners who help us operate Echo</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
                <li><strong>Public content:</strong> Information you choose to make public on Echo</li>
              </ul>
            </div>
          </section>

          <section id="data-security" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              4. Data Security
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                We implement industry-standard security measures to protect your information:
              </p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li>End-to-end encryption for private messages</li>
                <li>Secure data transmission using TLS/SSL</li>
                <li>Regular security audits and penetration testing</li>
                <li>Access controls and employee training</li>
                <li>Data backup and disaster recovery procedures</li>
                <li>Compliance with SOC 2 and other security standards</li>
              </ul>
            </div>
          </section>

          <section id="your-rights" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              5. Your Rights and Choices
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                You have the following rights regarding your personal information:
              </p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
                <li><strong>Objection:</strong> Object to certain types of processing</li>
                <li><strong>Withdraw consent:</strong> Revoke previously given consent</li>
              </ul>
              <p style={{ marginTop: '1rem' }}>
                To exercise these rights, contact us at privacy@echo.com or use the settings in your account.
              </p>
            </div>
          </section>

          <section id="cookies" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              6. Cookies and Tracking
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><strong>Essential cookies:</strong> Required for basic functionality</li>
                <li><strong>Performance cookies:</strong> Help us understand how you use Echo</li>
                <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
                <li><strong>Advertising cookies:</strong> Deliver relevant ads (with your consent)</li>
              </ul>
              <p style={{ marginTop: '1rem' }}>
                You can manage cookie preferences in your browser settings or through our cookie consent tool.
              </p>
            </div>
          </section>

          <section id="international-transfers" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              7. International Data Transfers
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p>
                Echo operates globally, and your information may be transferred to and processed in countries 
                other than your own. We ensure appropriate safeguards are in place, including:
              </p>
              <ul style={{ paddingLeft: '1.5rem', marginTop: '1rem' }}>
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Adequacy decisions for countries with equivalent privacy protections</li>
                <li>Binding Corporate Rules for transfers within our corporate group</li>
              </ul>
            </div>
          </section>

          <section id="children" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              8. Children's Privacy
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p>
                Echo is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If we become aware that we have collected 
                such information, we will take steps to delete it promptly. If you believe we have 
                collected information from a child under 13, please contact us immediately.
              </p>
            </div>
          </section>

          <section id="changes" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              9. Changes to This Policy
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last updated" date. 
                We encourage you to review this policy periodically to stay informed about how we 
                protect your information.
              </p>
            </div>
          </section>

          <section id="contact" style={{ marginBottom: '3rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: '#667eea'
            }}>
              10. Contact Us
            </h2>
            <div style={{ color: colorMode === 'dark' ? '#e0e0e0' : '#333' }}>
              <p style={{ marginBottom: '1rem' }}>
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div style={{
                background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '12px',
                padding: '1.5rem',
                border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
              }}>
                <p><strong>Email:</strong> privacy@echo.com</p>
                <p><strong>Address:</strong> Echo Inc., 123 Privacy Street, San Francisco, CA 94105</p>
                <p><strong>Data Protection Officer:</strong> dpo@echo.com</p>
                <p><strong>EU Representative:</strong> Echo EU Ltd., Dublin, Ireland</p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer style={{
          textAlign: 'center',
          padding: '2rem',
          borderTop: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
          marginTop: '3rem'
        }}>
          <p style={{
            color: colorMode === 'dark' ? '#a0a0a0' : '#666',
            fontSize: '0.9rem'
          }}>
            This policy is effective as of December 2024 and applies to all users of Echo.
          </p>
        </footer>
      </div>
    </div>
  );
}