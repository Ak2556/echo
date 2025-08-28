'use client';

import React, { useState, useMemo } from 'react';

interface Teacher {
  id: string;
  name: string;
  subject: string;
  rating: number;
  reviews: number;
  hourlyRate: number;
  experience: string;
  avatar: string;
  students: number;
}

interface Course {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  level: string;
  title: string;
  description: string;
  duration: string;
  schedule: string[];
  price: number;
  maxStudents: number;
  enrolled: number;
  rating: number;
  icon: string;
}

interface TuitionMarketplaceAppProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function TuitionMarketplaceApp({ isVisible, onClose }: TuitionMarketplaceAppProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'teachers' | 'insights'>('browse');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const teachers: Teacher[] = [
    { id: 't1', name: 'Sarah Johnson', subject: 'Mathematics', rating: 4.8, reviews: 156, hourlyRate: 45, experience: '8 years', avatar: '👩‍🏫', students: 234 },
    { id: 't2', name: 'Michael Chen', subject: 'Physics', rating: 4.9, reviews: 203, hourlyRate: 55, experience: '12 years', avatar: '👨‍🔬', students: 312 },
    { id: 't3', name: 'Emily Rodriguez', subject: 'English', rating: 4.7, reviews: 128, hourlyRate: 40, experience: '6 years', avatar: '👩‍💼', students: 189 },
    { id: 't4', name: 'David Kim', subject: 'Chemistry', rating: 4.6, reviews: 98, hourlyRate: 50, experience: '10 years', avatar: '🧑‍🔬', students: 156 }
  ];

  const courses: Course[] = [
    { id: '1', teacherId: 't1', teacherName: 'Sarah Johnson', subject: 'Mathematics', level: 'High School', title: 'Advanced Calculus', description: 'Master derivatives and integrals', duration: '12 weeks', schedule: ['Mon 4PM', 'Wed 4PM'], price: 2500, maxStudents: 20, enrolled: 15, rating: 4.8, icon: '📐' },
    { id: '2', teacherId: 't2', teacherName: 'Michael Chen', subject: 'Physics', level: 'College', title: 'Quantum Physics', description: 'Introduction to quantum mechanics', duration: '16 weeks', schedule: ['Tue 6PM', 'Thu 6PM'], price: 3500, maxStudents: 15, enrolled: 12, rating: 4.9, icon: '⚛️' },
    { id: '3', teacherId: 't3', teacherName: 'Emily Rodriguez', subject: 'English', level: 'Middle School', title: 'Creative Writing', description: 'Enhance writing skills', duration: '10 weeks', schedule: ['Mon 5PM', 'Thu 5PM'], price: 1800, maxStudents: 25, enrolled: 18, rating: 4.7, icon: '✍️' },
    { id: '4', teacherId: 't4', teacherName: 'David Kim', subject: 'Chemistry', level: 'High School', title: 'Organic Chemistry', description: 'Foundations of organic compounds', duration: '14 weeks', schedule: ['Wed 5PM', 'Fri 5PM'], price: 2800, maxStudents: 18, enrolled: 14, rating: 4.6, icon: '🧪' },
    { id: '5', teacherId: 't1', teacherName: 'Sarah Johnson', subject: 'Mathematics', level: 'College', title: 'Linear Algebra', description: 'Vectors, matrices and transformations', duration: '12 weeks', schedule: ['Tue 4PM', 'Fri 4PM'], price: 2200, maxStudents: 20, enrolled: 16, rating: 4.7, icon: '📊' }
  ];

  const subjects = ['All', 'Mathematics', 'Physics', 'Chemistry', 'English'];

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = searchQuery === '' ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || course.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [courses, searchQuery, selectedSubject]);

  // AI Insights
  const aiInsights = useMemo(() => {
    const avgPrice = courses.reduce((acc, c) => acc + c.price, 0) / courses.length;
    const topRated = [...courses].sort((a, b) => b.rating - a.rating)[0];
    const mostPopular = [...courses].sort((a, b) => b.enrolled - a.enrolled)[0];
    const avgEnrollment = Math.round(courses.reduce((acc, c) => acc + (c.enrolled / c.maxStudents) * 100, 0) / courses.length);

    return {
      avgPrice: Math.round(avgPrice),
      topRated,
      mostPopular,
      avgEnrollment,
      recommendations: [
        { text: 'Best Value', course: courses.sort((a, b) => (a.price / parseInt(a.duration)) - (b.price / parseInt(b.duration)))[0] },
        { text: 'Highest Rated', course: topRated },
        { text: 'Most Popular', course: mostPopular }
      ],
      tips: [
        'Classes with 70-80% enrollment often have the best student interaction.',
        'Consider teachers with 4.7+ ratings for quality instruction.',
        avgPrice < 2500 ? 'Great time to enroll - prices are below average!' : 'Premium courses available - invest in quality education.'
      ]
    };
  }, [courses]);

  if (!isVisible) return null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>🎓</span> Tuition Marketplace
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            AI-powered tutor matching & price insights
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '12px 24px', gap: '8px' }}>
        {[
          { id: 'browse', label: 'Browse', icon: '📚' },
          { id: 'teachers', label: 'Teachers', icon: '👨‍🏫' },
          { id: 'insights', label: 'AI Insights', icon: '🤖' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: activeTab === tab.id ? '600' : '400',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {activeTab === 'browse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Search & Filter */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  fontSize: '0.9rem'
                }}
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Course List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredCourses.map(course => (
                <div
                  key={course.id}
                  onClick={() => setSelectedCourse(course)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    padding: '16px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ fontSize: '2.5rem' }}>{course.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '4px' }}>{course.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '8px' }}>
                        {course.teacherName} • {course.level}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: '#ffd700' }}>⭐ {course.rating}</span>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)' }}>{course.duration}</span>
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: course.enrolled / course.maxStudents > 0.8 ? 'rgba(255, 71, 87, 0.3)' : 'rgba(46, 213, 115, 0.3)',
                          color: course.enrolled / course.maxStudents > 0.8 ? '#ff4757' : '#2ed573'
                        }}>
                          {course.enrolled}/{course.maxStudents} enrolled
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.2rem', fontWeight: '700', color: '#667eea' }}>${course.price}</div>
                      <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>total</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'teachers' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teachers.map(teacher => (
              <div key={teacher.id} style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <div style={{ fontSize: '2.5rem' }}>{teacher.avatar}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '2px' }}>{teacher.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                    {teacher.subject} • {teacher.experience}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem' }}>
                    <span style={{ color: '#ffd700' }}>⭐ {teacher.rating} ({teacher.reviews})</span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>👨‍🎓 {teacher.students} students</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#667eea' }}>${teacher.hourlyRate}</div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)' }}>per hour</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'insights' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#667eea' }}>${aiInsights.avgPrice}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>Avg Price</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.08)', borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#2ed573' }}>{aiInsights.avgEnrollment}%</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>Avg Enrollment</div>
              </div>
            </div>

            {/* Recommendations */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🤖</span> AI Recommendations
              </div>
              {aiInsights.recommendations.map((rec, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '1.5rem' }}>{rec.course.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.7rem', color: '#667eea', fontWeight: '600' }}>{rec.text}</div>
                    <div style={{ fontSize: '0.85rem' }}>{rec.course.title}</div>
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#667eea' }}>${rec.course.price}</div>
                </div>
              ))}
            </div>

            {/* Tips */}
            <div style={{
              background: 'rgba(102, 126, 234, 0.15)',
              border: '1px solid rgba(102, 126, 234, 0.3)',
              borderRadius: '16px',
              padding: '16px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>💡</span> Price Insights
              </div>
              {aiInsights.tips.map((tip, idx) => (
                <div key={idx} style={{
                  fontSize: '0.8rem',
                  color: 'rgba(255, 255, 255, 0.7)',
                  padding: '6px 0',
                  borderBottom: idx < aiInsights.tips.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'
                }}>
                  {tip}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setSelectedCourse(null)}>
          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '85vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '4rem', marginBottom: '12px' }}>{selectedCourse.icon}</div>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem' }}>{selectedCourse.title}</h3>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                {selectedCourse.teacherName}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#667eea' }}>${selectedCourse.price}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)' }}>Total</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#ffd700' }}>⭐ {selectedCourse.rating}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)' }}>Rating</div>
              </div>
              <div style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '700', color: '#2ed573' }}>{selectedCourse.enrolled}/{selectedCourse.maxStudents}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255, 255, 255, 0.6)' }}>Enrolled</div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>About</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.7)' }}>{selectedCourse.description}</div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '6px' }}>Schedule</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {selectedCourse.schedule.map((s, idx) => (
                  <span key={idx} style={{
                    padding: '4px 8px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.75rem'
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setSelectedCourse(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Close
              </button>
              <button
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}
              >
                Enroll Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
