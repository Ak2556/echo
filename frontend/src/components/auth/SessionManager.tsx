/**
 * Session manager component - displays active sessions and allows revocation.
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from '@/hooks/useSession';
import type { Session } from '@/lib/auth-schemas';

interface SessionManagerProps {
  className?: string;
}

export default function SessionManager({
  className = '',
}: SessionManagerProps) {
  const {
    sessions,
    loading,
    error,
    revokeSession,
    revokeAllOtherSessions,
    refreshSessions,
  } = useSession();
  const [revokingSessionId, setRevokingSessionId] = useState<string | null>(
    null
  );
  const [revokingAll, setRevokingAll] = useState(false);

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;

    setRevokingSessionId(sessionId);
    try {
      await revokeSession(sessionId);
    } catch (err) {
      // Error already handled in hook
    } finally {
      setRevokingSessionId(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('Are you sure you want to sign out of all other devices?'))
      return;

    setRevokingAll(true);
    try {
      await revokeAllOtherSessions();
    } catch (err) {
      // Error already handled in hook
    } finally {
      setRevokingAll(false);
    }
  };

  if (loading && sessions.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <SessionSkeleton />
        <SessionSkeleton />
        <SessionSkeleton />
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Active Sessions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage devices where you're currently logged in
          </p>
        </div>

        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
          >
            {revokingAll ? 'Revoking...' : 'Sign out all others'}
          </button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200"
        >
          {error}
        </motion.div>
      )}

      {/* Session list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={() => handleRevokeSession(session.id)}
              isRevoking={revokingSessionId === session.id}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty state */}
      {sessions.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 text-gray-500 dark:text-gray-400"
        >
          <p>No active sessions found</p>
          <button
            onClick={refreshSessions}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Refresh
          </button>
        </motion.div>
      )}
    </div>
  );
}

interface SessionCardProps {
  session: Session;
  onRevoke: () => void;
  isRevoking: boolean;
}

function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const deviceIcon = getDeviceIcon(session.device_type || 'unknown');
  const lastActive = formatLastActive(session.last_activity || session.last_active);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`p-4 rounded-lg border ${
        session.is_current
          ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Device icon */}
          <div className="text-2xl">{deviceIcon}</div>

          {/* Device info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {session.device_name}
              </h4>
              {session.is_current && (
                <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full">
                  Current
                </span>
              )}
            </div>

            <div className="mt-1 space-y-0.5 text-sm text-gray-600 dark:text-gray-400">
              <p>{session.ip_address}</p>
              {session.location && <p>{session.location}</p>}
              <p className="text-xs">Last active: {lastActive}</p>
            </div>
          </div>
        </div>

        {/* Revoke button */}
        {!session.is_current && (
          <button
            onClick={onRevoke}
            disabled={isRevoking}
            className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50"
          >
            {isRevoking ? 'Revoking...' : 'Revoke'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function SessionSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

function getDeviceIcon(deviceType: string): string {
  const type = deviceType.toLowerCase();
  if (type.includes('mobile') || type.includes('phone')) return '📱';
  if (type.includes('tablet')) return '📱';
  if (type.includes('desktop') || type.includes('computer')) return '💻';
  if (type.includes('browser')) return '🌐';
  return '🖥️';
}

function formatLastActive(lastActivity: string): string {
  const date = new Date(lastActivity);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}
