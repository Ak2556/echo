'use client';
export const dynamic = 'force-dynamic';


import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AboutPage() {
  const { colorMode } = useTheme();
  const { t } = useLanguage();

  return (
    <div className="about-page" style={{
      minHeight: '100vh',
      background: colorMode === 'dark' ? '#000000' : '#ffffff',
      color: colorMode === 'dark' ? '#ffffff' : '#000000',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            About Echo
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: colorMode === 'dark' ? '#a0a0a0' : '#666',
            maxWidth: '600px',
            margin: '0 auto',
            lineHeight: 1.6
          }}>
            Connecting the world through meaningful conversations and shared experiences
          </p>
        </header>

        {/* Mission Section */}
        <section style={{ marginBottom: '4rem' }}>
          <div style={{
            background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '20px',
            padding: '3rem',
            border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: '1.5rem',
              color: '#667eea'
            }}>
              Our Mission
            </h2>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: colorMode === 'dark' ? '#e0e0e0' : '#333',
              marginBottom: '1.5rem'
            }}>
              At Echo, we believe that technology should bring people closer together, not drive them apart. 
              Our mission is to create a social platform that fosters genuine connections, meaningful conversations, 
              and shared experiences that enrich lives and build communities.
            </p>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: colorMode === 'dark' ? '#e0e0e0' : '#333'
            }}>
              We're building more than just another social network – we're creating a digital space where 
              authenticity thrives, creativity flourishes, and every voice matters.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 600,
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Our Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '🤝',
                title: 'Authentic Connections',
                description: 'We prioritize genuine relationships over superficial metrics. Quality conversations matter more than follower counts.'
              },
              {
                icon: '🌍',
                title: 'Global Community',
                description: 'Breaking down barriers and connecting people across cultures, languages, and backgrounds to create a truly global community.'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                description: 'Your data belongs to you. We implement industry-leading privacy protections and give you complete control over your information.'
              },
              {
                icon: '🚀',
                title: 'Innovation',
                description: 'Constantly pushing boundaries with AI-powered features, mini-apps, and cutting-edge technology to enhance your experience.'
              },
              {
                icon: '🎨',
                title: 'Creative Expression',
                description: 'Empowering users to express themselves through various media, tools, and features that celebrate creativity and individuality.'
              },
              {
                icon: '🌱',
                title: 'Sustainable Growth',
                description: 'Building a platform that grows responsibly, prioritizing user wellbeing and positive social impact over rapid expansion.'
              }
            ].map((value, index) => (
              <div key={index} style={{
                background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '16px',
                padding: '2rem',
                border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                textAlign: 'center',
                transition: 'transform 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{value.icon}</div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  color: '#667eea'
                }}>
                  {value.title}
                </h3>
                <p style={{
                  color: colorMode === 'dark' ? '#b0b0b0' : '#555',
                  lineHeight: 1.6
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 600,
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Our Story
          </h2>
          <div style={{
            background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            borderRadius: '20px',
            padding: '3rem',
            border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: colorMode === 'dark' ? '#e0e0e0' : '#333',
              marginBottom: '1.5rem'
            }}>
              Echo was born from a simple observation: despite being more connected than ever, people felt increasingly isolated. 
              Social media had become a place of performance rather than genuine connection, algorithms prioritized engagement over wellbeing, 
              and meaningful conversations were lost in the noise.
            </p>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: colorMode === 'dark' ? '#e0e0e0' : '#333',
              marginBottom: '1.5rem'
            }}>
              Founded in 2024 by a team of passionate technologists, designers, and community builders, Echo represents a new approach 
              to social networking. We've reimagined what a social platform can be when it's built with intention, designed for wellbeing, 
              and powered by cutting-edge technology that serves humanity.
            </p>
            <p style={{
              fontSize: '1.1rem',
              lineHeight: 1.7,
              color: colorMode === 'dark' ? '#e0e0e0' : '#333'
            }}>
              Today, Echo is home to millions of users worldwide who are building communities, sharing knowledge, creating content, 
              and forming lasting friendships. But we're just getting started – our vision is to create a platform that grows with 
              you and adapts to your needs, powered by AI that enhances rather than replaces human connection.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 600,
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Echo by the Numbers
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '2rem',
            textAlign: 'center'
          }}>
            {[
              { number: '10M+', label: 'Active Users' },
              { number: '50+', label: 'Countries' },
              { number: '100M+', label: 'Messages Sent' },
              { number: '1M+', label: 'Communities' },
              { number: '500+', label: 'Mini Apps' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div key={index} style={{
                background: colorMode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                borderRadius: '16px',
                padding: '2rem',
                border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  marginBottom: '0.5rem'
                }}>
                  {stat.number}
                </div>
                <div style={{
                  color: colorMode === 'dark' ? '#b0b0b0' : '#555',
                  fontWeight: 500
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '3rem',
          color: '#fff'
        }}>
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 600,
            marginBottom: '1rem'
          }}>
            Join the Echo Community
          </h2>
          <p style={{
            fontSize: '1.1rem',
            marginBottom: '2rem',
            opacity: 0.9
          }}>
            Be part of a platform that's redefining social networking for the better.
          </p>
          <button style={{
            background: 'rgba(255, 255, 255, 0.2)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: '#fff',
            padding: '1rem 2rem',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            Get Started Today
          </button>
        </section>
      </div>
    </div>
  );
}