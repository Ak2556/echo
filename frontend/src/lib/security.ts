/**
 * Security utilities
 */

export function validateCSRFToken(token: string | null): boolean {
  return !!token && token.length > 0;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const validateInput = {
  message: (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;
    if (input.length > 10000) return false;
    return true;
  },
  model: (input: string): boolean => {
    if (!input || typeof input !== 'string') return false;
    return true;
  },
  temperature: (input: number): boolean => {
    return typeof input === 'number' && input >= 0 && input <= 2;
  },
};
