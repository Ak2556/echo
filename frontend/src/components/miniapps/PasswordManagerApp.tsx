'use client';

import { useThemeColors } from '@/hooks/useThemeColors';
import React, { useState, useEffect, useCallback, useMemo } from 'react';

// Interfaces
interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  category: string;
  favorite: boolean;
  created: string;
  modified: string;
  strength: number;
  tags: string[];
}

interface GeneratorSettings {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

interface SecurityScore {
  overall: number;
  weakPasswords: number;
  reusedPasswords: number;
  oldPasswords: number;
  totalEntries: number;
}

interface PasswordManagerAppProps {
  isVisible: boolean;
  onClose: () => void;
}

// Common passwords list
const COMMON_PASSWORDS = [
  'password',
  '123456',
  'qwerty',
  'admin',
  'letmein',
  'welcome',
];

// Categories
const CATEGORIES = [
  {
    id: 'all',
    name: 'All Items',
    icon: 'folder',
    color: 'colors.brand.primary',
  },
  { id: 'logins', name: 'Logins', icon: 'key', color: 'colors.status.info' },
  {
    id: 'cards',
    name: 'Credit Cards',
    icon: 'card',
    color: 'colors.status.warning',
  },
  {
    id: 'identity',
    name: 'Identity',
    icon: 'id',
    color: 'colors.status.success',
  },
  {
    id: 'notes',
    name: 'Secure Notes',
    icon: 'note',
    color: 'colors.brand.primary',
  },
];

export default function PasswordManagerApp({
  isVisible,
  onClose,
}: PasswordManagerAppProps) {
  const colors = useThemeColors();
  // State
  const [activeTab, setActiveTab] = useState<
    'vault' | 'generator' | 'analyzer'
  >('vault');
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);

  // Generator state
  const [generatorSettings, setGeneratorSettings] = useState<GeneratorSettings>(
    {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    }
  );
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Analyzer state
  const [analyzePassword, setAnalyzePassword] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    category: 'logins',
  });

  // Load data from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('password-manager-v3');
      if (saved) {
        setEntries(JSON.parse(saved));
      }
    } catch (e) {}
  }, []);

  // Save data to localStorage
  useEffect(() => {
    if (entries.length > 0) {
      localStorage.setItem('password-manager-v3', JSON.stringify(entries));
    }
  }, [entries]);

  // Password strength analyzer
  const analyzeStrength = useCallback(
    (
      password: string
    ): { score: number; label: string; color: string; crackTime: string } => {
      if (!password) {
        return {
          score: 0,
          label: 'None',
          color: '#6b7280',
          crackTime: 'Instant',
        };
      }

      let score = 0;
      const hasLength = password.length >= 12;
      const hasUpper = /[A-Z]/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      const hasSymbol = /[^a-zA-Z0-9]/.test(password);
      const noCommon = !COMMON_PASSWORDS.some((p) =>
        password.toLowerCase().includes(p)
      );

      if (hasLength) score += 2;
      else if (password.length >= 8) score += 1;
      if (hasUpper) score += 1;
      if (hasLower) score += 1;
      if (hasNumber) score += 1;
      if (hasSymbol) score += 2;
      if (noCommon) score += 1;

      // Calculate crack time
      const charsetSize =
        (hasLower ? 26 : 0) +
        (hasUpper ? 26 : 0) +
        (hasNumber ? 10 : 0) +
        (hasSymbol ? 32 : 0);
      const combinations = Math.pow(charsetSize || 1, password.length);
      const secondsToCrack = combinations / 10000000000;

      let crackTime = 'Instant';
      if (secondsToCrack > 31536000000) crackTime = 'Centuries';
      else if (secondsToCrack > 31536000)
        crackTime = `${Math.floor(secondsToCrack / 31536000)} years`;
      else if (secondsToCrack > 86400)
        crackTime = `${Math.floor(secondsToCrack / 86400)} days`;
      else if (secondsToCrack > 3600)
        crackTime = `${Math.floor(secondsToCrack / 3600)} hours`;
      else if (secondsToCrack > 60)
        crackTime = `${Math.floor(secondsToCrack / 60)} minutes`;
      else if (secondsToCrack > 1)
        crackTime = `${Math.floor(secondsToCrack)} seconds`;

      let label: string;
      let color: string;
      if (score >= 8) {
        label = 'Excellent';
        color = '#059669';
      } else if (score >= 6) {
        label = 'Strong';
        color = 'colors.status.success';
      } else if (score >= 4) {
        label = 'Good';
        color = 'colors.status.warning';
      } else if (score >= 2) {
        label = 'Fair';
        color = '#f97316';
      } else {
        label = 'Weak';
        color = 'colors.status.error';
      }

      return { score, label, color, crackTime };
    },
    []
  );

  // Security score calculation
  const securityScore = useMemo((): SecurityScore => {
    if (entries.length === 0) {
      return {
        overall: 100,
        weakPasswords: 0,
        reusedPasswords: 0,
        oldPasswords: 0,
        totalEntries: 0,
      };
    }

    const weakPasswords = entries.filter((e) => e.strength < 5).length;
    const reusedPasswords =
      entries.length - new Set(entries.map((e) => e.password)).size;
    const oldPasswords = entries.filter((e) => {
      const modified = new Date(e.modified);
      const now = new Date();
      return (now.getTime() - modified.getTime()) / (1000 * 60 * 60 * 24) > 90;
    }).length;

    let overall = 100;
    overall -= (weakPasswords / entries.length) * 40;
    overall -= (reusedPasswords / entries.length) * 30;
    overall -= (oldPasswords / entries.length) * 30;

    return {
      overall: Math.max(0, Math.round(overall)),
      weakPasswords,
      reusedPasswords,
      oldPasswords,
      totalEntries: entries.length,
    };
  }, [entries]);

  // Generate AI security insight
  const generateSecurityInsight = useCallback((): string => {
    const {
      overall,
      weakPasswords,
      reusedPasswords,
      oldPasswords,
      totalEntries,
    } = securityScore;

    if (totalEntries === 0) {
      return 'Add your first password to start building a secure vault!';
    }

    const insights: string[] = [];

    // Overall score insights
    if (overall >= 90) {
      insights.push(
        'Excellent security! Your password vault is well-protected.'
      );
    } else if (overall >= 70) {
      insights.push(
        'Good security posture. A few improvements would strengthen your vault.'
      );
    } else if (overall >= 50) {
      insights.push(
        'Moderate security. Consider updating weak passwords soon.'
      );
    } else {
      insights.push(
        'Security needs attention! Multiple passwords require updates.'
      );
    }

    // Specific insights
    if (weakPasswords > 0) {
      insights.push(
        `${weakPasswords} password${weakPasswords > 1 ? 's are' : ' is'} weak. Use the generator for stronger ones.`
      );
    }

    if (reusedPasswords > 0) {
      insights.push(
        `${reusedPasswords} password${reusedPasswords > 1 ? 's are' : ' is'} reused. Each account needs a unique password.`
      );
    }

    if (oldPasswords > 0) {
      insights.push(
        `${oldPasswords} password${oldPasswords > 1 ? "s haven't" : " hasn't"} been updated in 90+ days.`
      );
    }

    if (totalEntries >= 10 && weakPasswords === 0 && reusedPasswords === 0) {
      insights.push(
        'Great job maintaining unique, strong passwords across all accounts!'
      );
    }

    // Tips
    const tips = [
      "Tip: Use passphrases - they're longer and easier to remember.",
      'Tip: Enable 2FA wherever possible for extra security.',
      'Tip: Regular password audits help maintain security hygiene.',
      'Tip: Never share passwords via email or messages.',
    ];

    if (Math.random() > 0.5) {
      insights.push(tips[Math.floor(Math.random() * tips.length)]);
    }

    return insights[Math.floor(Math.random() * insights.length)];
  }, [securityScore]);

  // Password generator
  const generatePassword = useCallback(() => {
    let chars = '';
    let result = '';

    if (generatorSettings.lowercase) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (generatorSettings.uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (generatorSettings.numbers) chars += '0123456789';
    if (generatorSettings.symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz';

    const array = new Uint32Array(generatorSettings.length);
    crypto.getRandomValues(array);

    for (let i = 0; i < generatorSettings.length; i++) {
      result += chars[array[i] % chars.length];
    }

    setGeneratedPassword(result);
  }, [generatorSettings]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {}
  }, []);

  // Add new entry
  const addEntry = useCallback(() => {
    if (!newEntry.title || !newEntry.password) return;

    const strength = analyzeStrength(newEntry.password);
    const entry: PasswordEntry = {
      id: `entry-${Date.now()}`,
      title: newEntry.title,
      username: newEntry.username,
      password: newEntry.password,
      url: newEntry.url,
      notes: newEntry.notes,
      category: newEntry.category,
      favorite: false,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      strength: strength.score,
      tags: [],
    };

    setEntries((prev) => [...prev, entry]);
    setNewEntry({
      title: '',
      username: '',
      password: '',
      url: '',
      notes: '',
      category: 'logins',
    });
    setShowAddModal(false);
  }, [newEntry, analyzeStrength]);

  // Delete entry
  const deleteEntry = useCallback(
    (id: string) => {
      setEntries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEntry?.id === id) {
        setSelectedEntry(null);
      }
    },
    [selectedEntry]
  );

  // Toggle favorite
  const toggleFavorite = useCallback((id: string) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, favorite: !e.favorite } : e))
    );
  }, []);

  // Filter entries
  const filteredEntries = useMemo(() => {
    let result = entries;

    if (selectedCategory !== 'all') {
      result = result.filter((e) => e.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.username.toLowerCase().includes(query) ||
          e.url?.toLowerCase().includes(query)
      );
    }

    // Favorites first, then by title
    return [...result].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return a.title.localeCompare(b.title);
    });
  }, [entries, selectedCategory, searchQuery]);

  // Export data
  const exportData = useCallback(() => {
    const data = JSON.stringify(entries, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }, [entries]);

  if (!isVisible) return null;

  // Glass card style helper
  const glassCard = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'colors.status.success';
    if (score >= 50) return 'colors.status.warning';
    return 'colors.status.error';
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem', color: 'white' }}>
            Password Manager
          </span>
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
          {/* Security Score */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.25rem 0.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: `2px solid ${getScoreColor(securityScore.overall)}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: '600',
                color: getScoreColor(securityScore.overall),
              }}
            >
              {securityScore.overall}
            </div>
            <span
              style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.7)' }}
            >
              Security
            </span>
          </div>
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
          >
            AI
          </button>
          <button
            onClick={exportData}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            Export
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

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.1)',
          flexShrink: 0,
        }}
      >
        {[
          { id: 'vault', label: 'Vault' },
          { id: 'generator', label: 'Generator' },
          { id: 'analyzer', label: 'Analyzer' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              background:
                activeTab === tab.id
                  ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
              border:
                activeTab === tab.id
                  ? '1px solid rgba(139, 92, 246, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color:
                activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontWeight: activeTab === tab.id ? '600' : '400',
              fontSize: '0.85rem',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '1rem',
        }}
      >
        {/* AI Security Insight */}
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
              <span style={{ fontSize: '1rem' }}>AI Security Advisor</span>
            </div>
            <p
              style={{
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: 0,
                lineHeight: '1.5',
              }}
            >
              {generateSecurityInsight()}
            </p>

            {/* Security Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.5rem',
                marginTop: '1rem',
              }}
            >
              {[
                {
                  label: 'Total',
                  value: securityScore.totalEntries,
                  color: 'colors.brand.primary',
                },
                {
                  label: 'Weak',
                  value: securityScore.weakPasswords,
                  color: 'colors.status.error',
                },
                {
                  label: 'Reused',
                  value: securityScore.reusedPasswords,
                  color: 'colors.status.warning',
                },
                {
                  label: 'Old',
                  value: securityScore.oldPasswords,
                  color: 'colors.brand.primary',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: stat.color,
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: '0.6rem',
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

        {/* Vault Tab */}
        {activeTab === 'vault' && (
          <div>
            {/* Search and Add */}
            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
            >
              <input
                type="text"
                placeholder="Search passwords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  padding: '0.6rem 1rem',
                  background:
                    'linear-gradient(135deg, colors.status.success 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                }}
              >
                + Add
              </button>
            </div>

            {/* Categories */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
              }}
            >
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    background:
                      selectedCategory === cat.id
                        ? 'rgba(255, 255, 255, 0.2)'
                        : 'rgba(255, 255, 255, 0.05)',
                    border:
                      selectedCategory === cat.id
                        ? `1px solid ${cat.color}`
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color:
                      selectedCategory === cat.id
                        ? 'white'
                        : 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name} (
                  {cat.id === 'all'
                    ? entries.length
                    : entries.filter((e) => e.category === cat.id).length}
                  )
                </button>
              ))}
            </div>

            {/* Entries List */}
            {filteredEntries.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '3rem',
                  color: 'rgba(255, 255, 255, 0.5)',
                }}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                  Key icon
                </div>
                <h3
                  style={{
                    margin: '0 0 0.5rem 0',
                    color: 'rgba(255, 255, 255, 0.7)',
                  }}
                >
                  No passwords yet
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>
                  Add your first password to get started
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
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
                  Add Password
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {filteredEntries.map((entry) => {
                  const strength = analyzeStrength(entry.password);
                  return (
                    <div
                      key={entry.id}
                      onClick={() =>
                        setSelectedEntry(
                          selectedEntry?.id === entry.id ? null : entry
                        )
                      }
                      style={{
                        ...glassCard,
                        padding: '0.75rem',
                        cursor: 'pointer',
                        borderColor:
                          selectedEntry?.id === entry.id
                            ? 'colors.brand.primary'
                            : 'rgba(255, 255, 255, 0.1)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background:
                              CATEGORIES.find((c) => c.id === entry.category)
                                ?.color || 'colors.brand.primary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                          }}
                        >
                          {entry.title.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                            }}
                          >
                            {entry.favorite && (
                              <span style={{ fontSize: '0.7rem' }}>*</span>
                            )}
                            <span
                              style={{
                                fontSize: '0.9rem',
                                fontWeight: '500',
                                color: 'white',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {entry.title}
                            </span>
                          </div>
                          <div
                            style={{
                              fontSize: '0.75rem',
                              color: 'rgba(255, 255, 255, 0.5)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {entry.username}
                          </div>
                        </div>

                        {/* Actions */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(entry.password, entry.id);
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '6px',
                            color:
                              copiedField === entry.id
                                ? 'colors.status.success'
                                : 'rgba(255, 255, 255, 0.6)',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                          }}
                        >
                          {copiedField === entry.id ? 'Copied' : 'Copy'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(entry.id);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            padding: '0.25rem',
                            cursor: 'pointer',
                            color: entry.favorite
                              ? 'colors.status.warning'
                              : 'rgba(255, 255, 255, 0.4)',
                            fontSize: '0.85rem',
                          }}
                        >
                          Fav
                        </button>

                        {/* Strength indicator */}
                        <span
                          style={{
                            fontSize: '0.65rem',
                            padding: '0.2rem 0.4rem',
                            borderRadius: '4px',
                            background: strength.color,
                            color: 'white',
                            fontWeight: '500',
                          }}
                        >
                          {strength.label}
                        </span>
                      </div>

                      {/* Expanded details */}
                      {selectedEntry?.id === entry.id && (
                        <div
                          style={{
                            marginTop: '0.75rem',
                            paddingTop: '0.75rem',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                          }}
                        >
                          <div style={{ marginBottom: '0.5rem' }}>
                            <label
                              style={{
                                fontSize: '0.7rem',
                                color: 'rgba(255, 255, 255, 0.5)',
                              }}
                            >
                              Password
                            </label>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                              }}
                            >
                              <span
                                style={{
                                  flex: 1,
                                  fontFamily: 'monospace',
                                  fontSize: '0.85rem',
                                  color: 'white',
                                }}
                              >
                                {showPassword[entry.id]
                                  ? entry.password
                                  : '*'.repeat(entry.password.length)}
                              </span>
                              <button
                                onClick={() =>
                                  setShowPassword((prev) => ({
                                    ...prev,
                                    [entry.id]: !prev[entry.id],
                                  }))
                                }
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'rgba(255, 255, 255, 0.6)',
                                  cursor: 'pointer',
                                  fontSize: '0.75rem',
                                }}
                              >
                                {showPassword[entry.id] ? 'Hide' : 'Show'}
                              </button>
                            </div>
                          </div>
                          {entry.url && (
                            <div style={{ marginBottom: '0.5rem' }}>
                              <label
                                style={{
                                  fontSize: '0.7rem',
                                  color: 'rgba(255, 255, 255, 0.5)',
                                }}
                              >
                                URL
                              </label>
                              <div
                                style={{
                                  fontSize: '0.85rem',
                                  color: 'colors.status.info',
                                }}
                              >
                                {entry.url}
                              </div>
                            </div>
                          )}
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'rgba(255, 255, 255, 0.4)',
                            }}
                          >
                            Crack time: {strength.crackTime}
                          </div>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            style={{
                              marginTop: '0.5rem',
                              padding: '0.4rem 0.8rem',
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '6px',
                              color: '#fca5a5',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Generator Tab */}
        {activeTab === 'generator' && (
          <div>
            {/* Generated Password Display */}
            <div
              style={{
                ...glassCard,
                padding: '1.5rem',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: '1.25rem',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  wordBreak: 'break-all',
                  color: 'white',
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {generatedPassword || 'Click Generate'}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  justifyContent: 'center',
                }}
              >
                <button
                  onClick={generatePassword}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background:
                      'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '600',
                  }}
                >
                  Generate
                </button>
                <button
                  onClick={() =>
                    copyToClipboard(generatedPassword, 'generated')
                  }
                  disabled={!generatedPassword}
                  style={{
                    padding: '0.75rem 1rem',
                    background: generatedPassword
                      ? 'colors.status.success'
                      : 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: generatedPassword ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                  }}
                >
                  {copiedField === 'generated' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {generatedPassword && (
                <div style={{ marginTop: '1rem' }}>
                  {(() => {
                    const s = analyzeStrength(generatedPassword);
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            maxWidth: '200px',
                            height: '6px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '3px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${(s.score / 10) * 100}%`,
                              height: '100%',
                              background: s.color,
                              borderRadius: '3px',
                            }}
                          />
                        </div>
                        <span style={{ color: s.color, fontSize: '0.85rem' }}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Settings */}
            <div
              style={{
                ...glassCard,
                padding: '1rem',
              }}
            >
              <h4
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.9rem',
                  color: 'white',
                }}
              >
                Settings
              </h4>

              {/* Length */}
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '0.5rem',
                  }}
                >
                  Length: {generatorSettings.length}
                </label>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={generatorSettings.length}
                  onChange={(e) =>
                    setGeneratorSettings((prev) => ({
                      ...prev,
                      length: parseInt(e.target.value),
                    }))
                  }
                  style={{ width: '100%' }}
                />
              </div>

              {/* Character types */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.5rem',
                }}
              >
                {[
                  { key: 'uppercase', label: 'Uppercase (A-Z)' },
                  { key: 'lowercase', label: 'Lowercase (a-z)' },
                  { key: 'numbers', label: 'Numbers (0-9)' },
                  { key: 'symbols', label: 'Symbols (!@#)' },
                ].map((opt) => (
                  <label
                    key={opt.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'rgba(255, 255, 255, 0.8)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={(generatorSettings as any)[opt.key]}
                      onChange={(e) =>
                        setGeneratorSettings((prev) => ({
                          ...prev,
                          [opt.key]: e.target.checked,
                        }))
                      }
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analyzer Tab */}
        {activeTab === 'analyzer' && (
          <div>
            <div
              style={{
                ...glassCard,
                padding: '1.5rem',
                textAlign: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3
                style={{
                  margin: '0 0 0.5rem 0',
                  fontSize: '1rem',
                  color: 'white',
                }}
              >
                Password Strength Analyzer
              </h3>
              <p
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                }}
              >
                Enter a password to analyze its strength
              </p>
              <input
                type={showPassword['analyzer'] ? 'text' : 'password'}
                placeholder="Enter password..."
                value={analyzePassword}
                onChange={(e) => setAnalyzePassword(e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '400px',
                  padding: '0.75rem 1rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '1rem',
                  textAlign: 'center',
                  outline: 'none',
                }}
              />
              <button
                onClick={() =>
                  setShowPassword((prev) => ({
                    ...prev,
                    analyzer: !prev.analyzer,
                  }))
                }
                style={{
                  marginLeft: '0.5rem',
                  padding: '0.75rem',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                {showPassword['analyzer'] ? 'Hide' : 'Show'}
              </button>
            </div>

            {analyzePassword && (
              <div
                style={{
                  ...glassCard,
                  padding: '1.5rem',
                }}
              >
                {(() => {
                  const result = analyzeStrength(analyzePassword);
                  return (
                    <>
                      {/* Score display */}
                      <div
                        style={{
                          textAlign: 'center',
                          marginBottom: '1.5rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '3rem',
                            fontWeight: '700',
                            color: result.color,
                          }}
                        >
                          {result.score}/10
                        </div>
                        <div
                          style={{
                            fontSize: '1.25rem',
                            fontWeight: '600',
                            color: result.color,
                          }}
                        >
                          {result.label}
                        </div>
                        <div
                          style={{
                            marginTop: '0.5rem',
                            fontSize: '0.85rem',
                            color: 'rgba(255, 255, 255, 0.6)',
                          }}
                        >
                          Time to crack:{' '}
                          <strong style={{ color: 'white' }}>
                            {result.crackTime}
                          </strong>
                        </div>
                      </div>

                      {/* Criteria checklist */}
                      <div
                        style={{
                          display: 'grid',
                          gap: '0.5rem',
                        }}
                      >
                        {[
                          {
                            check: analyzePassword.length >= 12,
                            label: 'At least 12 characters',
                          },
                          {
                            check: /[A-Z]/.test(analyzePassword),
                            label: 'Contains uppercase',
                          },
                          {
                            check: /[a-z]/.test(analyzePassword),
                            label: 'Contains lowercase',
                          },
                          {
                            check: /[0-9]/.test(analyzePassword),
                            label: 'Contains numbers',
                          },
                          {
                            check: /[^a-zA-Z0-9]/.test(analyzePassword),
                            label: 'Contains symbols',
                          },
                          {
                            check: !COMMON_PASSWORDS.some((p) =>
                              analyzePassword.toLowerCase().includes(p)
                            ),
                            label: 'No common words',
                          },
                        ].map((item, i) => (
                          <div
                            key={i}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem',
                              background: 'rgba(255, 255, 255, 0.05)',
                              borderRadius: '6px',
                            }}
                          >
                            <span
                              style={{
                                color: item.check
                                  ? 'colors.status.success'
                                  : 'colors.status.error',
                                fontSize: '0.85rem',
                              }}
                            >
                              {item.check ? 'Pass' : 'Fail'}
                            </span>
                            <span
                              style={{
                                fontSize: '0.85rem',
                                color: 'rgba(255, 255, 255, 0.8)',
                              }}
                            >
                              {item.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              ...glassCard,
              padding: '1.5rem',
              width: '90%',
              maxWidth: '400px',
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
              Add New Password
            </h3>

            {/* Title */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Title *
              </label>
              <input
                type="text"
                value={newEntry.title}
                onChange={(e) =>
                  setNewEntry((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g., Google Account"
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

            {/* Username */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={newEntry.username}
                onChange={(e) =>
                  setNewEntry((prev) => ({ ...prev, username: e.target.value }))
                }
                placeholder="e.g., john@example.com"
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

            {/* Password */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Password *
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type={showPassword['new'] ? 'text' : 'password'}
                  value={newEntry.password}
                  onChange={(e) =>
                    setNewEntry((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter password"
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '0.9rem',
                  }}
                />
                <button
                  onClick={() =>
                    setShowPassword((prev) => ({ ...prev, new: !prev.new }))
                  }
                  style={{
                    padding: '0.6rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                  }}
                >
                  {showPassword['new'] ? 'Hide' : 'Show'}
                </button>
              </div>
              {newEntry.password && (
                <div
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.75rem',
                    color: analyzeStrength(newEntry.password).color,
                  }}
                >
                  {analyzeStrength(newEntry.password).label}
                </div>
              )}
            </div>

            {/* URL */}
            <div style={{ marginBottom: '0.75rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '0.25rem',
                }}
              >
                Website URL
              </label>
              <input
                type="url"
                value={newEntry.url}
                onChange={(e) =>
                  setNewEntry((prev) => ({ ...prev, url: e.target.value }))
                }
                placeholder="https://example.com"
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
                value={newEntry.category}
                onChange={(e) =>
                  setNewEntry((prev) => ({ ...prev, category: e.target.value }))
                }
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
                {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    style={{ background: '#1a1a2e' }}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
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
                onClick={() => setShowAddModal(false)}
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
                onClick={addEntry}
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
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
