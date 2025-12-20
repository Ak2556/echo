/**
 * Authentication state management hook.
 * Provides auth state, user info, and auth actions.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, APIError } from '@/lib/api-client';
import type { User, LoginForm, RegisterForm } from '@/lib/auth-schemas';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (
    data: LoginForm
  ) => Promise<{ requires2FA?: boolean; tempToken?: string }>;
  register: (
    data: RegisterForm
  ) => Promise<{ userId: string; requiresVerification: boolean }>;
  logout: (everywhere?: boolean) => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  /**
   * Load user on mount if access token exists.
   */
  useEffect(() => {
    const loadUser = async () => {
      const token = apiClient.getAccessToken();

      if (!token) {
        // No token, clear everything
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        setState({ user: null, loading: false, error: null });
        return;
      }

      // Check if we have user in localStorage first (faster initial load)
      if (typeof window !== 'undefined') {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            const user = JSON.parse(cachedUser);
            setState({ user, loading: false, error: null });
            // Still verify token in background
            apiClient.getCurrentUser().catch(() => {
              // Token invalid, clear everything
              apiClient.setAccessToken(null);
              localStorage.removeItem('user');
              setState({ user: null, loading: false, error: null });
            });
            return;
          } catch (e) {
            localStorage.removeItem('user');
          }
        }
      }

      try {
        const user = await apiClient.getCurrentUser();
        setState({ user, loading: false, error: null });
        // Store for next time
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (error) {
        // Token might be expired, try refresh
        try {
          await apiClient.refreshToken();
          const user = await apiClient.getCurrentUser();
          setState({ user, loading: false, error: null });
          if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
          }
        } catch (refreshError) {
          // Refresh failed, clear token and user
          apiClient.setAccessToken(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
          }
          setState({ user: null, loading: false, error: null });
        }
      }
    };

    loadUser();
  }, []);

  /**
   * Refresh user data from API.
   */
  const refreshUser = useCallback(async () => {
    try {
      const user = await apiClient.getCurrentUser();
      setState((prev) => ({ ...prev, user, error: null }));
    } catch (error) {
      const message =
        error instanceof APIError ? error.message : 'Failed to load user';
      setState((prev) => ({ ...prev, error: message }));
    }
  }, []);

  /**
   * Login with email and password.
   * Returns { requires2FA: true, tempToken: "..." } if 2FA is required.
   */
  const login = useCallback(async (data: LoginForm) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.login(data);

      // Check if 2FA is required
      if (response.requires_2fa) {
        setState((prev) => ({ ...prev, loading: false }));
        return {
          requires2FA: true,
          tempToken: response.access_token, // Temporary token for 2FA verification
        };
      }

      // Login successful, set user and store in localStorage for persistence
      const user = response.user;
      setState({ user, loading: false, error: null });

      // Store user in localStorage for cross-page persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { requires2FA: false };
    } catch (error) {
      const message =
        error instanceof APIError ? error.message : 'Login failed';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, []);

  /**
   * Register a new user.
   * Returns user ID and whether email verification is required.
   */
  const register = useCallback(async (data: RegisterForm) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const response = await apiClient.register(data);
      setState((prev) => ({ ...prev, loading: false }));

      return {
        userId: response.user_id,
        requiresVerification: response.requires_verification,
      };
    } catch (error) {
      const message =
        error instanceof APIError ? error.message : 'Registration failed';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, []);

  /**
   * Logout (revoke tokens).
   * @param everywhere - Logout from all devices
   */
  const logout = useCallback(
    async (everywhere: boolean = false) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        await apiClient.logout(everywhere);
        // Clear user from localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        setState({ user: null, loading: false, error: null });
        router.push('/auth/login');
      } catch (error) {
        // Still clear local state even if API call fails
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
        }
        setState({ user: null, loading: false, error: null });
        router.push('/auth/login');
      }
    },
    [router]
  );

  /**
   * Clear error state.
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    login,
    register,
    logout,
    refreshUser,
    clearError,
  };
}
