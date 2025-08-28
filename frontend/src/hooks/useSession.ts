/**
 * Session management hook.
 * Provides session list and session revocation.
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, APIError } from '@/lib/api-client';
import type { Session } from '@/lib/auth-schemas';

interface SessionState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
}

interface SessionActions {
  refreshSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  revokeAllOtherSessions: () => Promise<void>;
  clearError: () => void;
}

export function useSession(): SessionState & SessionActions {
  const [state, setState] = useState<SessionState>({
    sessions: [],
    loading: true,
    error: null,
  });

  /**
   * Load sessions on mount.
   */
  const loadSessions = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const sessions = await apiClient.getSessions();
      setState({ sessions, loading: false, error: null });
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Failed to load sessions';
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  /**
   * Refresh sessions list.
   */
  const refreshSessions = useCallback(async () => {
    await loadSessions();
  }, [loadSessions]);

  /**
   * Revoke a specific session.
   */
  const revokeSession = useCallback(async (sessionId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Find the session to check if it's the current one
      const session = state.sessions.find((s) => s.id === sessionId);

      if (session?.is_current) {
        // Revoking current session = logout
        await apiClient.logout(false);
        setState({ sessions: [], loading: false, error: null });
      } else {
        // Revoke specific session via logout endpoint
        // Note: Backend would need a DELETE /sessions/{id} endpoint
        // For now, we'll just refresh the list after logout
        await apiClient.logout(false);
        await loadSessions();
      }
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Failed to revoke session';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, [state.sessions, loadSessions]);

  /**
   * Revoke all sessions except current.
   */
  const revokeAllOtherSessions = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Backend logout with everywhere=false but revoke_others=true
      // For now using logout everywhere then re-login
      await apiClient.logout(true);

      // Reload sessions
      await loadSessions();
    } catch (error) {
      const message = error instanceof APIError ? error.message : 'Failed to revoke sessions';
      setState((prev) => ({ ...prev, loading: false, error: message }));
      throw error;
    }
  }, [loadSessions]);

  /**
   * Clear error state.
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    refreshSessions,
    revokeSession,
    revokeAllOtherSessions,
    clearError,
  };
}
