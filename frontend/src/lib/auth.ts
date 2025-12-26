/**
 * Authentication utility functions
 *
 * SECURITY: JWT tokens are now stored in httpOnly cookies (set by backend)
 * This prevents XSS attacks from stealing tokens.
 * Only user profile data is stored in localStorage (non-sensitive).
 */

/**
 * Check if user is authenticated by checking for user data
 * Note: Actual tokens are in httpOnly cookies, inaccessible to JavaScript
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;

  const user = localStorage.getItem('user');
  return !!user;
};

/**
 * Get user profile data (non-sensitive)
 */
export const getUser = () => {
  if (typeof window === 'undefined') return null;

  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

/**
 * DEPRECATED: Tokens are now in httpOnly cookies
 * This function returns null and exists for backwards compatibility
 * @deprecated Use httpOnly cookies instead
 */
export const getAccessToken = (): string | null => {
  console.warn(
    'getAccessToken is deprecated. Tokens are now in httpOnly cookies.'
  );
  return null;
};

/**
 * Logout user by calling backend logout endpoint
 * Backend will clear httpOnly cookies
 */
export const logout = async () => {
  if (typeof window === 'undefined') return;

  try {
    // Call backend logout to clear httpOnly cookies
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies in request
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ everywhere: false }),
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local user data
    localStorage.removeItem('user');
    // Redirect to login
    window.location.href = '/auth/login-experience';
  }
};

/**
 * Set user profile data (non-sensitive only)
 * SECURITY: Tokens are set by backend as httpOnly cookies, not here
 */
export const setAuthData = (user: any) => {
  if (typeof window === 'undefined') return;

  // Only store non-sensitive user profile data
  // Tokens are set by backend as httpOnly cookies
  localStorage.setItem('user', JSON.stringify(user));
};

/**
 * Make authenticated API request with credentials (cookies)
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    credentials: 'include', // Always include httpOnly cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};
