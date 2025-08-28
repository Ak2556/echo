/**
 * Enhanced Tuition Marketplace Landing Page
 * Features: Advanced filtering, sorting, search, categories, and more
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import {
  courses,
  teachers,
  categories,
  getFeaturedCourses,
  getBestsellerCourses,
  getNewCourses,
  getTeacherById,
  getCourseBySlug,
  type Course
} from '../data/tuitionData';
import CourseDetailPage from './CourseDetailPage';
import TeacherProfilePage from './TeacherProfilePage';

type TuitionView =
  | { type: 'home' }
  | { type: 'course'; slug: string }
  | { type: 'teacher'; teacherId: number };

const TuitionPage: React.FC = () => {
  const { colorMode } = useTheme();

  // Navigation state for internal views
  const [currentView, setCurrentView] = useState<TuitionView>({ type: 'home' });

  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedMode, setSelectedMode] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const coursesPerPage = 12;

  // Handle navigation to course detail
  const handleCourseClick = (courseSlug: string) => {
    setCurrentView({ type: 'course', slug: courseSlug });
  };

  // Handle navigation to teacher profile
  const handleTeacherClick = (teacherId: number) => {
    setCurrentView({ type: 'teacher', teacherId });
  };

  // Handle back to home
  const handleBackToHome = () => {
    setCurrentView({ type: 'home' });
  };

  // Filtered and sorted courses (must be before any conditional returns - React Rules of Hooks)
  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.subject.toLowerCase().includes(query) ||
        course.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // Subject filter
    if (selectedSubject !== 'all') {
      filtered = filtered.filter(course => course.subject === selectedSubject);
    }

    // Level filter
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Mode filter
    if (selectedMode !== 'all') {
      filtered = filtered.filter(course => course.mode === selectedMode);
    }

    // Price range filter
    if (priceRange !== 'all') {
      filtered = filtered.filter(course => {
        switch(priceRange) {
          case 'free': return course.price === 0;
          case 'under-2000': return course.price > 0 && course.price < 2000;
          case '2000-4000': return course.price >= 2000 && course.price < 4000;
          case '4000-6000': return course.price >= 4000 && course.price < 6000;
          case 'above-6000': return course.price >= 6000;
          default: return true;
        }
      });
    }

    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(course => course.rating >= minRating);
    }

    // Sorting
    switch(sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.enrolledStudents - a.enrolledStudents);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, selectedSubject, selectedLevel, selectedMode, priceRange, minRating, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * coursesPerPage,
    currentPage * coursesPerPage
  );

  // Get unique subjects
  const subjects = Array.from(new Set(courses.map(c => c.subject)));

  // Render different views based on current navigation state (after all hooks)
  if (currentView.type === 'course') {
    return <CourseDetailPage slug={currentView.slug} onBack={handleBackToHome} />;
  }

  if (currentView.type === 'teacher') {
    return <TeacherProfilePage teacherId={currentView.teacherId} onBack={handleBackToHome} />;
  }

  // Home view - course list
  return (
    <div className="tuition-page" style={{
      minHeight: '100vh',
      background: colorMode === 'dark' ? '#000000' : '#ffffff',
      color: colorMode === 'dark' ? '#ffffff' : '#000000'
    }}>
      {/* Hero Section */}
      <section className="hero-section" style={{
        background: `linear-gradient(135deg, ${colorMode === 'dark' ? '#1a1a1a' : '#f8f9fa'} 0%, ${colorMode === 'dark' ? '#2d2d2d' : '#e9ecef'} 100%)`,
        padding: '4rem 2rem',
        borderBottom: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 700,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Discover Your Perfect Learning Journey
            </h1>
            <p style={{
              fontSize: '1.25rem',
              color: colorMode === 'dark' ? '#a0a0a0' : '#666',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              Connect with qualified teachers, enroll in premium courses, and achieve your educational goals
            </p>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '2rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {[
              { value: '500+', label: 'Courses' },
              { value: '50+', label: 'Qualified Teachers' },
              { value: '10,000+', label: 'Students' },
              { value: '4.8', label: 'Avg Rating' }
            ].map((stat, idx) => (
              <div key={idx} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{stat.value}</div>
                <div style={{
                  fontSize: '0.9rem',
                  color: colorMode === 'dark' ? '#888' : '#666',
                  marginTop: '0.25rem'
                }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <section style={{
        padding: '2rem',
        background: colorMode === 'dark' ? '#0a0a0a' : '#fff',
        borderBottom: `1px solid ${colorMode === 'dark' ? '#222' : '#e0e0e0'}`,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search courses, subjects, or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                minWidth: '300px',
                padding: '0.875rem 1rem',
                border: `2px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                borderRadius: '12px',
                fontSize: '1rem',
                background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                color: colorMode === 'dark' ? '#fff' : '#000',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
              onBlur={(e) => e.currentTarget.style.borderColor = colorMode === 'dark' ? '#333' : '#ddd'}
            />

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                padding: '0.875rem 1.5rem',
                background: showFilters ? '#667eea' : (colorMode === 'dark' ? '#1a1a1a' : '#f8f9fa'),
                color: showFilters ? '#fff' : (colorMode === 'dark' ? '#fff' : '#000'),
                border: `2px solid ${showFilters ? '#667eea' : (colorMode === 'dark' ? '#333' : '#ddd')}`,
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              🎛️ Filters {showFilters ? '▲' : '▼'}
            </button>

            {/* View Mode Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '0.875rem 1rem',
                  background: viewMode === 'grid' ? '#667eea' : (colorMode === 'dark' ? '#1a1a1a' : '#f8f9fa'),
                  color: viewMode === 'grid' ? '#fff' : (colorMode === 'dark' ? '#fff' : '#000'),
                  border: `2px solid ${viewMode === 'grid' ? '#667eea' : (colorMode === 'dark' ? '#333' : '#ddd')}`,
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '0.875rem 1rem',
                  background: viewMode === 'list' ? '#667eea' : (colorMode === 'dark' ? '#1a1a1a' : '#f8f9fa'),
                  color: viewMode === 'list' ? '#fff' : (colorMode === 'dark' ? '#fff' : '#000'),
                  border: `2px solid ${viewMode === 'list' ? '#667eea' : (colorMode === 'dark' ? '#333' : '#ddd')}`,
                  borderRadius: '12px',
                  cursor: 'pointer'
                }}
              >
                ☰
              </button>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              background: colorMode === 'dark' ? '#1a1a1a' : '#f8f9fa',
              borderRadius: '12px',
              border: `1px solid ${colorMode === 'dark' ? '#333' : '#e0e0e0'}`
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {/* Category Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                      background: colorMode === 'dark' ? '#0a0a0a' : '#fff',
                      color: colorMode === 'dark' ? '#fff' : '#000',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Subject Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                      background: colorMode === 'dark' ? '#0a0a0a' : '#fff',
                      color: colorMode === 'dark' ? '#fff' : '#000',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                {/* Level Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                      background: colorMode === 'dark' ? '#0a0a0a' : '#fff',
                      color: colorMode === 'dark' ? '#fff' : '#000',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Levels</option>
                    <option value="elementary">Elementary</option>
                    <option value="middle_school">Middle School</option>
                    <option value="high_school">High School</option>
                    <option value="college">College</option>
                    <option value="professional">Professional</option>
                    <option value="all_levels">All Levels</option>
                  </select>
                </div>

                {/* Mode Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Mode
                  </label>
                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                      background: colorMode === 'dark' ? '#0a0a0a' : '#fff',
                      color: colorMode === 'dark' ? '#fff' : '#000',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Modes</option>
                    <option value="online">🌐 Online</option>
                    <option value="offline">🏫 Offline</option>
                    <option value="hybrid">🔄 Hybrid</option>
                  </select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Price Range
                  </label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                      background: colorMode === 'dark' ? '#0a0a0a' : '#fff',
                      color: colorMode === 'dark' ? '#fff' : '#000',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">All Prices</option>
                    <option value="free">Free</option>
                    <option value="under-2000">Under ₹2,000</option>
                    <option value="2000-4000">₹2,000 - ₹4,000</option>
                    <option value="4000-6000">₹4,000 - ₹6,000</option>
                    <option value="above-6000">Above ₹6,000</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    Minimum Rating
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                      background: colorMode === 'dark' ? '#0a0a0a' : '#fff',
                      color: colorMode === 'dark' ? '#fff' : '#000',
                      cursor: 'pointer'
                    }}
                  >
                    <option value={0}>All Ratings</option>
                    <option value={4.5}>⭐ 4.5+</option>
                    <option value={4}>⭐ 4.0+</option>
                    <option value={3.5}>⭐ 3.5+</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters Button */}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setSelectedSubject('all');
                  setSelectedLevel('all');
                  setSelectedMode('all');
                  setPriceRange('all');
                  setMinRating(0);
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  background: colorMode === 'dark' ? '#2d2d2d' : '#e9ecef',
                  color: colorMode === 'dark' ? '#fff' : '#000',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section style={{ padding: '2rem', background: colorMode === 'dark' ? '#000' : '#fff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
            Browse by Category
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                style={{
                  padding: '1.5rem 1rem',
                  background: selectedCategory === category.name
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : (colorMode === 'dark' ? '#1a1a1a' : '#f8f9fa'),
                  color: selectedCategory === category.name ? '#fff' : (colorMode === 'dark' ? '#fff' : '#000'),
                  border: `2px solid ${selectedCategory === category.name ? 'transparent' : (colorMode === 'dark' ? '#333' : '#e0e0e0')}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.name) {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{category.icon}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{category.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.25rem' }}>
                  {category.count} courses
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Results Header */}
      <section style={{
        padding: '1.5rem 2rem',
        background: colorMode === 'dark' ? '#0a0a0a' : '#f8f9fa',
        borderTop: `1px solid ${colorMode === 'dark' ? '#222' : '#e0e0e0'}`,
        borderBottom: `1px solid ${colorMode === 'dark' ? '#222' : '#e0e0e0'}`
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '1rem', fontWeight: 600 }}>
            {filteredCourses.length} courses found
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.9rem' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: `1px solid ${colorMode === 'dark' ? '#333' : '#ddd'}`,
                background: colorMode === 'dark' ? '#1a1a1a' : '#fff',
                color: colorMode === 'dark' ? '#fff' : '#000',
                cursor: 'pointer'
              }}
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section style={{ padding: '2rem', background: colorMode === 'dark' ? '#000' : '#fff', minHeight: '400px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {paginatedCourses.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No courses found</h3>
              <p style={{ color: colorMode === 'dark' ? '#888' : '#666' }}>
                Try adjusting your filters or search query
              </p>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: viewMode === 'grid'
                  ? 'repeat(auto-fill, minmax(300px, 1fr))'
                  : '1fr',
                gap: '1.5rem'
              }}>
                {paginatedCourses.map(course => {
                  const teacher = getTeacherById(course.teacherId);
                  const discount = course.originalPrice
                    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
                    : 0;

                  return (
                    <div
                      key={course.id}
                      onClick={() => handleCourseClick(course.slug)}
                      style={{
                        background: colorMode === 'dark'
                          ? 'linear-gradient(135deg, rgba(30, 20, 50, 0.95) 0%, rgba(26, 11, 46, 0.95) 100%)'
                          : 'rgba(255, 255, 255, 0.98)',
                        border: `1px solid ${colorMode === 'dark' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.15)'}`,
                        borderRadius: '20px',
                        overflow: 'hidden',
                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        cursor: 'pointer',
                        display: viewMode === 'list' ? 'flex' : 'block',
                        boxShadow: colorMode === 'dark'
                          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                          : '0 4px 16px rgba(139, 92, 246, 0.08)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                        e.currentTarget.style.boxShadow = colorMode === 'dark'
                          ? '0 20px 40px rgba(167, 139, 250, 0.2)'
                          : '0 20px 40px rgba(139, 92, 246, 0.15)';
                        e.currentTarget.style.borderColor = colorMode === 'dark'
                          ? 'rgba(167, 139, 250, 0.4)'
                          : 'rgba(139, 92, 246, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        e.currentTarget.style.boxShadow = colorMode === 'dark'
                          ? '0 4px 16px rgba(0, 0, 0, 0.3)'
                          : '0 4px 16px rgba(139, 92, 246, 0.08)';
                        e.currentTarget.style.borderColor = colorMode === 'dark'
                          ? 'rgba(167, 139, 250, 0.2)'
                          : 'rgba(139, 92, 246, 0.15)';
                      }}
                    >
                      {/* Premium Thumbnail with Video Preview */}
                      <div
                        style={{
                          position: 'relative',
                          width: viewMode === 'list' ? '300px' : '100%',
                          height: viewMode === 'list' ? '200px' : '180px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)',
                          borderBottom: colorMode === 'dark'
                            ? '1px solid rgba(167, 139, 250, 0.1)'
                            : '1px solid rgba(139, 92, 246, 0.08)'
                        }}
                        onMouseEnter={(e) => {
                          const overlay = e.currentTarget.querySelector('.video-overlay') as HTMLElement;
                          const playIcon = e.currentTarget.querySelector('.play-icon') as HTMLElement;
                          if (overlay) {
                            overlay.style.opacity = '1';
                          }
                          if (playIcon) {
                            playIcon.style.transform = 'scale(1.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const overlay = e.currentTarget.querySelector('.video-overlay') as HTMLElement;
                          const playIcon = e.currentTarget.querySelector('.play-icon') as HTMLElement;
                          if (overlay) {
                            overlay.style.opacity = '0';
                          }
                          if (playIcon) {
                            playIcon.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {/* Course Thumbnail Image */}
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s ease'
                          }}
                        />

                        {/* Video Preview Overlay */}
                        <div
                          className="video-overlay"
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                            backdropFilter: 'blur(4px)',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewCourse(course);
                          }}
                        >
                          <div
                            className="play-icon"
                            style={{
                              width: '60px',
                              height: '60px',
                              borderRadius: '50%',
                              background: 'rgba(255, 255, 255, 0.95)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '1rem',
                              transition: 'transform 0.3s ease',
                              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)'
                            }}
                          >
                            <div style={{
                              width: 0,
                              height: 0,
                              borderLeft: '16px solid #667eea',
                              borderTop: '10px solid transparent',
                              borderBottom: '10px solid transparent',
                              marginLeft: '4px'
                            }} />
                          </div>
                          <div style={{
                            color: '#fff',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            textAlign: 'center',
                            padding: '0 1rem'
                          }}>
                            Preview Course
                          </div>
                          <div style={{
                            color: 'rgba(255, 255, 255, 0.9)',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem'
                          }}>
                            {course.modules.length} modules • {course.totalHours} hours
                          </div>
                        </div>

                        {/* Premium Badges */}
                        <div style={{
                          position: 'absolute',
                          top: '1rem',
                          left: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          zIndex: 10
                        }}>
                          {course.isBestseller && (
                            <span style={{
                              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                              color: '#fff',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 8px rgba(245, 158, 11, 0.3)',
                              textTransform: 'uppercase'
                            }}>
                              ⭐ Bestseller
                            </span>
                          )}
                          {course.isNew && (
                            <span style={{
                              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                              color: '#fff',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 8px rgba(16, 185, 129, 0.3)',
                              textTransform: 'uppercase'
                            }}>
                              ✨ New
                            </span>
                          )}
                          {discount > 0 && (
                            <span style={{
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                              color: '#fff',
                              padding: '0.35rem 0.85rem',
                              borderRadius: '8px',
                              fontSize: '0.7rem',
                              fontWeight: 800,
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 8px rgba(239, 68, 68, 0.3)',
                              textTransform: 'uppercase'
                            }}>
                              🔥 {discount}% OFF
                            </span>
                          )}
                        </div>

                        {/* Quick Info Bar */}
                        <div style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
                          padding: '1.5rem 1rem 0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.75rem',
                          color: '#fff',
                          zIndex: 5
                        }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            ⏱️ {course.totalHours}h
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            👥 {course.enrolledStudents.toLocaleString()}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {course.mode === 'online' ? '🌐' : course.mode === 'offline' ? '🏫' : '🔄'} {course.mode}
                          </span>
                        </div>

                        {/* Wishlist Button */}
                        <button
                          style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(10px)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '50%',
                            width: '40px',
                            height: '40px',
                            fontSize: '1.25rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                            zIndex: 10
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.currentTarget.innerHTML = e.currentTarget.innerHTML === '🤍' ? '❤️' : '🤍';
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(102, 126, 234, 0.9)';
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          🤍
                        </button>
                      </div>

                      {/* Content */}
                      <div style={{ padding: '1.25rem', flex: 1 }}>
                        {/* Category & Level */}
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem',
                          marginBottom: '0.75rem',
                          flexWrap: 'wrap'
                        }}>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.3rem 0.75rem',
                            background: colorMode === 'dark'
                              ? 'rgba(167, 139, 250, 0.15)'
                              : 'rgba(139, 92, 246, 0.1)',
                            color: colorMode === 'dark' ? '#a78bfa' : '#8b5cf6',
                            borderRadius: '8px',
                            fontWeight: 600
                          }}>
                            {course.subject}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            padding: '0.3rem 0.75rem',
                            background: colorMode === 'dark'
                              ? 'rgba(167, 139, 250, 0.1)'
                              : 'rgba(139, 92, 246, 0.08)',
                            color: colorMode === 'dark' ? '#94a3b8' : '#64748b',
                            borderRadius: '8px'
                          }}>
                            {course.level.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          marginBottom: '0.5rem',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {course.title}
                        </h3>

                        {/* Teacher Info */}
                        {teacher && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '0.75rem'
                          }}>
                            <img
                              src={teacher.avatar}
                              alt={teacher.name}
                              style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%'
                              }}
                            />
                            <span style={{
                              fontSize: '0.85rem',
                              color: colorMode === 'dark' ? '#a0a0a0' : '#666'
                            }}>
                              {teacher.name}
                            </span>
                            {teacher.verified && <span style={{ fontSize: '0.75rem' }}>✓</span>}
                          </div>
                        )}

                        {/* Rating & Students */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          marginBottom: '1rem',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <span style={{ color: '#f59e0b' }}>⭐</span>
                            <span style={{ fontWeight: 700 }}>{course.rating}</span>
                            <span style={{ color: colorMode === 'dark' ? '#666' : '#999' }}>
                              ({course.totalReviews.toLocaleString()})
                            </span>
                          </div>
                          <span style={{ color: colorMode === 'dark' ? '#666' : '#999' }}>
                            {course.enrolledStudents.toLocaleString()} students
                          </span>
                        </div>

                        {/* Course Details */}
                        <div style={{
                          display: 'flex',
                          gap: '1rem',
                          marginBottom: '1rem',
                          fontSize: '0.8rem',
                          color: colorMode === 'dark' ? '#888' : '#666',
                          flexWrap: 'wrap'
                        }}>
                          <span>⏱️ {course.totalHours}h total</span>
                          <span>📅 {course.duration} weeks</span>
                          <span>
                            {course.mode === 'online' ? '🌐' : course.mode === 'offline' ? '🏫' : '🔄'}
                            {' '}{course.mode}
                          </span>
                        </div>

                        {/* Price */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: 'auto',
                          paddingTop: '1rem',
                          borderTop: colorMode === 'dark'
                            ? '1px solid rgba(167, 139, 250, 0.15)'
                            : '1px solid rgba(139, 92, 246, 0.1)'
                        }}>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                              <span style={{
                                fontSize: '1.4rem',
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                              }}>
                                ₹{course.price.toLocaleString()}
                              </span>
                              {course.originalPrice && (
                                <span style={{
                                  fontSize: '1rem',
                                  textDecoration: 'line-through',
                                  color: colorMode === 'dark' ? '#666' : '#999'
                                }}>
                                  ₹{course.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>

                          <button style={{
                            padding: '0.75rem 1.5rem',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                          }}>
                            Enroll Now
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginTop: '3rem'
                }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.75rem 1rem',
                      background: currentPage === 1
                        ? (colorMode === 'dark' ? '#1a1a1a' : '#f0f0f0')
                        : '#667eea',
                      color: currentPage === 1 ? (colorMode === 'dark' ? '#666' : '#999') : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ← Previous
                  </button>

                  {[...Array(totalPages)].map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            padding: '0.75rem 1rem',
                            background: currentPage === page
                              ? '#667eea'
                              : (colorMode === 'dark' ? '#1a1a1a' : '#f0f0f0'),
                            color: currentPage === page ? '#fff' : (colorMode === 'dark' ? '#fff' : '#000'),
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: currentPage === page ? 700 : 400,
                            minWidth: '40px'
                          }}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} style={{ padding: '0.75rem 0.5rem' }}>...</span>;
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.75rem 1rem',
                      background: currentPage === totalPages
                        ? (colorMode === 'dark' ? '#1a1a1a' : '#f0f0f0')
                        : '#667eea',
                      color: currentPage === totalPages ? (colorMode === 'dark' ? '#666' : '#999') : '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Course Preview Modal */}
      {previewCourse && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setPreviewCourse(null)}
        >
          <div
            style={{
              background: colorMode === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 20, 50, 0.98) 0%, rgba(26, 11, 46, 0.98) 100%)'
                : 'rgba(255, 255, 255, 0.98)',
              borderRadius: '24px',
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflow: 'hidden',
              boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)',
              border: colorMode === 'dark'
                ? '1px solid rgba(167, 139, 250, 0.2)'
                : '1px solid rgba(139, 92, 246, 0.15)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: colorMode === 'dark'
                ? '1px solid rgba(167, 139, 250, 0.15)'
                : '1px solid rgba(139, 92, 246, 0.1)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h2 style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: colorMode === 'dark' ? '#f8fafc' : '#1a1a1a'
                }}>
                  Course Preview
                </h2>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '0.9rem',
                  color: colorMode === 'dark' ? '#a78bfa' : '#8b5cf6'
                }}>
                  {previewCourse.title}
                </p>
              </div>
              <button
                onClick={() => setPreviewCourse(null)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: colorMode === 'dark'
                    ? 'rgba(167, 139, 250, 0.15)'
                    : 'rgba(139, 92, 246, 0.1)',
                  color: colorMode === 'dark' ? '#a78bfa' : '#8b5cf6',
                  fontSize: '18px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                ✕
              </button>
            </div>

            {/* Video Player */}
            <div style={{
              position: 'relative',
              width: '100%',
              paddingBottom: '56.25%', // 16:9 aspect ratio
              background: '#000'
            }}>
              <iframe
                src={previewCourse.demoVideo}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={`Preview: ${previewCourse.title}`}
              />
            </div>

            {/* Course Info Footer */}
            <div style={{
              padding: '20px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontSize: '0.85rem',
                color: colorMode === 'dark' ? '#94a3b8' : '#64748b'
              }}>
                <span>⏱️ {previewCourse.totalHours} hours</span>
                <span>📚 {previewCourse.modules.length} modules</span>
                <span>⭐ {previewCourse.rating} ({previewCourse.totalReviews} reviews)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setPreviewCourse(null);
                    handleCourseClick(previewCourse.slug);
                  }}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  View Full Course
                </button>
                <button
                  onClick={() => setPreviewCourse(null)}
                  style={{
                    padding: '0.6rem 1.25rem',
                    background: colorMode === 'dark'
                      ? 'rgba(167, 139, 250, 0.15)'
                      : 'rgba(139, 92, 246, 0.1)',
                    color: colorMode === 'dark' ? '#a78bfa' : '#8b5cf6',
                    border: colorMode === 'dark'
                      ? '1px solid rgba(167, 139, 250, 0.3)'
                      : '1px solid rgba(139, 92, 246, 0.2)',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TuitionPage;
