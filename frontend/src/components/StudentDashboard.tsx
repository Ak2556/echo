'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { courses, Course, getTeacherById } from '@/data/tuitionData';

interface EnrolledCourse extends Course {
  enrolledDate: string;
  progress: number; // 0-100
  lastAccessedLesson?: string;
  certificateEarned: boolean;
  hoursCompleted: number;
}

export default function StudentDashboard() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed' | 'wishlist'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlistIds, setWishlistIds] = useState<number[]>([2]); // Mock wishlist

  // Mock enrolled courses data
  const [enrolledCourses] = useState<EnrolledCourse[]>([
    {
      ...courses[0],
      enrolledDate: '2025-01-15',
      progress: 45,
      lastAccessedLesson: 'Understanding Limits and Continuity',
      certificateEarned: false,
      hoursCompleted: 23
    }
  ]);

  const wishlistCourses = courses.filter(c => wishlistIds.includes(c.id));

  const filteredCourses = useMemo(() => {
    let filtered = enrolledCourses;

    if (activeTab === 'in-progress') {
      filtered = filtered.filter(c => c.progress > 0 && c.progress < 100);
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(c => c.progress === 100);
    } else if (activeTab === 'wishlist') {
      return wishlistCourses;
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.subject.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [activeTab, searchQuery, enrolledCourses, wishlistCourses]);

  const totalHoursLearned = enrolledCourses.reduce((acc, c) => acc + c.hoursCompleted, 0);
  const totalCoursesCompleted = enrolledCourses.filter(c => c.progress === 100).length;
  const totalCertificates = enrolledCourses.filter(c => c.certificateEarned).length;
  const averageProgress = enrolledCourses.length > 0
    ? enrolledCourses.reduce((acc, c) => acc + c.progress, 0) / enrolledCourses.length
    : 0;

  const removeFromWishlist = (courseId: number) => {
    setWishlistIds(prev => prev.filter(id => id !== courseId));
  };

  return (
    <section id="student-dashboard" data-route="student-dashboard" className="active">
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            My Learning Dashboard
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--muted)' }}>
            Track your progress and continue learning
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '2rem' }}>📚</span>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 700
              }}>
                {enrolledCourses.length}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
              Enrolled Courses
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {enrolledCourses.length}
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.15) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '2rem' }}>⏱️</span>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 700
              }}>
                {totalHoursLearned}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
              Hours Learned
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {totalHoursLearned}h
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.15) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '2rem' }}>✅</span>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 700
              }}>
                {totalCoursesCompleted}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
              Completed Courses
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {totalCoursesCompleted}
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.15) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '2rem' }}>🏆</span>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 700
              }}>
                {totalCertificates}
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
              Certificates Earned
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>
              {totalCertificates}
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div style={{
          padding: '2rem',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          marginBottom: '3rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Overall Learning Progress
              </h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
                Keep up the great work! You're making excellent progress.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)' }}>
                {Math.round(averageProgress)}%
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                Average Progress
              </div>
            </div>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: 'var(--bg)',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${averageProgress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--accent) 0%, #764ba2 100%)',
              transition: 'width 0.5s ease',
              borderRadius: '6px'
            }} />
          </div>
        </div>

        {/* Tabs and Search */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          gap: '2rem'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '0.5rem'
          }}>
            {([
              { key: 'all', label: 'All Courses', count: enrolledCourses.length },
              { key: 'in-progress', label: 'In Progress', count: enrolledCourses.filter(c => c.progress > 0 && c.progress < 100).length },
              { key: 'completed', label: 'Completed', count: totalCoursesCompleted },
              { key: 'wishlist', label: 'Wishlist', count: wishlistIds.length }
            ] as const).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeTab === tab.key ? 'var(--accent)' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : 'var(--fg)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'var(--bg)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {tab.label}
                <span style={{
                  marginLeft: '0.5rem',
                  padding: '0.15rem 0.5rem',
                  background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--bg)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <input
            type="search"
            placeholder="Search your courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              maxWidth: '400px',
              padding: '0.85rem 1.25rem',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              background: 'var(--card)',
              color: 'var(--fg)',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {/* Courses Grid */}
        {filteredCourses.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
              {activeTab === 'wishlist' ? '🤍' : '📚'}
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {activeTab === 'wishlist' ? 'No courses in wishlist' : 'No courses found'}
            </h3>
            <p style={{ fontSize: '1rem', color: 'var(--muted)', marginBottom: '2rem' }}>
              {activeTab === 'wishlist'
                ? 'Start adding courses to your wishlist to keep track of courses you want to take.'
                : 'Start your learning journey by enrolling in courses.'}
            </p>
            <button style={{
              padding: '0.85rem 2rem',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}>
              Browse Courses
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
            gap: '1.5rem'
          }}>
            {activeTab === 'wishlist' ? (
              // Wishlist Cards
              wishlistCourses.map(course => {
                const teacher = getTeacherById(course.teacherId);
                return (
                  <div
                    key={course.id}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(course.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: '1rem',
                          right: '1rem',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.95)',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1.2rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        ❤️
                      </button>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{
                        display: 'inline-block',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        marginBottom: '0.75rem'
                      }}>
                        {course.category}
                      </div>

                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '0.75rem',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {course.title}
                      </h3>

                      {teacher && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                          marginBottom: '1rem'
                        }}>
                          {teacher.name}
                        </div>
                      )}

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: '1rem',
                        borderTop: '1px solid var(--border)'
                      }}>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: 700,
                          color: 'var(--accent)'
                        }}>
                          ₹{course.price.toLocaleString()}
                        </div>
                        <button style={{
                          padding: '0.5rem 1.25rem',
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}>
                          Enroll Now
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              // Enrolled Courses Cards
              enrolledCourses.map(course => {
                const teacher = getTeacherById(course.teacherId);
                return (
                  <div
                    key={course.id}
                    style={{
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {/* Thumbnail */}
                    <div style={{ position: 'relative', width: '100%', height: '200px' }}>
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {course.progress === 100 && (
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          left: '1rem',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          padding: '0.35rem 0.85rem',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}>
                          ✓ Completed
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{
                          display: 'inline-block',
                          background: 'var(--bg)',
                          border: '1px solid var(--border)',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {course.category}
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: course.progress === 100 ? '#10b981' : 'var(--accent)'
                        }}>
                          {course.progress}%
                        </div>
                      </div>

                      <h3 style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '0.75rem',
                        lineHeight: '1.3',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {course.title}
                      </h3>

                      {teacher && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                          marginBottom: '1rem'
                        }}>
                          {teacher.name}
                        </div>
                      )}

                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '8px',
                        background: 'var(--bg)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                      }}>
                        <div style={{
                          width: `${course.progress}%`,
                          height: '100%',
                          background: course.progress === 100
                            ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(90deg, var(--accent) 0%, #764ba2 100%)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>

                      <div style={{
                        display: 'flex',
                        gap: '1rem',
                        fontSize: '0.85rem',
                        color: 'var(--muted)',
                        marginBottom: '1rem'
                      }}>
                        <div>⏱️ {course.hoursCompleted}h completed</div>
                        <div>📚 {course.modules.length} modules</div>
                      </div>

                      {course.lastAccessedLesson && (
                        <div style={{
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                          marginBottom: '1rem',
                          padding: '0.75rem',
                          background: 'var(--bg)',
                          borderRadius: '8px'
                        }}>
                          <strong>Last lesson:</strong> {course.lastAccessedLesson}
                        </div>
                      )}

                      <button style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: course.progress === 100
                          ? 'var(--bg)'
                          : 'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
                        color: course.progress === 100 ? 'var(--fg)' : '#fff',
                        border: course.progress === 100 ? '2px solid var(--border)' : 'none',
                        borderRadius: '10px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}>
                        {course.progress === 100 ? '🏆 View Certificate' : '▶️ Continue Learning'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Achievement Section */}
        {totalCertificates > 0 && (
          <div style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(217, 119, 6, 0.1) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '16px'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
              🏆 Your Achievements
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1.5rem'
            }}>
              {enrolledCourses.filter(c => c.certificateEarned).map(course => (
                <div
                  key={course.id}
                  style={{
                    padding: '1.5rem',
                    background: 'var(--card)',
                    border: '2px solid #f59e0b',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏆</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Certificate of Completion
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {course.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
