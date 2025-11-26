'use client';

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
  tags?: string[];
}

interface TaskManagerAppProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function TaskManagerAppUnified({
  isVisible,
  onClose,
}: TaskManagerAppProps) {
  const [activeFilter, setActiveFilter] = useState<
    'all' | 'today' | 'upcoming' | 'overdue'
  >('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as const,
    category: 'work' as const,
    dueDate: '',
  });

  // Sample tasks data
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
    },
    {
      id: '2',
      title: 'Buy groceries',
      description: 'Get ingredients for weekend cooking',
      completed: false,
      priority: 'medium',
      category: 'shopping',
      createdAt: new Date('2024-01-16'),
      tags: ['personal', 'shopping'],
    },
    {
      id: '3',
      title: 'Doctor appointment',
      description: 'Annual health checkup',
      completed: true,
      priority: 'medium',
      category: 'health',
      createdAt: new Date('2024-01-10'),
      dueDate: new Date('2024-01-18'),
    },
  ]);

  // Filter tasks based on active filter
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

  // Calculate stats
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
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

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const addTask = useCallback(() => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      category: newTask.category,
      completed: false,
      createdAt: new Date(),
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
    };

    setTasks((prev) => [task, ...prev]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      category: 'work',
      dueDate: '',
    });
    setShowAddModal(false);
  }, [newTask]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#eab308';
      case 'low':
        return '#22c55e';
      default:
        return '#6b7280';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'work':
        return '💼';
      case 'personal':
        return '👤';
      case 'shopping':
        return '🛒';
      case 'health':
        return '🏥';
      default:
        return '📋';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="miniapp-integration">
      {/* Header */}
      <div className="miniapp-modern-card miniapp-mb-6">
        <div className="miniapp-flex miniapp-justify-between miniapp-items-center">
          <div>
            <h1 className="miniapp-h2 miniapp-text-primary">📋 Task Manager</h1>
            <p className="miniapp-text-sm miniapp-text-secondary miniapp-mt-2">
              Organize your tasks with style and efficiency
            </p>
          </div>
          <div className="miniapp-flex miniapp-gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="miniapp-btn miniapp-btn-primary"
            >
              ➕ Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="miniapp-grid miniapp-grid-cols-4 miniapp-gap-4 miniapp-mb-6">
        <div className="miniapp-card miniapp-text-center">
          <div className="miniapp-text-2xl miniapp-font-bold miniapp-text-primary">
            {stats.total}
          </div>
          <div className="miniapp-text-sm miniapp-text-secondary">Total</div>
        </div>
        <div className="miniapp-card miniapp-text-center">
          <div className="miniapp-text-2xl miniapp-font-bold miniapp-text-success">
            {stats.completed}
          </div>
          <div className="miniapp-text-sm miniapp-text-secondary">
            Completed
          </div>
        </div>
        <div className="miniapp-card miniapp-text-center">
          <div className="miniapp-text-2xl miniapp-font-bold miniapp-text-warning">
            {stats.today}
          </div>
          <div className="miniapp-text-sm miniapp-text-secondary">Today</div>
        </div>
        <div className="miniapp-card miniapp-text-center">
          <div className="miniapp-text-2xl miniapp-font-bold miniapp-text-error">
            {stats.overdue}
          </div>
          <div className="miniapp-text-sm miniapp-text-secondary">Overdue</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="miniapp-tabs miniapp-mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`miniapp-tab ${activeFilter === 'all' ? 'active' : ''}`}
        >
          📋 All Tasks
        </button>
        <button
          onClick={() => setActiveFilter('today')}
          className={`miniapp-tab ${activeFilter === 'today' ? 'active' : ''}`}
        >
          📅 Today
        </button>
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`miniapp-tab ${activeFilter === 'upcoming' ? 'active' : ''}`}
        >
          ⏰ Upcoming
        </button>
        <button
          onClick={() => setActiveFilter('overdue')}
          className={`miniapp-tab ${activeFilter === 'overdue' ? 'active' : ''}`}
        >
          ⚠️ Overdue
        </button>
      </div>

      {/* Tasks List */}
      <div className="miniapp-flex miniapp-flex-col miniapp-gap-3">
        {filteredTasks.length === 0 ? (
          <div className="miniapp-empty-state">
            <div className="miniapp-empty-state-icon">📋</div>
            <div className="miniapp-empty-state-title">No tasks found</div>
            <div className="miniapp-empty-state-description">
              {activeFilter === 'all'
                ? 'Create your first task to get started'
                : `No ${activeFilter} tasks at the moment`}
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`miniapp-card miniapp-hover-lift ${task.completed ? 'opacity-70' : ''}`}
            >
              <div className="miniapp-flex miniapp-items-start miniapp-gap-4">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="miniapp-mt-1"
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: 'var(--miniapp-primary)',
                  }}
                />

                <div className="miniapp-flex-1">
                  <div className="miniapp-flex miniapp-items-center miniapp-gap-2 miniapp-mb-2">
                    <h3
                      className={`miniapp-h4 miniapp-text-primary ${
                        task.completed ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <span style={{ fontSize: '0.8rem' }}>
                      {getCategoryIcon(task.category)}
                    </span>
                  </div>

                  {task.description && (
                    <p className="miniapp-text-sm miniapp-text-secondary miniapp-mb-3">
                      {task.description}
                    </p>
                  )}

                  <div className="miniapp-flex miniapp-items-center miniapp-gap-2 miniapp-flex-wrap">
                    <span
                      className="miniapp-text-xs miniapp-font-semibold miniapp-px-2 miniapp-py-1 miniapp-rounded-full"
                      style={{
                        backgroundColor: getPriorityColor(task.priority),
                        color: 'white',
                      }}
                    >
                      {task.priority}
                    </span>

                    <span className="miniapp-text-xs miniapp-bg-surface miniapp-px-2 miniapp-py-1 miniapp-rounded-full miniapp-border">
                      {task.category}
                    </span>

                    {task.dueDate && (
                      <span className="miniapp-text-xs miniapp-text-secondary">
                        📅 {task.dueDate.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="miniapp-flex miniapp-gap-2">
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="miniapp-btn miniapp-btn-ghost miniapp-btn-sm"
                    title="Delete task"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="miniapp-modern-card"
            style={{ width: '90%', maxWidth: '500px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="miniapp-flex miniapp-justify-between miniapp-items-center miniapp-mb-6">
              <h2 className="miniapp-h3 miniapp-text-primary">Add New Task</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="miniapp-btn miniapp-btn-ghost miniapp-btn-sm"
              >
                ✕
              </button>
            </div>

            <div className="miniapp-flex miniapp-flex-col miniapp-gap-4">
              <div className="miniapp-form-group">
                <label className="miniapp-label">Task Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="miniapp-input"
                  placeholder="Enter task title"
                />
              </div>

              <div className="miniapp-form-group">
                <label className="miniapp-label">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="miniapp-input miniapp-textarea"
                  placeholder="Enter task description"
                  rows={3}
                />
              </div>

              <div className="miniapp-grid miniapp-grid-cols-2 miniapp-gap-4">
                <div className="miniapp-form-group">
                  <label className="miniapp-label">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        priority: e.target.value as any,
                      }))
                    }
                    className="miniapp-input miniapp-select"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div className="miniapp-form-group">
                  <label className="miniapp-label">Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        category: e.target.value as any,
                      }))
                    }
                    className="miniapp-input miniapp-select"
                  >
                    <option value="work">💼 Work</option>
                    <option value="personal">👤 Personal</option>
                    <option value="shopping">🛒 Shopping</option>
                    <option value="health">🏥 Health</option>
                  </select>
                </div>
              </div>

              <div className="miniapp-form-group">
                <label className="miniapp-label">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) =>
                    setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="miniapp-input"
                />
              </div>
            </div>

            <div className="miniapp-flex miniapp-justify-end miniapp-gap-3 miniapp-mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="miniapp-btn miniapp-btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="miniapp-btn miniapp-btn-primary"
                disabled={!newTask.title.trim()}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
