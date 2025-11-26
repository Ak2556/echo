'use client';

import { useState, useEffect, useCallback } from 'react';
import { ChatMessage } from '@/services/api';

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  model: string;
  personality: string;
  isBookmarked?: boolean;
  tags?: string[];
}

export interface ConversationHistory {
  conversations: Conversation[];
  currentConversationId: string | null;
  searchQuery: string;
  filteredConversations: Conversation[];
}

const STORAGE_KEY = 'echo_ai_conversations';
const MAX_CONVERSATIONS = 50;

export function useConversationHistory() {
  const [history, setHistory] = useState<ConversationHistory>({
    conversations: [],
    currentConversationId: null,
    searchQuery: '',
    filteredConversations: [],
  });

  // Load conversations from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const conversations = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
        }));
        setHistory((prev) => ({
          ...prev,
          conversations,
          filteredConversations: conversations,
        }));
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }, []);

  // Save conversations to localStorage whenever they change
  const saveConversations = useCallback((conversations: Conversation[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }, []);

  // Filter conversations based on search query
  useEffect(() => {
    const filtered = history.conversations.filter((conv) => {
      if (!history.searchQuery) return true;

      const query = history.searchQuery.toLowerCase();
      return (
        conv.title.toLowerCase().includes(query) ||
        conv.messages.some((msg) =>
          msg.content.toLowerCase().includes(query)
        ) ||
        conv.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    });

    setHistory((prev) => ({
      ...prev,
      filteredConversations: filtered,
    }));
  }, [history.conversations, history.searchQuery]);

  const createNewConversation = useCallback(
    (model: string, personality: string) => {
      const newConversation: Conversation = {
        id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        model,
        personality,
        tags: [],
      };

      setHistory((prev) => {
        const conversations = [newConversation, ...prev.conversations].slice(
          0,
          MAX_CONVERSATIONS
        );
        saveConversations(conversations);
        return {
          ...prev,
          conversations,
          currentConversationId: newConversation.id,
        };
      });

      return newConversation.id;
    },
    [saveConversations]
  );

  const updateConversation = useCallback(
    (id: string, updates: Partial<Conversation>) => {
      setHistory((prev) => {
        const conversations = prev.conversations.map((conv) =>
          conv.id === id ? { ...conv, ...updates, updatedAt: new Date() } : conv
        );
        saveConversations(conversations);
        return {
          ...prev,
          conversations,
        };
      });
    },
    [saveConversations]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      setHistory((prev) => {
        const conversations = prev.conversations.filter(
          (conv) => conv.id !== id
        );
        saveConversations(conversations);
        return {
          ...prev,
          conversations,
          currentConversationId:
            prev.currentConversationId === id
              ? null
              : prev.currentConversationId,
        };
      });
    },
    [saveConversations]
  );

  const addMessageToConversation = useCallback(
    (conversationId: string, message: ChatMessage) => {
      setHistory((prev) => {
        const conversations = prev.conversations.map((conv) => {
          if (conv.id === conversationId) {
            const updatedMessages = [...conv.messages, message];

            // Auto-generate title from first user message
            let title = conv.title;
            if (conv.title === 'New Conversation' && message.role === 'user') {
              title =
                message.content.slice(0, 50) +
                (message.content.length > 50 ? '...' : '');
            }

            return {
              ...conv,
              messages: updatedMessages,
              title,
              updatedAt: new Date(),
            };
          }
          return conv;
        });

        saveConversations(conversations);
        return {
          ...prev,
          conversations,
        };
      });
    },
    [saveConversations]
  );

  const setCurrentConversation = useCallback((id: string | null) => {
    setHistory((prev) => ({
      ...prev,
      currentConversationId: id,
    }));
  }, []);

  const searchConversations = useCallback((query: string) => {
    setHistory((prev) => ({
      ...prev,
      searchQuery: query,
    }));
  }, []);

  const toggleBookmark = useCallback(
    (id: string) => {
      updateConversation(id, {
        isBookmarked: !history.conversations.find((c) => c.id === id)
          ?.isBookmarked,
      });
    },
    [updateConversation, history.conversations]
  );

  const addTagToConversation = useCallback(
    (id: string, tag: string) => {
      const conversation = history.conversations.find((c) => c.id === id);
      if (conversation && !conversation.tags?.includes(tag)) {
        updateConversation(id, {
          tags: [...(conversation.tags || []), tag],
        });
      }
    },
    [updateConversation, history.conversations]
  );

  const removeTagFromConversation = useCallback(
    (id: string, tag: string) => {
      const conversation = history.conversations.find((c) => c.id === id);
      if (conversation) {
        updateConversation(id, {
          tags: conversation.tags?.filter((t) => t !== tag) || [],
        });
      }
    },
    [updateConversation, history.conversations]
  );

  const getCurrentConversation = useCallback(() => {
    return (
      history.conversations.find(
        (c) => c.id === history.currentConversationId
      ) || null
    );
  }, [history.conversations, history.currentConversationId]);

  const exportConversation = useCallback(
    (id: string, format: 'json' | 'markdown' | 'txt') => {
      const conversation = history.conversations.find((c) => c.id === id);
      if (!conversation) return null;

      switch (format) {
        case 'json':
          return JSON.stringify(conversation, null, 2);

        case 'markdown':
          let markdown = `# ${conversation.title}\n\n`;
          markdown += `**Created:** ${conversation.createdAt.toLocaleString()}\n`;
          markdown += `**Model:** ${conversation.model}\n`;
          markdown += `**Personality:** ${conversation.personality}\n\n`;

          conversation.messages.forEach((msg) => {
            const role = msg.role === 'user' ? '**You**' : '**AI Assistant**';
            markdown += `${role}: ${msg.content}\n\n`;
          });

          return markdown;

        case 'txt':
          let text = `${conversation.title}\n`;
          text += `Created: ${conversation.createdAt.toLocaleString()}\n`;
          text += `Model: ${conversation.model}\n\n`;

          conversation.messages.forEach((msg) => {
            const role = msg.role === 'user' ? 'You' : 'AI Assistant';
            text += `${role}: ${msg.content}\n\n`;
          });

          return text;

        default:
          return null;
      }
    },
    [history.conversations]
  );

  const clearAllConversations = useCallback(() => {
    setHistory({
      conversations: [],
      currentConversationId: null,
      searchQuery: '',
      filteredConversations: [],
    });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    ...history,
    createNewConversation,
    updateConversation,
    deleteConversation,
    addMessageToConversation,
    setCurrentConversation,
    searchConversations,
    toggleBookmark,
    addTagToConversation,
    removeTagFromConversation,
    getCurrentConversation,
    exportConversation,
    clearAllConversations,
  };
}
