'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatUtils } from '@/utils/chatUtils';
import {
  useConversationHistory,
  Conversation,
} from '@/hooks/useConversationHistory';
import { AISettings } from '@/services/api';
import { MessageCircle, X } from 'lucide-react';

interface ConversationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AISettings;
  onSettingsChange: (settings: AISettings) => void;
  onNewConversation: () => void;
  onClearAll: () => void;
  className?: string;
}

export default function ConversationSidebar({
  isOpen,
  onClose,
  currentSettings,
  onSettingsChange,
  onNewConversation,
  onClearAll,
  className = '',
}: ConversationSidebarProps) {
  const {
    conversations,
    filteredConversations,
    currentConversationId,
    searchQuery,
    setCurrentConversation,
    searchConversations,
    deleteConversation,
    toggleBookmark,
    exportConversation,
    clearAllConversations,
  } = useConversationHistory();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [showExportMenu, setShowExportMenu] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when sidebar opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleExport = (
    conversationId: string,
    format: 'json' | 'markdown' | 'txt'
  ) => {
    const content = exportConversation(conversationId, format);
    if (content) {
      const conversation = conversations.find((c) => c.id === conversationId);
      const filename = `${conversation?.title || 'conversation'}.${format}`;
      ChatUtils.downloadFile(content, filename);
    }
    setShowExportMenu(null);
  };

  const handleClearAll = () => {
    clearAllConversations();
    onClearAll();
    setShowClearConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          {!className.includes('relative') && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] lg:hidden"
              onClick={onClose}
            />
          )}

          {/* Sidebar */}
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`${
              className.includes('relative')
                ? 'relative h-full w-80'
                : 'fixed left-0 top-0 h-full w-80 z-[10000] shadow-2xl'
            } bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MessageCircle size={24} />
                  Conversations
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors lg:hidden"
                  aria-label="Close sidebar"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => searchConversations(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <svg
                  className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onNewConversation}
                  className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Chat
                </button>
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                  disabled={conversations.length === 0}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear All
                </button>
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                  {searchQuery ? (
                    <>
                      <svg
                        className="w-12 h-12 mx-auto mb-3 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                      <p>No conversations found</p>
                      <p className="text-sm mt-1">
                        Try a different search term
                      </p>
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 mx-auto mb-3 opacity-50"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <p>No conversations yet</p>
                      <p className="text-sm mt-1">
                        Start a new conversation to get started
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-2">
                  {filteredConversations.map((conversation) => (
                    <motion.div
                      key={conversation.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`group relative p-3 mb-2 rounded-lg cursor-pointer transition-all ${
                        currentConversationId === conversation.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => setCurrentConversation(conversation.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">
                              {conversation.title}
                            </h3>
                            {conversation.isBookmarked && (
                              <svg
                                className="w-3 h-3 text-yellow-500 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                              </svg>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                            {ChatUtils.formatRelativeTime(
                              conversation.updatedAt
                            )}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                            {ChatUtils.generateConversationSummary(
                              conversation.messages,
                              80
                            )}
                          </p>
                          {conversation.tags &&
                            conversation.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {conversation.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {conversation.tags.length > 2 && (
                                  <span className="text-xs text-gray-400">
                                    +{conversation.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleBookmark(conversation.id);
                            }}
                            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            title={
                              conversation.isBookmarked
                                ? 'Remove bookmark'
                                : 'Add bookmark'
                            }
                          >
                            <svg
                              className={`w-3 h-3 ${
                                conversation.isBookmarked
                                  ? 'text-yellow-500'
                                  : 'text-gray-400'
                              }`}
                              fill={
                                conversation.isBookmarked
                                  ? 'currentColor'
                                  : 'none'
                              }
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                              />
                            </svg>
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowExportMenu(
                                  showExportMenu === conversation.id
                                    ? null
                                    : conversation.id
                                );
                              }}
                              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              title="Export conversation"
                            >
                              <svg
                                className="w-3 h-3 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </button>
                            {showExportMenu === conversation.id && (
                              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-[120px]">
                                <button
                                  onClick={() =>
                                    handleExport(conversation.id, 'markdown')
                                  }
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg"
                                >
                                  Markdown
                                </button>
                                <button
                                  onClick={() =>
                                    handleExport(conversation.id, 'txt')
                                  }
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  Text
                                </button>
                                <button
                                  onClick={() =>
                                    handleExport(conversation.id, 'json')
                                  }
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 last:rounded-b-lg"
                                >
                                  JSON
                                </button>
                              </div>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(conversation.id);
                            }}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title="Delete conversation"
                          >
                            <svg
                              className="w-3 h-3 text-red-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Stats */}
            {conversations.length > 0 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {conversations.length} conversation
                  {conversations.length !== 1 ? 's' : ''}
                  {searchQuery && ` • ${filteredConversations.length} found`}
                </div>
              </div>
            )}
          </motion.div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Delete Conversation
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to delete this conversation? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      deleteConversation(showDeleteConfirm);
                      setShowDeleteConfirm(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {/* Clear All Confirmation Modal */}
          {showClearConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Clear All Conversations
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Are you sure you want to delete all conversations? This action
                  cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
