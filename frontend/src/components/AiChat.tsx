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
  MessageCircle,
  Zap,
  Brain,
  Cpu
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

  // Utility function to decode HTML entities
  const decodeHtmlEntities = (text: string): string => {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      try {
        setAISettings(JSON.parse(savedSettings));
      } catch (error) {}
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          toast.success('Response received!', { icon: '✨', duration: 2000 });
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
          toast.error('Failed to send message', { duration: 3000 });
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
    toast.success('Chat cleared', { icon: '🗑️' });
  }, []);

  const startNewChat = () => {
    clearChat();
    const personalityGreetings = {
      helpful: '👋 Welcome to Echo AI! I\'m here to assist you with anything you need.',
      casual: "Hey! 🎉 I'm Echo AI, ready to chat and have some fun!",
      professional: 'Good day. I\'m Echo AI, your professional assistant.',
      creative: '✨ Greetings! I\'m Echo AI, your creative companion!',
      technical: '🔧 Hello! I\'m Echo AI, your technical expert.',
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
    toast.success('New conversation started', { icon: '✨' });
  };

  const handleSettingsChange = useCallback((newSettings: AISettings) => {
    setAISettings(newSettings);
    toast.success('Settings updated', { icon: '⚙️' });
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      if (!prev) {
        setIsOpen(true);
        toast.success('Fullscreen mode', { icon: '🖥️', duration: 2000 });
      } else {
        toast.success('Compact mode', { icon: '📱', duration: 2000 });
      }
      return !prev;
    });
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          toast.success('Echo AI activated', { icon: '✨', duration: 2000 });
        }}
        className="group fixed top-24 right-8 z-[9999]"
        aria-label="Open Echo AI Assistant"
      >
        <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 shadow-lg flex items-center justify-center hover:shadow-xl transition-all hover:scale-105 active:scale-95">
          <Sparkles className="w-7 h-7 text-white" strokeWidth={2.5} />
          {/* Status indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 shadow-md"></div>
        </div>
      </button>
    );
  }

  return (
    <>
      {/* Fullscreen backdrop with gradient */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20 z-[9998] backdrop-blur-3xl" />
      )}

      <div
        className={`
          fixed z-[9999] flex flex-col overflow-hidden
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          shadow-2xl
          transition-all duration-300 ease-out
          ${
            isFullscreen
              ? 'inset-0 rounded-none'
              : 'top-24 right-8 w-[440px] rounded-3xl'
          }
          ${isMinimized && !isFullscreen ? 'h-20' : isFullscreen ? 'h-full' : 'h-[680px]'}
        `}
      >

        {/* Clean Header */}
        <div className="relative px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">
                  Echo AI
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Online</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Exit fullscreen"
                >
                  <Minimize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              {!isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              )}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className={`p-2 rounded-lg transition-colors ${
                    showMenu
                      ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}
                  title="Menu"
                >
                  <Settings className="w-4 h-4" />
                </button>
                {showMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={() => {
                        startNewChat();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>New Chat</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowSettings(true);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </button>
                    <div className="my-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <button
                      onClick={() => {
                        clearChat();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear History</span>
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                <Minimize2 className={`w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  toast('Echo AI closed', { icon: '👋', duration: 2000 });
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
                {/* Minimal Icon */}
                <div className="relative mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Clean Typography */}
                <h3 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white tracking-tight">
                  Welcome to ECHO AI
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-10 max-w-sm text-sm leading-relaxed">
                  Your intelligent companion powered by advanced AI
                </p>

                {/* Minimal Action Cards */}
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                  {[
                    { icon: '💡', title: 'Get Started', gradient: 'from-purple-500 to-purple-600' },
                    { icon: '🎨', title: 'Explore', gradient: 'from-blue-500 to-blue-600' },
                  ].map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setInputValue(item.title === 'Get Started' ? 'What can you do?' : 'Tell me about Echo')}
                      className={`group relative p-6 rounded-2xl bg-gradient-to-br ${item.gradient} hover:shadow-lg transition-all duration-200 hover:scale-[1.02]`}
                    >
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="text-white font-semibold text-sm">{item.title}</div>
                    </button>
                  ))}
                </div>

                {/* Subtle Helper Text */}
                <p className="text-gray-400 dark:text-gray-600 text-xs mt-8">
                  Type a message below to start chatting
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="w-4 h-4 rounded-full bg-white/40" />
                  ) : (
                    <Sparkles className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
                  )}
                </div>
                <div
                  className={`flex-1 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white rounded-2xl rounded-tr-md'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-md'
                  } px-4 py-3`}
                >
                  <div className="text-sm leading-relaxed">
                    {decodeHtmlEntities(message.displayedContent || message.content)}
                    {message.isTyping && (
                      <span className="inline-flex items-center ml-2">
                        <span className="w-1 h-3 bg-current animate-pulse"></span>
                      </span>
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
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-gray-600 dark:text-gray-400" strokeWidth={2.5} />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Clean Input */}
        {!isMinimized && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="relative flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={isLoading}
                  rows={1}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-all flex items-center justify-center"
              >
                {isLoading ? (
                  <Cpu className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
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
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
      `}</style>
    </>
  );
}
