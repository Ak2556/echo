import React from 'react';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

interface IconProps {
  name: IconName;
  size?: number | string;
  color?: string;
  className?: string;
  strokeWidth?: number;
  'aria-label'?: string;
}

/**
 * Unified Icon component using lucide-react
 * Provides consistent sizing, coloring, and accessibility across the app
 */
export default function Icon({
  name,
  size = 20,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
  'aria-label': ariaLabel,
}: IconProps) {
  const LucideIcon = LucideIcons[
    name
  ] as React.ComponentType<LucideIcons.LucideProps>;

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in lucide-react`);
    return null;
  }

  return (
    <LucideIcon
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      aria-label={ariaLabel || name}
    />
  );
}

// Export icon mapping for easy access
export const iconNames = {
  // General
  add: 'Plus',
  close: 'X',
  check: 'Check',
  edit: 'Pencil',
  delete: 'Trash2',
  view: 'Eye',
  search: 'Search',
  filter: 'Filter',
  refresh: 'RefreshCw',
  download: 'Download',
  upload: 'Upload',

  // Navigation
  home: 'Home',
  settings: 'Settings',
  menu: 'Menu',
  back: 'ArrowLeft',
  forward: 'ArrowRight',

  // Social
  like: 'Heart',
  message: 'MessageCircle',
  share: 'Share2',
  notification: 'Bell',
  user: 'User',
  users: 'Users',

  // Data
  list: 'List',
  table: 'Table',
  grid: 'Grid',
  chart: 'BarChart3',
  trendingUp: 'TrendingUp',
  trendingDown: 'TrendingDown',

  // Farm/Dairy
  cow: 'Beef',
  health: 'HeartPulse',
  hospital: 'Hospital',
  medicine: 'Pill',
  temperature: 'Thermometer',

  // Business
  money: 'DollarSign',
  shop: 'ShoppingCart',
  product: 'Package',
  invoice: 'FileText',

  // Communication
  phone: 'Phone',
  email: 'Mail',
  chat: 'MessageSquare',

  // Education
  book: 'Book',
  graduation: 'GraduationCap',
  learning: 'BookOpen',

  // Calendar/Time
  calendar: 'Calendar',
  clock: 'Clock',
  reminder: 'BellRing',

  // Files
  file: 'File',
  folder: 'Folder',
  image: 'Image',

  // Status
  success: 'CheckCircle',
  error: 'XCircle',
  warning: 'AlertTriangle',
  info: 'Info',

  // Other
  target: 'Target',
  airplane: 'Plane',
  vacation: 'Palmtree',
  food: 'UtensilsCrossed',
  language: 'Languages',
} as const;
