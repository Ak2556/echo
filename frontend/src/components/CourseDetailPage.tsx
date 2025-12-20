'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Course,
  getCourseBySlug,
  getTeacherById,
  getReviewsByCourse,
  courses,
} from '@/data/tuitionData';

interface CourseDetailPageProps {
  slug: string;
  onBack?: () => void;
}

export default function CourseDetailPage({
  slug,
  onBack,
}: CourseDetailPageProps) {
  const { t } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<
    'curriculum' | 'instructor' | 'reviews' | 'faq'
  >('curriculum');
  const [expandedModules, setExpandedModules] = useState<number[]>([0]); // First module expanded by default
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  useEffect(() => {
    const foundCourse = getCourseBySlug(slug);
    setCourse(foundCourse || null);
  }, [slug]);

  const teacher = course ? getTeacherById(course.teacherId) : null;
  const reviews = course ? getReviewsByCourse(course.id) : [];

  const relatedCourses = useMemo(
    () =>
      course
        ? courses
            .filter(
              (c) =>
                c.id !== course.id &&
                (c.category === course.category || c.subject === course.subject)
            )
            .slice(0, 3)
        : [],
    [course]
  );

  const toggleModule = (moduleIndex: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleIndex)
        ? prev.filter((i) => i !== moduleIndex)
        : [...prev, moduleIndex]
    );
  };

  const { totalLessons, freeLessons } = useMemo(
    () => ({
      totalLessons: course
        ? course.modules.reduce((acc, module) => acc + module.lessons.length, 0)
        : 0,
      freeLessons: course
        ? course.modules.reduce(
            (acc, module) =>
              acc + module.lessons.filter((lesson) => lesson.isFree).length,
            0
          )
        : 0,
    }),
    [course]
  );

  if (!course) {
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
        Course not found
      </div>
    );
  }

  return (
    <section id="course-detail" data-route="course-detail" className="active">
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
              {course.category}
            </span>
            <span>›</span>
            <span>{course.title}</span>
          </div>
        </div>

        {/* Hero Section */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 400px',
            gap: '3rem',
            marginBottom: '3rem',
          }}
        >
          {/* Left: Course Info */}
          <div>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
              }}
            >
              {course.isBestseller && (
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    color: '#fff',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  ⭐ Bestseller
                </span>
              )}
              {course.isFeatured && (
                <span
                  style={{
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                  }}
                >
                  ⚡ Featured
                </span>
              )}
              <span
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  color: 'var(--fg)',
                  padding: '0.35rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                {course.category}
              </span>
            </div>

            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                marginBottom: '1rem',
                lineHeight: '1.2',
              }}
            >
              {course.title}
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                color: 'var(--muted)',
                marginBottom: '1.5rem',
                lineHeight: '1.6',
              }}
            >
              {course.description}
            </p>

            {/* Course Stats */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: 'var(--accent)',
                  }}
                >
                  {course.rating}
                </span>
                <div style={{ display: 'flex', gap: '0.1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      style={{
                        color:
                          i < Math.floor(course.rating) ? '#f59e0b' : '#d1d5db',
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  ({course.totalReviews.toLocaleString()} reviews)
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--muted)',
                }}
              >
                <span>👥</span>
                <span>
                  {course.enrolledStudents.toLocaleString()} students enrolled
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: 'var(--muted)',
                }}
              >
                <span>🌐</span>
                <span>{course.language}</span>
              </div>
            </div>

            {/* Teacher Info */}
            {teacher && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  marginBottom: '2rem',
                }}
              >
                <Image
                  src={teacher.avatar}
                  alt={teacher.name}
                  width={60}
                  height={60}
                  style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--muted)',
                      marginBottom: '0.25rem',
                    }}
                  >
                    Instructor
                  </div>
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 600,
                      marginBottom: '0.25rem',
                    }}
                  >
                    {teacher.name}
                    {teacher.verified && (
                      <span
                        style={{ marginLeft: '0.5rem', color: 'var(--accent)' }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                    {teacher.title}
                  </div>
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '0.25rem',
                    fontSize: '0.85rem',
                    color: 'var(--muted)',
                  }}
                >
                  <div>⭐ {teacher.rating} rating</div>
                  <div>
                    👥 {teacher.totalStudents.toLocaleString()} students
                  </div>
                  <div>📚 {teacher.totalCourses} courses</div>
                </div>
              </div>
            )}

            {/* Quick Stats Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem',
              }}
            >
              <div
                style={{
                  padding: '1rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  ⏱️
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '0.25rem',
                  }}
                >
                  {course.totalHours}h
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Total Duration
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  📚
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '0.25rem',
                  }}
                >
                  {totalLessons}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Lessons
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  📅
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '0.25rem',
                  }}
                >
                  {course.duration}w
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Weeks
                </div>
              </div>

              <div
                style={{
                  padding: '1rem',
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                  🎯
                </div>
                <div
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '0.25rem',
                  }}
                >
                  {course.level.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Level
                </div>
              </div>
            </div>
          </div>

          {/* Right: Enrollment Card (Sticky) */}
          <div style={{ position: 'relative' }}>
            <div
              style={{
                position: 'sticky',
                top: '2rem',
                background: 'var(--card)',
                border: '2px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
            >
              {/* Course Video Preview / Thumbnail */}
              {showVideoPreview && course.demoVideo ? (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '220px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem',
                    background: '#000',
                  }}
                >
                  <iframe
                    width="100%"
                    height="100%"
                    src={course.demoVideo}
                    title={course.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      borderRadius: '12px',
                    }}
                  />
                  <button
                    onClick={() => setShowVideoPreview(false)}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      background: 'rgba(0, 0, 0, 0.7)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 10,
                    }}
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '220px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    marginBottom: '1.5rem',
                    cursor: course.demoVideo ? 'pointer' : 'default',
                    background:
                      'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                  }}
                  onClick={() => course.demoVideo && setShowVideoPreview(true)}
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
                  {course.demoVideo && (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'rgba(0, 0, 0, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'background 0.3s ease',
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            'rgba(0, 0, 0, 0.5)')
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            'rgba(0, 0, 0, 0.3)')
                        }
                      >
                        <div
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            background: 'rgba(255, 255, 255, 0.95)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'transform 0.3s ease',
                          }}
                        >
                          <div
                            style={{
                              width: 0,
                              height: 0,
                              borderLeft: '16px solid var(--accent)',
                              borderTop: '10px solid transparent',
                              borderBottom: '10px solid transparent',
                              marginLeft: '4px',
                            }}
                          />
                        </div>
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '1rem',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          color: '#fff',
                          fontSize: '0.9rem',
                          fontWeight: 600,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        }}
                      >
                        🎬 Watch Course Preview
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Price */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '2.5rem',
                      fontWeight: 700,
                      color: 'var(--accent)',
                    }}
                  >
                    ₹{course.price.toLocaleString()}
                  </span>
                  {course.originalPrice &&
                    course.originalPrice > course.price && (
                      <span
                        style={{
                          fontSize: '1.2rem',
                          color: 'var(--muted)',
                          textDecoration: 'line-through',
                        }}
                      >
                        ₹{course.originalPrice.toLocaleString()}
                      </span>
                    )}
                </div>
                {course.originalPrice &&
                  course.originalPrice > course.price && (
                    <div
                      style={{
                        display: 'inline-block',
                        background:
                          'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: '#fff',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      Save{' '}
                      {Math.round(
                        ((course.originalPrice - course.price) /
                          course.originalPrice) *
                          100
                      )}
                      % 🎉
                    </div>
                  )}
              </div>

              {/* Enrollment Button */}
              <button
                onClick={() => setIsEnrolled(!isEnrolled)}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: isEnrolled
                    ? 'var(--muted)'
                    : 'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginBottom: '1rem',
                  transition: 'transform 0.2s ease',
                  boxShadow: isEnrolled
                    ? 'none'
                    : '0 4px 15px rgba(102, 126, 234, 0.4)',
                }}
                onMouseEnter={(e) => {
                  if (!isEnrolled)
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  if (!isEnrolled)
                    e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {isEnrolled ? '✓ Enrolled' : '🎓 Enroll Now'}
              </button>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  marginBottom: '1.5rem',
                }}
              >
                <button
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--fg)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
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
                  🤍 Wishlist
                </button>
                <button
                  style={{
                    padding: '0.75rem',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    color: 'var(--fg)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
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

              {/* This course includes */}
              <div
                style={{
                  padding: '1.5rem',
                  background: 'var(--bg)',
                  borderRadius: '12px',
                  marginBottom: '1rem',
                }}
              >
                <div
                  style={{
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                  }}
                >
                  This course includes:
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span>🎥</span>
                    <span>{course.totalHours} hours on-demand video</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span>📝</span>
                    <span>
                      {totalLessons} lessons & {course.modules.length} modules
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span>📱</span>
                    <span>Access on mobile and desktop</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span>🏆</span>
                    <span>Certificate of completion</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span>♾️</span>
                    <span>Lifetime access</span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span>💬</span>
                    <span>Direct teacher support</span>
                  </div>
                </div>
              </div>

              {/* Money-back guarantee */}
              <div
                style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  color: 'var(--fg)',
                }}
              >
                <span style={{ marginRight: '0.5rem' }}>✓</span>
                30-Day Money-Back Guarantee
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
          {(['curriculum', 'instructor', 'reviews', 'faq'] as const).map(
            (tab) => (
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
                {tab === 'curriculum' && '📚 '}
                {tab === 'instructor' && '👨‍🏫 '}
                {tab === 'reviews' && '⭐ '}
                {tab === 'faq' && '❓ '}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
        </div>

        {/* Tab Content */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '3rem',
          }}
        >
          {/* Main Content */}
          <div>
            {/* Curriculum Tab */}
            {activeTab === 'curriculum' && (
              <div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: 'var(--card)',
                    borderRadius: '12px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                      }}
                    >
                      Course Curriculum
                    </h3>
                    <div style={{ fontSize: '0.95rem', color: 'var(--muted)' }}>
                      {course.modules.length} modules • {totalLessons} lessons •{' '}
                      {course.totalHours}h total
                      {freeLessons > 0 && (
                        <span
                          style={{
                            marginLeft: '1rem',
                            color: 'var(--accent)',
                            fontWeight: 600,
                          }}
                        >
                          • {freeLessons} free preview lessons
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setExpandedModules(
                        expandedModules.length === course.modules.length
                          ? []
                          : course.modules.map((_, i) => i)
                      )
                    }
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--accent)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {expandedModules.length === course.modules.length
                      ? 'Collapse All'
                      : 'Expand All'}
                  </button>
                </div>

                {/* Modules */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {course.modules.map((module, moduleIndex) => {
                    const isExpanded = expandedModules.includes(moduleIndex);
                    const moduleDuration = module.lessons.reduce(
                      (acc, lesson) => acc + lesson.duration,
                      0
                    );

                    return (
                      <div
                        key={moduleIndex}
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Module Header */}
                        <div
                          onClick={() => toggleModule(moduleIndex)}
                          style={{
                            padding: '1.25rem 1.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background 0.2s ease',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = 'var(--bg)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = 'transparent')
                          }
                        >
                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                              }}
                            >
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '8px',
                                  background:
                                    'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)',
                                  color: '#fff',
                                  fontSize: '0.9rem',
                                  fontWeight: 700,
                                }}
                              >
                                {moduleIndex + 1}
                              </span>
                              {module.title}
                            </div>
                            <div
                              style={{
                                fontSize: '0.9rem',
                                color: 'var(--muted)',
                              }}
                            >
                              {module.lessons.length} lessons •{' '}
                              {Math.floor(moduleDuration / 60)}h{' '}
                              {moduleDuration % 60}m
                              {module.description && ` • ${module.description}`}
                            </div>
                          </div>
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            style={{
                              transform: isExpanded
                                ? 'rotate(180deg)'
                                : 'rotate(0deg)',
                              transition: 'transform 0.3s ease',
                              color: 'var(--muted)',
                            }}
                          >
                            <polyline points="6,9 12,15 18,9" />
                          </svg>
                        </div>

                        {/* Module Lessons */}
                        {isExpanded && (
                          <div
                            style={{
                              borderTop: '1px solid var(--border)',
                              background: 'var(--bg)',
                            }}
                          >
                            {module.lessons.map((lesson, lessonIndex) => (
                              <div
                                key={lessonIndex}
                                style={{
                                  padding: '1rem 1.5rem',
                                  borderBottom:
                                    lessonIndex < module.lessons.length - 1
                                      ? '1px solid var(--border)'
                                      : 'none',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  cursor:
                                    lesson.isFree || isEnrolled
                                      ? 'pointer'
                                      : 'default',
                                  opacity:
                                    lesson.isFree || isEnrolled ? 1 : 0.7,
                                  transition: 'background 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (lesson.isFree || isEnrolled) {
                                    e.currentTarget.style.background =
                                      'var(--card)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    'transparent';
                                }}
                              >
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.75rem',
                                      marginBottom: '0.25rem',
                                    }}
                                  >
                                    <span style={{ fontSize: '1rem' }}>
                                      {lesson.type === 'video' && '🎥'}
                                      {lesson.type === 'reading' && '📖'}
                                      {lesson.type === 'quiz' && '✅'}
                                      {lesson.type === 'assignment' && '📝'}
                                      {lesson.type === 'live' && '🔴'}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '0.95rem',
                                        fontWeight: 600,
                                        color: 'var(--fg)',
                                      }}
                                    >
                                      {lesson.title}
                                    </span>
                                    {lesson.isFree && (
                                      <span
                                        style={{
                                          background:
                                            'rgba(16, 185, 129, 0.15)',
                                          color: '#10b981',
                                          padding: '0.15rem 0.5rem',
                                          borderRadius: '4px',
                                          fontSize: '0.7rem',
                                          fontWeight: 700,
                                          textTransform: 'uppercase',
                                        }}
                                      >
                                        Free
                                      </span>
                                    )}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: '0.85rem',
                                      color: 'var(--muted)',
                                      marginLeft: '2rem',
                                    }}
                                  >
                                    {lesson.description}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    fontSize: '0.85rem',
                                    color: 'var(--muted)',
                                  }}
                                >
                                  <span>{lesson.duration} min</span>
                                  {(lesson.isFree || isEnrolled) && (
                                    <button
                                      style={{
                                        background: 'transparent',
                                        border: '1px solid var(--border)',
                                        borderRadius: '6px',
                                        padding: '0.25rem 0.75rem',
                                        color: 'var(--accent)',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                      }}
                                    >
                                      {lesson.type === 'video'
                                        ? 'Play'
                                        : 'View'}
                                    </button>
                                  )}
                                  {!lesson.isFree && !isEnrolled && (
                                    <span
                                      style={{
                                        fontSize: '1rem',
                                        color: 'var(--muted)',
                                      }}
                                    >
                                      🔒
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Instructor Tab */}
            {activeTab === 'instructor' && teacher && (
              <div>
                <div
                  style={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '2rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      gap: '2rem',
                      marginBottom: '2rem',
                    }}
                  >
                    <Image
                      src={teacher.avatar}
                      alt={teacher.name}
                      width={120}
                      height={120}
                      style={{ borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h3
                        style={{
                          fontSize: '1.8rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                        }}
                      >
                        {teacher.name}
                        {teacher.verified && (
                          <span
                            style={{
                              marginLeft: '0.75rem',
                              color: 'var(--accent)',
                              fontSize: '1.5rem',
                            }}
                          >
                            ✓
                          </span>
                        )}
                      </h3>
                      <div
                        style={{
                          fontSize: '1.1rem',
                          color: 'var(--muted)',
                          marginBottom: '1rem',
                        }}
                      >
                        {teacher.title}
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(4, 1fr)',
                          gap: '1rem',
                          marginTop: '1rem',
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: 'var(--accent)',
                            }}
                          >
                            {teacher.rating}
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: 'var(--muted)',
                            }}
                          >
                            Instructor Rating
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: 'var(--accent)',
                            }}
                          >
                            {(teacher.totalStudents / 1000).toFixed(1)}K
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: 'var(--muted)',
                            }}
                          >
                            Students
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: 'var(--accent)',
                            }}
                          >
                            {teacher.totalCourses}
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: 'var(--muted)',
                            }}
                          >
                            Courses
                          </div>
                        </div>
                        <div>
                          <div
                            style={{
                              fontSize: '1.5rem',
                              fontWeight: 700,
                              color: 'var(--accent)',
                            }}
                          >
                            {teacher.yearsExperience}y
                          </div>
                          <div
                            style={{
                              fontSize: '0.85rem',
                              color: 'var(--muted)',
                            }}
                          >
                            Experience
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '2rem' }}>
                    <h4
                      style={{
                        fontSize: '1.2rem',
                        fontWeight: 700,
                        marginBottom: '1rem',
                      }}
                    >
                      About
                    </h4>
                    <p style={{ lineHeight: '1.8', color: 'var(--muted)' }}>
                      {teacher.bio}
                    </p>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '2rem',
                    }}
                  >
                    <div>
                      <h4
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          marginBottom: '1rem',
                        }}
                      >
                        Education
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                        }}
                      >
                        {teacher.education.map((edu, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              fontSize: '0.95rem',
                            }}
                          >
                            <span>🎓</span>
                            <span>{edu}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          marginBottom: '1rem',
                        }}
                      >
                        Specializations
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        {teacher.specializations.map((spec, i) => (
                          <span
                            key={i}
                            style={{
                              background: 'var(--bg)',
                              border: '1px solid var(--border)',
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                            }}
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {teacher.certifications.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                      <h4
                        style={{
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          marginBottom: '1rem',
                        }}
                      >
                        Certifications
                      </h4>
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                        }}
                      >
                        {teacher.certifications.map((cert, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              fontSize: '0.95rem',
                            }}
                          >
                            <span>🏆</span>
                            <span>{cert}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: '2rem',
                      padding: '1rem',
                      background: 'var(--bg)',
                      borderRadius: '12px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--muted)',
                          marginBottom: '0.25rem',
                        }}
                      >
                        Typical response time
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        {teacher.responseTime}
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
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      💬 Message Instructor
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
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
                      display: 'grid',
                      gridTemplateColumns: '300px 1fr',
                      gap: '3rem',
                    }}
                  >
                    {/* Overall Rating */}
                    <div>
                      <div
                        style={{ textAlign: 'center', marginBottom: '1.5rem' }}
                      >
                        <div
                          style={{
                            fontSize: '4rem',
                            fontWeight: 700,
                            marginBottom: '0.5rem',
                          }}
                        >
                          {course.rating}
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
                                fontSize: '1.5rem',
                                color:
                                  i < Math.floor(course.rating)
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
                          Course Rating
                        </div>
                      </div>

                      {/* Rating Breakdown */}
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.75rem',
                        }}
                      >
                        {[5, 4, 3, 2, 1].map((star) => {
                          const percentage = Math.floor(
                            Math.random() * 60 + (star >= 4 ? 30 : 10)
                          );
                          return (
                            <div
                              key={star}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '0.9rem',
                              }}
                            >
                              <div
                                style={{
                                  width: '60px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.25rem',
                                }}
                              >
                                {[...Array(star)].map((_, i) => (
                                  <span key={i} style={{ fontSize: '0.7rem' }}>
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              <div
                                style={{
                                  flex: 1,
                                  height: '8px',
                                  background: 'var(--bg)',
                                  borderRadius: '4px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background:
                                      'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                                    transition: 'width 0.3s ease',
                                  }}
                                />
                              </div>
                              <div
                                style={{
                                  width: '40px',
                                  textAlign: 'right',
                                  color: 'var(--muted)',
                                }}
                              >
                                {percentage}%
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Rating Categories */}
                    <div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, 1fr)',
                          gap: '1rem',
                        }}
                      >
                        {[
                          { label: 'Content Quality', score: 4.8 },
                          { label: 'Instructor Skills', score: 4.9 },
                          { label: 'Learning Experience', score: 4.7 },
                          { label: 'Value for Money', score: 4.8 },
                        ].map((category, i) => (
                          <div
                            key={i}
                            style={{
                              padding: '1rem',
                              background: 'var(--bg)',
                              borderRadius: '12px',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.85rem',
                                color: 'var(--muted)',
                                marginBottom: '0.5rem',
                              }}
                            >
                              {category.label}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <span
                                style={{ fontSize: '1.5rem', fontWeight: 700 }}
                              >
                                {category.score}
                              </span>
                              <div style={{ display: 'flex', gap: '0.1rem' }}>
                                {[...Array(5)].map((_, j) => (
                                  <span
                                    key={j}
                                    style={{
                                      fontSize: '0.8rem',
                                      color:
                                        j < Math.floor(category.score)
                                          ? '#f59e0b'
                                          : '#d1d5db',
                                    }}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
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
                  {reviews.slice(0, 5).map((review) => (
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
                        <button
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--muted)',
                            cursor: 'pointer',
                          }}
                        >
                          Report
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '1rem',
                    marginTop: '2rem',
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    color: 'var(--fg)',
                    fontSize: '1rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Load More Reviews
                </button>
              </div>
            )}

            {/* FAQ Tab */}
            {activeTab === 'faq' && (
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
                    Frequently Asked Questions
                  </h3>
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.5rem',
                    }}
                  >
                    {[
                      {
                        question: 'What are the prerequisites for this course?',
                        answer: course.prerequisites.join(', '),
                      },
                      {
                        question: 'How long do I have access to the course?',
                        answer:
                          'You have lifetime access to this course. Once enrolled, you can learn at your own pace with no time limits.',
                      },
                      {
                        question: 'Are there any live sessions?',
                        answer: `Yes, this course includes ${course.sessionsPerWeek} live sessions per week where you can interact with the instructor and other students in real-time.`,
                      },
                      {
                        question: 'Will I get a certificate after completion?',
                        answer:
                          'Yes, upon successful completion of all modules and assessments, you will receive a verified certificate that you can share on LinkedIn and your resume.',
                      },
                      {
                        question: "What if I'm not satisfied with the course?",
                        answer:
                          "We offer a 30-day money-back guarantee. If you're not satisfied with the course for any reason, you can request a full refund within 30 days of enrollment.",
                      },
                      {
                        question: 'Can I download the course videos?',
                        answer:
                          'Yes, all video lessons can be downloaded for offline viewing through our mobile app. You can learn anytime, anywhere without an internet connection.',
                      },
                    ].map((faq, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '1.5rem',
                          background: 'var(--bg)',
                          borderRadius: '12px',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.05rem',
                            fontWeight: 700,
                            marginBottom: '0.75rem',
                          }}
                        >
                          {faq.question}
                        </div>
                        <div
                          style={{
                            fontSize: '0.95rem',
                            color: 'var(--muted)',
                            lineHeight: '1.7',
                          }}
                        >
                          {faq.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            {/* What You'll Learn */}
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                What You'll Learn
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {course.learningOutcomes.slice(0, 5).map((outcome, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                    }}
                  >
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>
                      ✓
                    </span>
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Features */}
            <div
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <h3
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                Course Features
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {course.features.map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                    }}
                  >
                    <span style={{ color: 'var(--accent)', flexShrink: 0 }}>
                      •
                    </span>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Related Courses */}
            {relatedCourses.length > 0 && (
              <div
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    marginBottom: '1rem',
                  }}
                >
                  Related Courses
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {relatedCourses.map((relatedCourse) => (
                    <div
                      key={relatedCourse.id}
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        transition: 'background 0.2s ease',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = 'var(--bg)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = 'transparent')
                      }
                    >
                      <img
                        src={relatedCourse.thumbnail}
                        alt={relatedCourse.title}
                        style={{
                          width: '80px',
                          height: '60px',
                          borderRadius: '6px',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            marginBottom: '0.25rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {relatedCourse.title}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--muted)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {getTeacherById(relatedCourse.teacherId)?.name}
                        </div>
                        <div
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            color: 'var(--accent)',
                          }}
                        >
                          ₹{relatedCourse.price.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
