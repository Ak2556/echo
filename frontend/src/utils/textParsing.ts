// Utility functions for parsing mentions and hashtags

export interface ParsedEntity {
  type: 'text' | 'mention' | 'hashtag' | 'url';
  content: string;
  value?: string; // The actual username/hashtag without @ or #
}

/**
 * Parse text and extract mentions, hashtags, and URLs
 */
export function parseText(text: string): ParsedEntity[] {
  if (!text) return [];

  const entities: ParsedEntity[] = [];

  // Combined regex for mentions, hashtags, and URLs
  const pattern = /(@[\w]+)|(#[\w]+)|(https?:\/\/[^\s]+)|([^@#\s]+|\s+)/g;

  let match;
  let lastIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    const [fullMatch, mention, hashtag, url, other] = match;

    if (mention) {
      entities.push({
        type: 'mention',
        content: mention,
        value: mention.slice(1) // Remove @
      });
    } else if (hashtag) {
      entities.push({
        type: 'hashtag',
        content: hashtag,
        value: hashtag.slice(1) // Remove #
      });
    } else if (url) {
      entities.push({
        type: 'url',
        content: url,
        value: url
      });
    } else if (other) {
      entities.push({
        type: 'text',
        content: other
      });
    }

    lastIndex = pattern.lastIndex;
  }

  return entities;
}

/**
 * Extract all mentions from text
 */
export function extractMentions(text: string): string[] {
  const mentionPattern = /@([\w]+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionPattern.exec(text)) !== null) {
    mentions.push(match[1]);
  }

  return mentions;
}

/**
 * Extract all hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const hashtagPattern = /#([\w]+)/g;
  const hashtags: string[] = [];
  let match;

  while ((match = hashtagPattern.exec(text)) !== null) {
    hashtags.push(match[1]);
  }

  return hashtags;
}

/**
 * Get current word being typed and cursor position context
 */
export function getCurrentWord(text: string, cursorPosition: number): {
  word: string;
  type: 'mention' | 'hashtag' | 'text';
  startIndex: number;
  endIndex: number;
} | null {
  // Find the start of the current word
  let startIndex = cursorPosition - 1;
  while (startIndex >= 0 && text[startIndex] !== ' ' && text[startIndex] !== '\n') {
    startIndex--;
  }
  startIndex++;

  // Find the end of the current word
  let endIndex = cursorPosition;
  while (endIndex < text.length && text[endIndex] !== ' ' && text[endIndex] !== '\n') {
    endIndex++;
  }

  const word = text.slice(startIndex, endIndex);

  if (!word) return null;

  // Determine type
  if (word.startsWith('@')) {
    return {
      word: word.slice(1),
      type: 'mention',
      startIndex,
      endIndex
    };
  } else if (word.startsWith('#')) {
    return {
      word: word.slice(1),
      type: 'hashtag',
      startIndex,
      endIndex
    };
  }

  return null;
}

/**
 * Mock data for autocomplete suggestions
 */
export const mockUsers = [
  { username: 'priya_sharma', name: 'Priya Sharma', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya', verified: true },
  { username: 'arjun_singh', name: 'Arjun Singh', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun', verified: false },
  { username: 'sarah_jones', name: 'Sarah Jones', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', verified: true },
  { username: 'raj_kumar', name: 'Raj Kumar', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Raj', verified: false },
  { username: 'emily_chen', name: 'Emily Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily', verified: true },
  { username: 'david_miller', name: 'David Miller', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', verified: false },
  { username: 'ananya_patel', name: 'Ananya Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya', verified: false },
  { username: 'michael_brown', name: 'Michael Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael', verified: true },
];

export const mockHashtags = [
  { tag: 'technology', postCount: 15432 },
  { tag: 'ai', postCount: 12890 },
  { tag: 'design', postCount: 9876 },
  { tag: 'startup', postCount: 8765 },
  { tag: 'coding', postCount: 7654 },
  { tag: 'entrepreneurship', postCount: 6543 },
  { tag: 'innovation', postCount: 5432 },
  { tag: 'business', postCount: 4321 },
  { tag: 'marketing', postCount: 3210 },
  { tag: 'productivity', postCount: 2109 },
];

/**
 * Search users for mention autocomplete
 */
export function searchUsers(query: string) {
  const q = query.toLowerCase();
  return mockUsers.filter(user =>
    user.username.toLowerCase().includes(q) ||
    user.name.toLowerCase().includes(q)
  ).slice(0, 5);
}

/**
 * Search hashtags for autocomplete
 */
export function searchHashtags(query: string) {
  const q = query.toLowerCase();
  return mockHashtags.filter(hashtag =>
    hashtag.tag.toLowerCase().includes(q)
  ).slice(0, 5);
}
