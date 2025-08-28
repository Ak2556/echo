'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { Course, Lesson, getCourseBySlug, getTeacherById } from '@/data/tuitionData';

interface LessonViewerPageProps {
  courseSlug: string;
  lessonId: number;
}

export default function LessonViewerPage({ courseSlug, lessonId }: LessonViewerPageProps) {
  const { t } = useLanguage();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoProgress, setVideoProgress] = useState(0);

  useEffect(() => {
    const foundCourse = getCourseBySlug(courseSlug);
    setCourse(foundCourse || null);

    if (foundCourse) {
      // Find the lesson by ID
      for (let moduleIndex = 0; moduleIndex < foundCourse.modules.length; moduleIndex++) {
        const module = foundCourse.modules[moduleIndex];
        const lessonIndex = module.lessons.findIndex(l => l.id === lessonId);
        if (lessonIndex !== -1) {
          setCurrentModuleIndex(moduleIndex);
          setCurrentLessonIndex(lessonIndex);
          setCurrentLesson(module.lessons[lessonIndex]);
          break;
        }
      }
    }
  }, [courseSlug, lessonId]);

  if (!course || !currentLesson) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontSize: '1.2rem',
        color: 'var(--muted)'
      }}>
        Loading lesson...
      </div>
    );
  }

  const teacher = getTeacherById(course.teacherId);
  const currentModule = course.modules[currentModuleIndex];
  const totalLessons = course.modules.reduce((acc, module) => acc + module.lessons.length, 0);
  const progressPercentage = (completedLessons.length / totalLessons) * 100;

  const goToNextLesson = () => {
    if (currentLessonIndex < currentModule.lessons.length - 1) {
      // Next lesson in same module
      const nextLesson = currentModule.lessons[currentLessonIndex + 1];
      setCurrentLessonIndex(currentLessonIndex + 1);
      setCurrentLesson(nextLesson);
    } else if (currentModuleIndex < course.modules.length - 1) {
      // First lesson of next module
      const nextModule = course.modules[currentModuleIndex + 1];
      setCurrentModuleIndex(currentModuleIndex + 1);
      setCurrentLessonIndex(0);
      setCurrentLesson(nextModule.lessons[0]);
    }
  };

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      // Previous lesson in same module
      const prevLesson = currentModule.lessons[currentLessonIndex - 1];
      setCurrentLessonIndex(currentLessonIndex - 1);
      setCurrentLesson(prevLesson);
    } else if (currentModuleIndex > 0) {
      // Last lesson of previous module
      const prevModule = course.modules[currentModuleIndex - 1];
      setCurrentModuleIndex(currentModuleIndex - 1);
      setCurrentLessonIndex(prevModule.lessons.length - 1);
      setCurrentLesson(prevModule.lessons[prevModule.lessons.length - 1]);
    }
  };

  const markAsComplete = () => {
    if (!completedLessons.includes(currentLesson.id)) {
      setCompletedLessons([...completedLessons, currentLesson.id]);
    }
    goToNextLesson();
  };

  const navigateToLesson = (moduleIndex: number, lessonIndex: number) => {
    setCurrentModuleIndex(moduleIndex);
    setCurrentLessonIndex(lessonIndex);
    setCurrentLesson(course.modules[moduleIndex].lessons[lessonIndex]);
  };

  const hasNextLesson = currentLessonIndex < currentModule.lessons.length - 1 || currentModuleIndex < course.modules.length - 1;
  const hasPreviousLesson = currentLessonIndex > 0 || currentModuleIndex > 0;

  return (
    <section id="lesson-viewer" data-route="lesson-viewer" className="active">
      <div style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg)'
      }}>

        {/* Main Content Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>

          {/* Top Navigation Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1rem 1.5rem',
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                style={{
                  padding: '0.5rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '0.25rem' }}>
                  {course.title}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {currentLesson.title}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Progress */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.5rem 1rem',
                background: 'var(--bg)',
                borderRadius: '8px'
              }}>
                <div style={{
                  width: '120px',
                  height: '6px',
                  background: 'var(--border)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progressPercentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent) 0%, #764ba2 100%)',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  {Math.round(progressPercentage)}%
                </span>
              </div>

              <button style={{
                padding: '0.5rem 1rem',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--fg)',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}>
                ⚙️ Settings
              </button>

              <button style={{
                padding: '0.5rem 1rem',
                background: 'var(--accent)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                ← Back to Course
              </button>
            </div>
          </div>

          {/* Video/Content Player */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            background: '#000'
          }}>
            {currentLesson.type === 'video' && (
              <div style={{
                position: 'relative',
                width: '100%',
                paddingTop: '56.25%', // 16:9 aspect ratio
                background: '#000'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
                }}>
                  <div style={{ textAlign: 'center', color: '#fff' }}>
                    <div style={{
                      width: '80px',
                      height: '80px',
                      margin: '0 auto 1rem',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <div style={{
                        width: 0,
                        height: 0,
                        borderLeft: '24px solid #fff',
                        borderTop: '16px solid transparent',
                        borderBottom: '16px solid transparent',
                        marginLeft: '6px'
                      }} />
                    </div>
                    <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      {currentLesson.title}
                    </div>
                    <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                      {currentLesson.duration} minutes • Click to play
                    </div>
                  </div>
                </div>

                {/* Video Controls Overlay (bottom) */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1.5rem 1rem 1rem',
                  background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)'
                }}>
                  {/* Progress Bar */}
                  <div style={{
                    width: '100%',
                    height: '4px',
                    background: 'rgba(255, 255, 255, 0.3)',
                    borderRadius: '2px',
                    marginBottom: '1rem',
                    cursor: 'pointer',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${videoProgress}%`,
                      height: '100%',
                      background: 'var(--accent)',
                      transition: 'width 0.1s linear'
                    }} />
                  </div>

                  {/* Controls */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: '#fff'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}>
                        ▶️
                      </button>
                      <button
                        onClick={goToPreviousLesson}
                        disabled={!hasPreviousLesson}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: hasPreviousLesson ? '#fff' : 'rgba(255,255,255,0.3)',
                          cursor: hasPreviousLesson ? 'pointer' : 'not-allowed',
                          fontSize: '1rem'
                        }}
                      >
                        ⏮️
                      </button>
                      <button
                        onClick={goToNextLesson}
                        disabled={!hasNextLesson}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: hasNextLesson ? '#fff' : 'rgba(255,255,255,0.3)',
                          cursor: hasNextLesson ? 'pointer' : 'not-allowed',
                          fontSize: '1rem'
                        }}
                      >
                        ⏭️
                      </button>
                      <div style={{ fontSize: '0.85rem' }}>
                        0:00 / {currentLesson.duration}:00
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        style={{
                          padding: '0.25rem 0.5rem',
                          background: 'rgba(255, 255, 255, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '0.85rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="0.5">0.5x</option>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                      <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}>
                        🔊
                      </button>
                      <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}>
                        ⚙️
                      </button>
                      <button style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1rem'
                      }}>
                        ⛶
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lesson Content Area */}
          <div style={{
            maxHeight: '40vh',
            overflowY: 'auto',
            background: 'var(--card)',
            borderTop: '1px solid var(--border)'
          }}>
            <div style={{ padding: '2rem' }}>
              {/* Lesson Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '2rem'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block',
                    background: currentLesson.type === 'video' ? 'rgba(102, 126, 234, 0.15)' :
                                currentLesson.type === 'quiz' ? 'rgba(16, 185, 129, 0.15)' :
                                'rgba(245, 158, 11, 0.15)',
                    color: currentLesson.type === 'video' ? 'var(--accent)' :
                           currentLesson.type === 'quiz' ? '#10b981' :
                           '#f59e0b',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    marginBottom: '1rem'
                  }}>
                    {currentLesson.type === 'video' && '🎥 VIDEO LESSON'}
                    {currentLesson.type === 'reading' && '📖 READING'}
                    {currentLesson.type === 'quiz' && '✅ QUIZ'}
                    {currentLesson.type === 'assignment' && '📝 ASSIGNMENT'}
                    {currentLesson.type === 'live' && '🔴 LIVE SESSION'}
                  </div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.75rem' }}>
                    {currentLesson.title}
                  </h2>
                  <p style={{ fontSize: '1.05rem', color: 'var(--muted)', lineHeight: '1.6' }}>
                    {currentLesson.description}
                  </p>
                </div>
                <button
                  onClick={markAsComplete}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: completedLessons.includes(currentLesson.id)
                      ? 'rgba(16, 185, 129, 0.2)'
                      : 'var(--accent)',
                    color: completedLessons.includes(currentLesson.id)
                      ? '#10b981'
                      : '#fff',
                    border: completedLessons.includes(currentLesson.id)
                      ? '2px solid #10b981'
                      : 'none',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginLeft: '2rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {completedLessons.includes(currentLesson.id) ? '✓ Completed' : 'Mark as Complete'}
                </button>
              </div>

              {/* Lesson Content */}
              {currentLesson.content && (
                <div style={{
                  padding: '1.5rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                    Lesson Overview
                  </h3>
                  <p style={{ fontSize: '1rem', lineHeight: '1.8', color: 'var(--muted)' }}>
                    {currentLesson.content}
                  </p>
                </div>
              )}

              {/* Resources */}
              {currentLesson.resources && currentLesson.resources.length > 0 && (
                <div style={{
                  padding: '1.5rem',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  marginBottom: '2rem'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                    📎 Resources
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {currentLesson.resources.map((resource, i) => (
                      <div
                        key={i}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem 1rem',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent)'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>📄</span>
                          <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>{resource}</span>
                        </div>
                        <button style={{
                          padding: '0.35rem 0.85rem',
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}>
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes Section */}
              <div style={{
                padding: '1.5rem',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                marginBottom: '2rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                    📝 My Notes
                  </h3>
                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {showNotes ? 'Hide' : 'Show'} Notes
                  </button>
                </div>
                {showNotes && (
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes while learning..."
                    style={{
                      width: '100%',
                      minHeight: '150px',
                      padding: '1rem',
                      background: 'var(--card)',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--fg)',
                      fontSize: '0.95rem',
                      lineHeight: '1.6',
                      resize: 'vertical',
                      fontFamily: 'inherit'
                    }}
                  />
                )}
              </div>

              {/* Navigation Buttons */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem'
              }}>
                <button
                  onClick={goToPreviousLesson}
                  disabled={!hasPreviousLesson}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: hasPreviousLesson ? 'var(--card)' : 'var(--bg)',
                    border: '2px solid var(--border)',
                    borderRadius: '12px',
                    color: hasPreviousLesson ? 'var(--fg)' : 'var(--muted)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: hasPreviousLesson ? 'pointer' : 'not-allowed',
                    opacity: hasPreviousLesson ? 1 : 0.5
                  }}
                >
                  ← Previous Lesson
                </button>
                <button
                  onClick={goToNextLesson}
                  disabled={!hasNextLesson}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    background: hasNextLesson ? 'linear-gradient(135deg, var(--accent) 0%, #764ba2 100%)' : 'var(--bg)',
                    border: hasNextLesson ? 'none' : '2px solid var(--border)',
                    borderRadius: '12px',
                    color: hasNextLesson ? '#fff' : 'var(--muted)',
                    fontSize: '1rem',
                    fontWeight: 700,
                    cursor: hasNextLesson ? 'pointer' : 'not-allowed',
                    opacity: hasNextLesson ? 1 : 0.5
                  }}
                >
                  Next Lesson →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Curriculum */}
        {showSidebar && (
          <div style={{
            width: '380px',
            background: 'var(--card)',
            borderLeft: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Sidebar Header */}
            <div style={{
              padding: '1.5rem',
              borderBottom: '1px solid var(--border)'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Course Content
              </h3>
              <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                {completedLessons.length} of {totalLessons} lessons completed
              </div>
            </div>

            {/* Curriculum List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1rem'
            }}>
              {course.modules.map((module, moduleIndex) => {
                const moduleLessonsCompleted = module.lessons.filter(l => completedLessons.includes(l.id)).length;
                const moduleProgress = (moduleLessonsCompleted / module.lessons.length) * 100;

                return (
                  <div
                    key={moduleIndex}
                    style={{
                      marginBottom: '1rem',
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Module Header */}
                    <div style={{
                      padding: '1rem',
                      background: currentModuleIndex === moduleIndex ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                      borderBottom: '1px solid var(--border)'
                    }}>
                      <div style={{
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '6px',
                          background: 'var(--accent)',
                          color: '#fff',
                          fontSize: '0.75rem',
                          fontWeight: 700
                        }}>
                          {moduleIndex + 1}
                        </span>
                        {module.title}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                        {moduleLessonsCompleted} / {module.lessons.length} lessons
                      </div>
                      {/* Progress Bar */}
                      <div style={{
                        width: '100%',
                        height: '4px',
                        background: 'var(--border)',
                        borderRadius: '2px',
                        marginTop: '0.5rem',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${moduleProgress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--accent) 0%, #764ba2 100%)',
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* Module Lessons */}
                    <div>
                      {module.lessons.map((lesson, lessonIndex) => {
                        const isCurrentLesson = moduleIndex === currentModuleIndex && lessonIndex === currentLessonIndex;
                        const isCompleted = completedLessons.includes(lesson.id);

                        return (
                          <div
                            key={lessonIndex}
                            onClick={() => navigateToLesson(moduleIndex, lessonIndex)}
                            style={{
                              padding: '0.85rem 1rem',
                              borderBottom: lessonIndex < module.lessons.length - 1 ? '1px solid var(--border)' : 'none',
                              cursor: 'pointer',
                              background: isCurrentLesson ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                              transition: 'background 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (!isCurrentLesson) {
                                e.currentTarget.style.background = 'var(--card)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isCurrentLesson) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem'
                            }}>
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: isCompleted ? '2px solid #10b981' : '2px solid var(--border)',
                                background: isCompleted ? '#10b981' : 'transparent',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {isCompleted && (
                                  <span style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</span>
                                )}
                                {isCurrentLesson && !isCompleted && (
                                  <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--accent)'
                                  }} />
                                )}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{
                                  fontSize: '0.9rem',
                                  fontWeight: isCurrentLesson ? 700 : 600,
                                  color: isCurrentLesson ? 'var(--accent)' : 'var(--fg)',
                                  marginBottom: '0.25rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {lesson.title}
                                </div>
                                <div style={{
                                  fontSize: '0.75rem',
                                  color: 'var(--muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}>
                                  <span>
                                    {lesson.type === 'video' && '🎥'}
                                    {lesson.type === 'reading' && '📖'}
                                    {lesson.type === 'quiz' && '✅'}
                                    {lesson.type === 'assignment' && '📝'}
                                    {lesson.type === 'live' && '🔴'}
                                  </span>
                                  <span>{lesson.duration} min</span>
                                  {lesson.isFree && (
                                    <span style={{
                                      background: 'rgba(16, 185, 129, 0.15)',
                                      color: '#10b981',
                                      padding: '0.1rem 0.4rem',
                                      borderRadius: '3px',
                                      fontSize: '0.65rem',
                                      fontWeight: 700,
                                      textTransform: 'uppercase'
                                    }}>
                                      Free
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Instructor Card */}
            {teacher && (
              <div style={{
                padding: '1rem',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem',
                  background: 'var(--card)',
                  borderRadius: '10px'
                }}>
                  <Image
                    src={teacher.avatar}
                    alt={teacher.name}
                    width={45}
                    height={45}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.15rem' }}>
                      {teacher.name}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--muted)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {teacher.title}
                    </div>
                  </div>
                  <button style={{
                    padding: '0.35rem 0.75rem',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}>
                    Message
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
