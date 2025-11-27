/**
 * CSRF Token Management
 */

export function getCSRFToken(): string | null {
  if (typeof document === 'undefined') return null;

  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrf_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

export function setCSRFToken(token: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `csrf_token=${encodeURIComponent(token)}; path=/; SameSite=Strict`;
}
