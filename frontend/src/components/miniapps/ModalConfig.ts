import { ModalField, ModalAction } from './UniversalModal';

export interface AppModalConfig {
  id: string;
  title: string;
  icon: string;
  description?: string;
  fields: ModalField[];
  actions: ModalAction[];
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const APP_MODALS: Record<string, Record<string, AppModalConfig>> = {
  // Productivity Apps
  calculator: {
    'history': {
      id: 'calculator-history',
      title: 'Calculation History',
      icon: '📊',
      description: 'View and manage your calculation history',
      fields: [],
      actions: [
        { label: 'Clear History', type: 'danger', onClick: () => {} },
        { label: 'Export', type: 'secondary', onClick: () => {} },
        { label: 'Close', type: 'secondary', onClick: () => {} }
      ],
      size: 'md'
    },
    'settings': {
      id: 'calculator-settings',
      title: 'Calculator Settings',
      icon: '⚙️',
      fields: [
        { id: 'precision', label: 'Decimal Precision', type: 'number', defaultValue: 10 },
        { id: 'angleUnit', label: 'Angle Unit', type: 'select', options: [
          { value: 'deg', label: 'Degrees' },
          { value: 'rad', label: 'Radians' }
        ]},
        { id: 'scientific', label: 'Scientific Mode', type: 'checkbox', defaultValue: false }
      ],
      actions: [
        { label: 'Reset', type: 'secondary', onClick: () => {} },
        { label: 'Save', type: 'primary', onClick: () => {} }
      ]
    }
  },

  tasks: {
    'add-task': {
      id: 'add-task',
      title: 'Add New Task',
      icon: '➕',
      fields: [
        { id: 'title', label: 'Task Title', type: 'text', required: true, placeholder: 'Enter task title' },
        { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Task details...' },
        { id: 'priority', label: 'Priority', type: 'select', options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
          { value: 'urgent', label: 'Urgent' }
        ]},
        { id: 'category', label: 'Category', type: 'select', options: [
          { value: 'work', label: 'Work' },
          { value: 'personal', label: 'Personal' },
          { value: 'shopping', label: 'Shopping' },
          { value: 'health', label: 'Health' }
        ]},
        { id: 'dueDate', label: 'Due Date', type: 'date' },
        { id: 'reminder', label: 'Set Reminder', type: 'checkbox' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Add Task', type: 'primary', onClick: () => {} }
      ]
    },
    'bulk-actions': {
      id: 'bulk-actions',
      title: 'Bulk Task Actions',
      icon: '⚡',
      description: 'Perform actions on multiple tasks',
      fields: [
        { id: 'action', label: 'Action', type: 'select', options: [
          { value: 'complete', label: 'Mark as Complete' },
          { value: 'delete', label: 'Delete Tasks' },
          { value: 'priority', label: 'Change Priority' },
          { value: 'category', label: 'Change Category' }
        ]},
        { id: 'newValue', label: 'New Value', type: 'text', placeholder: 'Enter new value' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Apply', type: 'primary', onClick: () => {} }
      ]
    }
  },

  notes: {
    'new-note': {
      id: 'new-note',
      title: 'Create New Note',
      icon: '📝',
      fields: [
        { id: 'title', label: 'Note Title', type: 'text', required: true },
        { id: 'content', label: 'Content', type: 'textarea', required: true },
        { id: 'tags', label: 'Tags', type: 'text', placeholder: 'Comma-separated tags' },
        { id: 'category', label: 'Category', type: 'select', options: [
          { value: 'general', label: 'General' },
          { value: 'work', label: 'Work' },
          { value: 'personal', label: 'Personal' },
          { value: 'ideas', label: 'Ideas' }
        ]},
        { id: 'pinned', label: 'Pin Note', type: 'checkbox' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Save Note', type: 'primary', onClick: () => {} }
      ],
      size: 'lg'
    },
    'import-export': {
      id: 'import-export',
      title: 'Import/Export Notes',
      icon: '📁',
      fields: [
        { id: 'action', label: 'Action', type: 'select', options: [
          { value: 'import', label: 'Import Notes' },
          { value: 'export', label: 'Export Notes' }
        ]},
        { id: 'format', label: 'Format', type: 'select', options: [
          { value: 'json', label: 'JSON' },
          { value: 'csv', label: 'CSV' },
          { value: 'txt', label: 'Plain Text' }
        ]},
        { id: 'file', label: 'File', type: 'file' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Process', type: 'primary', onClick: () => {} }
      ]
    }
  },

  calendar: {
    'new-event': {
      id: 'new-event',
      title: 'Create New Event',
      icon: '📅',
      fields: [
        { id: 'title', label: 'Event Title', type: 'text', required: true },
        { id: 'description', label: 'Description', type: 'textarea' },
        { id: 'startDate', label: 'Start Date', type: 'date', required: true },
        { id: 'startTime', label: 'Start Time', type: 'time', required: true },
        { id: 'endDate', label: 'End Date', type: 'date' },
        { id: 'endTime', label: 'End Time', type: 'time' },
        { id: 'location', label: 'Location', type: 'text' },
        { id: 'reminder', label: 'Reminder', type: 'select', options: [
          { value: '0', label: 'At event time' },
          { value: '15', label: '15 minutes before' },
          { value: '30', label: '30 minutes before' },
          { value: '60', label: '1 hour before' },
          { value: '1440', label: '1 day before' }
        ]},
        { id: 'recurring', label: 'Recurring', type: 'select', options: [
          { value: 'none', label: 'No repeat' },
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' }
        ]}
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Create Event', type: 'primary', onClick: () => {} }
      ],
      size: 'lg'
    }
  },

  finance: {
    'add-transaction': {
      id: 'add-transaction',
      title: 'Add Transaction',
      icon: '💰',
      fields: [
        { id: 'type', label: 'Type', type: 'select', options: [
          { value: 'income', label: 'Income' },
          { value: 'expense', label: 'Expense' }
        ], required: true },
        { id: 'amount', label: 'Amount', type: 'number', required: true },
        { id: 'category', label: 'Category', type: 'select', options: [
          { value: 'food', label: 'Food' },
          { value: 'transport', label: 'Transport' },
          { value: 'entertainment', label: 'Entertainment' },
          { value: 'bills', label: 'Bills' },
          { value: 'salary', label: 'Salary' },
          { value: 'other', label: 'Other' }
        ]},
        { id: 'description', label: 'Description', type: 'text' },
        { id: 'date', label: 'Date', type: 'date', required: true },
        { id: 'recurring', label: 'Recurring Transaction', type: 'checkbox' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Add Transaction', type: 'primary', onClick: () => {} }
      ]
    },
    'budget-setup': {
      id: 'budget-setup',
      title: 'Set Budget',
      icon: '📊',
      fields: [
        { id: 'category', label: 'Category', type: 'select', options: [
          { value: 'food', label: 'Food' },
          { value: 'transport', label: 'Transport' },
          { value: 'entertainment', label: 'Entertainment' },
          { value: 'bills', label: 'Bills' }
        ]},
        { id: 'amount', label: 'Budget Amount', type: 'number', required: true },
        { id: 'period', label: 'Period', type: 'select', options: [
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' },
          { value: 'yearly', label: 'Yearly' }
        ]},
        { id: 'alert', label: 'Alert at % spent', type: 'number', defaultValue: 80 }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Set Budget', type: 'primary', onClick: () => {} }
      ]
    }
  },

  weather: {
    'add-location': {
      id: 'add-location',
      title: 'Add Location',
      icon: '📍',
      fields: [
        { id: 'city', label: 'City Name', type: 'text', required: true },
        { id: 'country', label: 'Country', type: 'text' },
        { id: 'default', label: 'Set as Default', type: 'checkbox' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Add Location', type: 'primary', onClick: () => {} }
      ]
    },
    'weather-alerts': {
      id: 'weather-alerts',
      title: 'Weather Alerts',
      icon: '🚨',
      fields: [
        { id: 'type', label: 'Alert Type', type: 'select', options: [
          { value: 'rain', label: 'Rain Alert' },
          { value: 'temp', label: 'Temperature Alert' },
          { value: 'wind', label: 'Wind Alert' }
        ]},
        { id: 'threshold', label: 'Threshold Value', type: 'number' },
        { id: 'notifications', label: 'Push Notifications', type: 'checkbox' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Create Alert', type: 'primary', onClick: () => {} }
      ]
    }
  },

  // Media & Entertainment Apps
  musicplayer: {
    'create-playlist': {
      id: 'create-playlist',
      title: 'Create Playlist',
      icon: '🎵',
      fields: [
        { id: 'name', label: 'Playlist Name', type: 'text', required: true },
        { id: 'description', label: 'Description', type: 'textarea' },
        { id: 'public', label: 'Make Public', type: 'checkbox' },
        { id: 'cover', label: 'Cover Image', type: 'file' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Create', type: 'primary', onClick: () => {} }
      ]
    },
    'equalizer': {
      id: 'equalizer',
      title: 'Audio Equalizer',
      icon: '🎚️',
      description: 'Adjust audio settings',
      fields: [
        { id: 'preset', label: 'Preset', type: 'select', options: [
          { value: 'normal', label: 'Normal' },
          { value: 'rock', label: 'Rock' },
          { value: 'pop', label: 'Pop' },
          { value: 'jazz', label: 'Jazz' },
          { value: 'classical', label: 'Classical' }
        ]},
        { id: 'bass', label: 'Bass', type: 'number', defaultValue: 0 },
        { id: 'treble', label: 'Treble', type: 'number', defaultValue: 0 }
      ],
      actions: [
        { label: 'Reset', type: 'secondary', onClick: () => {} },
        { label: 'Apply', type: 'primary', onClick: () => {} }
      ]
    }
  },

  // Tools & Utilities
  texttools: {
    'batch-process': {
      id: 'batch-process',
      title: 'Batch Text Processing',
      icon: '⚡',
      fields: [
        { id: 'input', label: 'Input Text', type: 'textarea', required: true },
        { id: 'operation', label: 'Operation', type: 'select', options: [
          { value: 'uppercase', label: 'Convert to Uppercase' },
          { value: 'lowercase', label: 'Convert to Lowercase' },
          { value: 'title', label: 'Title Case' },
          { value: 'reverse', label: 'Reverse Text' },
          { value: 'remove-spaces', label: 'Remove Extra Spaces' },
          { value: 'word-count', label: 'Count Words' }
        ]},
        { id: 'separator', label: 'Line Separator', type: 'text', defaultValue: '\n' }
      ],
      actions: [
        { label: 'Clear', type: 'secondary', onClick: () => {} },
        { label: 'Process', type: 'primary', onClick: () => {} }
      ],
      size: 'lg'
    }
  },

  colorpicker: {
    'palette-manager': {
      id: 'palette-manager',
      title: 'Manage Color Palettes',
      icon: '🎨',
      fields: [
        { id: 'name', label: 'Palette Name', type: 'text', required: true },
        { id: 'colors', label: 'Colors (hex codes)', type: 'textarea', placeholder: '#ff0000\n#00ff00\n#0000ff' },
        { id: 'public', label: 'Share with Community', type: 'checkbox' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Save Palette', type: 'primary', onClick: () => {} }
      ]
    }
  },

  // Health & Fitness
  habittracker: {
    'add-habit': {
      id: 'add-habit',
      title: 'Add New Habit',
      icon: '🎯',
      fields: [
        { id: 'name', label: 'Habit Name', type: 'text', required: true },
        { id: 'description', label: 'Description', type: 'textarea' },
        { id: 'frequency', label: 'Frequency', type: 'select', options: [
          { value: 'daily', label: 'Daily' },
          { value: 'weekly', label: 'Weekly' },
          { value: 'monthly', label: 'Monthly' }
        ]},
        { id: 'target', label: 'Target (e.g., 30 minutes)', type: 'text' },
        { id: 'category', label: 'Category', type: 'select', options: [
          { value: 'health', label: 'Health' },
          { value: 'fitness', label: 'Fitness' },
          { value: 'productivity', label: 'Productivity' },
          { value: 'learning', label: 'Learning' },
          { value: 'social', label: 'Social' }
        ]},
        { id: 'reminder', label: 'Daily Reminder Time', type: 'time' }
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Add Habit', type: 'primary', onClick: () => {} }
      ]
    }
  },

  // Developer Tools
  'qr-code': {
    'batch-generate': {
      id: 'batch-generate',
      title: 'Batch QR Code Generation',
      icon: '📱',
      fields: [
        { id: 'input', label: 'Input Data (one per line)', type: 'textarea', required: true },
        { id: 'size', label: 'QR Code Size', type: 'select', options: [
          { value: '128', label: '128x128' },
          { value: '256', label: '256x256' },
          { value: '512', label: '512x512' }
        ]},
        { id: 'format', label: 'Output Format', type: 'select', options: [
          { value: 'png', label: 'PNG' },
          { value: 'svg', label: 'SVG' }
        ]},
        { id: 'errorCorrection', label: 'Error Correction', type: 'select', options: [
          { value: 'L', label: 'Low (7%)' },
          { value: 'M', label: 'Medium (15%)' },
          { value: 'Q', label: 'Quartile (25%)' },
          { value: 'H', label: 'High (30%)' }
        ]}
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Generate All', type: 'primary', onClick: () => {} }
      ],
      size: 'lg'
    }
  }
};

// Helper function to get modals for a specific app
export const getAppModals = (appId: string): Record<string, AppModalConfig> => {
  return APP_MODALS[appId] || {};
};

// Helper function to get a specific modal config
export const getModalConfig = (appId: string, modalId: string): AppModalConfig | null => {
  return APP_MODALS[appId]?.[modalId] || null;
};

// Generate additional modal configs for remaining apps
export const generateDefaultModals = (appId: string): Record<string, AppModalConfig> => {
  const defaultModals: Record<string, AppModalConfig> = {
    settings: {
      id: `${appId}-settings`,
      title: 'Settings',
      icon: '⚙️',
      fields: [
        { id: 'theme', label: 'Theme', type: 'select', options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
          { value: 'auto', label: 'Auto' }
        ]},
        { id: 'notifications', label: 'Enable Notifications', type: 'checkbox', defaultValue: true }
      ],
      actions: [
        { label: 'Reset', type: 'secondary', onClick: () => {} },
        { label: 'Save', type: 'primary', onClick: () => {} }
      ]
    },
    help: {
      id: `${appId}-help`,
      title: 'Help & Tips',
      icon: '💡',
      description: 'Learn how to use this app effectively',
      fields: [],
      actions: [
        { label: 'Close', type: 'secondary', onClick: () => {} }
      ]
    },
    export: {
      id: `${appId}-export`,
      title: 'Export Data',
      icon: '📤',
      fields: [
        { id: 'format', label: 'Export Format', type: 'select', options: [
          { value: 'json', label: 'JSON' },
          { value: 'csv', label: 'CSV' },
          { value: 'pdf', label: 'PDF' }
        ]},
        { id: 'dateRange', label: 'Date Range', type: 'select', options: [
          { value: 'all', label: 'All Data' },
          { value: 'last7', label: 'Last 7 days' },
          { value: 'last30', label: 'Last 30 days' },
          { value: 'custom', label: 'Custom Range' }
        ]}
      ],
      actions: [
        { label: 'Cancel', type: 'secondary', onClick: () => {} },
        { label: 'Export', type: 'primary', onClick: () => {} }
      ]
    }
  };

  return { ...defaultModals, ...(APP_MODALS[appId] || {}) };
};