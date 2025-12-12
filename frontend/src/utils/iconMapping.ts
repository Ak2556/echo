/**
 * Mapping of emoji icons to lucide-react icon names
 * This helps in the migration from emoji to SVG icons
 */

export const emojiToLucideMapping: Record<string, string> = {
  // Dairy Farm Manager
  '🐄': 'Beef',
  '📋': 'ClipboardList',
  '📊': 'BarChart3',
  '✏️': 'Pencil',
  '🗑️': 'Trash2',
  '👁️': 'Eye',
  '➕': 'Plus',
  '✓': 'Check',
  '✕': 'X',

  // Health & Medical
  '🏥': 'Hospital',
  '💊': 'Pill',
  '🌡️': 'Thermometer',
  '🩺': 'Stethoscope',

  // General UI
  '🎯': 'Target',
  '📝': 'FileText',
  '💬': 'MessageCircle',
  '🔔': 'Bell',
  '⚙️': 'Settings',
  '🏠': 'Home',
  '🔍': 'Search',
  '🔄': 'RefreshCw',
  '⬆️': 'ArrowUp',
  '⬇️': 'ArrowDown',

  // Business & Finance
  '💰': 'DollarSign',
  '🛒': 'ShoppingCart',
  '🛍️': 'ShoppingBag',
  '📈': 'TrendingUp',
  '📉': 'TrendingDown',

  // Communication
  '📱': 'Smartphone',
  '✈️': 'Plane',
  '🏖️': 'Palmtree',
  '🍽️': 'UtensilsCrossed',
  '🗣️': 'Languages',

  // Social
  '❤️': 'Heart',
  '✂️': 'Scissors',

  // Status
  '🖥️': 'Monitor',
  '⭐': 'Star',
  '🔥': 'Flame',
};

/**
 * Get lucide-react icon name from emoji
 */
export function getLucideIconFromEmoji(emoji: string): string {
  return emojiToLucideMapping[emoji] || 'CircleHelp';
}

/**
 * Common icon sizes used across the app
 */
export const iconSizes = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
} as const;

/**
 * Icon presets for common use cases
 */
export const iconPresets = {
  button: { size: 18, strokeWidth: 2 },
  card: { size: 24, strokeWidth: 2 },
  header: { size: 28, strokeWidth: 2.5 },
  inline: { size: 16, strokeWidth: 2 },
  large: { size: 48, strokeWidth: 1.5 },
} as const;
