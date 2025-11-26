'use client';

import { useThemeColors } from '@/hooks/useThemeColors';
import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  created: string;
  updated: string;
  category?: string;
  tags?: string[];
  color?: string;
  pinned?: boolean;
  favorite?: boolean;
  archived?: boolean;
}

interface NotesAppProps {
  isVisible: boolean;
  onClose: () => void;
}

interface WritingStats {
  totalNotes: number;
  totalWords: number;
  totalChars: number;
  avgWordsPerNote: number;
  pinnedCount: number;
  favoritesCount: number;
  longestNote: number;
  mostUsedCategory: string;
}

export default function NotesApp({ isVisible, onClose }: NotesAppProps) {
  const colors = useThemeColors();
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showOnlyPinned, setShowOnlyPinned] = useState(false);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeModal, setActiveModal] = useState<
    'create' | 'edit' | 'delete' | null
  >(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('Personal');
  const [formTags, setFormTags] = useState('');
  const [formColor, setFormColor] = useState('colors.brand.primary');

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Categories and colors
  const categories = ['Personal', 'Work', 'Ideas', 'To-Do', 'Journal'];
  const colorOptions = [
    'colors.brand.primary',
    'colors.status.success',
    'colors.status.warning',
    '#ec4899',
    'colors.status.info',
    'colors.brand.primary',
  ];

  // Load notes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('notes-app-data-v3');
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        // Default note
        setNotes([
          {
            id: '1',
            title: 'Welcome to Notes',
            content: `Welcome to your premium notes app!\n\nFeatures:\n- AI writing suggestions\n- Rich organization with tags and categories\n- Pin important notes\n- Mark favorites\n- Export as Markdown\n- Full-text search\n\nStart creating notes and explore all features!`,
            created: new Date().toISOString().split('T')[0],
            updated: new Date().toISOString().split('T')[0],
            category: 'Personal',
            tags: ['welcome', 'features'],
            color: 'colors.brand.primary',
            pinned: true,
            favorite: false,
            archived: false,
          },
        ]);
      }
    } catch (e) {}
  }, []);

  // Save notes to localStorage
  useEffect(() => {
    if (notes.length > 0) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      autoSaveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem('notes-app-data-v3', JSON.stringify(notes));
        } catch (e) {}
      }, 500);
    }
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [notes]);

  // Calculate writing stats
  const writingStats = useMemo((): WritingStats => {
    const totalNotes = notes.filter((n) => !n.archived).length;
    const activeNotes = notes.filter((n) => !n.archived);
    const totalWords = activeNotes.reduce((sum, note) => {
      return (
        sum +
        note.content
          .trim()
          .split(/\s+/)
          .filter((w) => w).length
      );
    }, 0);
    const totalChars = activeNotes.reduce(
      (sum, note) => sum + note.content.length,
      0
    );
    const avgWordsPerNote =
      totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0;
    const pinnedCount = notes.filter((n) => n.pinned && !n.archived).length;
    const favoritesCount = notes.filter(
      (n) => n.favorite && !n.archived
    ).length;
    const longestNote =
      activeNotes.length > 0
        ? Math.max(
            ...activeNotes.map(
              (n) =>
                n.content
                  .trim()
                  .split(/\s+/)
                  .filter((w) => w).length
            )
          )
        : 0;

    // Most used category
    const categoryCounts: Record<string, number> = {};
    activeNotes.forEach((note) => {
      const cat = note.category || 'Personal';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    const mostUsedCategory =
      Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      'Personal';

    return {
      totalNotes,
      totalWords,
      totalChars,
      avgWordsPerNote,
      pinnedCount,
      favoritesCount,
      longestNote,
      mostUsedCategory,
    };
  }, [notes]);

  // Generate AI writing insight
  const generateWritingInsight = useCallback((): string => {
    const {
      totalNotes,
      totalWords,
      avgWordsPerNote,
      longestNote,
      mostUsedCategory,
    } = writingStats;

    if (totalNotes === 0) {
      return 'Start writing your first note! Regular note-taking improves memory and creativity.';
    }

    const insights: string[] = [];

    // Productivity insights
    if (totalNotes >= 20) {
      insights.push(
        `Impressive! You have ${totalNotes} notes. You're a prolific writer!`
      );
    } else if (totalNotes >= 10) {
      insights.push(
        `${totalNotes} notes and growing! Keep building your knowledge base.`
      );
    } else if (totalNotes >= 5) {
      insights.push(
        `Great start with ${totalNotes} notes. Try writing daily to build momentum.`
      );
    }

    // Word count insights
    if (totalWords >= 5000) {
      insights.push(
        `You've written ${totalWords.toLocaleString()} words! That's novel territory.`
      );
    } else if (totalWords >= 1000) {
      insights.push(
        `${totalWords.toLocaleString()} words written. Your ideas are flowing!`
      );
    }

    // Average length insights
    if (avgWordsPerNote >= 200) {
      insights.push(
        'Your notes average 200+ words - great for detailed documentation.'
      );
    } else if (avgWordsPerNote >= 50) {
      insights.push(
        'Good note length! Try adding more detail to capture context.'
      );
    } else if (avgWordsPerNote > 0 && avgWordsPerNote < 30) {
      insights.push(
        'Quick notes are great! Consider expanding key ideas for better recall.'
      );
    }

    // Longest note insight
    if (longestNote >= 500) {
      insights.push(
        `Your longest note has ${longestNote} words - perfect for deep topics!`
      );
    }

    // Category insight
    insights.push(
      `"${mostUsedCategory}" is your most used category. Consider cross-referencing with tags.`
    );

    // Writing tips
    const tips = [
      'Tip: Use tags to connect related ideas across different notes.',
      'Tip: Pin your most referenced notes for quick access.',
      'Tip: Review and update old notes to reinforce learning.',
      'Tip: Break long notes into smaller, focused pieces.',
      'Tip: Use the journal category for daily reflections.',
    ];
    insights.push(tips[Math.floor(Math.random() * tips.length)]);

    return insights[Math.floor(Math.random() * insights.length)];
  }, [writingStats]);

  // Filter notes
  const filteredNotes = useMemo(() => {
    let filtered = [...notes];

    // Archive filter
    filtered = filtered.filter((note) =>
      showArchived ? note.archived : !note.archived
    );

    // Pinned/Favorites filter
    if (showOnlyPinned) {
      filtered = filtered.filter((note) => note.pinned);
    }
    if (showOnlyFavorites) {
      filtered = filtered.filter((note) => note.favorite);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(term) ||
          note.content.toLowerCase().includes(term) ||
          note.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Sort pinned to top
    return filtered.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    });
  }, [notes, showOnlyPinned, showOnlyFavorites, showArchived, searchTerm]);

  // CRUD operations
  const createNote = useCallback(() => {
    const newNote: Note = {
      id: `note-${Date.now()}`,
      title: formTitle || 'Untitled Note',
      content: formContent,
      created: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0],
      category: formCategory,
      tags: formTags
        ? formTags
            .split(',')
            .map((t) => t.trim())
            .filter((t) => t)
        : [],
      color: formColor,
      pinned: false,
      favorite: false,
      archived: false,
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveModal(null);
    resetForm();
  }, [formTitle, formContent, formCategory, formTags, formColor]);

  const updateNote = useCallback(() => {
    if (!editingNote) return;
    setNotes((prev) =>
      prev.map((note) =>
        note.id === editingNote.id
          ? {
              ...note,
              title: formTitle || 'Untitled Note',
              content: formContent,
              category: formCategory,
              tags: formTags
                ? formTags
                    .split(',')
                    .map((t) => t.trim())
                    .filter((t) => t)
                : note.tags,
              color: formColor,
              updated: new Date().toISOString().split('T')[0],
            }
          : note
      )
    );
    setActiveModal(null);
    setEditingNote(null);
    resetForm();
  }, [editingNote, formTitle, formContent, formCategory, formTags, formColor]);

  const deleteNote = useCallback(() => {
    if (!editingNote) return;
    setNotes((prev) => prev.filter((note) => note.id !== editingNote.id));
    if (selectedNote?.id === editingNote.id) {
      setSelectedNote(null);
    }
    setActiveModal(null);
    setEditingNote(null);
  }, [editingNote, selectedNote]);

  const togglePin = useCallback((note: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, pinned: !n.pinned } : n))
    );
  }, []);

  const toggleFavorite = useCallback((note: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, favorite: !n.favorite } : n))
    );
  }, []);

  const toggleArchive = useCallback((note: Note) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === note.id ? { ...n, archived: !n.archived } : n))
    );
  }, []);

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('Personal');
    setFormTags('');
    setFormColor('colors.brand.primary');
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setFormTitle(note.title);
    setFormContent(note.content);
    setFormCategory(note.category || 'Personal');
    setFormTags(note.tags?.join(', ') || '');
    setFormColor(note.color || 'colors.brand.primary');
    setActiveModal('edit');
  };

  const openDeleteModal = (note: Note) => {
    setEditingNote(note);
    setActiveModal('delete');
  };

  const copyNoteContent = async (note: Note) => {
    try {
      await navigator.clipboard.writeText(note.content);
    } catch (e) {}
  };

  const exportNotesJSON = () => {
    const dataStr = JSON.stringify(notes, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute(
      'download',
      `notes-${new Date().toISOString().split('T')[0]}.json`
    );
    link.click();
  };

  const getRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'n') {
        e.preventDefault();
        setActiveModal('create');
      }
      if (ctrl && e.key === 'e') {
        e.preventDefault();
        exportNotesJSON();
      }
      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
          setEditingNote(null);
          resetForm();
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, activeModal, onClose]);

  if (!isVisible) return null;

  // Glass card style helper
  const glassCard = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background:
          'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        overflow: 'hidden',
        position: 'relative',
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.2)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem', color: 'white' }}>Notes</span>
          <span
            style={{
              fontSize: '0.7rem',
              padding: '0.2rem 0.5rem',
              background:
                'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
              borderRadius: '4px',
              color: 'white',
            }}
          >
            PRO
          </span>
          <span
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            {filteredNotes.length} notes
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowAI(!showAI)}
            style={{
              background: showAI
                ? 'rgba(139, 92, 246, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
            title="AI Writing Coach"
          >
            AI
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              background: showStats
                ? 'rgba(59, 130, 246, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
            title="Statistics"
          >
            Stats
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {viewMode === 'grid' ? '=' : ':::'}
          </button>
          <button
            onClick={() => setShowOnlyPinned(!showOnlyPinned)}
            style={{
              background: showOnlyPinned
                ? 'rgba(245, 158, 11, 0.3)'
                : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            Pin
          </button>
          <button
            onClick={exportNotesJSON}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
            }}
            title="Export"
          >
            Export
          </button>
          <button
            onClick={() => {
              resetForm();
              setActiveModal('create');
            }}
            style={{
              background:
                'linear-gradient(135deg, colors.status.success 0%, #059669 100%)',
              border: 'none',
              borderRadius: '8px',
              padding: '0.4rem 0.75rem',
              color: 'white',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.85rem',
            }}
          >
            + New
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            X
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.1)',
        }}
      >
        <input
          type="text"
          placeholder="Search notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none',
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem',
        }}
      >
        {/* AI Writing Coach */}
        {showAI && (
          <div
            style={{
              ...glassCard,
              padding: '1rem',
              marginBottom: '1rem',
              background:
                'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ fontSize: '1rem' }}>AI Writing Coach</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '0.15rem 0.4rem',
                  background: 'rgba(139, 92, 246, 0.3)',
                  borderRadius: '4px',
                  color: '#a78bfa',
                }}
              >
                BETA
              </span>
            </div>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                lineHeight: '1.5',
              }}
            >
              {generateWritingInsight()}
            </p>
          </div>
        )}

        {/* Statistics */}
        {showStats && (
          <div
            style={{
              ...glassCard,
              padding: '1rem',
              marginBottom: '1rem',
            }}
          >
            <h4
              style={{
                margin: '0 0 0.75rem 0',
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Writing Statistics
            </h4>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem',
              }}
            >
              {[
                {
                  label: 'Total Notes',
                  value: writingStats.totalNotes,
                  color: 'colors.brand.primary',
                },
                {
                  label: 'Total Words',
                  value: writingStats.totalWords.toLocaleString(),
                  color: 'colors.status.success',
                },
                {
                  label: 'Avg Words',
                  value: writingStats.avgWordsPerNote,
                  color: 'colors.status.warning',
                },
                {
                  label: 'Pinned',
                  value: writingStats.pinnedCount,
                  color: '#ec4899',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    padding: '0.6rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.65rem',
                      color: 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Grid/List */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              viewMode === 'grid'
                ? 'repeat(auto-fill, minmax(280px, 1fr))'
                : '1fr',
            gap: '0.75rem',
          }}
        >
          {filteredNotes.map((note) => {
            const wordCount = note.content
              .trim()
              .split(/\s+/)
              .filter((w) => w).length;
            const preview =
              note.content.length > 150
                ? `${note.content.substring(0, 150)}...`
                : note.content;

            return (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                style={{
                  ...glassCard,
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  borderLeft: `3px solid ${note.color || 'colors.brand.primary'}`,
                  opacity: note.archived ? 0.6 : 1,
                  position: 'relative',
                }}
              >
                {/* Note Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flex: 1,
                    }}
                  >
                    {note.pinned && (
                      <span style={{ fontSize: '0.8rem' }} title="Pinned">
                        Pin
                      </span>
                    )}
                    {note.favorite && (
                      <span style={{ fontSize: '0.8rem' }} title="Favorite">
                        *
                      </span>
                    )}
                    <h4
                      style={{
                        margin: 0,
                        fontSize: '0.95rem',
                        fontWeight: '500',
                        color: 'white',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {note.title}
                    </h4>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePin(note);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.2rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: note.pinned
                          ? 'colors.status.warning'
                          : 'rgba(255, 255, 255, 0.4)',
                      }}
                      title={note.pinned ? 'Unpin' : 'Pin'}
                    >
                      Pin
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(note);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.2rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: note.favorite
                          ? '#ec4899'
                          : 'rgba(255, 255, 255, 0.4)',
                      }}
                      title={note.favorite ? 'Unfavorite' : 'Favorite'}
                    >
                      Fav
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(note);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.2rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: 'rgba(255, 255, 255, 0.4)',
                      }}
                      title="Edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteModal(note);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '0.2rem',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        color: 'colors.status.error',
                      }}
                      title="Delete"
                    >
                      Del
                    </button>
                  </div>
                </div>

                {/* Preview */}
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    lineHeight: '1.5',
                    margin: '0 0 0.75rem 0',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {preview}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.25rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    {note.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.15rem 0.4rem',
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderRadius: '4px',
                          color: note.color || 'colors.brand.primary',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                    {note.tags.length > 3 && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          color: 'rgba(255, 255, 255, 0.4)',
                        }}
                      >
                        +{note.tags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Meta */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '0.7rem',
                    color: 'rgba(255, 255, 255, 0.4)',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                  }}
                >
                  <span>{wordCount} words</span>
                  <span>{getRelativeTime(note.updated)}</span>
                </div>
              </div>
            );
          })}

          {filteredNotes.length === 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                textAlign: 'center',
                padding: '3rem',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                Note icon
              </div>
              <h3
                style={{
                  margin: '0 0 0.5rem 0',
                  color: 'rgba(255, 255, 255, 0.7)',
                }}
              >
                {showOnlyPinned
                  ? 'No pinned notes'
                  : showOnlyFavorites
                    ? 'No favorites'
                    : 'No notes yet'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem' }}>
                {showOnlyPinned || showOnlyFavorites
                  ? 'Try adjusting your filters'
                  : 'Create your first note to get started'}
              </p>
              {!showOnlyPinned && !showOnlyFavorites && (
                <button
                  onClick={() => {
                    resetForm();
                    setActiveModal('create');
                  }}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    background:
                      'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  Create Note
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(activeModal === 'create' || activeModal === 'edit') && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => {
            setActiveModal(null);
            setEditingNote(null);
            resetForm();
          }}
        >
          <div
            style={{
              ...glassCard,
              padding: '1.5rem',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                color: 'white',
              }}
            >
              {activeModal === 'create' ? 'Create New Note' : 'Edit Note'}
            </h3>

            {/* Title */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Title
              </label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Note title"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              >
                {categories.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    style={{ background: '#1a1a2e' }}
                  >
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.9rem',
                }}
              />
            </div>

            {/* Color */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Color
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFormColor(color)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      background: color,
                      border:
                        formColor === color
                          ? '2px solid white'
                          : '2px solid transparent',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Content
              </label>
              <textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder="Write your note here..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  fontSize: '0.9rem',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Actions */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingNote(null);
                  resetForm();
                }}
                style={{
                  padding: '0.6rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={activeModal === 'create' ? createNote : updateNote}
                style={{
                  padding: '0.6rem 1rem',
                  background:
                    'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                {activeModal === 'create' ? 'Create Note' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {activeModal === 'delete' && editingNote && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={() => {
            setActiveModal(null);
            setEditingNote(null);
          }}
        >
          <div
            style={{
              ...glassCard,
              padding: '1.5rem',
              width: '90%',
              maxWidth: '400px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1.1rem',
                color: 'white',
              }}
            >
              Delete Note
            </h3>
            <p
              style={{
                margin: '0 0 1rem 0',
                fontSize: '0.9rem',
                color: 'rgba(255, 255, 255, 0.7)',
              }}
            >
              Are you sure you want to delete "{editingNote.title}"? This action
              cannot be undone.
            </p>
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => {
                  setActiveModal(null);
                  setEditingNote(null);
                }}
                style={{
                  padding: '0.6rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={deleteNote}
                style={{
                  padding: '0.6rem 1rem',
                  background:
                    'linear-gradient(135deg, colors.status.error 0%, #dc2626 100%)',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
