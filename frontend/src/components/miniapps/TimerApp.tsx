'use client';

import { useThemeColors } from '@/hooks/useThemeColors';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';

interface TimerAppProps {
  isVisible: boolean;
  onClose: () => void;
}

interface TimerPreset {
  id: string;
  name: string;
  duration: number; // in seconds
  color: string;
}

interface LapTime {
  id: string;
  time: number;
  timestamp: Date;
}

interface TimerSession {
  id: string;
  mode: 'timer' | 'stopwatch' | 'pomodoro';
  duration: number;
  completedAt: Date;
  laps?: LapTime[];
}

interface ProductivityStats {
  totalFocusTime: number;
  pomodorosCompleted: number;
  avgSessionLength: number;
  streakDays: number;
  bestFocusTime: number;
}

export default function TimerApp({ isVisible, onClose }: TimerAppProps) {
  const colors = useThemeColors();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState<'timer' | 'stopwatch' | 'pomodoro'>('timer');
  const [inputMinutes, setInputMinutes] = useState('');
  const [inputSeconds, setInputSeconds] = useState('');

  // Pomodoro state
  const [pomodoroRound, setPomodoroRound] = useState(1);
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break' | 'longBreak'>('work');
  const [workDuration, setWorkDuration] = useState(25 * 60);
  const [breakDuration, setBreakDuration] = useState(5 * 60);
  const [longBreakDuration, setLongBreakDuration] = useState(15 * 60);

  // Stopwatch laps
  const [laps, setLaps] = useState<LapTime[]>([]);

  // Sessions history
  const [sessions, setSessions] = useState<TimerSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // UI states
  const [showPresets, setShowPresets] = useState(false);
  const [presets, setPresets] = useState<TimerPreset[]>([
    { id: '1', name: 'Quick Break', duration: 5 * 60, color: 'colors.status.success' },
    { id: '2', name: 'Focus Session', duration: 25 * 60, color: 'colors.status.info' },
    { id: '3', name: 'Long Work', duration: 50 * 60, color: 'colors.status.warning' },
    { id: '4', name: 'Power Nap', duration: 20 * 60, color: '#ec4899' },
  ]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const initialTimeRef = useRef(0);

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('timer-sessions-v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSessions(parsed.map((s: any) => ({
          ...s,
          completedAt: new Date(s.completedAt),
          laps: s.laps?.map((l: any) => ({ ...l, timestamp: new Date(l.timestamp) }))
        })));
      }

      const savedPresets = localStorage.getItem('timer-presets-v2');
      if (savedPresets) {
        setPresets(JSON.parse(savedPresets));
      }
    } catch (e) {

    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem('timer-sessions-v2', JSON.stringify(sessions.slice(0, 50)));
      } catch (e) {

      }
    }
  }, [sessions]);

  // Save presets to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('timer-presets-v2', JSON.stringify(presets));
    } catch (e) {

    }
  }, [presets]);

  // Calculate productivity stats
  const productivityStats = useMemo((): ProductivityStats => {
    const pomodoroSessions = sessions.filter(s => s.mode === 'pomodoro');
    const timerSessions = sessions.filter(s => s.mode === 'timer');
    const allFocusSessions = [...pomodoroSessions, ...timerSessions];

    const totalFocusTime = allFocusSessions.reduce((sum, s) => sum + s.duration, 0);
    const pomodorosCompleted = pomodoroSessions.length;
    const avgSessionLength = allFocusSessions.length > 0
      ? Math.round(totalFocusTime / allFocusSessions.length / 60)
      : 0;

    const bestFocusTime = allFocusSessions.length > 0
      ? Math.max(...allFocusSessions.map(s => s.duration))
      : 0;

    // Calculate streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streakDays = 0;
    let checkDate = new Date(today);

    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const hasSession = sessions.some(s => {
        const sessionDate = new Date(s.completedAt);
        return sessionDate >= dayStart && sessionDate < dayEnd;
      });

      if (hasSession) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      totalFocusTime,
      pomodorosCompleted,
      avgSessionLength,
      streakDays,
      bestFocusTime
    };
  }, [sessions]);

  // Generate AI productivity insight
  const generateProductivityInsight = useCallback((): string => {
    const { totalFocusTime, pomodorosCompleted, avgSessionLength, streakDays, bestFocusTime } = productivityStats;

    if (sessions.length === 0) {
      return "Start your first timer session to track your productivity!";
    }

    const insights: string[] = [];

    // Streak-based insights
    if (streakDays >= 7) {
      insights.push(`Amazing ${streakDays}-day streak! You're building strong focus habits.`);
    } else if (streakDays >= 3) {
      insights.push(`${streakDays}-day streak! Keep the momentum going.`);
    } else if (streakDays === 0 && sessions.length > 0) {
      insights.push("Time to get back on track! Start a focus session today.");
    }

    // Pomodoro insights
    if (pomodorosCompleted >= 10) {
      insights.push(`You've completed ${pomodorosCompleted} Pomodoros! Impressive dedication.`);
    } else if (pomodorosCompleted > 0) {
      insights.push(`${pomodorosCompleted} Pomodoros done. Try to hit 4 per day for optimal flow.`);
    }

    // Time-based insights
    const hours = Math.floor(totalFocusTime / 3600);
    if (hours >= 10) {
      insights.push(`${hours}+ hours of deep work logged. You're a focus champion!`);
    } else if (hours >= 1) {
      insights.push(`${hours} hour${hours > 1 ? 's' : ''} of focus time. Every session counts!`);
    }

    // Session length insights
    if (avgSessionLength >= 45) {
      insights.push("Your average session is 45+ minutes - great for deep work!");
    } else if (avgSessionLength >= 25) {
      insights.push("Perfect Pomodoro-style sessions. Ideal for sustained focus.");
    } else if (avgSessionLength > 0 && avgSessionLength < 15) {
      insights.push("Try longer sessions (25 min) to enter deep focus state.");
    }

    // Best session insight
    if (bestFocusTime >= 60 * 60) {
      const bestMins = Math.floor(bestFocusTime / 60);
      insights.push(`Personal best: ${bestMins} minutes! Can you beat it?`);
    }

    return insights[Math.floor(Math.random() * insights.length)] || "Keep tracking your time to unlock productivity insights!";
  }, [productivityStats, sessions]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prev => {
          if (mode === 'timer' || mode === 'pomodoro') {
            if (prev <= 1) {
              handleTimerComplete();
              return 0;
            }
            return prev - 1;
          } else {
            // Stopwatch
            return prev + 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode]);

  // Update document title with time
  useEffect(() => {
    if (isRunning && isVisible) {
      document.title = `${formatTime(time)} - Timer`;
    } else {
      document.title = 'Echo';
    }

    return () => {
      document.title = 'Echo';
    };
  }, [time, isRunning, isVisible]);

  const handleTimerComplete = useCallback(() => {
    setIsRunning(false);

    // Play sound
    if (soundEnabled) {
      playNotificationSound();
    }

    // Show browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Timer Complete!', {
        body: mode === 'pomodoro' ? `${pomodoroPhase} session finished` : 'Your timer has finished',
        icon: '/timer-icon.png'
      });
    }

    // Save session
    const session: TimerSession = {
      id: `session-${Date.now()}`,
      mode,
      duration: initialTimeRef.current,
      completedAt: new Date(),
      laps: mode === 'stopwatch' ? [...laps] : undefined
    };
    setSessions(prev => [session, ...prev].slice(0, 50));

    // Handle Pomodoro auto-advance
    if (mode === 'pomodoro') {
      setTimeout(() => {
        if (pomodoroPhase === 'work') {
          if (pomodoroRound % 4 === 0) {
            // Long break after 4 rounds
            setPomodoroPhase('longBreak');
            setTime(longBreakDuration);
            initialTimeRef.current = longBreakDuration;
          } else {
            // Short break
            setPomodoroPhase('break');
            setTime(breakDuration);
            initialTimeRef.current = breakDuration;
          }
        } else {
          // Back to work
          setPomodoroPhase('work');
          setPomodoroRound(prev => prev + 1);
          setTime(workDuration);
          initialTimeRef.current = workDuration;
        }
      }, 1000);
    }
  }, [mode, pomodoroPhase, pomodoroRound, laps, soundEnabled, workDuration, breakDuration, longBreakDuration]);

  const playNotificationSound = () => {
    try {
      // Create a simple beep using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {

    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const startTimer = () => {
    if ((mode === 'timer' || mode === 'pomodoro') && time === 0) {
      let duration = 0;

      if (mode === 'timer') {
        const mins = parseInt(inputMinutes) || 0;
        const secs = parseInt(inputSeconds) || 0;
        duration = mins * 60 + secs;
      } else if (mode === 'pomodoro') {
        duration = pomodoroPhase === 'work' ? workDuration :
                   pomodoroPhase === 'break' ? breakDuration : longBreakDuration;
      }

      setTime(duration);
      initialTimeRef.current = duration;
    }
    setIsRunning(true);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTime(0);
    initialTimeRef.current = 0;
    setLaps([]);
    if (mode === 'timer') {
      setInputMinutes('');
      setInputSeconds('');
    } else if (mode === 'pomodoro') {
      setPomodoroPhase('work');
      setPomodoroRound(1);
    }
  };

  const addLap = () => {
    if (mode === 'stopwatch' && time > 0) {
      const lap: LapTime = {
        id: `lap-${Date.now()}`,
        time,
        timestamp: new Date()
      };
      setLaps(prev => [lap, ...prev]);
    }
  };

  const setPresetTimer = (duration: number) => {
    setMode('timer');
    setTime(duration);
    initialTimeRef.current = duration;
    setInputMinutes(String(Math.floor(duration / 60)));
    setInputSeconds(String(duration % 60));
    setIsRunning(false);
  };

  const exportSessions = useCallback(() => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `timer-sessions-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [sessions]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
          pauseTimer();
        } else {
          startTimer();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetTimer();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (mode === 'stopwatch') {
          addLap();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, isRunning, mode]);

  // Progress percentage
  const progress = useMemo(() => {
    if (initialTimeRef.current === 0) return 0;
    if (mode === 'stopwatch') return 0;
    return ((initialTimeRef.current - time) / initialTimeRef.current) * 100;
  }, [time, mode]);

  // Calculate lap delta times
  const lapDeltas = useMemo(() => {
    if (laps.length === 0) return [];
    const deltas: number[] = [];
    for (let i = 0; i < laps.length; i++) {
      if (i === laps.length - 1) {
        deltas.push(laps[i].time);
      } else {
        deltas.push(laps[i].time - laps[i + 1].time);
      }
    }
    return deltas;
  }, [laps]);

  if (!isVisible) return null;

  // Glass card style helper
  const glassCard = {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      overflow: 'hidden',
      position: 'relative',
      fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.2)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.25rem' }}>Timer & Stopwatch</span>
          <span style={{
            fontSize: '0.7rem',
            padding: '0.2rem 0.5rem',
            background: 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
            borderRadius: '4px',
            color: 'white'
          }}>PRO</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              background: showStats ? 'rgba(139, 92, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
            title="Productivity Stats"
          >
            AI
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              background: showHistory ? 'rgba(59, 130, 246, 0.3)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
            title="History"
          >
            History
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: 'white',
              cursor: 'pointer',
              opacity: soundEnabled ? 1 : 0.5
            }}
          >
            {soundEnabled ? '🔔' : '🔕'}
          </button>
          {mode === 'pomodoro' && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: showSettings ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.4rem 0.6rem',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              ⚙️
            </button>
          )}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.4rem 0.6rem',
              color: '#fca5a5',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            X
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        background: 'rgba(0, 0, 0, 0.1)',
        flexShrink: 0
      }}>
        {['timer', 'stopwatch', 'pomodoro'].map((m) => (
          <button
            key={m}
            onClick={() => {
              setMode(m as any);
              resetTimer();
              if (m === 'pomodoro') {
                setTime(workDuration);
                initialTimeRef.current = workDuration;
              }
            }}
            style={{
              flex: 1,
              padding: '0.6rem 1rem',
              background: mode === m
                ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                : 'rgba(255, 255, 255, 0.05)',
              border: mode === m
                ? '1px solid rgba(139, 92, 246, 0.5)'
                : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: mode === m ? 'white' : 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              fontWeight: mode === m ? '600' : '400',
              fontSize: '0.85rem',
              textTransform: 'capitalize',
              transition: 'all 0.3s ease'
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '1rem'
      }}>
        {/* AI Productivity Insight */}
        {showStats && (
          <div style={{
            ...glassCard,
            padding: '1rem',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <span style={{ fontSize: '1rem' }}>🤖</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#a78bfa'
              }}>AI Productivity Coach</span>
            </div>
            <p style={{
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0,
              lineHeight: '1.5'
            }}>
              {generateProductivityInsight()}
            </p>

            {/* Stats Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
              marginTop: '1rem'
            }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#a78bfa' }}>
                  {formatDuration(productivityStats.totalFocusTime)}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Total Focus
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'colors.status.success' }}>
                  {productivityStats.pomodorosCompleted}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Pomodoros
                </div>
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'colors.status.warning' }}>
                  {productivityStats.streakDays}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Day Streak
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && mode === 'pomodoro' && (
          <div style={{
            ...glassCard,
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>Pomodoro Settings</h4>
            {[
              { label: 'Work Duration', value: workDuration, setter: setWorkDuration },
              { label: 'Break Duration', value: breakDuration, setter: setBreakDuration },
              { label: 'Long Break', value: longBreakDuration, setter: setLongBreakDuration }
            ].map((setting) => (
              <div key={setting.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.5rem 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <label style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                  {setting.label} (min)
                </label>
                <input
                  type="number"
                  value={setting.value / 60}
                  onChange={(e) => setting.setter(parseInt(e.target.value) * 60)}
                  min="1"
                  max="60"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    padding: '0.4rem',
                    color: 'white',
                    width: '60px',
                    textAlign: 'center'
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {/* History Panel */}
        {showHistory && (
          <div style={{
            ...glassCard,
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h4 style={{
                margin: 0,
                fontSize: '0.85rem',
                color: 'rgba(255, 255, 255, 0.7)',
                textTransform: 'uppercase'
              }}>Session History ({sessions.length})</h4>
              <button
                onClick={exportSessions}
                style={{
                  background: 'linear-gradient(135deg, colors.status.info 0%, #2563eb 100%)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '0.4rem 0.8rem',
                  color: 'white',
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                Export
              </button>
            </div>
            <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
              {sessions.slice(0, 10).map(session => (
                <div key={session.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '8px',
                  marginBottom: '0.5rem',
                  fontSize: '0.8rem'
                }}>
                  <span style={{
                    background: session.mode === 'pomodoro' ? 'colors.status.success' :
                               session.mode === 'timer' ? 'colors.status.info' : 'colors.status.warning',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    textTransform: 'uppercase',
                    fontWeight: '600'
                  }}>{session.mode}</span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'monospace' }}>
                    {formatTime(session.duration)}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.7rem' }}>
                    {session.completedAt.toLocaleDateString()}
                  </span>
                </div>
              ))}
              {sessions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255, 255, 255, 0.5)' }}>
                  No sessions yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Timer Display */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 0'
        }}>
          {/* Timer Orb */}
          <div style={{
            position: 'relative',
            width: '240px',
            height: '240px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {/* Background glow */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: 'radial-gradient(circle at 30% 30%, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.15) 40%, transparent 70%)',
              filter: 'blur(30px)'
            }} />

            {/* Progress ring */}
            {(mode === 'timer' || mode === 'pomodoro') && (
              <svg
                width="220"
                height="220"
                style={{
                  position: 'absolute',
                  transform: 'rotate(-90deg)'
                }}
              >
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="colors.brand.primary" />
                    <stop offset="50%" stopColor="colors.brand.tertiary" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                </defs>
                <circle
                  cx="110"
                  cy="110"
                  r="100"
                  fill="none"
                  stroke="rgba(102, 126, 234, 0.15)"
                  strokeWidth="8"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="100"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="628"
                  strokeDashoffset={628 - (628 * progress) / 100}
                  style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
            )}

            {/* Time display */}
            <div style={{
              position: 'relative',
              zIndex: 10,
              fontFamily: "'SF Mono', monospace",
              fontWeight: '200',
              fontSize: '2.75rem',
              background: 'linear-gradient(135deg, #fff 0%, #e0e7ff 50%, #c7d2fe 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {formatTime(time)}
            </div>
          </div>

          {/* Pomodoro info */}
          {mode === 'pomodoro' && (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <div style={{
                fontSize: '1.1rem',
                color: pomodoroPhase === 'work' ? 'colors.status.success' : 'colors.status.info'
              }}>
                {pomodoroPhase === 'work' ? '🔥 Focus Time' :
                 pomodoroPhase === 'break' ? '☕ Short Break' : '🌟 Long Break'}
              </div>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Round {pomodoroRound}/4
              </div>
            </div>
          )}

          {/* Complete indicator */}
          {time === 0 && (mode === 'timer' || mode === 'pomodoro') && !isRunning && initialTimeRef.current > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              marginTop: '1rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>⏰</span>
              <span style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'colors.status.success'
              }}>Complete!</span>
            </div>
          )}
        </div>

        {/* Timer Input */}
        {mode === 'timer' && !isRunning && time === 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <input
              type="number"
              value={inputMinutes}
              onChange={(e) => setInputMinutes(e.target.value)}
              placeholder="MM"
              min="0"
              max="999"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1.5rem',
                width: '80px',
                textAlign: 'center',
                fontFamily: "'SF Mono', monospace"
              }}
            />
            <span style={{ fontSize: '1.5rem', color: 'rgba(255, 255, 255, 0.6)' }}>:</span>
            <input
              type="number"
              value={inputSeconds}
              onChange={(e) => setInputSeconds(e.target.value)}
              placeholder="SS"
              min="0"
              max="59"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                padding: '0.75rem',
                color: 'white',
                fontSize: '1.5rem',
                width: '80px',
                textAlign: 'center',
                fontFamily: "'SF Mono', monospace"
              }}
            />
          </div>
        )}

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '0.75rem',
          justifyContent: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          {!isRunning ? (
            <button
              onClick={startTimer}
              disabled={mode === 'timer' && time === 0 && !inputMinutes && !inputSeconds}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, colors.status.success 0%, #059669 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '100px',
                opacity: mode === 'timer' && time === 0 && !inputMinutes && !inputSeconds ? 0.5 : 1,
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              ▶ Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, colors.status.warning 0%, #d97706 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '100px',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)'
              }}
            >
              ⏸ Pause
            </button>
          )}

          {mode === 'stopwatch' && isRunning && (
            <button
              onClick={addLap}
              style={{
                padding: '0.875rem 1.5rem',
                background: 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
                border: 'none',
                borderRadius: '12px',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer',
                minWidth: '100px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              🏁 Lap
            </button>
          )}

          <button
            onClick={resetTimer}
            style={{
              padding: '0.875rem 1.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            Reset
          </button>
        </div>

        {/* Quick Presets */}
        {mode === 'timer' && !isRunning && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              textAlign: 'center'
            }}>Quick Presets</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem'
            }}>
              {presets.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => setPresetTimer(preset.duration)}
                  style={{
                    ...glassCard,
                    padding: '0.875rem',
                    color: 'white',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.3s ease',
                    borderColor: `${preset.color}40`
                  }}
                >
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    marginBottom: '0.25rem'
                  }}>{preset.name}</div>
                  <div style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: preset.color
                  }}>{Math.floor(preset.duration / 60)}m</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stopwatch Laps */}
        {mode === 'stopwatch' && laps.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{
              margin: '0 0 0.75rem 0',
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.6)',
              textTransform: 'uppercase',
              textAlign: 'center'
            }}>Laps ({laps.length})</h4>
            <div style={{
              ...glassCard,
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {laps.map((lap, index) => (
                <div key={lap.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.75rem',
                  borderBottom: index < laps.length - 1 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                  fontFamily: "'SF Mono', monospace"
                }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
                    #{laps.length - index}
                  </span>
                  <span style={{ color: 'colors.status.info', fontWeight: '600' }}>
                    {formatTime(lapDeltas[index])}
                  </span>
                  <span style={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: '0.8rem' }}>
                    {formatTime(lap.time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Keyboard Hints */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {['Space: Start/Pause', 'R: Reset', ...(mode === 'stopwatch' ? ['L: Lap'] : [])].map((hint) => (
            <span key={hint} style={{
              fontSize: '0.7rem',
              padding: '0.3rem 0.6rem',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>{hint}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
