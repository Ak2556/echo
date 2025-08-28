'use client';

import { useThemeColors } from '@/hooks/useThemeColors';
import React, { useState, useCallback, useMemo } from 'react';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'work' | 'personal' | 'shopping' | 'health';
  createdAt: Date;
  dueDate?: Date;
  reminder?: boolean;
  tags?: string[];
  subtasks?: Array<{ id: string; title: string; completed: boolean }>;
  recurring?: 'daily' | 'weekly' | 'monthly' | null;
  archived?: boolean;
}

interface TaskManagerAppProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function TaskManagerApp({ isVisible, onClose }: TaskManagerAppProps) {
  const colors = useThemeColors();
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<'work' | 'personal' | 'shopping' | 'health'>('work');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete project proposal',
      description: 'Write and submit the quarterly project proposal',
      completed: false,
      priority: 'high',
      category: 'work',
      createdAt: new Date('2024-01-15'),
      dueDate: new Date('2024-01-20'),
      tags: ['work', 'important'],
      subtasks: [
        { id: '1a', title: 'Research requirements', completed: true },
        { id: '1b', title: 'Write draft', completed: false }
      ]
    },
    {
      id: '2',
      title: 'Buy groceries',
      description: 'Get ingredients for weekend cooking',
      completed: false,
      priority: 'medium',
      category: 'shopping',
      createdAt: new Date('2024-01-16'),
      tags: ['personal', 'shopping']
    },
    {
      id: '3',
      title: 'Doctor appointment',
      description: 'Annual health checkup',
      completed: true,
      priority: 'medium',
      category: 'health',
      createdAt: new Date('2024-01-10'),
      dueDate: new Date('2024-01-18')
    },
    {
      id: '4',
      title: 'Review team reports',
      description: 'Weekly team performance review',
      completed: false,
      priority: 'urgent',
      category: 'work',
      createdAt: new Date('2024-01-17'),
      dueDate: new Date(Date.now() + 86400000)
    },
    {
      id: '5',
      title: 'Gym session',
      description: 'Evening workout routine',
      completed: false,
      priority: 'low',
      category: 'health',
      createdAt: new Date('2024-01-17')
    }
  ]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    switch (activeFilter) {
      case 'today':
        filtered = filtered.filter((t: Task) => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          const today = new Date();
          due.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);
          return due.getTime() === today.getTime();
        });
        break;
      case 'upcoming':
        filtered = filtered.filter((t: Task) => {
          if (!t.dueDate) return false;
          const due = new Date(t.dueDate);
          const today = new Date();
          return due > today;
        });
        break;
      case 'overdue':
        filtered = filtered.filter((t: Task) => {
          if (!t.dueDate) return false;
          return new Date(t.dueDate) < new Date() && !t.completed;
        });
        break;
    }

    return filtered;
  }, [tasks, activeFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const overdue = tasks.filter((t: Task) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate) < new Date() && !t.completed;
    }).length;
    const today = tasks.filter((t: Task) => {
      if (!t.dueDate) return false;
      const due = new Date(t.dueDate);
      const now = new Date();
      due.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      return due.getTime() === now.getTime();
    }).length;

    return { total, completed, overdue, today };
  }, [tasks]);

  // AI Insights calculation
  const aiInsights = useMemo(() => {
    const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
    const urgentTasks = tasks.filter(t => t.priority === 'urgent' && !t.completed).length;
    const workTasks = tasks.filter(t => t.category === 'work' && !t.completed).length;
    const personalTasks = tasks.filter(t => t.category === 'personal' && !t.completed).length;

    const productivityScore = Math.min(100, Math.round(
      (completionRate * 0.4) +
      ((stats.overdue === 0 ? 30 : Math.max(0, 30 - stats.overdue * 5))) +
      ((urgentTasks === 0 ? 30 : Math.max(0, 30 - urgentTasks * 10)))
    ));

    const tips: string[] = [];
    if (stats.overdue > 0) tips.push(`You have ${stats.overdue} overdue tasks. Consider prioritizing these first.`);
    if (urgentTasks > 2) tips.push('Multiple urgent tasks detected. Break them into smaller subtasks for better management.');
    if (workTasks > personalTasks * 2) tips.push('Work-life balance tip: Schedule some personal tasks to maintain wellbeing.');
    if (completionRate < 30) tips.push('Productivity tip: Start with the easiest task to build momentum.');
    if (completionRate > 70) tips.push('Great progress! Keep up the momentum.');
    if (tips.length === 0) tips.push('You\'re doing great! Keep maintaining this productive flow.');

    return {
      completionRate,
      productivityScore,
      urgentTasks,
      tips,
      focusSuggestion: urgentTasks > 0 ? 'Focus on urgent tasks first' :
                       stats.overdue > 0 ? 'Clear overdue tasks' :
                       'Great! Work on your schedule as planned'
    };
  }, [tasks, stats]);

  const toggleTask = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const addTask = useCallback(() => {
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDesc,
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      createdAt: new Date(),
      dueDate: newTaskDueDate ? new Date(newTaskDueDate) : undefined
    };
    setTasks(prev => [task, ...prev]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskCategory('work');
    setNewTaskDueDate('');
    setShowAddTask(false);
  }, [newTaskTitle, newTaskDesc, newTaskPriority, newTaskCategory, newTaskDueDate]);

  const exportTasksJSON = useCallback(() => {
    const dataStr = JSON.stringify(tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'tasks.json';
    link.click();
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#ff4757';
      case 'high': return '#ff6b35';
      case 'medium': return '#ffa502';
      case 'low': return '#2ed573';
      default: return '#888';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work': return '💼';
      case 'personal': return '👤';
      case 'shopping': return '🛒';
      case 'health': return '🏥';
      default: return '📋';
    }
  };

  if (!isVisible) return null;

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#ffffff',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>✅</span>
            Task Manager Pro
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
            AI-powered task management & productivity insights
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowAIInsights(!showAIInsights)}
            style={{
              background: showAIInsights ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.3s ease'
            }}
          >
            🤖 AI Insights
          </button>
          <button
            onClick={exportTasksJSON}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '10px',
              padding: '8px 12px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            📥
          </button>
          <button
            onClick={() => setShowAddTask(true)}
            style={{
              background: 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            + Add Task
          </button>
        </div>
      </div>

      {/* AI Insights Panel */}
      {showAIInsights && (
        <div style={{
          padding: '20px 24px',
          background: 'rgba(102, 126, 234, 0.1)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: 'colors.brand.primary' }}>{aiInsights.productivityScore}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>Productivity Score</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2ed573' }}>{aiInsights.completionRate}%</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>Completion Rate</div>
            </div>
            <div style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#ff4757' }}>{aiInsights.urgentTasks}</div>
              <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '4px' }}>Urgent Tasks</div>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🎯</span> Focus Suggestion
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px' }}>
              {aiInsights.focusSuggestion}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💡</span> Productivity Tips
            </div>
            {aiInsights.tips.map((tip, idx) => (
              <div key={idx} style={{
                fontSize: '0.8rem',
                color: 'rgba(255, 255, 255, 0.7)',
                padding: '8px 12px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                marginBottom: '6px'
              }}>
                {tip}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '12px',
        padding: '16px 24px',
        background: 'rgba(255, 255, 255, 0.03)'
      }}>
        {[
          { label: 'Total', value: stats.total, color: 'colors.brand.primary' },
          { label: 'Completed', value: stats.completed, color: '#2ed573' },
          { label: 'Today', value: stats.today, color: '#ffa502' },
          { label: 'Overdue', value: stats.overdue, color: '#ff4757' }
        ].map((stat, idx) => (
          <div key={idx} style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: '12px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '2px' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        padding: '0 24px',
        gap: '8px',
        marginTop: '8px'
      }}>
        {[
          { id: 'all', label: 'All Tasks', icon: '📋' },
          { id: 'today', label: 'Today', icon: '📅' },
          { id: 'upcoming', label: 'Upcoming', icon: '⏰' },
          { id: 'overdue', label: 'Overdue', icon: '⚠️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as typeof activeFilter)}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: activeFilter === tab.id
                ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                : 'rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: activeFilter === tab.id ? '600' : '400',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {filteredTasks.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px 24px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
            <div style={{ fontSize: '1rem' }}>No tasks found</div>
            <div style={{ fontSize: '0.85rem', marginTop: '8px' }}>Create a new task to get started</div>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                opacity: task.completed ? 0.6 : 1,
                transition: 'all 0.3s ease',
                borderLeft: `4px solid ${getPriorityColor(task.priority)}`
              }}
            >
              <button
                onClick={() => toggleTask(task.id)}
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  border: task.completed
                    ? 'none'
                    : '2px solid rgba(255, 255, 255, 0.3)',
                  background: task.completed
                    ? 'linear-gradient(135deg, #2ed573 0%, #26de81 100%)'
                    : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  color: 'white',
                  flexShrink: 0,
                  marginTop: '2px'
                }}
              >
                {task.completed && '✓'}
              </button>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  marginBottom: '4px',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  color: task.completed ? 'rgba(255, 255, 255, 0.5)' : 'white'
                }}>
                  {task.title}
                </div>

                {task.description && (
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginBottom: '8px'
                  }}>
                    {task.description}
                  </div>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: '600',
                    background: getPriorityColor(task.priority),
                    color: 'white',
                    textTransform: 'uppercase'
                  }}>
                    {task.priority}
                  </span>

                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: 'rgba(255, 255, 255, 0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {getCategoryIcon(task.category)} {task.category}
                  </span>

                  {task.dueDate && (
                    <span style={{
                      fontSize: '0.7rem',
                      color: new Date(task.dueDate) < new Date() && !task.completed
                        ? '#ff4757'
                        : 'rgba(255, 255, 255, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                style={{
                  background: 'rgba(255, 71, 87, 0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px',
                  cursor: 'pointer',
                  color: '#ff4757',
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease'
                }}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddTask && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setShowAddTask(false)}>
          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            padding: '24px',
            width: '90%',
            maxWidth: '400px',
            maxHeight: '90vh',
            overflowY: 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '600' }}>
              Create New Task
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px' }}>
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Add description..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px' }}>
                    Priority
                  </label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as typeof newTaskPriority)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as typeof newTaskCategory)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      color: 'white',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="shopping">Shopping</option>
                    <option value="health">Health</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '6px' }}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '10px',
                    color: 'white',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowAddTask(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTaskTitle.trim()}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: newTaskTitle.trim()
                    ? 'linear-gradient(135deg, colors.brand.primary 0%, colors.brand.tertiary 100%)'
                    : 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: 'white',
                  cursor: newTaskTitle.trim() ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  opacity: newTaskTitle.trim() ? 1 : 0.5
                }}
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
