'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, User, Hash, FileText, Image, Video } from 'lucide-react';
import { createPortal } from 'react-dom';
import { debounce } from '@/lib/utils';
import { useNavigation } from '../navigation/NavigationProvider';

interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'hashtag' | 'page' | 'file' | 'app';
  title: string;
  description?: string;
  thumbnail?: string;
  url?: string;
  metadata?: Record<string, any>;
}

interface SearchCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
}

interface GlobalSearchProps {
  placeholder?: string;
  maxResults?: number;
  categories?: string[];
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
}

export default function GlobalSearch({
  placeholder = 'Search Echo...',
  maxResults = 50,
  categories = ['all', 'users', 'posts', 'hashtags', 'pages', 'files', 'apps'],
  onResultSelect,
  className = ''
}: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState<string[]>([
    'AI tutorials', 'React 19', 'Web development', 'Design systems', 'TypeScript'
  ]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { navigate } = useNavigation();

  // Mock search data
  const mockResults: SearchResult[] = useMemo(() => [
    {
      id: '1',
      type: 'user',
      title: 'John Doe',
      description: 'Frontend Developer at Echo',
      thumbnail: '/api/placeholder/40/40'
    },
    {
      id: '2',
      type: 'post',
      title: 'Getting Started with React 19',
      description: 'A comprehensive guide to the latest React features...',
      thumbnail: '/api/placeholder/60/40'
    },
    {
      id: '3',
      type: 'hashtag',
      title: '#webdevelopment',
      description: '1.2K posts'
    },
    {
      id: '4',
      type: 'page',
      title: 'Settings',
      description: 'Manage your account preferences',
      url: '/settings'
    },
    {
      id: '5',
      type: 'app',
      title: 'Calculator',
      description: 'Built-in calculator app',
      thumbnail: '🧮'
    }
  ], []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('echo-recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {

      }
    }
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter mock results based on query and category
      const filtered = mockResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            result.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || 
                               result.type === selectedCategory.slice(0, -1); // Remove 's' from category
        return matchesQuery && matchesCategory;
      });
      
      setResults(filtered.slice(0, maxResults));
      setLoading(false);
    }, 300),
    [mockResults, selectedCategory, maxResults]
  );

  // Handle search input
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < results.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > -1 ? prev - 1 : prev);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && results[selectedIndex]) {
            handleResultSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    // Add to recent searches
    const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem('echo-recent-searches', JSON.stringify(newRecent));

    // Handle navigation based on result type
    if (result.type === 'page' && result.url) {
      navigate(result.url.replace('/', ''));
    } else if (result.type === 'app') {
      // Trigger mini app opening
      window.dispatchEvent(new CustomEvent('open-mini-app', { detail: result.title.toLowerCase() }));
    }

    // Call custom handler
    onResultSelect?.(result);
    
    setIsOpen(false);
    setQuery('');
  }, [query, recentSearches, navigate, onResultSelect]);

  // Get category counts
  const categoryData: SearchCategory[] = useMemo(() => [
    { id: 'all', label: 'All', icon: <Search size={16} />, count: results.length },
    { id: 'users', label: 'Users', icon: <User size={16} />, count: results.filter(r => r.type === 'user').length },
    { id: 'posts', label: 'Posts', icon: <FileText size={16} />, count: results.filter(r => r.type === 'post').length },
    { id: 'hashtags', label: 'Tags', icon: <Hash size={16} />, count: results.filter(r => r.type === 'hashtag').length },
    { id: 'pages', label: 'Pages', icon: <FileText size={16} />, count: results.filter(r => r.type === 'page').length },
    { id: 'files', label: 'Files', icon: <Image size={16} />, count: results.filter(r => r.type === 'file').length },
    { id: 'apps', label: 'Apps', icon: <Video size={16} />, count: results.filter(r => r.type === 'app').length }
  ].filter(cat => categories.includes(cat.id)), [results, categories]);

  // Get result icon
  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return <User size={16} className="text-blue-500" />;
      case 'post': return <FileText size={16} className="text-green-500" />;
      case 'hashtag': return <Hash size={16} className="text-purple-500" />;
      case 'page': return <FileText size={16} className="text-orange-500" />;
      case 'file': return <Image size={16} className="text-pink-500" />;
      case 'app': return <Video size={16} className="text-indigo-500" />;
      default: return <Search size={16} className="text-gray-500" />;
    }
  };

  return (
    <>
      {/* Search Input */}
      <div className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Search Results Portal */}
      {isOpen && typeof window !== 'undefined' && createPortal(
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          
          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-3 bg-transparent border-none outline-none text-lg"
                  autoFocus
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent" />
                  </div>
                )}
              </div>
            </div>

            {/* Categories */}
            {query && (
              <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2 overflow-x-auto">
                  {categoryData.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.icon}
                      <span>{category.label}</span>
                      {category.count > 0 && (
                        <span className="bg-gray-200 dark:bg-gray-600 text-xs px-1.5 py-0.5 rounded-full">
                          {category.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results */}
            <div ref={resultsRef} className="max-h-96 overflow-y-auto">
              {!query ? (
                /* Recent and Trending */
                <div className="p-4 space-y-4">
                  {recentSearches.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                        <Clock size={16} className="mr-2" />
                        Recent Searches
                      </h3>
                      <div className="space-y-1">
                        {recentSearches.map((search, index) => (
                          <button
                            key={index}
                            onClick={() => setQuery(search)}
                            className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                      <TrendingUp size={16} className="mr-2" />
                      Trending
                    </h3>
                    <div className="space-y-1">
                      {trendingSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => setQuery(search)}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : results.length > 0 ? (
                /* Search Results */
                <div className="p-2">
                  {results.map((result, index) => (
                    <motion.button
                      key={result.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleResultSelect(result)}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                        selectedIndex === index
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {/* Icon/Thumbnail */}
                      <div className="flex-shrink-0">
                        {result.thumbnail && result.type !== 'app' ? (
                          <img
                            src={result.thumbnail}
                            alt={result.title}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : result.type === 'app' ? (
                          <div className="w-10 h-10 flex items-center justify-center text-2xl">
                            {result.thumbnail}
                          </div>
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {getResultIcon(result.type)}
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 dark:text-white truncate">
                          {result.title}
                        </div>
                        {result.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {result.description}
                          </div>
                        )}
                      </div>
                      
                      {/* Type Badge */}
                      <div className="flex-shrink-0">
                        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full capitalize">
                          {result.type}
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : query && !loading ? (
                /* No Results */
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <Search size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">No results found</p>
                  <p className="text-sm">Try adjusting your search terms or browse categories</p>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-4">
                  <span>↑↓ Navigate</span>
                  <span>↵ Select</span>
                  <span>Esc Close</span>
                </div>
                <div>
                  {results.length} results
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}
    </>
  );
}