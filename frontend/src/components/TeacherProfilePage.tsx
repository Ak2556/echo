'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Teacher,
  getTeacherById,
  courses,
  Course,
  reviews,
} from '@/data/tuitionData';

interface TeacherProfilePageProps {
  teacherId: number;
  onBack?: () => void;
}

export default function TeacherProfilePage({
  teacherId,
  onBack,
}: TeacherProfilePageProps) {
  const { t } = useLanguage();
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'about' | 'reviews'>(
    'courses'
  );
  const [sortBy, setSortBy] = useState<'popular' | 'rating' | 'newest'>(
    'popular'
  );

  useEffect(() => {
    const foundTeacher = getTeacherById(teacherId);
    setTeacher(foundTeacher || null);
  }, [teacherId]);

  const teacherCourses = useMemo(() => {
    const filtered = courses.filter((course) => course.teacherId === teacherId);

    switch (sortBy) {
      case 'popular':
        return filtered.sort((a, b) => b.enrolledStudents - a.enrolledStudents);
      case 'rating':
        return filtered.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return filtered.sort((a, b) => b.id - a.id);
      default:
        return filtered;
    }
  }, [teacherId, sortBy]);

  const teacherReviews = useMemo(() => {
    const teacherCourseIds = teacherCourses.map((c) => c.id);
    return reviews.filter((review) =>
      teacherCourseIds.includes(review.courseId)
    );
  }, [teacherCourses]);

  const averageRating = useMemo(() => {
    if (teacherReviews.length === 0) return teacher?.rating || 0;
    return (
      teacherReviews.reduce((acc, r) => acc + r.rating, 0) /
      teacherReviews.length
    );
  }, [teacher, teacherReviews]);

  if (!teacher) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          fontSize: '1.2rem',
          color: 'var(--muted)',
        }}
      >
        Teacher not found
      </div>
    );
  }

  return (
    <section
      id="teacher-profile"
      data-route="teacher-profile"
      className="active"
    >
      <div
        className="container"
        style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem' }}
      >
        {/* Breadcrumb with Back Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem',
          }}
        >
          {onBack && (
            <button
              onClick={onBack}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--fg)',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--accent)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--card)';
                e.currentTarget.style.color = 'var(--fg)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              ← Back to Courses
            </button>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              color: 'var(--muted)',
            }}
          >
            <span style={{ cursor: 'pointer', color: 'var(--accent)' }}>
              Home
            </span>
            <span>›</span>
            <span
              onClick={onBack}
              style={{
                cursor: onBack ? 'pointer' : 'default',
                color: onBack ? 'var(--accent)' : 'var(--muted)',
              }}
            >
              Tuition
            </span>
            <span>›</span>
            <span style={{ cursor: 'pointer', color: 'var(--accent)' }}>
              Instructors
            </span>
            <span>›</span>
            <span>{teacher.name}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div
          style={{
            background:
              'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '3rem',
            marginBottom: '3rem',
          }}
        >
          <div
            style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}
          >
            {/* Avatar */}
            <div style={{ position: 'relative' }}>
              <Image
                src={teacher.avatar}
                alt={teacher.name}
                width={180}
                height={180}
                style={{
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '5px solid var(--card)',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                }}
              />
              {teacher.verified && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    background:
                      'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.5rem',
                    border: '3px solid var(--card)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  ✓
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'inline-block',
                  background: teacher.verified
                    ? 'rgba(16, 185, 129, 0.15)'
                    : 'rgba(156, 163, 175, 0.15)',
                  color: teacher.verified ? '#10b981' : 'var(--muted)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                }}
              >
                {teacher.verified ? '✓ Verified Instructor' : 'Instructor'}
              </div>

              <h1
                style={{
                  fontSize: '2.8rem',
                  fontWeight: 700,
                  marginBottom: '0.75rem',
                  lineHeight: '1.2',
                }}
              >
                {teacher.name}
              </h1>

              <p
                style={{
                  fontSize: '1.3rem',
                  color: 'var(--muted)',
                  marginBottom: '2rem',
                  lineHeight: '1.5',
                }}
              >
                {teacher.title}
              </p>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: '2rem',
                  marginBottom: '2rem',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {teacher.rating}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    ⭐ Instructor Rating
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {(teacher.totalStudents / 1000).toFixed(1)}K
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    👥 Total Students
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {teacher.totalCourses}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    📚 Courses
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {teacher.yearsExperience}+
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    📅 Years Experience
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    {teacher.responseTime}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    ⚡ Response Time
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  style={{
                    padding: '0.85rem 2rem',
                    background:
                      'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = 'translateY(-2px)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = 'translateY(0)')
                  }
                >
                  💬 Message Instructor
                </button>
                <button
                  style={{
                    padding: '0.85rem 2rem',
                    background: 'var(--card)',
                    color: 'var(--fg)',
                    border: '2px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--fg)';
                  }}
                >
                  🔔 Follow
                </button>
                <button
                  style={{
                    padding: '0.85rem 1.5rem',
                    background: 'var(--card)',
                    color: 'var(--fg)',
                    border: '2px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.color = 'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--fg)';
                  }}
                >
                  🔗 Share
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '2px solid var(--border)',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          {(['courses', 'about', 'reviews'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '1rem 1.5rem',
                background: 'transparent',
                border: 'none',
                borderBottom:
                  activeTab === tab
                    ? '3px solid var(--accent)'
                    : '3px solid transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (activeTab !== tab)
                  e.currentTarget.style.color = 'var(--fg)';
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab)
                  e.currentTarget.style.color = 'var(--muted)';
              }}
            >
              {tab === 'courses' && '📚 '}
              {tab === 'about' && '👨‍🏫 '}
              {tab === 'reviews' && '⭐ '}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.15rem 0.5rem',
                  background: 'var(--bg)',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                }}
              >
                {tab === 'courses' && teacherCourses.length}
                {tab === 'reviews' && teacherReviews.length}
              </span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 380px',
            gap: '2rem',
          }}
        >
          {/* Main Content */}
          <div>
            {/* Courses Tab */}
            {activeTab === 'courses' && (
              <div>
                {/* Sort Controls */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                    {teacherCourses.length} Course
                    {teacherCourses.length !== 1 ? 's' : ''}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                      Sort by:
                    </span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'var(--bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--fg)',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="popular">Most Popular</option>
                      <option value="rating">Highest Rated</option>
                      <option value="newest">Newest</option>
                    </select>
                  </div>
                </div>

                {/* Courses Grid */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
                  {teacherCourses.map((course: Course) => (
                    <div
                      key={course.id}
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        gap: '1.5rem',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow =
                          '0 12px 40px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Course Thumbnail */}
                      <div
                        style={{
                          position: 'relative',
                          width: '300px',
                          height: '200px',
                          flexShrink: 0,
                          background:
                            'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                        }}
                      >
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                        {course.isBestseller && (
                          <span
                            style={{
                              position: 'absolute',
                              top: '1rem',
                              left: '1rem',
                              background:
                                'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: '#fff',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                              boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)',
                            }}
                          >
                            ⭐ Bestseller
                          </span>
                        )}
                      </div>

                      {/* Course Info */}
                      <div
                        style={{
                          flex: 1,
                          padding: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: 'inline-block',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              marginBottom: '0.75rem',
                            }}
                          >
                            {course.category}
                          </div>

                          <h3
                            style={{
                              fontSize: '1.3rem',
                              fontWeight: 700,
                              marginBottom: '0.75rem',
                              lineHeight: '1.3',
                            }}
                          >
                            {course.title}
                          </h3>

                          <p
                            style={{
                              fontSize: '0.95rem',
                              color: 'var(--muted)',
                              marginBottom: '1rem',
                              lineHeight: '1.6',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {course.description}
                          </p>

                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              gap: '1.5rem',
                              fontSize: '0.85rem',
                              color: 'var(--muted)',
                              marginBottom: '1rem',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <span>⭐</span>
                              <span
                                style={{ fontWeight: 700, color: 'var(--fg)' }}
                              >
                                {course.rating}
                              </span>
                              <span>({course.totalReviews})</span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <span>👥</span>
                              <span>
                                {course.enrolledStudents.toLocaleString()}{' '}
                                students
                              </span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <span>⏱️</span>
                              <span>{course.totalHours}h total</span>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                              }}
                            >
                              <span>📚</span>
                              <span>{course.modules.length} modules</span>
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingTop: '1rem',
                            borderTop: '1px solid var(--border)',
                          }}
                        >
                          <div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'baseline',
                                gap: '0.75rem',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '1.8rem',
                                  fontWeight: 700,
                                  color: 'var(--accent)',
                                }}
                              >
                                ₹{course.price.toLocaleString()}
                              </span>
                              {course.originalPrice &&
                                course.originalPrice > course.price && (
                                  <>
                                    <span
                                      style={{
                                        fontSize: '1rem',
                                        color: 'var(--muted)',
                                        textDecoration: 'line-through',
                                      }}
                                    >
                                      ₹{course.originalPrice.toLocaleString()}
                                    </span>
                                    <span
                                      style={{
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10b981',
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                      }}
                                    >
                                      {Math.round(
                                        ((course.originalPrice - course.price) /
                                          course.originalPrice) *
                                          100
                                      )}
                                      % OFF
                                    </span>
                                  </>
                                )}
                            </div>
                          </div>
                          <button
                            style={{
                              padding: '0.75rem 1.5rem',
                              background: 'var(--accent)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '10px',
                              fontSize: '0.95rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            View Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <div>
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '2rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      marginBottom: '1.5rem',
                    }}
                  >
                    About {teacher.name}
                  </h3>
                  <p
                    style={{
                      fontSize: '1.05rem',
                      lineHeight: '1.8',
                      color: 'var(--muted)',
                      marginBottom: '2rem',
                    }}
                  >
                    {teacher.bio}
                  </p>

                  {/* Education */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h4
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <span>🎓</span> Education
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                      }}
                    >
                      {teacher.education.map((edu, i) => (
                        <div
                          key={i}
                          style={{
                            padding: '1rem',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            fontSize: '0.95rem',
                          }}
                        >
                          {edu}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specializations */}
                  <div style={{ marginBottom: '2rem' }}>
                    <h4
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <span>⚡</span> Specializations
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      {teacher.specializations.map((spec, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '0.75rem 1.25rem',
                            background:
                              'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            color: 'var(--accent)',
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  {teacher.certifications.length > 0 && (
                    <div style={{ marginBottom: '2rem' }}>
                      <h4
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          marginBottom: '1rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <span>🏆</span> Certifications
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '1rem',
                        }}
                      >
                        {teacher.certifications.map((cert, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '1rem',
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              fontSize: '0.95rem',
                            }}
                          >
                            {cert}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  <div>
                    <h4
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                      }}
                    >
                      <span>🌐</span> Languages
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.75rem',
                      }}
                    >
                      {teacher.languages.map((lang, i) => (
                        <span
                          key={i}
                          style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--bg)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                          }}
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                {/* Overall Rating Summary */}
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '2rem',
                    marginBottom: '2rem',
                  }}
                >
                  <h3
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      marginBottom: '1.5rem',
                    }}
                  >
                    Student Reviews
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3rem',
                      marginBottom: '2rem',
                    }}
                  >
                    {/* Overall Rating */}
                    <div style={{ textAlign: 'center' }}>
                      <div
                        style={{
                          fontSize: '4rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                        }}
                      >
                        {averageRating.toFixed(1)}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          gap: '0.25rem',
                          marginBottom: '0.5rem',
                        }}
                      >
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '1.2rem',
                              color:
                                i < Math.floor(averageRating)
                                  ? '#f59e0b'
                                  : '#d1d5db',
                            }}
                          >
                            ⭐
                          </span>
                        ))}
                      </div>
                      <div
                        style={{ fontSize: '0.95rem', color: 'var(--muted)' }}
                      >
                        {teacherReviews.length} reviews
                      </div>
                    </div>

                    {/* Review Stats */}
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '1rem' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <span
                            style={{ fontSize: '0.9rem', minWidth: '60px' }}
                          >
                            5 stars
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              background: 'var(--border)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${(teacherReviews.filter((r) => r.rating === 5).length / teacherReviews.length) * 100}%`,
                                height: '100%',
                                background: '#f59e0b',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              minWidth: '40px',
                              textAlign: 'right',
                            }}
                          >
                            {
                              teacherReviews.filter((r) => r.rating === 5)
                                .length
                            }
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <span
                            style={{ fontSize: '0.9rem', minWidth: '60px' }}
                          >
                            4 stars
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              background: 'var(--border)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${(teacherReviews.filter((r) => r.rating >= 4 && r.rating < 5).length / teacherReviews.length) * 100}%`,
                                height: '100%',
                                background: '#f59e0b',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              minWidth: '40px',
                              textAlign: 'right',
                            }}
                          >
                            {
                              teacherReviews.filter(
                                (r) => r.rating >= 4 && r.rating < 5
                              ).length
                            }
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <span
                            style={{ fontSize: '0.9rem', minWidth: '60px' }}
                          >
                            3 stars
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              background: 'var(--border)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${(teacherReviews.filter((r) => r.rating >= 3 && r.rating < 4).length / teacherReviews.length) * 100}%`,
                                height: '100%',
                                background: '#f59e0b',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              minWidth: '40px',
                              textAlign: 'right',
                            }}
                          >
                            {
                              teacherReviews.filter(
                                (r) => r.rating >= 3 && r.rating < 4
                              ).length
                            }
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            marginBottom: '0.5rem',
                          }}
                        >
                          <span
                            style={{ fontSize: '0.9rem', minWidth: '60px' }}
                          >
                            2 stars
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              background: 'var(--border)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${(teacherReviews.filter((r) => r.rating >= 2 && r.rating < 3).length / teacherReviews.length) * 100}%`,
                                height: '100%',
                                background: '#f59e0b',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              minWidth: '40px',
                              textAlign: 'right',
                            }}
                          >
                            {
                              teacherReviews.filter(
                                (r) => r.rating >= 2 && r.rating < 3
                              ).length
                            }
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                          }}
                        >
                          <span
                            style={{ fontSize: '0.9rem', minWidth: '60px' }}
                          >
                            1 star
                          </span>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              background: 'var(--border)',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${(teacherReviews.filter((r) => r.rating >= 1 && r.rating < 2).length / teacherReviews.length) * 100}%`,
                                height: '100%',
                                background: '#f59e0b',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: '0.9rem',
                              minWidth: '40px',
                              textAlign: 'right',
                            }}
                          >
                            {
                              teacherReviews.filter(
                                (r) => r.rating >= 1 && r.rating < 2
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Reviews */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                  }}
                >
                  {teacherReviews.slice(0, 10).map((review) => (
                    <div
                      key={review.id}
                      style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <Image
                          src={review.studentAvatar}
                          alt={review.studentName}
                          width={50}
                          height={50}
                          style={{ borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontSize: '1rem',
                              fontWeight: 600,
                              marginBottom: '0.25rem',
                            }}
                          >
                            {review.studentName}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              fontSize: '0.85rem',
                              color: 'var(--muted)',
                            }}
                          >
                            <div style={{ display: 'flex', gap: '0.1rem' }}>
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  style={{
                                    fontSize: '0.9rem',
                                    color:
                                      i < Math.floor(review.rating)
                                        ? '#f59e0b'
                                        : '#d1d5db',
                                  }}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                            <span>•</span>
                            <span>
                              {new Date(review.date).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p
                        style={{
                          lineHeight: '1.7',
                          color: 'var(--fg)',
                          marginBottom: '1rem',
                        }}
                      >
                        {review.comment}
                      </p>
                      <div
                        style={{
                          display: 'flex',
                          gap: '1rem',
                          fontSize: '0.85rem',
                          color: 'var(--muted)',
                        }}
                      >
                        <button
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          👍 Helpful ({Math.floor(Math.random() * 50 + 10)})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* Quick Stats Card */}
            <div
              style={{
                position: 'sticky',
                top: '2rem',
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <h4
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                }}
              >
                Teaching Statistics
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Total Reviews
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {teacherReviews.length}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Avg. Rating
                  </span>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                    }}
                  >
                    {teacher.rating} ⭐
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Total Enrollments
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {teacher.totalStudents.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    borderRadius: '10px',
                  }}
                >
                  <span style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                    Response Time
                  </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {teacher.responseTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Achievements Card */}
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
              }}
            >
              <h4
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                }}
              >
                Achievements & Badges
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                {teacher.verified && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(102, 126, 234, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.3)',
                      borderRadius: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                      }}
                    >
                      ✓
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          marginBottom: '0.25rem',
                        }}
                      >
                        Verified Instructor
                      </div>
                      <div
                        style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
                      >
                        Identity & credentials verified
                      </div>
                    </div>
                  </div>
                )}

                {teacher.totalStudents > 1000 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                      }}
                    >
                      ⭐
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          marginBottom: '0.25rem',
                        }}
                      >
                        Top Instructor
                      </div>
                      <div
                        style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
                      >
                        {(teacher.totalStudents / 1000).toFixed(1)}K+ students
                        taught
                      </div>
                    </div>
                  </div>
                )}

                {teacher.rating >= 4.8 && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '10px',
                    }}
                  >
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background:
                          'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: '1.2rem',
                        flexShrink: 0,
                      }}
                    >
                      🏆
                    </div>
                    <div>
                      <div
                        style={{
                          fontSize: '0.95rem',
                          fontWeight: 700,
                          marginBottom: '0.25rem',
                        }}
                      >
                        Highly Rated
                      </div>
                      <div
                        style={{ fontSize: '0.8rem', color: 'var(--muted)' }}
                      >
                        {teacher.rating} average rating
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
