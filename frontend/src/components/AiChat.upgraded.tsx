'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService, ChatMessage, AISettings } from '@/services/api';
import AISettingsComponent from './AISettings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSendMessage } from '@/hooks/useChat';
import {
  Sparkles,
  Send,
  Settings,
  Maximize2,
  Minimize2,
  X,
  Plus,
  Trash2,
  MessageCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TypingMessage extends ChatMessage {
  isTyping?: boolean;
  displayedContent?: string;
  currentWord?: string;
  progress?: number;
  image_url?: string;
  image_prompt?: string;
  type?: 'text' | 'image';
}

const defaultAISettings: AISettings = {
  model: 'anthropic/claude-3-haiku',
  personality: 'helpful',
  temperature: 0.7,
  maxTokens: 500,
};

export default function AiChat() {
  const colors = useThemeColors();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [messages, setMessages] = useState<TypingMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [aiSettings, setAISettings] = useState<AISettings>(defaultAISettings);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: sendChatMessage, isPending: isSendingMessage } = useSendMessage();

  // Load AI settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      try {
        setAISettings(JSON.parse(savedSettings));
      } catch (error) {}
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup typing interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  }, []);

  useEffect(() => {
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu, handleClickOutside]);

  const handleOpenAiChat = useCallback(() => {
    setIsOpen(true);
    setIsMinimized(false);
  }, []);

  useEffect(() => {
    window.addEventListener('openAiChat' as any, handleOpenAiChat);
    return () => window.removeEventListener('openAiChat' as any, handleOpenAiChat);
  }, [handleOpenAiChat]);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isFullscreen, handleEscape]);

  // Enhanced animated typewriter effect
  const animatedTypewriterEffect = (fullText: string, messageIndex: number) => {
    const words = fullText.split(' ');
    let currentWordIndex = 0;
    let currentWord = '';
    let currentCharInWord = 0;

    const getTypingSpeed = (char: string) => {
      if (char === '.' || char === '!' || char === '?') return 150;
      if (char === ',' || char === ';') return 100;
      if (char === ' ') return 50;
      return 25 + Math.random() * 15;
    };

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const typeNextChar = () => {
      if (currentWordIndex >= words.length) {
        setMessages((prev) =>
          prev.map((msg, index) =>
            index === messageIndex
              ? { ...msg, displayedContent: fullText, isTyping: false }
              : msg
          )
        );
        return;
      }

      if (currentCharInWord < words[currentWordIndex].length) {
        currentWord = words[currentWordIndex].slice(0, currentCharInWord + 1);
        currentCharInWord++;
      } else {
        currentWordIndex++;
        currentCharInWord = 0;
        currentWord = words[currentWordIndex - 1] + ' ';
      }

      const displayedWords = words.slice(0, currentWordIndex);
      if (currentCharInWord > 0 && currentWordIndex < words.length) {
        displayedWords.push(words[currentWordIndex].slice(0, currentCharInWord));
      }
      const displayedText = displayedWords.join(' ');

      setMessages((prev) =>
        prev.map((msg, index) =>
          index === messageIndex
            ? {
                ...msg,
                displayedContent: displayedText,
                isTyping: true,
                currentWord: currentWord,
                progress: (displayedText.length / fullText.length) * 100,
              }
            : msg
        )
      );

      const nextChar = displayedText[displayedText.length - 1] || ' ';
      const speed = getTypingSpeed(nextChar);

      typingIntervalRef.current = setTimeout(typeNextChar, speed);
    };

    typingIntervalRef.current = setTimeout(typeNextChar, 200);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || isSendingMessage) return;

    const userMessageContent = inputValue;
    const userMessage: ChatMessage = {
      content: userMessageContent,
      role: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    sendChatMessage(
      {
        message: userMessageContent,
        model: aiSettings.model,
        temperature: aiSettings.temperature,
      },
      {
        onSuccess: (response) => {
          const aiMessage: TypingMessage = {
            content: response.response,
            role: 'assistant',
            displayedContent: '',
            isTyping: true,
            image_url: response.image_url,
            image_prompt: response.image_prompt,
            type: (response.type as 'text' | 'image') || 'text',
          };

          setMessages((prev) => {
            const newMessages = [...prev, aiMessage];
            setTimeout(() => {
              animatedTypewriterEffect(response.response, newMessages.length - 1);
            }, 100);
            return newMessages;
          });
          setIsLoading(false);
          toast.success('Response received!', { icon: '✨' });
        },
        onError: (error) => {
          const errorMessage: TypingMessage = {
            content: 'I encountered an unexpected error. Please try refreshing the page.',
            role: 'assistant',
            displayedContent: 'I encountered an unexpected error. Please try refreshing the page.',
            isTyping: false,
          };
          setMessages((prev) => [...prev, errorMessage]);
          setIsLoading(false);
          toast.error('Failed to send message');
        },
      }
    );
  };

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [inputValue, isLoading]);

  const clearChat = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setMessages([]);
    setShowMenu(false);
    toast.success('Chat cleared');
  }, []);

  const startNewChat = () => {
    clearChat();
    const personalityGreetings = {
      helpful: 'Welcome to Echo AI Assistant! How can I help you today?',
      casual: "Hey there! 😊 I'm ECHO AI, and I'm super excited to chat with you! What's up?",
      professional: "Good day! I'm ECHO AI, your professional AI assistant. How may I assist you today?",
      creative: "Greetings, creative soul! ✨ I'm ECHO AI, your imaginative companion!",
      technical: "Hello! I'm ECHO AI, your technical AI assistant.",
    };

    const welcomeMessage: TypingMessage = {
      content:
        personalityGreetings[aiSettings.personality as keyof typeof personalityGreetings] ||
        personalityGreetings.helpful,
      role: 'assistant',
      displayedContent:
        personalityGreetings[aiSettings.personality as keyof typeof personalityGreetings] ||
        personalityGreetings.helpful,
      isTyping: false,
    };
    setMessages([welcomeMessage]);
    toast.success('New conversation started');
  };

  const handleSettingsChange = useCallback((newSettings: AISettings) => {
    setAISettings(newSettings);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      if (!prev) {
        setIsOpen(true);
      }
      return !prev;
    });
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-24 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
        aria-label="Open Echo AI Assistant"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
      </button>
    );
  }

  return (
    <>
      {/* Fullscreen backdrop */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-blue-950 z-[9998]" />
      )}

      <div
        className={`
          fixed z-[9999] flex flex-col
          bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl
          border border-gray-200 dark:border-gray-800
          shadow-2xl
          transition-all duration-300
          ${
            isFullscreen
              ? 'inset-0 rounded-none'
              : 'top-24 right-8 w-[420px] rounded-3xl'
          }
          ${isMinimized && !isFullscreen ? 'h-20' : isFullscreen ? 'h-full' : 'h-[600px]'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
            </div>
            <div>
              <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                ECHO AI
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Always here to help</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title="Exit fullscreen"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            )}
            {!isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors relative"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              {showMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  <button
                    onClick={() => {
                      startNewChat();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <Plus className="w-4 h-4" />
                    New Chat
                  </button>
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3"
                  >
                    <Settings className="w-4 h-4" />
                    AI Settings
                  </button>
                  <button
                    onClick={() => {
                      clearChat();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Chat
                  </button>
                </div>
              )}
            </button>
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Minimize2 className={`w-4 h-4 ${isMinimized ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <Sparkles className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Welcome to ECHO AI
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-xs">
                  Your intelligent companion powered by advanced AI. Ask me anything!
                </p>
                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  <button
                    onClick={() => setInputValue('What can you help me with?')}
                    className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">💡</div>
                    <div className="text-sm font-semibold">Get Help</div>
                  </button>
                  <button
                    onClick={() => setInputValue("Tell me about Echo's features")}
                    className="p-4 rounded-xl bg-pink-50 dark:bg-pink-900/20 hover:bg-pink-100 dark:hover:bg-pink-900/30 transition-colors text-left"
                  >
                    <div className="text-2xl mb-2">🎨</div>
                    <div className="text-sm font-semibold">Explore Echo</div>
                  </button>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-fade-in-up`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-600'
                      : 'bg-gradient-to-br from-purple-600 to-pink-600'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="w-6 h-6 rounded-full bg-white/20" />
                  ) : (
                    <Sparkles className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-blue-600 to-cyan-600 text-white rounded-3xl rounded-tr-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-3xl rounded-tl-md'
                  } px-5 py-3 shadow-lg`}
                >
                  <div className="text-sm leading-relaxed">
                    {message.displayedContent || message.content}
                    {message.isTyping && (
                      <span className="inline-block w-0.5 h-4 ml-1 bg-current animate-pulse" />
                    )}
                  </div>
                  {message.image_url && (
                    <img
                      src={message.image_url}
                      alt={message.image_prompt || 'Generated image'}
                      className="mt-3 rounded-xl w-full"
                    />
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-fade-in-up">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white animate-pulse" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-3xl rounded-tl-md px-5 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input */}
        {!isMinimized && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask ECHO AI anything... ✨"
                disabled={isLoading}
                rows={1}
                className="w-full px-5 py-3 pr-14 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 bottom-2 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* AI Settings Modal */}
        <AISettingsComponent
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentSettings={aiSettings}
          onSettingsChange={handleSettingsChange}
        />
      </div>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
