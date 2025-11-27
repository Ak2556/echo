/**
 * Centralized API client for making requests to the backend.
 * Handles authentication, error handling, and request configuration.
 *
 * SECURITY: JWT tokens are now stored in httpOnly cookies (set by backend).
 * Authentication is handled automatically via cookies, not Authorization headers.
 * CSRF protection implemented via Double-Submit Cookie pattern.
 */

import { getCSRFToken } from './csrf';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
}

export class APIError extends Error {
  status: number;
  detail?: string;

  constructor(message: string, status: number, detail?: string) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.detail = detail;
  }
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  /**
   * DEPRECATED: Tokens are now in httpOnly cookies
   * @deprecated Use httpOnly cookies instead
   */
  getAccessToken(): string | null {
    console.warn('getAccessToken is deprecated. Tokens are now in httpOnly cookies.');
    return null;
  }

  /**
   * DEPRECATED: Tokens are now in httpOnly cookies
   * @deprecated Use httpOnly cookies instead
   */
  setAccessToken(token: string | null): void {
    console.warn('setAccessToken is deprecated. Tokens are now in httpOnly cookies.');
    // No-op: tokens are managed by backend via httpOnly cookies
  }

  /**
   * SECURITY: No longer uses Authorization header
   * Authentication is handled via httpOnly cookies automatically
   */
  private getAuthHeader(): Record<string, string> {
    // Tokens are in httpOnly cookies, no Authorization header needed
    return {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { requiresAuth = false, headers = {}, ...restOptions } = options;

    const headersObj = headers instanceof Headers
      ? Object.fromEntries(headers.entries())
      : headers || {};

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headersObj,
    } as Record<string, string>;

    // SECURITY: Add CSRF token for state-changing requests
    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      const csrfToken = getCSRFToken();
      if (csrfToken) {
        requestHeaders['X-CSRF-Token'] = csrfToken;
      }
    }

    const config: RequestInit = {
      ...restOptions,
      credentials: 'include', // SECURITY: Always include httpOnly cookies
      headers: requestHeaders,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);
    const contentType = response.headers.get('content-type');
    const isJSON = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = response.statusText;
      let errorDetail: string | undefined;

      if (isJSON) {
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.detail || response.statusText;
          errorDetail = errorData.detail;
        } catch {
          // If JSON parsing fails, use statusText
        }
      }

      throw new APIError(errorMessage, response.status, errorDetail);
    }

    return isJSON ? await response.json() : ({} as T);
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Auth-specific methods
  async getCurrentUser(): Promise<any> {
    return this.get('/api/auth/me', { requiresAuth: true });
  }

  async login(data: any): Promise<any> {
    const response = await this.post<any>('/api/auth/login', data);
    if (response.access_token) {
      this.setAccessToken(response.access_token);
      if (response.refresh_token) {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
    }
    return response;
  }

  async register(data: any): Promise<any> {
    return this.post('/api/auth/register', data);
  }

  async logout(everywhere: boolean = false): Promise<void> {
    try {
      await this.post('/api/auth/logout', { everywhere }, { requiresAuth: true });
    } finally {
      this.setAccessToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    }
  }

  async refreshToken(): Promise<any> {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await this.post<any>('/api/auth/refresh', { refresh_token: refreshToken });
    if (response.access_token) {
      this.setAccessToken(response.access_token);
    }
    return response;
  }

  async forgotPassword(data: { email: string }): Promise<any> {
    return this.post('/api/auth/forgot-password', data);
  }

  async resetPassword(data: { token: string; password: string }): Promise<any> {
    return this.post('/api/auth/reset-password', data);
  }

  async verifyResetToken(token: string): Promise<any> {
    return this.get(`/api/auth/verify-reset-token?token=${token}`);
  }

  async verifyEmail(data: { email: string; code: string }): Promise<any> {
    return this.post('/api/auth/verify-email', data);
  }

  async setup2FA(): Promise<any> {
    return this.post('/api/auth/totp/setup', {}, { requiresAuth: true });
  }

  async verify2FASetup(data: { code: string }): Promise<any> {
    return this.post('/api/auth/totp/verify-setup', data, { requiresAuth: true });
  }

  async getSessions(): Promise<any> {
    return this.get('/api/auth/sessions', { requiresAuth: true });
  }
}

export const apiClient = new APIClient();
export { APIClient };
