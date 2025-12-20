'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function CareersPage() {
  const { colorMode } = useTheme();
  const { t } = useLanguage();
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  const jobOpenings = [
    {
      id: 1,
      title: 'Frontend Engineer',
      department: 'Engineering',
      location: 'Remote / San Francisco',
      type: 'Full-time',
      experience: '5+ years',
      description:
        'Build beautiful, responsive user interfaces using React, TypeScript, and modern web technologies.',
      requirements: [
        '5+ years React experience',
        'TypeScript proficiency',
        'Modern CSS/Styling',
        'Performance optimization',
      ],
    },
    {
      id: 2,
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'Remote / New York',
      type: 'Full-time',
      experience: '3+ years',
      description:
        'Develop and deploy machine learning models for our AI assistant and recommendation systems.',
      requirements: [
        'Python/TensorFlow/PyTorch',
        'ML model deployment',
        'NLP experience',
        'Cloud platforms (AWS/GCP)',
      ],
    },
    {
      id: 3,
      title: 'Product Designer',
      department: 'Design',
      location: 'Remote / London',
      type: 'Full-time',
      experience: '4+ years',
      description:
        'Design intuitive user experiences that delight millions of users across our platform.',
      requirements: [
        'Figma/Sketch skills',
        'User research skills',
        'Design systems',
        'Mobile-first design',
      ],
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      experience: '4+ years',
      description:
        'Scale our infrastructure to support millions of users with high availability and performance.',
      requirements: [
        'Kubernetes/Docker',
        'AWS/GCP/Azure',
        'CI/CD pipelines',
        'Monitoring & observability',
      ],
    },
    {
      id: 5,
      title: 'Community Manager',
      department: 'Marketing',
      location: 'Remote / Austin',
      type: 'Full-time',
      experience: '2+ years',
      description:
        'Build and nurture our global community, creating engaging content and fostering connections.',
      requirements: [
        'Social media skills',
        'Content creation',
        'Community building',
        'Analytics & insights',
      ],
    },
    {
      id: 6,
      title: 'Security Engineer',
      department: 'Engineering',
      location: 'Remote / Berlin',
      type: 'Full-time',
      experience: '5+ years',
      description:
        'Protect our users and platform with cutting-edge security practices and technologies.',
      requirements: [
        'Security frameworks',
        'Penetration testing',
        'Compliance (SOC2, GDPR)',
        'Incident response',
      ],
    },
  ];

  const departments = ['all', 'Engineering', 'Design', 'Marketing'];
  const filteredJobs =
    selectedDepartment === 'all'
      ? jobOpenings
      : jobOpenings.filter((job) => job.department === selectedDepartment);

  return (
    <div
      className="careers-page"
      style={{
        minHeight: '100vh',
        background: colorMode === 'dark' ? '#000000' : '#ffffff',
        color: colorMode === 'dark' ? '#ffffff' : '#000000',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Join Our Team
          </h1>
          <p
            style={{
              fontSize: '1.25rem',
              color: colorMode === 'dark' ? '#a0a0a0' : '#666',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Help us build the future of social networking and create meaningful
            connections worldwide
          </p>
        </header>

        {/* Why Echo Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Why Work at Echo?
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
            }}
          >
            {[
              {
                icon: '🚀',
                title: 'Impact at Scale',
                description:
                  'Your work will directly impact millions of users and shape the future of social networking.',
              },
              {
                icon: '🌍',
                title: 'Remote-First Culture',
                description:
                  'Work from anywhere with flexible hours and a strong emphasis on work-life balance.',
              },
              {
                icon: '💡',
                title: 'Innovation & Learning',
                description:
                  'Access to cutting-edge technology, continuous learning opportunities, and innovation time.',
              },
              {
                icon: '🤝',
                title: 'Collaborative Team',
                description:
                  'Work with passionate, talented individuals who care about building something meaningful.',
              },
              {
                icon: '💰',
                title: 'Competitive Package',
                description:
                  'Competitive salary, equity, comprehensive benefits, and performance bonuses.',
              },
              {
                icon: '🌱',
                title: 'Growth Opportunities',
                description:
                  'Clear career progression paths, mentorship programs, and leadership development.',
              },
            ].map((benefit, index) => (
              <div
                key={index}
                style={{
                  background:
                    colorMode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  textAlign: 'center',
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = 'translateY(-5px)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = 'translateY(0)')
                }
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  {benefit.icon}
                </div>
                <h3
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: '#667eea',
                  }}
                >
                  {benefit.title}
                </h3>
                <p
                  style={{
                    color: colorMode === 'dark' ? '#b0b0b0' : '#555',
                    lineHeight: 1.6,
                  }}
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section style={{ marginBottom: '4rem' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Open Positions
          </h2>

          {/* Department Filter */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              marginBottom: '3rem',
              flexWrap: 'wrap',
            }}
          >
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '25px',
                  border: 'none',
                  background:
                    selectedDepartment === dept
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : colorMode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)',
                  color:
                    selectedDepartment === dept
                      ? '#fff'
                      : colorMode === 'dark'
                        ? '#fff'
                        : '#333',
                  cursor: 'pointer',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  textTransform: 'capitalize',
                }}
                onMouseEnter={(e) => {
                  if (selectedDepartment !== dept) {
                    e.currentTarget.style.background =
                      colorMode === 'dark'
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDepartment !== dept) {
                    e.currentTarget.style.background =
                      colorMode === 'dark'
                        ? 'rgba(255, 255, 255, 0.1)'
                        : 'rgba(0, 0, 0, 0.05)';
                  }
                }}
              >
                {dept === 'all' ? 'All Departments' : dept} (
                {dept === 'all'
                  ? jobOpenings.length
                  : jobOpenings.filter((job) => job.department === dept).length}
                )
              </button>
            ))}
          </div>

          {/* Job Listings */}
          <div
            style={{
              display: 'grid',
              gap: '2rem',
            }}
          >
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                style={{
                  background:
                    colorMode === 'dark'
                      ? 'rgba(255, 255, 255, 0.03)'
                      : 'rgba(0, 0, 0, 0.02)',
                  borderRadius: '16px',
                  padding: '2rem',
                  border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow =
                    colorMode === 'dark'
                      ? '0 10px 30px rgba(255, 255, 255, 0.1)'
                      : '0 10px 30px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem',
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                        color: '#667eea',
                      }}
                    >
                      {job.title}
                    </h3>
                    <div
                      style={{
                        display: 'flex',
                        gap: '1rem',
                        flexWrap: 'wrap',
                        fontSize: '0.9rem',
                        color: colorMode === 'dark' ? '#b0b0b0' : '#666',
                      }}
                    >
                      <span>📍 {job.location}</span>
                      <span>💼 {job.type}</span>
                      <span>⏱️ {job.experience}</span>
                      <span
                        style={{
                          background:
                            colorMode === 'dark'
                              ? 'rgba(255, 255, 255, 0.1)'
                              : 'rgba(0, 0, 0, 0.1)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                        }}
                      >
                        {job.department}
                      </span>
                    </div>
                  </div>
                  <button
                    style={{
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = 'scale(1.05)')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = 'scale(1)')
                    }
                  >
                    Apply Now
                  </button>
                </div>

                <p
                  style={{
                    color: colorMode === 'dark' ? '#e0e0e0' : '#333',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                  }}
                >
                  {job.description}
                </p>

                <div>
                  <h4
                    style={{
                      fontSize: '1rem',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                      color: colorMode === 'dark' ? '#fff' : '#333',
                    }}
                  >
                    Key Requirements:
                  </h4>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    {job.requirements.map((req, index) => (
                      <span
                        key={index}
                        style={{
                          background:
                            colorMode === 'dark'
                              ? 'rgba(102, 126, 234, 0.2)'
                              : 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea',
                          padding: '0.5rem 1rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                        }}
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{ marginBottom: '4rem' }}>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            Benefits & Perks
          </h2>
          <div
            style={{
              background:
                colorMode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              borderRadius: '20px',
              padding: '3rem',
              border: `1px solid ${colorMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '2rem',
              }}
            >
              {[
                '🏥 Comprehensive health, dental, and vision insurance',
                '💰 Competitive salary with equity participation',
                '🏖️ Unlimited PTO and flexible working hours',
                '💻 Top-tier equipment and home office stipend',
                '📚 $2,000 annual learning and development budget',
                '🍎 Wellness programs and mental health support',
                '👶 Parental leave and family support benefits',
                '🌍 Annual company retreats and team building',
                '🚀 Stock options and performance bonuses',
                '☕ Catered meals and premium coffee/snacks',
              ].map((benefit, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    background:
                      colorMode === 'dark'
                        ? 'rgba(255, 255, 255, 0.03)'
                        : 'rgba(255, 255, 255, 0.5)',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    color: colorMode === 'dark' ? '#e0e0e0' : '#333',
                  }}
                >
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          style={{
            textAlign: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px',
            padding: '3rem',
            color: '#fff',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            Don't See the Perfect Role?
          </h2>
          <p
            style={{
              fontSize: '1.1rem',
              marginBottom: '2rem',
              opacity: 0.9,
            }}
          >
            We're always looking for exceptional talent. Send us your resume and
            let us know how you'd like to contribute to Echo.
          </p>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              color: '#fff',
              padding: '1rem 2rem',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
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
            Send Us Your Resume
          </button>
        </section>
      </div>
    </div>
  );
}
