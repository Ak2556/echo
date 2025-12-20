'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  memo,
} from 'react';
import {
  getHolidaysForYear,
  getHolidayForDate,
  type Holiday,
} from '@/utils/holidaysData';
import { useTheme } from '@/contexts/ThemeContext';

// Types
interface Event {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  time: string;
  endTime?: string;
  type:
    | 'meeting'
    | 'reminder'
    | 'event'
    | 'task'
    | 'birthday'
    | 'holiday'
    | 'focus'
    | 'workout';
  description?: string;
  location?: string;
  category?: string;
  color?: string;
  isAllDay?: boolean;
  isRecurring?: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    daysOfWeek?: number[];
  };
  reminder?: number; // minutes before
  attendees?: string[];
  url?: string;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  attachments?: string[];
  timeZone?: string;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  period: 'daily' | 'weekly' | 'monthly';
  color: string;
}

interface CalendarAppProps {
  isVisible: boolean;
  onClose: () => void;
}

type ViewMode = 'month' | 'week' | 'day' | 'agenda' | 'year';

interface WeatherData {
  temp: number;
  condition: string;
  icon: string;
}

// Color palette for events
const EVENT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
];

// Event type icons
const EVENT_ICONS: Record<Event['type'], string> = {
  meeting: '👥',
  reminder: '🔔',
  event: '📅',
  task: '✓',
  birthday: '🎂',
  holiday: '🎉',
  focus: '🎯',
  workout: '💪',
};

const CalendarApp = memo(({ isVisible, onClose }: CalendarAppProps) => {
  // Theme
  const { colorMode } = useTheme();
  const isDark = colorMode === 'dark';

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMiniCalendar, setShowMiniCalendar] = useState(true);
  const [weather, setWeather] = useState<Record<string, WeatherData>>({});
  const [draggedEvent, setDraggedEvent] = useState<Event | null>(null);
  const [showConflicts, setShowConflicts] = useState(false);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>(''); // Empty = all countries

  // Settings
  const [settings, setSettings] = useState({
    firstDayOfWeek: 0, // 0 = Sunday, 1 = Monday
    timeFormat: '12h' as '12h' | '24h',
    showWeekNumbers: false,
    defaultView: 'month' as ViewMode,
    defaultEventDuration: 60, // minutes
    workingHours: { start: 9, end: 17 },
    showDeclinedEvents: false,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '09:00',
    endTime: '10:00',
    type: 'event',
    description: '',
    location: '',
    color: '#3b82f6',
    isAllDay: false,
    priority: 'medium',
    status: 'confirmed',
    reminder: 15,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const fullDayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Load data from localStorage
  useEffect(() => {
    try {
      const savedEvents = localStorage.getItem('calendar-events-v4');
      const savedGoals = localStorage.getItem('calendar-goals-v1');
      const savedSettings = localStorage.getItem('calendar-settings-v1');

      if (savedEvents) setEvents(JSON.parse(savedEvents));
      if (savedGoals) setGoals(JSON.parse(savedGoals));
      if (savedSettings)
        setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
    } catch (e) {
      console.error('Error loading calendar data:', e);
    }
  }, []);

  // Save data to localStorage with debounce
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('calendar-events-v4', JSON.stringify(events));
      localStorage.setItem('calendar-goals-v1', JSON.stringify(goals));
      localStorage.setItem('calendar-settings-v1', JSON.stringify(settings));
    }, 500);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [events, goals, settings]);

  // Generate mock weather data
  useEffect(() => {
    const generateWeather = () => {
      const conditions = ['☀️', '⛅', '☁️', '🌧️', '⛈️', '❄️'];
      const newWeather: Record<string, WeatherData> = {};

      for (let i = 0; i < 14; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        newWeather[dateStr] = {
          temp: Math.floor(Math.random() * 20 + 15),
          condition: conditions[Math.floor(Math.random() * conditions.length)],
          icon: conditions[Math.floor(Math.random() * conditions.length)],
        };
      }
      setWeather(newWeather);
    };
    generateWeather();
  }, []);

  // Load holidays for current year and country
  useEffect(() => {
    const year = currentDate.getFullYear();
    const yearHolidays = getHolidaysForYear(year, selectedCountry);
    setHolidays(yearHolidays);
  }, [currentDate, selectedCountry]);

  // Categories derived from events
  const categories = useMemo(() => {
    const cats = new Set(events.map((e) => e.category).filter(Boolean));
    return ['all', ...Array.from(cats)] as string[];
  }, [events]);

  // Filtered events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((e) => e.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.description?.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [events, selectedCategory, searchQuery]);

  // Schedule statistics
  const scheduleStats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const eventsByDate = new Map<string, number>();
    const eventsByHour = new Map<number, number>();

    let upcoming = 0;
    let todayCount = 0;
    let thisWeekCount = 0;
    let overdue = 0;
    const typeCount: Record<string, number> = {};

    events.forEach((event) => {
      const eventDate = new Date(`${event.date}T${event.time || '00:00'}`);

      if (eventDate >= now) upcoming++;
      else if (event.status !== 'completed') overdue++;

      if (event.date === today) todayCount++;

      const eventDateOnly = new Date(event.date);
      if (eventDateOnly >= weekStart && eventDateOnly <= weekEnd)
        thisWeekCount++;

      typeCount[event.type] = (typeCount[event.type] || 0) + 1;

      const count = eventsByDate.get(event.date) || 0;
      eventsByDate.set(event.date, count + 1);

      if (event.time) {
        const hour = parseInt(event.time.split(':')[0]);
        eventsByHour.set(hour, (eventsByHour.get(hour) || 0) + 1);
      }
    });

    let busiestDay = '';
    let busiestDayCount = 0;
    eventsByDate.forEach((count, date) => {
      if (count > busiestDayCount) {
        busiestDayCount = count;
        busiestDay = date;
      }
    });

    let peakHour = 9;
    let peakHourCount = 0;
    eventsByHour.forEach((count, hour) => {
      if (count > peakHourCount) {
        peakHourCount = count;
        peakHour = hour;
      }
    });

    // Calculate productivity score (0-100)
    const completedTasks = events.filter(
      (e) => e.status === 'completed'
    ).length;
    const totalTasks = events.filter((e) => e.type === 'task').length;
    const productivityScore =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    return {
      totalEvents: events.length,
      upcomingEvents: upcoming,
      todayEvents: todayCount,
      thisWeekEvents: thisWeekCount,
      overdueEvents: overdue,
      typeCount,
      busiestDay,
      busiestDayCount,
      peakHour,
      productivityScore,
    };
  }, [events]);

  // Check for conflicts
  const conflicts = useMemo(() => {
    const conflictPairs: [Event, Event][] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const e1 = events[i];
        const e2 = events[j];

        if (e1.date !== e2.date || e1.isAllDay || e2.isAllDay) continue;

        const start1 = parseInt(e1.time.replace(':', ''));
        const end1 = parseInt((e1.endTime || e1.time).replace(':', ''));
        const start2 = parseInt(e2.time.replace(':', ''));
        const end2 = parseInt((e2.endTime || e2.time).replace(':', ''));

        if (start1 < end2 && end1 > start2) {
          conflictPairs.push([e1, e2]);
        }
      }
    }

    return conflictPairs;
  }, [events]);

  // Generate AI scheduling insight
  const generateScheduleInsight = useCallback((): {
    main: string;
    tips: string[];
  } => {
    const {
      totalEvents,
      upcomingEvents,
      todayEvents,
      thisWeekEvents,
      overdueEvents,
      busiestDay,
      peakHour,
      productivityScore,
    } = scheduleStats;

    if (totalEvents === 0) {
      return {
        main: 'Your calendar is empty! Start by adding your first event to organize your schedule.',
        tips: [
          'Try adding a daily routine',
          'Set up recurring reminders',
          'Block focus time',
        ],
      };
    }

    const insights: string[] = [];
    const tips: string[] = [];

    // Productivity insight
    if (productivityScore >= 80) {
      insights.push(
        `Excellent! Your productivity score is ${productivityScore}%. Keep it up! 🌟`
      );
    } else if (productivityScore >= 50) {
      insights.push(
        `Your productivity score is ${productivityScore}%. Room for improvement!`
      );
      tips.push('Break large tasks into smaller ones');
    } else {
      insights.push(
        `Your productivity score is ${productivityScore}%. Let's work on completing more tasks.`
      );
      tips.push('Focus on 3 most important tasks each day');
    }

    // Today insights
    if (todayEvents === 0) {
      insights.push('Today is clear - perfect for deep work or catching up!');
    } else if (todayEvents > 5) {
      insights.push(
        `Packed day with ${todayEvents} events! Prioritize ruthlessly.`
      );
      tips.push('Consider rescheduling non-essential meetings');
    }

    // Overdue
    if (overdueEvents > 0) {
      tips.push(
        `You have ${overdueEvents} overdue items - review and reschedule`
      );
    }

    // Peak hours
    tips.push(`Your peak activity is at ${peakHour}:00 - protect this time!`);

    // Week ahead
    if (thisWeekEvents > 20) {
      tips.push('Heavy week ahead - ensure you have buffer time');
    }

    // Busiest day
    if (busiestDay) {
      const date = new Date(busiestDay);
      tips.push(
        `${fullDayNames[date.getDay()]} is your busiest day with ${scheduleStats.busiestDayCount} events`
      );
    }

    return {
      main:
        insights[Math.floor(Math.random() * insights.length)] ||
        'Keep organizing your schedule!',
      tips: tips.slice(0, 4),
    };
  }, [scheduleStats]);

  // Calendar calculations
  const getDaysInMonth = useCallback((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayOfMonth = useCallback((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }, []);

  const getWeekNumber = useCallback((date: Date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }, []);

  const changeMonth = useCallback((direction: number) => {
    setCurrentDate(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + direction, 1)
    );
  }, []);

  const changeWeek = useCallback((direction: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction * 7);
      return newDate;
    });
  }, []);

  const changeDay = useCallback((direction: number) => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
      newDate.setDate(prev.getDate() + direction);
      return newDate;
    });
  }, []);

  const getEventsForDate = useCallback(
    (date: Date): Event[] => {
      const dateStr = date.toISOString().split('T')[0];
      return filteredEvents
        .filter((event) => {
          if (event.date === dateStr) return true;

          // Check for multi-day events
          if (event.endDate) {
            const eventStart = new Date(event.date);
            const eventEnd = new Date(event.endDate);
            return date >= eventStart && date <= eventEnd;
          }

          // Check for recurring events
          if (event.isRecurring && event.recurrence) {
            const eventDate = new Date(event.date);
            const checkDate = new Date(dateStr);

            if (checkDate < eventDate) return false;
            if (
              event.recurrence.endDate &&
              checkDate > new Date(event.recurrence.endDate)
            )
              return false;

            const daysDiff = Math.floor(
              (checkDate.getTime() - eventDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );

            switch (event.recurrence.frequency) {
              case 'daily':
                return daysDiff % event.recurrence.interval === 0;
              case 'weekly':
                if (event.recurrence.daysOfWeek) {
                  return event.recurrence.daysOfWeek.includes(
                    checkDate.getDay()
                  );
                }
                return daysDiff % (7 * event.recurrence.interval) === 0;
              case 'monthly':
                return (
                  eventDate.getDate() === checkDate.getDate() &&
                  ((checkDate.getMonth() - eventDate.getMonth() + 12) % 12) %
                    event.recurrence.interval ===
                    0
                );
              case 'yearly':
                return (
                  eventDate.getDate() === checkDate.getDate() &&
                  eventDate.getMonth() === checkDate.getMonth()
                );
            }
          }

          return false;
        })
        .sort((a, b) => {
          if (a.isAllDay && !b.isAllDay) return -1;
          if (!a.isAllDay && b.isAllDay) return 1;
          return a.time.localeCompare(b.time);
        });
    },
    [filteredEvents]
  );

  // Event operations
  const addEvent = useCallback(() => {
    if (newEvent.title && newEvent.date) {
      const event: Event = {
        id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: newEvent.title,
        date: newEvent.date,
        endDate: newEvent.endDate,
        time: newEvent.time || '00:00',
        endTime: newEvent.endTime,
        type: newEvent.type || 'event',
        description: newEvent.description,
        location: newEvent.location,
        color: newEvent.color || '#3b82f6',
        isAllDay: newEvent.isAllDay,
        isRecurring: newEvent.isRecurring,
        recurrence: newEvent.recurrence,
        reminder: newEvent.reminder,
        attendees: newEvent.attendees,
        url: newEvent.url,
        notes: newEvent.notes,
        priority: newEvent.priority,
        status: newEvent.status || 'confirmed',
        category: newEvent.category,
        timeZone: settings.timezone,
      };
      setEvents((prev) => [...prev, event]);
      setNewEvent({
        title: '',
        date: '',
        time: '09:00',
        endTime: '10:00',
        type: 'event',
        description: '',
        location: '',
        color: '#3b82f6',
        isAllDay: false,
        priority: 'medium',
        status: 'confirmed',
        reminder: 15,
      });
      setShowAddEvent(false);
    }
  }, [newEvent, settings.timezone]);

  const updateEvent = useCallback(() => {
    if (editingEvent && editingEvent.title && editingEvent.date) {
      setEvents((prev) =>
        prev.map((e) => (e.id === editingEvent.id ? editingEvent : e))
      );
      setEditingEvent(null);
    }
  }, [editingEvent]);

  const deleteEvent = useCallback((id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setEditingEvent(null);
  }, []);

  const duplicateEvent = useCallback((event: Event) => {
    const newEvent: Event = {
      ...event,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: `${event.title} (Copy)`,
    };
    setEvents((prev) => [...prev, newEvent]);
  }, []);

  const completeEvent = useCallback((id: string) => {
    setEvents((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              status: e.status === 'completed' ? 'confirmed' : 'completed',
            }
          : e
      )
    );
  }, []);

  // Import/Export
  const exportToICS = useCallback(() => {
    let icsContent =
      'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Echo Calendar//EN\n';

    events.forEach((event) => {
      const startDate = event.date.replace(/-/g, '');
      const endDate = event.endDate?.replace(/-/g, '') || startDate;
      const startTime = event.time.replace(':', '') + '00';
      const endTime = (event.endTime || event.time).replace(':', '') + '00';

      icsContent += 'BEGIN:VEVENT\n';
      icsContent += `UID:${event.id}@echo-calendar\n`;
      icsContent += `DTSTART:${startDate}T${startTime}\n`;
      icsContent += `DTEND:${endDate}T${endTime}\n`;
      icsContent += `SUMMARY:${event.title}\n`;
      if (event.description) icsContent += `DESCRIPTION:${event.description}\n`;
      if (event.location) icsContent += `LOCATION:${event.location}\n`;
      icsContent += 'END:VEVENT\n';
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echo-calendar-${new Date().toISOString().split('T')[0]}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  }, [events]);

  const exportToJSON = useCallback(() => {
    const data = {
      events,
      goals,
      settings,
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `echo-calendar-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [events, goals, settings]);

  // Goals
  const addGoal = useCallback((goal: Omit<Goal, 'id'>) => {
    const newGoal: Goal = {
      ...goal,
      id: `goal-${Date.now()}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  }, []);

  const updateGoalProgress = useCallback((id: string, progress: number) => {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === id ? { ...g, current: Math.min(progress, g.target) } : g
      )
    );
  }, []);

  // Format time
  const formatTime = useCallback(
    (time: string) => {
      if (settings.timeFormat === '24h') return time;
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    },
    [settings.timeFormat]
  );

  // Keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (ctrl && e.key === 'n') {
        e.preventDefault();
        setShowAddEvent(true);
      }
      if (e.key === 'Escape') {
        setShowAddEvent(false);
        setEditingEvent(null);
        setShowSettings(false);
        setShowGoals(false);
      }
      if (e.key === 't' && !e.ctrlKey) {
        setCurrentDate(new Date());
        setSelectedDate(new Date());
      }
      if (e.key === 'ArrowLeft' && ctrl) {
        changeMonth(-1);
      }
      if (e.key === 'ArrowRight' && ctrl) {
        changeMonth(1);
      }
      if (e.key === '1') setViewMode('month');
      if (e.key === '2') setViewMode('week');
      if (e.key === '3') setViewMode('day');
      if (e.key === '4') setViewMode('agenda');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, changeMonth]);

  if (!isVisible) return null;

  const selectedDateEvents = getEventsForDate(selectedDate);
  const today = new Date();

  // Theme-aware colors
  const colors = {
    bg: isDark ? '#1a1a2e' : '#ffffff',
    bgSecondary: isDark ? '#16213e' : '#f8f9fa',
    bgTertiary: isDark ? '#0f3460' : '#e9ecef',
    text: isDark ? '#ffffff' : '#1a1a2e',
    textSecondary: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
    textMuted: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.5)',
    textLight: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.4)',
    textVeryLight: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)',
    textExtremeLight: isDark
      ? 'rgba(255, 255, 255, 0.3)'
      : 'rgba(0, 0, 0, 0.25)',
    border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    borderStrong: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
    cardBg: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    cardBgHover: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    inputBg: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    modalOverlay: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
    labelText: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
    accent: '#667eea',
    accentSecondary: '#764ba2',
    success: '#10b981',
    warning: '#f59e0b',
    warningLight: '#fbbf24',
    error: '#ef4444',
    errorLight: isDark ? '#fca5a5' : '#ef4444',
    errorBg: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)',
    errorBgHover: isDark ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.15)',
  };

  // Styles
  const glassCard: React.CSSProperties = {
    background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    backdropFilter: 'blur(20px)',
    borderRadius: '12px',
    border: `1px solid ${colors.border}`,
  };

  const buttonStyle: React.CSSProperties = {
    background: colors.inputBg,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: '8px',
    padding: '0.4rem 0.6rem',
    color: colors.text,
    cursor: 'pointer',
    fontSize: '0.75rem',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.6rem',
    background: colors.inputBg,
    border: `1px solid ${colors.borderStrong}`,
    borderRadius: '6px',
    color: colors.text,
    fontSize: '0.85rem',
  };

  // Render Month View
  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Previous month days
    const prevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const prevMonthDays = getDaysInMonth(prevMonth);
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      const date = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), day);
      days.push(renderDayCell(date, true));
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      days.push(renderDayCell(date, false));
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        day
      );
      days.push(renderDayCell(date, true));
    }

    return (
      <div style={{ ...glassCard, padding: '0.75rem' }}>
        {/* Day Headers */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: settings.showWeekNumbers
              ? '30px repeat(7, 1fr)'
              : 'repeat(7, 1fr)',
            gap: '0.25rem',
            marginBottom: '0.5rem',
          }}
        >
          {settings.showWeekNumbers && (
            <div style={{ fontSize: '0.6rem', color: colors.textExtremeLight }}>
              Wk
            </div>
          )}
          {dayNames.map((day) => (
            <div
              key={day}
              style={{
                textAlign: 'center',
                fontSize: '0.7rem',
                fontWeight: '500',
                color: colors.textLight,
                padding: '0.25rem',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: settings.showWeekNumbers
              ? '30px repeat(7, 1fr)'
              : 'repeat(7, 1fr)',
            gap: '0.25rem',
          }}
        >
          {days.map((day, i) => {
            if (settings.showWeekNumbers && i % 7 === 0) {
              const weekDate = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                (i / 7) * 7 - firstDay + 1
              );
              return (
                <React.Fragment key={`week-${i}`}>
                  <div
                    style={{
                      fontSize: '0.6rem',
                      color: colors.textExtremeLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {getWeekNumber(weekDate)}
                  </div>
                  {day}
                </React.Fragment>
              );
            }
            return day;
          })}
        </div>
      </div>
    );
  };

  const renderDayCell = (date: Date, isOutsideMonth: boolean) => {
    const isToday = date.toDateString() === today.toDateString();
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const dayEvents = getEventsForDate(date);
    const dateStr = date.toISOString().split('T')[0];
    const dayWeather = weather[dateStr];
    const dayHoliday = getHolidayForDate(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      selectedCountry
    );

    return (
      <div
        key={date.toISOString()}
        onClick={() => setSelectedDate(date)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (draggedEvent) {
            setEvents((prev) =>
              prev.map((ev) =>
                ev.id === draggedEvent.id ? { ...ev, date: dateStr } : ev
              )
            );
            setDraggedEvent(null);
          }
        }}
        style={{
          minHeight: '60px',
          height: '60px',
          padding: '0.25rem',
          cursor: 'pointer',
          background: isSelected
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : isToday
              ? 'rgba(102, 126, 234, 0.2)'
              : isOutsideMonth
                ? 'rgba(255, 255, 255, 0.02)'
                : 'rgba(255, 255, 255, 0.05)',
          border:
            isToday && !isSelected
              ? '1px solid rgba(102, 126, 234, 0.5)'
              : '1px solid transparent',
          borderRadius: '6px',
          display: 'flex',
          flexDirection: 'column',
          opacity: isOutsideMonth ? 0.5 : 1,
          WebkitTapHighlightColor: 'transparent',
          userSelect: 'none',
          willChange: 'auto',
          contain: 'layout style paint',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: isToday ? '600' : '400',
                color: isSelected
                  ? colors.text
                  : dayHoliday
                    ? colors.warning
                    : colors.textSecondary,
                pointerEvents: 'none',
              }}
            >
              {date.getDate()}
            </span>
            {dayHoliday && (
              <span
                style={{ fontSize: '0.55rem', pointerEvents: 'none' }}
                title={dayHoliday.name}
              >
                🎉
              </span>
            )}
          </div>
          {dayWeather && (
            <span style={{ fontSize: '0.6rem', pointerEvents: 'none' }}>
              {dayWeather.icon}
            </span>
          )}
        </div>

        {dayHoliday && (
          <div
            style={{
              fontSize: '0.5rem',
              color: colors.warningLight,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              pointerEvents: 'none',
              marginTop: '1px',
            }}
            title={dayHoliday.description}
          >
            {dayHoliday.name}
          </div>
        )}

        {dayEvents.length > 0 && (
          <div
            style={{
              marginTop: '2px',
              overflow: 'hidden',
              flex: 1,
              pointerEvents: 'none',
            }}
          >
            {dayEvents.slice(0, 3).map((event, idx) => (
              <div
                key={event.id}
                style={{
                  fontSize: '0.55rem',
                  padding: '1px 3px',
                  marginBottom: '1px',
                  background: event.color || colors.accent,
                  borderRadius: '2px',
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  opacity: event.status === 'completed' ? 0.6 : 1,
                  textDecoration:
                    event.status === 'completed' ? 'line-through' : 'none',
                  pointerEvents: 'none',
                }}
              >
                {event.isAllDay
                  ? ''
                  : formatTime(event.time).split(' ')[0] + ' '}
                {event.title}
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div
                style={{
                  fontSize: '0.5rem',
                  color: colors.textMuted,
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                +{dayEvents.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Week View
  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(
      currentDate.getDate() - currentDate.getDay() + settings.firstDayOfWeek
    );

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      return date;
    });

    return (
      <div
        style={{
          ...glassCard,
          padding: '0.5rem',
          overflow: 'auto',
          maxHeight: '500px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '50px repeat(7, 1fr)',
            gap: '1px',
            marginBottom: '0.5rem',
            position: 'sticky',
            top: 0,
            background: colors.bg,
            zIndex: 10,
            padding: '0.5rem 0',
          }}
        >
          <div></div>
          {weekDays.map((date) => (
            <div
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              style={{
                textAlign: 'center',
                padding: '0.5rem',
                cursor: 'pointer',
                background:
                  date.toDateString() === today.toDateString()
                    ? 'rgba(102, 126, 234, 0.3)'
                    : 'transparent',
                borderRadius: '6px',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: colors.textLight }}>
                {dayNames[date.getDay()]}
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '600' }}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '50px repeat(7, 1fr)',
            gap: '1px',
          }}
        >
          {hours.map((hour) => (
            <React.Fragment key={hour}>
              <div
                style={{
                  fontSize: '0.6rem',
                  color: colors.textVeryLight,
                  textAlign: 'right',
                  paddingRight: '0.5rem',
                  height: '40px',
                }}
              >
                {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
              </div>
              {weekDays.map((date) => {
                const dateStr = date.toISOString().split('T')[0];
                const hourEvents = filteredEvents.filter(
                  (e) =>
                    e.date === dateStr &&
                    !e.isAllDay &&
                    parseInt(e.time.split(':')[0]) === hour
                );

                return (
                  <div
                    key={`${dateStr}-${hour}`}
                    onClick={() => {
                      setSelectedDate(date);
                      setNewEvent((prev) => ({
                        ...prev,
                        date: dateStr,
                        time: `${hour.toString().padStart(2, '0')}:00`,
                      }));
                      setShowAddEvent(true);
                    }}
                    style={{
                      height: '40px',
                      background:
                        hour >= settings.workingHours.start &&
                        hour < settings.workingHours.end
                          ? colors.cardBg
                          : isDark
                            ? 'rgba(0,0,0,0.1)'
                            : 'rgba(0,0,0,0.02)',
                      borderBottom: `1px solid ${colors.border}`,
                      cursor: 'pointer',
                      position: 'relative',
                    }}
                  >
                    {hourEvents.map((event) => (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingEvent(event);
                        }}
                        style={{
                          position: 'absolute',
                          left: '2px',
                          right: '2px',
                          top: '2px',
                          padding: '2px 4px',
                          background: event.color || colors.accent,
                          borderRadius: '3px',
                          fontSize: '0.6rem',
                          color: '#ffffff',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Render Day View
  const renderDayView = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayEvents = getEventsForDate(selectedDate);
    const allDayEvents = dayEvents.filter((e) => e.isAllDay);
    const timedEvents = dayEvents.filter((e) => !e.isAllDay);

    return (
      <div style={{ ...glassCard, padding: '0.75rem' }}>
        {/* Date Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <button onClick={() => changeDay(-1)} style={buttonStyle}>
            ←
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: '600' }}>
              {fullDayNames[selectedDate.getDay()]}
            </div>
            <div style={{ fontSize: '0.8rem', color: colors.textMuted }}>
              {monthNames[selectedDate.getMonth()]} {selectedDate.getDate()},{' '}
              {selectedDate.getFullYear()}
            </div>
          </div>
          <button onClick={() => changeDay(1)} style={buttonStyle}>
            →
          </button>
        </div>

        {/* All Day Events */}
        {allDayEvents.length > 0 && (
          <div
            style={{
              marginBottom: '1rem',
              padding: '0.5rem',
              background: colors.cardBg,
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                fontSize: '0.7rem',
                color: colors.textLight,
                marginBottom: '0.5rem',
              }}
            >
              All Day
            </div>
            {allDayEvents.map((event) => (
              <div
                key={event.id}
                onClick={() => setEditingEvent(event)}
                style={{
                  padding: '0.5rem',
                  background: event.color || colors.accent,
                  borderRadius: '6px',
                  marginBottom: '0.25rem',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                {EVENT_ICONS[event.type]} {event.title}
              </div>
            ))}
          </div>
        )}

        {/* Hourly Timeline */}
        <div style={{ maxHeight: '400px', overflow: 'auto' }}>
          {hours.map((hour) => {
            const hourEvents = timedEvents.filter(
              (e) => parseInt(e.time.split(':')[0]) === hour
            );
            const isWorkingHour =
              hour >= settings.workingHours.start &&
              hour < settings.workingHours.end;

            return (
              <div
                key={hour}
                onClick={() => {
                  setNewEvent((prev) => ({
                    ...prev,
                    date: dateStr,
                    time: `${hour.toString().padStart(2, '0')}:00`,
                  }));
                  setShowAddEvent(true);
                }}
                style={{
                  display: 'flex',
                  borderBottom: `1px solid ${colors.border}`,
                  minHeight: '50px',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    width: '60px',
                    fontSize: '0.7rem',
                    color: colors.textVeryLight,
                    padding: '0.5rem',
                    flexShrink: 0,
                  }}
                >
                  {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: '0.25rem',
                    background: isWorkingHour
                      ? 'rgba(255,255,255,0.02)'
                      : 'transparent',
                  }}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingEvent(event);
                      }}
                      style={{
                        padding: '0.5rem',
                        background: event.color || '#3b82f6',
                        borderRadius: '6px',
                        marginBottom: '0.25rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ fontWeight: '500' }}>{event.title}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                        {formatTime(event.time)} -{' '}
                        {formatTime(event.endTime || event.time)}
                        {event.location && ` • ${event.location}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Agenda View
  const renderAgendaView = () => {
    const upcomingEvents = filteredEvents
      .filter((e) => new Date(`${e.date}T${e.time || '00:00'}`) >= today)
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time || '00:00'}`);
        const dateB = new Date(`${b.date}T${b.time || '00:00'}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 50);

    // Group by date
    const groupedEvents: Record<string, Event[]> = {};
    upcomingEvents.forEach((event) => {
      if (!groupedEvents[event.date]) groupedEvents[event.date] = [];
      groupedEvents[event.date].push(event);
    });

    return (
      <div
        style={{
          ...glassCard,
          padding: '0.75rem',
          maxHeight: '500px',
          overflow: 'auto',
        }}
      >
        <div
          style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1rem' }}
        >
          Upcoming Events
        </div>

        {Object.entries(groupedEvents).length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2rem',
              color: colors.textLight,
            }}
          >
            No upcoming events
          </div>
        ) : (
          Object.entries(groupedEvents).map(([date, events]) => {
            const dateObj = new Date(date);
            const isToday = dateObj.toDateString() === today.toDateString();
            const isTomorrow =
              dateObj.toDateString() ===
              new Date(today.getTime() + 86400000).toDateString();

            return (
              <div key={date} style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    color: isToday
                      ? colors.success
                      : isTomorrow
                        ? colors.warning
                        : colors.textSecondary,
                    marginBottom: '0.5rem',
                    padding: '0.5rem',
                    background: colors.cardBg,
                    borderRadius: '6px',
                  }}
                >
                  {isToday
                    ? 'Today'
                    : isTomorrow
                      ? 'Tomorrow'
                      : fullDayNames[dateObj.getDay()]}
                  {' • '}
                  {monthNames[dateObj.getMonth()]} {dateObj.getDate()}
                </div>

                {events.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => setEditingEvent(event)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      marginLeft: '1rem',
                      borderLeft: `3px solid ${event.color || colors.accent}`,
                      background: colors.cardBg,
                      borderRadius: '0 6px 6px 0',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      WebkitTapHighlightColor: 'transparent',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.2rem' }}>
                      {EVENT_ICONS[event.type]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontWeight: '500',
                          fontSize: '0.9rem',
                          textDecoration:
                            event.status === 'completed'
                              ? 'line-through'
                              : 'none',
                          opacity: event.status === 'completed' ? 0.6 : 1,
                        }}
                      >
                        {event.title}
                      </div>
                      <div
                        style={{ fontSize: '0.75rem', color: colors.textMuted }}
                      >
                        {event.isAllDay
                          ? 'All day'
                          : `${formatTime(event.time)} - ${formatTime(event.endTime || event.time)}`}
                        {event.location && ` • ${event.location}`}
                      </div>
                      {event.description && (
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: colors.textVeryLight,
                            marginTop: '0.25rem',
                          }}
                        >
                          {event.description.slice(0, 100)}...
                        </div>
                      )}
                    </div>
                    {event.priority === 'high' && (
                      <span style={{ fontSize: '0.6rem', color: colors.error }}>
                        HIGH
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: isDark
          ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)',
        overflow: 'hidden',
        position: 'relative',
        fontFamily:
          "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1400px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            borderBottom: `1px solid ${colors.border}`,
            background: isDark
              ? 'rgba(0, 0, 0, 0.2)'
              : 'rgba(255, 255, 255, 0.5)',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                fontSize: '1rem',
                color: colors.text,
                fontWeight: '600',
              }}
            >
              📅 Calendar
            </span>
            <span
              style={{
                fontSize: '0.6rem',
                padding: '0.15rem 0.4rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '4px',
                color: 'white',
              }}
            >
              PRO
            </span>
          </div>

          <div
            style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}
          >
            {/* View Mode Buttons */}
            {(['month', 'week', 'day', 'agenda'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  ...buttonStyle,
                  background:
                    viewMode === mode
                      ? 'rgba(102, 126, 234, 0.3)'
                      : 'rgba(255, 255, 255, 0.1)',
                  padding: '0.3rem 0.5rem',
                  fontSize: '0.65rem',
                }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}

            <button
              onClick={() => setShowAI(!showAI)}
              style={{
                ...buttonStyle,
                background: showAI
                  ? 'rgba(139, 92, 246, 0.3)'
                  : 'rgba(255, 255, 255, 0.1)',
                padding: '0.3rem 0.5rem',
              }}
            >
              🤖
            </button>

            <button
              onClick={() => setShowGoals(!showGoals)}
              style={{
                ...buttonStyle,
                padding: '0.3rem 0.5rem',
              }}
            >
              🎯
            </button>

            <button
              onClick={() => {
                setCurrentDate(new Date());
                setSelectedDate(new Date());
              }}
              style={{ ...buttonStyle, padding: '0.3rem 0.5rem' }}
            >
              Today
            </button>

            <button
              onClick={() => setShowAddEvent(true)}
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                border: 'none',
                borderRadius: '8px',
                padding: '0.3rem 0.6rem',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.7rem',
              }}
            >
              + Add
            </button>

            <button
              onClick={onClose}
              style={{
                background: colors.errorBg,
                border: `1px solid ${colors.errorBgHover}`,
                borderRadius: '8px',
                padding: '0.3rem 0.5rem',
                color: colors.errorLight,
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.5rem 0.75rem',
            background: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 0, 0, 0.03)',
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          {/* Month Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => changeMonth(-1)}
              style={{ ...buttonStyle, padding: '0.25rem 0.5rem' }}
            >
              ◀
            </button>
            <span
              style={{
                fontSize: '0.9rem',
                fontWeight: '500',
                minWidth: '120px',
                textAlign: 'center',
                color: colors.text,
              }}
            >
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => changeMonth(1)}
              style={{ ...buttonStyle, padding: '0.25rem 0.5rem' }}
            >
              ▶
            </button>
          </div>

          {/* Search & Filter */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                ...inputStyle,
                width: '120px',
                padding: '0.3rem 0.5rem',
                fontSize: '0.7rem',
              }}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                ...inputStyle,
                width: 'auto',
                padding: '0.3rem 0.5rem',
                fontSize: '0.7rem',
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} style={{ background: colors.bg }}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={{
                ...inputStyle,
                width: 'auto',
                padding: '0.3rem 0.5rem',
                fontSize: '0.7rem',
              }}
              title="Filter holidays by country"
            >
              <option value="" style={{ background: colors.bg }}>
                🌍 All Holidays
              </option>
              <option value="IN" style={{ background: colors.bg }}>
                🇮🇳 India
              </option>
              <option value="US" style={{ background: colors.bg }}>
                🇺🇸 USA
              </option>
              <option value="GB" style={{ background: colors.bg }}>
                🇬🇧 UK
              </option>
              <option value="CA" style={{ background: colors.bg }}>
                🇨🇦 Canada
              </option>
              <option value="AU" style={{ background: colors.bg }}>
                🇦🇺 Australia
              </option>
              <option value="DE" style={{ background: colors.bg }}>
                🇩🇪 Germany
              </option>
              <option value="FR" style={{ background: colors.bg }}>
                🇫🇷 France
              </option>
              <option value="IT" style={{ background: colors.bg }}>
                🇮🇹 Italy
              </option>
              <option value="ES" style={{ background: colors.bg }}>
                🇪🇸 Spain
              </option>
              <option value="MX" style={{ background: colors.bg }}>
                🇲🇽 Mexico
              </option>
              <option value="BR" style={{ background: colors.bg }}>
                🇧🇷 Brazil
              </option>
              <option value="CN" style={{ background: colors.bg }}>
                🇨🇳 China
              </option>
              <option value="JP" style={{ background: colors.bg }}>
                🇯🇵 Japan
              </option>
              <option value="KR" style={{ background: colors.bg }}>
                🇰🇷 South Korea
              </option>
            </select>

            {conflicts.length > 0 && (
              <button
                onClick={() => setShowConflicts(!showConflicts)}
                style={{
                  ...buttonStyle,
                  background: colors.errorBg,
                  border: `1px solid ${colors.errorBgHover}`,
                  color: colors.errorLight,
                  padding: '0.25rem 0.4rem',
                  fontSize: '0.65rem',
                }}
              >
                ⚠️ {conflicts.length}
              </button>
            )}

            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={{ ...buttonStyle, padding: '0.25rem 0.4rem' }}
              >
                ⚙️
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '0.75rem',
          }}
        >
          {/* AI Insights */}
          {showAI && (
            <div
              style={{
                ...glassCard,
                padding: '0.75rem',
                marginBottom: '0.75rem',
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
                  marginBottom: '0.5rem',
                }}
              >
                <span style={{ fontSize: '0.9rem' }}>
                  🤖 AI Schedule Advisor
                </span>
              </div>

              {(() => {
                const insight = generateScheduleInsight();
                return (
                  <>
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: colors.textSecondary,
                        margin: '0 0 0.75rem 0',
                        lineHeight: '1.4',
                      }}
                    >
                      {insight.main}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      {insight.tips.map((tip, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: '0.65rem',
                            padding: '0.3rem 0.5rem',
                            background: colors.inputBg,
                            borderRadius: '4px',
                            color: colors.textSecondary,
                          }}
                        >
                          💡 {tip}
                        </div>
                      ))}
                    </div>

                    {/* Quick Stats */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '0.5rem',
                        marginTop: '0.75rem',
                      }}
                    >
                      {[
                        {
                          label: 'Today',
                          value: scheduleStats.todayEvents,
                          color: '#667eea',
                        },
                        {
                          label: 'This Week',
                          value: scheduleStats.thisWeekEvents,
                          color: '#10b981',
                        },
                        {
                          label: 'Upcoming',
                          value: scheduleStats.upcomingEvents,
                          color: '#f59e0b',
                        },
                        {
                          label: 'Score',
                          value: `${scheduleStats.productivityScore}%`,
                          color: '#ec4899',
                        },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          style={{
                            background: colors.inputBg,
                            borderRadius: '6px',
                            padding: '0.4rem',
                            textAlign: 'center',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              color: stat.color,
                            }}
                          >
                            {stat.value}
                          </div>
                          <div
                            style={{
                              fontSize: '0.55rem',
                              color: colors.textLight,
                            }}
                          >
                            {stat.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Goals Section */}
          {showGoals && (
            <div
              style={{
                ...glassCard,
                padding: '0.75rem',
                marginBottom: '0.75rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  🎯 Goals & Habits
                </span>
                <button
                  onClick={() => {
                    const title = prompt('Goal title:');
                    const target = parseInt(prompt('Target (number):') || '0');
                    const unit =
                      prompt('Unit (e.g., minutes, pages, glasses):') || '';
                    if (title && target) {
                      addGoal({
                        title,
                        target,
                        current: 0,
                        unit,
                        period: 'daily',
                        color:
                          EVENT_COLORS[
                            Math.floor(Math.random() * EVENT_COLORS.length)
                          ].value,
                      });
                    }
                  }}
                  style={{ ...buttonStyle, fontSize: '0.65rem' }}
                >
                  + Add Goal
                </button>
              </div>

              {goals.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1rem',
                    color: colors.textLight,
                    fontSize: '0.8rem',
                  }}
                >
                  No goals yet. Add one to start tracking!
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      style={{
                        padding: '0.5rem',
                        background: colors.cardBg,
                        borderRadius: '6px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '0.25rem',
                        }}
                      >
                        <span style={{ fontSize: '0.8rem' }}>{goal.title}</span>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            color: colors.textMuted,
                          }}
                        >
                          {goal.current}/{goal.target} {goal.unit}
                        </span>
                      </div>
                      <div
                        style={{
                          height: '6px',
                          background: colors.inputBg,
                          borderRadius: '3px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min((goal.current / goal.target) * 100, 100)}%`,
                            background: goal.color,
                            borderRadius: '3px',
                            transition: 'width 0.3s ease',
                          }}
                        />
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.25rem',
                          marginTop: '0.5rem',
                        }}
                      >
                        {[1, 5, 10].map((inc) => (
                          <button
                            key={inc}
                            onClick={() =>
                              updateGoalProgress(goal.id, goal.current + inc)
                            }
                            style={{
                              ...buttonStyle,
                              padding: '0.2rem 0.4rem',
                              fontSize: '0.6rem',
                            }}
                          >
                            +{inc}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main Calendar View */}
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
          {viewMode === 'agenda' && renderAgendaView()}

          {/* Selected Date Events (for month view) */}
          {viewMode === 'month' && (
            <div
              style={{ ...glassCard, padding: '0.75rem', marginTop: '0.75rem' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                }}
              >
                <h3
                  style={{ margin: 0, fontSize: '0.85rem', fontWeight: '500' }}
                >
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>
                <button
                  onClick={() => {
                    setNewEvent((prev) => ({
                      ...prev,
                      date: selectedDate.toISOString().split('T')[0],
                    }));
                    setShowAddEvent(true);
                  }}
                  style={{ ...buttonStyle, fontSize: '0.65rem' }}
                >
                  + Add
                </button>
              </div>

              {selectedDateEvents.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    padding: '1.5rem',
                    color: colors.textLight,
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                    📅
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem' }}>
                    No events for this date
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => setEditingEvent(event)}
                      style={{
                        padding: '0.6rem',
                        background: colors.cardBg,
                        borderRadius: '8px',
                        borderLeft: `3px solid ${event.color || colors.accent}`,
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        userSelect: 'none',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              marginBottom: '0.25rem',
                            }}
                          >
                            <span>{EVENT_ICONS[event.type]}</span>
                            <span
                              style={{
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                textDecoration:
                                  event.status === 'completed'
                                    ? 'line-through'
                                    : 'none',
                                opacity: event.status === 'completed' ? 0.6 : 1,
                              }}
                            >
                              {event.title}
                            </span>
                            {event.priority === 'high' && (
                              <span
                                style={{
                                  fontSize: '0.55rem',
                                  padding: '0.1rem 0.3rem',
                                  background: colors.errorBgHover,
                                  borderRadius: '3px',
                                  color: colors.errorLight,
                                }}
                              >
                                HIGH
                              </span>
                            )}
                          </div>
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: colors.textMuted,
                            }}
                          >
                            {event.isAllDay
                              ? 'All day'
                              : formatTime(event.time)}
                            {event.endTime &&
                              !event.isAllDay &&
                              ` - ${formatTime(event.endTime)}`}
                            {event.location && ` • ${event.location}`}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              completeEvent(event.id);
                            }}
                            style={{
                              background:
                                event.status === 'completed'
                                  ? isDark
                                    ? 'rgba(16, 185, 129, 0.3)'
                                    : 'rgba(16, 185, 129, 0.2)'
                                  : colors.inputBg,
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.2rem 0.4rem',
                              color: colors.text,
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                            }}
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEvent(event.id);
                            }}
                            style={{
                              background: colors.errorBg,
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.2rem 0.4rem',
                              color: colors.errorLight,
                              cursor: 'pointer',
                              fontSize: '0.7rem',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add/Edit Event Modal */}
        {(showAddEvent || editingEvent) && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colors.modalOverlay,
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
            onClick={() => {
              setShowAddEvent(false);
              setEditingEvent(null);
            }}
          >
            <div
              style={{
                ...glassCard,
                padding: '1.25rem',
                width: '90%',
                maxWidth: '450px',
                maxHeight: '85vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h3>

              {/* Title */}
              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: colors.labelText,
                    marginBottom: '0.2rem',
                  }}
                >
                  Title *
                </label>
                <input
                  type="text"
                  value={editingEvent ? editingEvent.title : newEvent.title}
                  onChange={(e) =>
                    editingEvent
                      ? setEditingEvent({
                          ...editingEvent,
                          title: e.target.value,
                        })
                      : setNewEvent((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                  }
                  placeholder="Event title"
                  style={inputStyle}
                />
              </div>

              {/* Type & Color */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '0.6rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: colors.labelText,
                      marginBottom: '0.2rem',
                    }}
                  >
                    Type
                  </label>
                  <select
                    value={editingEvent ? editingEvent.type : newEvent.type}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            type: e.target.value as Event['type'],
                          })
                        : setNewEvent((prev) => ({
                            ...prev,
                            type: e.target.value as Event['type'],
                          }))
                    }
                    style={inputStyle}
                  >
                    {Object.entries(EVENT_ICONS).map(([type, icon]) => (
                      <option
                        key={type}
                        value={type}
                        style={{ background: colors.bg }}
                      >
                        {icon} {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: colors.labelText,
                      marginBottom: '0.2rem',
                    }}
                  >
                    Color
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.25rem',
                      flexWrap: 'wrap',
                    }}
                  >
                    {EVENT_COLORS.map((color) => (
                      <button
                        key={color.value}
                        onClick={() =>
                          editingEvent
                            ? setEditingEvent({
                                ...editingEvent,
                                color: color.value,
                              })
                            : setNewEvent((prev) => ({
                                ...prev,
                                color: color.value,
                              }))
                        }
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '4px',
                          background: color.value,
                          border:
                            (editingEvent?.color || newEvent.color) ===
                            color.value
                              ? '2px solid white'
                              : '2px solid transparent',
                          cursor: 'pointer',
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '0.6rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: colors.labelText,
                      marginBottom: '0.2rem',
                    }}
                  >
                    Date *
                  </label>
                  <input
                    type="date"
                    value={editingEvent ? editingEvent.date : newEvent.date}
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            date: e.target.value,
                          })
                        : setNewEvent((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: colors.labelText,
                      marginBottom: '0.2rem',
                    }}
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    value={
                      editingEvent
                        ? editingEvent.endDate || ''
                        : newEvent.endDate || ''
                    }
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            endDate: e.target.value,
                          })
                        : setNewEvent((prev) => ({
                            ...prev,
                            endDate: e.target.value,
                          }))
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* All Day Toggle */}
              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      editingEvent ? editingEvent.isAllDay : newEvent.isAllDay
                    }
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            isAllDay: e.target.checked,
                          })
                        : setNewEvent((prev) => ({
                            ...prev,
                            isAllDay: e.target.checked,
                          }))
                    }
                  />
                  <span style={{ fontSize: '0.8rem' }}>All Day</span>
                </label>
              </div>

              {/* Time (if not all day) */}
              {!(editingEvent?.isAllDay || newEvent.isAllDay) && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem',
                    marginBottom: '0.6rem',
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.7rem',
                        color: colors.labelText,
                        marginBottom: '0.2rem',
                      }}
                    >
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={editingEvent ? editingEvent.time : newEvent.time}
                      onChange={(e) =>
                        editingEvent
                          ? setEditingEvent({
                              ...editingEvent,
                              time: e.target.value,
                            })
                          : setNewEvent((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                      }
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.7rem',
                        color: colors.labelText,
                        marginBottom: '0.2rem',
                      }}
                    >
                      End Time
                    </label>
                    <input
                      type="time"
                      value={
                        editingEvent
                          ? editingEvent.endTime || ''
                          : newEvent.endTime || ''
                      }
                      onChange={(e) =>
                        editingEvent
                          ? setEditingEvent({
                              ...editingEvent,
                              endTime: e.target.value,
                            })
                          : setNewEvent((prev) => ({
                              ...prev,
                              endTime: e.target.value,
                            }))
                      }
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: colors.labelText,
                    marginBottom: '0.2rem',
                  }}
                >
                  Location
                </label>
                <input
                  type="text"
                  value={
                    editingEvent
                      ? editingEvent.location || ''
                      : newEvent.location
                  }
                  onChange={(e) =>
                    editingEvent
                      ? setEditingEvent({
                          ...editingEvent,
                          location: e.target.value,
                        })
                      : setNewEvent((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                  }
                  placeholder="Add location"
                  style={inputStyle}
                />
              </div>

              {/* Priority & Reminder */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.5rem',
                  marginBottom: '0.6rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: colors.labelText,
                      marginBottom: '0.2rem',
                    }}
                  >
                    Priority
                  </label>
                  <select
                    value={
                      editingEvent ? editingEvent.priority : newEvent.priority
                    }
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            priority: e.target.value as Event['priority'],
                          })
                        : setNewEvent((prev) => ({
                            ...prev,
                            priority: e.target.value as Event['priority'],
                          }))
                    }
                    style={inputStyle}
                  >
                    <option value="low" style={{ background: colors.bg }}>
                      Low
                    </option>
                    <option value="medium" style={{ background: colors.bg }}>
                      Medium
                    </option>
                    <option value="high" style={{ background: colors.bg }}>
                      High
                    </option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.7rem',
                      color: colors.labelText,
                      marginBottom: '0.2rem',
                    }}
                  >
                    Reminder
                  </label>
                  <select
                    value={
                      editingEvent ? editingEvent.reminder : newEvent.reminder
                    }
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            reminder: parseInt(e.target.value),
                          })
                        : setNewEvent((prev) => ({
                            ...prev,
                            reminder: parseInt(e.target.value),
                          }))
                    }
                    style={inputStyle}
                  >
                    <option value={0} style={{ background: colors.bg }}>
                      None
                    </option>
                    <option value={5} style={{ background: colors.bg }}>
                      5 min before
                    </option>
                    <option value={15} style={{ background: colors.bg }}>
                      15 min before
                    </option>
                    <option value={30} style={{ background: colors.bg }}>
                      30 min before
                    </option>
                    <option value={60} style={{ background: colors.bg }}>
                      1 hour before
                    </option>
                    <option value={1440} style={{ background: colors.bg }}>
                      1 day before
                    </option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: colors.labelText,
                    marginBottom: '0.2rem',
                  }}
                >
                  Category
                </label>
                <input
                  type="text"
                  value={
                    editingEvent
                      ? editingEvent.category || ''
                      : newEvent.category || ''
                  }
                  onChange={(e) =>
                    editingEvent
                      ? setEditingEvent({
                          ...editingEvent,
                          category: e.target.value,
                        })
                      : setNewEvent((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                  }
                  placeholder="e.g., Work, Personal, Health"
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: colors.labelText,
                    marginBottom: '0.2rem',
                  }}
                >
                  Description
                </label>
                <textarea
                  value={
                    editingEvent
                      ? editingEvent.description || ''
                      : newEvent.description
                  }
                  onChange={(e) =>
                    editingEvent
                      ? setEditingEvent({
                          ...editingEvent,
                          description: e.target.value,
                        })
                      : setNewEvent((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                  }
                  placeholder="Add description"
                  rows={3}
                  style={{
                    ...inputStyle,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              {/* URL */}
              <div style={{ marginBottom: '0.6rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    color: colors.labelText,
                    marginBottom: '0.2rem',
                  }}
                >
                  URL
                </label>
                <input
                  type="url"
                  value={
                    editingEvent ? editingEvent.url || '' : newEvent.url || ''
                  }
                  onChange={(e) =>
                    editingEvent
                      ? setEditingEvent({
                          ...editingEvent,
                          url: e.target.value,
                        })
                      : setNewEvent((prev) => ({
                          ...prev,
                          url: e.target.value,
                        }))
                  }
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>

              {/* Recurring */}
              <div style={{ marginBottom: '0.75rem' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={
                      editingEvent
                        ? editingEvent.isRecurring
                        : newEvent.isRecurring
                    }
                    onChange={(e) =>
                      editingEvent
                        ? setEditingEvent({
                            ...editingEvent,
                            isRecurring: e.target.checked,
                          })
                        : setNewEvent((prev) => ({
                            ...prev,
                            isRecurring: e.target.checked,
                          }))
                    }
                  />
                  <span style={{ fontSize: '0.8rem' }}>Recurring Event</span>
                </label>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  justifyContent: 'flex-end',
                }}
              >
                {editingEvent && (
                  <button
                    onClick={() => duplicateEvent(editingEvent)}
                    style={{ ...buttonStyle, marginRight: 'auto' }}
                  >
                    Duplicate
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowAddEvent(false);
                    setEditingEvent(null);
                  }}
                  style={buttonStyle}
                >
                  Cancel
                </button>
                <button
                  onClick={editingEvent ? updateEvent : addEvent}
                  style={{
                    padding: '0.5rem 1rem',
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '6px',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.8rem',
                  }}
                >
                  {editingEvent ? 'Update' : 'Add'} Event
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colors.modalOverlay,
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
            onClick={() => setShowSettings(false)}
          >
            <div
              style={{
                ...glassCard,
                padding: '1.25rem',
                width: '90%',
                maxWidth: '400px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem' }}>
                Settings
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: colors.labelText,
                      marginBottom: '0.25rem',
                    }}
                  >
                    Time Format
                  </label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        timeFormat: e.target.value as '12h' | '24h',
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value="12h" style={{ background: colors.bg }}>
                      12 Hour (AM/PM)
                    </option>
                    <option value="24h" style={{ background: colors.bg }}>
                      24 Hour
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      color: colors.labelText,
                      marginBottom: '0.25rem',
                    }}
                  >
                    First Day of Week
                  </label>
                  <select
                    value={settings.firstDayOfWeek}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        firstDayOfWeek: parseInt(e.target.value),
                      }))
                    }
                    style={inputStyle}
                  >
                    <option value={0} style={{ background: colors.bg }}>
                      Sunday
                    </option>
                    <option value={1} style={{ background: colors.bg }}>
                      Monday
                    </option>
                  </select>
                </div>

                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={settings.showWeekNumbers}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        showWeekNumbers: e.target.checked,
                      }))
                    }
                  />
                  <span style={{ fontSize: '0.8rem' }}>Show Week Numbers</span>
                </label>

                <div
                  style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    paddingTop: '0.75rem',
                    marginTop: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: colors.labelText,
                      marginBottom: '0.5rem',
                    }}
                  >
                    Export Data
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={exportToICS} style={buttonStyle}>
                      Export ICS
                    </button>
                    <button onClick={exportToJSON} style={buttonStyle}>
                      Export JSON
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                style={{
                  ...buttonStyle,
                  width: '100%',
                  marginTop: '1rem',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Conflicts Modal */}
        {showConflicts && conflicts.length > 0 && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: colors.modalOverlay,
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
            }}
            onClick={() => setShowConflicts(false)}
          >
            <div
              style={{
                ...glassCard,
                padding: '1.25rem',
                width: '90%',
                maxWidth: '400px',
                maxHeight: '70vh',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                style={{
                  margin: '0 0 1rem 0',
                  fontSize: '1rem',
                  color: colors.errorLight,
                }}
              >
                ⚠️ Schedule Conflicts ({conflicts.length})
              </h3>

              {conflicts.map(([e1, e2], i) => (
                <div
                  key={i}
                  style={{
                    padding: '0.75rem',
                    background: colors.errorBg,
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <strong>{e1.title}</strong> ({formatTime(e1.time)})
                  </div>
                  <div style={{ fontSize: '0.7rem', color: colors.labelText }}>
                    conflicts with
                  </div>
                  <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    <strong>{e2.title}</strong> ({formatTime(e2.time)})
                  </div>
                </div>
              ))}

              <button
                onClick={() => setShowConflicts(false)}
                style={{ ...buttonStyle, width: '100%', marginTop: '0.5rem' }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

CalendarApp.displayName = 'CalendarApp';

export default CalendarApp;
