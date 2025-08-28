'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { apiService, ChatMessage, AISettings } from '@/services/api';
import AISettingsComponent from './AISettings';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useSendMessage } from '@/hooks/useChat';

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
  maxTokens: 500
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

  // PERFORMANCE FIX: Use React Query for API caching
  const { mutate: sendChatMessage, isPending: isSendingMessage } = useSendMessage();

  // Load AI settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('aiSettings');
    if (savedSettings) {
      try {
        setAISettings(JSON.parse(savedSettings));
      } catch (error) {

      }
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

  // PERFORMANCE FIX: Memoize event handlers with useCallback
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setShowMenu(false);
    }
  }, []);

  // Close menu when clicking outside
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

  // Listen for openAiChat event from footer
  useEffect(() => {
    window.addEventListener('openAiChat' as any, handleOpenAiChat);
    return () => window.removeEventListener('openAiChat' as any, handleOpenAiChat);
  }, [handleOpenAiChat]);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsFullscreen(false);
    }
  }, []);

  // Handle escape key to exit fullscreen
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

    // Variable typing speed based on punctuation
    const getTypingSpeed = (char: string) => {
      if (char === '.' || char === '!' || char === '?') return 150; // Pause at sentence end
      if (char === ',' || char === ';') return 100; // Shorter pause at commas
      if (char === ' ') return 50; // Space between words
      return 25 + Math.random() * 15; // Variable character speed for natural feel
    };

    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    const typeNextChar = () => {
      if (currentWordIndex >= words.length) {
        // Typing complete
        setMessages(prev =>
          prev.map((msg, index) =>
            index === messageIndex
              ? { ...msg, displayedContent: fullText, isTyping: false }
              : msg
          )
        );
        return;
      }

      // Build current word character by character
      if (currentCharInWord < words[currentWordIndex].length) {
        currentWord = words[currentWordIndex].slice(0, currentCharInWord + 1);
        currentCharInWord++;
      } else {
        // Word complete, move to next word
        currentWordIndex++;
        currentCharInWord = 0;
        currentWord = words[currentWordIndex - 1] + ' '; // Add space after word
      }

      // Build displayed text with current progress
      const displayedWords = words.slice(0, currentWordIndex);
      if (currentCharInWord > 0 && currentWordIndex < words.length) {
        displayedWords.push(words[currentWordIndex].slice(0, currentCharInWord));
      }
      const displayedText = displayedWords.join(' ');

      // Update with animation data
      setMessages(prev =>
        prev.map((msg, index) =>
          index === messageIndex
            ? {
                ...msg,
                displayedContent: displayedText,
                isTyping: true,
                currentWord: currentWord,
                progress: (displayedText.length / fullText.length) * 100
              }
            : msg
        )
      );

      // Schedule next character with dynamic speed
      const nextChar = displayedText[displayedText.length - 1] || ' ';
      const speed = getTypingSpeed(nextChar);

      typingIntervalRef.current = setTimeout(typeNextChar, speed);
    };

    // Start typing after a brief delay
    typingIntervalRef.current = setTimeout(typeNextChar, 200);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading || isSendingMessage) return;

    const userMessageContent = inputValue;
    const userMessage: ChatMessage = {
      content: userMessageContent,
      role: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // PERFORMANCE FIX: Use React Query mutation with automatic caching
    sendChatMessage(
      {
        message: userMessageContent,
        model: aiSettings.model,
        temperature: aiSettings.temperature,
      },
      {
        onSuccess: (response) => {
          // Add AI message with empty displayed content initially
          const aiMessage: TypingMessage = {
            content: response.response,
            role: 'assistant',
            displayedContent: '',
            isTyping: true,
            image_url: response.image_url,
            image_prompt: response.image_prompt,
            type: (response.type as 'text' | 'image') || 'text'
          };

          setMessages(prev => {
            const newMessages = [...prev, aiMessage];
            // Start enhanced animated typewriter effect for the new AI message
            setTimeout(() => {
              animatedTypewriterEffect(response.response, newMessages.length - 1);
            }, 100);
            return newMessages;
          });
          setIsLoading(false);
        },
        onError: (error) => {
          // Handle error with user-friendly message
          const errorMessage: TypingMessage = {
            content: 'I encountered an unexpected error. Please try refreshing the page.',
            role: 'assistant',
            displayedContent: 'I encountered an unexpected error. Please try refreshing the page.',
            isTyping: false
          };
          setMessages(prev => [...prev, errorMessage]);
          setIsLoading(false);
        },
      }
    );
  };

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, []);

  const clearChat = useCallback(() => {
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setMessages([]);
    setShowMenu(false);
  }, []);

  const startNewChat = () => {
    clearChat();
    // Add personalized welcome message based on current personality
    const personalityGreetings = {
      helpful: 'Welcome to Echo AI Assistant! How can I help you today?',
      casual: "Hey there! 😊 I'm ECHO AI, and I'm super excited to chat with you! Whether you want to explore Echo, have a fun conversation, or need some help with something, I'm your go-to AI buddy. What's up?",
      professional: "Good day! I'm ECHO AI, your professional AI assistant for the Echo platform. I'm here to provide comprehensive support, detailed information, and structured assistance with any inquiries you may have. How may I assist you today?",
      creative: "Greetings, creative soul! ✨ I'm ECHO AI, your imaginative companion ready to explore the boundless realms of creativity and innovation! Whether you're seeking inspiration, artistic guidance, or just want to brainstorm amazing ideas, I'm here to spark your imagination! What creative adventure shall we embark on?",
      technical: "Hello! I'm ECHO AI, your technical AI assistant. I'm equipped to provide detailed technical information, explanations, and support for Echo platform functionality and general technical inquiries. Please specify your technical requirements or questions."
    };

    const welcomeMessage: TypingMessage = {
      content: personalityGreetings[aiSettings.personality as keyof typeof personalityGreetings] || personalityGreetings.helpful,
      role: 'assistant',
      displayedContent: personalityGreetings[aiSettings.personality as keyof typeof personalityGreetings] || personalityGreetings.helpful,
      isTyping: false
    };
    setMessages([welcomeMessage]);
  };

  const handleSettingsChange = useCallback((newSettings: AISettings) => {
    setAISettings(newSettings);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => {
      if (!prev) {
        setIsOpen(true);
      }
      return !prev;
    });
  }, []);

  if (!isOpen) {
    return (
      <div style={{ position: 'fixed', top: '6rem', right: '2rem', zIndex: 1000 }}>
        {/* Main ECHO AI Trigger Button */}
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <button
            onClick={() => setIsOpen(true)}
            className="floating-button hover-lift glass-effect"
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundImage: 'linear-gradient(135deg, var(--accent), #8b5cf6, #06b6d4)',
              backgroundSize: '200% 200%',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.5rem',
              boxShadow: '0 6px 25px rgba(var(--accent-rgb), 0.4)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            aria-label="AI Assistant - AI Companion"
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
              e.currentTarget.style.boxShadow = '0 10px 35px rgba(var(--accent-rgb), 0.6)';
              e.currentTarget.style.backgroundPosition = '100% 50%';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(var(--accent-rgb), 0.4)';
              e.currentTarget.style.backgroundPosition = '0% 50%';
            }}
          >
            <span style={{
              fontSize: '1.5rem',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}>
              🌟
            </span>
            {/* Pulse ring */}
            <div style={{
              position: 'absolute',
              top: '-3px',
              left: '-3px',
              right: '-3px',
              bottom: '-3px',
              borderRadius: '50%',
              border: '2px solid rgba(var(--accent-rgb), 0.3)',
              animation: 'pulse 2s infinite'
            }} />
          </button>

          {/* Tooltip */}
          <div style={{
            position: 'absolute',
            right: '70px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '0.4rem 0.8rem',
            borderRadius: '8px',
            fontSize: '0.75rem',
            whiteSpace: 'nowrap',
            opacity: 0,
            visibility: 'hidden',
            transition: 'all 0.3s ease',
            pointerEvents: 'none'
          }}
          className="tooltip">
AI Assistant - AI Companion
          </div>
        </div>

        {/* Quick Toggle for Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="hover-lift"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--card)',
            border: '2px solid rgba(var(--accent-rgb), 0.2)',
            color: 'var(--fg)',
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: '0 3px 12px rgba(0,0,0,0.1)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(10px)',
            marginLeft: '10px'
          }}
          aria-label="Fullscreen AI Chat"
          title="Open in fullscreen"
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 5px 18px rgba(var(--accent-rgb), 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.2)';
            e.currentTarget.style.color = 'var(--fg)';
            e.currentTarget.style.boxShadow = '0 3px 12px rgba(0,0,0,0.1)';
          }}
        >
          ⛶
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced CSS for ECHO AI with advanced animations */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(var(--accent-rgb), 0.3);
          }
          50% {
            box-shadow: 0 0 30px rgba(var(--accent-rgb), 0.6);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -5px, 0);
          }
          70% {
            animation-timing-function: cubic-bezier(0.755, 0.050, 0.855, 0.060);
            transform: translate3d(0, -3px, 0);
          }
          90% {
            transform: translate3d(0, -1px, 0);
          }
        }

        @keyframes typewriter {
          from { width: 0; }
          to { width: 100%; }
        }

        @keyframes echoGlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .typing-text {
          animation: slideInLeft 0.4s ease-out;
        }

        .user-message {
          animation: slideInRight 0.4s ease-out;
        }

        .typing-word {
          display: inline-block;
          animation: fadeInUp 0.3s ease-out;
        }

        .ai-message-bubble {
          position: relative;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ai-message-bubble:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .ai-message-bubble.typing {
          animation: glow 2s ease-in-out infinite;
        }

        .ai-message-bubble.typing::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(var(--accent-rgb), 0.1),
            transparent
          );
          animation: shimmer 2s infinite;
        }

        .typing-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), #8b5cf6, #06b6d4);
          transition: width 0.2s ease-out;
          border-radius: 2px;
        }

        .echo-logo {
          background-image: linear-gradient(45deg, var(--accent), #8b5cf6, #06b6d4);
          background-size: 200% 200%;
          animation: echoGlow 3s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .floating-button {
          animation: bounce 2s infinite;
        }

        .floating-button:hover {
          animation: pulse 0.5s ease-in-out infinite;
        }

        .glass-effect {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 10px 40px rgba(var(--accent-rgb), 0.2);
        }

        .text-gradient {
          background: linear-gradient(135deg, var(--accent), #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>

      {/* Fullscreen backdrop to cover the entire app */}
      {isFullscreen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--bg)',
          zIndex: 9998
        }} />
      )}

      <div
        className={`ai-chat-container glass ${isFullscreen ? 'fullscreen' : ''}`}
        style={{
          position: 'fixed',
          top: isFullscreen ? 0 : '6rem',
          left: isFullscreen ? 0 : 'auto',
          bottom: isFullscreen ? 0 : 'auto',
          right: isFullscreen ? 0 : '1rem',
          width: isFullscreen ? '100vw' : '400px',
          height: isFullscreen ? '100vh' : isMinimized ? '80px' : '550px',
          borderRadius: isFullscreen ? 0 : '16px',
          display: 'flex',
          flexDirection: isFullscreen ? 'row' : 'column',
          zIndex: isFullscreen ? 9999 : 1000,
          background: isFullscreen
            ? 'var(--bg)'
            : 'rgba(var(--card), 0.95)',
          border: isFullscreen ? 'none' : '2px solid rgba(var(--accent-rgb), 0.1)',
          boxShadow: isFullscreen
            ? 'none'
            : '0 15px 50px rgba(0,0,0,0.12), 0 5px 20px rgba(var(--accent-rgb), 0.1)',
          backdropFilter: isFullscreen ? 'none' : 'blur(20px)',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isFullscreen ? 'none' : 'translateY(0)',
          animation: !isFullscreen ? 'slideInFromTop 0.5s ease-out' : 'none'
        }}
      >
      {/* Sidebar (fullscreen only) */}
      {isFullscreen && (
        <div style={{
          width: '320px',
          background: 'var(--card)',
          borderRight: '2px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '4px 0 20px rgba(0,0,0,0.05)'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '2.5rem 1.5rem',
            borderBottom: '2px solid rgba(var(--accent-rgb), 0.1)',
            background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Animated gradient overlay */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: 'linear-gradient(135deg, var(--accent), #8b5cf6, #06b6d4)',
              backgroundSize: '200% 200%',
              animation: 'echoGlow 8s ease-in-out infinite',
              opacity: 0.05,
              pointerEvents: 'none'
            }} />

            {/* Background pattern */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 0.03,
              backgroundImage: 'radial-gradient(circle at 20% 50%, currentColor 1px, transparent 1px), radial-gradient(circle at 80% 50%, currentColor 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              pointerEvents: 'none'
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 className="echo-logo" style={{
                margin: 0,
                fontSize: '2rem',
                fontWeight: 900,
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                letterSpacing: '1px'
              }}>
                <span style={{
                  fontSize: '2.5rem',
                  filter: 'drop-shadow(0 2px 8px rgba(var(--accent-rgb), 0.4))',
                  animation: 'bounce 3s infinite'
                }}>🌟</span>
                ECHO AI
              </h2>
              <p style={{
                margin: '0.75rem 0 0 0',
                color: 'var(--muted)',
                fontSize: '0.95rem',
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}>
                Your Intelligent Companion ✨
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Quick Actions
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <button
                onClick={startNewChat}
                className="hover-lift"
                style={{
                  padding: '1rem 1.25rem',
                  background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.08), rgba(var(--accent-rgb), 0.12))',
                  border: '2px solid rgba(var(--accent-rgb), 0.2)',
                  borderRadius: '12px',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.15), rgba(var(--accent-rgb), 0.2))';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(var(--accent-rgb), 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.08), rgba(var(--accent-rgb), 0.12))';
                  e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>✨</span>
                <span>New Conversation</span>
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="hover-lift"
                style={{
                  padding: '1rem 1.25rem',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.12))',
                  border: '2px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: '12px',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(139, 92, 246, 0.2))';
                  e.currentTarget.style.borderColor = colors.brand.primary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.12))';
                  e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>⚙️</span>
                <span>AI Settings</span>
              </button>
              <button
                onClick={clearChat}
                className="hover-lift"
                style={{
                  padding: '1rem 1.25rem',
                  background: 'linear-gradient(135deg, rgba(255, 59, 48, 0.08), rgba(255, 59, 48, 0.12))',
                  border: '2px solid rgba(255, 59, 48, 0.2)',
                  borderRadius: '12px',
                  color: 'var(--fg)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 59, 48, 0.15), rgba(255, 59, 48, 0.2))';
                  e.currentTarget.style.borderColor = colors.status.error;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 59, 48, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 59, 48, 0.08), rgba(255, 59, 48, 0.12))';
                  e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.2)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                }}
              >
                <span style={{ fontSize: '1.25rem' }}>🗑️</span>
                <span>Clear History</span>
              </button>
            </div>
          </div>

          {/* Session Info */}
          <div style={{ padding: '1rem 1.5rem 1.5rem', flex: 1 }}>
            <h4 style={{
              margin: '0 0 1rem 0',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Session Info
            </h4>
            <div style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.03), rgba(6, 182, 212, 0.03))',
              borderRadius: '12px',
              border: '2px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.875rem',
                paddingBottom: '0.875rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>Messages</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(var(--accent-rgb), 0.1)',
                  borderRadius: '8px'
                }}>{messages.length}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.875rem',
                paddingBottom: '0.875rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>Model</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--fg)',
                  padding: '0.25rem 0.75rem',
                  background: 'var(--bg)',
                  borderRadius: '8px'
                }}>{aiSettings.model.split('/')[1]?.split('-')[0] || 'Claude'}</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.875rem',
                paddingBottom: '0.875rem',
                borderBottom: '1px solid var(--border)'
              }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>Personality</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: colors.brand.primary,
                  textTransform: 'capitalize',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(139, 92, 246, 0.1)',
                  borderRadius: '8px'
                }}>{aiSettings.personality}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>Status</span>
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: colors.status.success,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.25rem 0.75rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '0.625rem', animation: 'pulse 2s infinite' }}>●</span>
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: isFullscreen ? '2rem 2.5rem' : '1rem',
          borderBottom: isFullscreen ? '2px solid var(--border)' : '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          background: isFullscreen ? 'var(--card)' : 'transparent',
          boxShadow: isFullscreen ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <h3 className="text-gradient" style={{
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              fontSize: isFullscreen ? '1.5rem' : '1.1rem',
              fontWeight: 800,
              letterSpacing: '0.5px'
            }}>
              {!isFullscreen && <span style={{ fontSize: '1.2rem' }}>🌟</span>}
              {isFullscreen && <span style={{
                fontSize: '1.75rem',
                filter: 'drop-shadow(0 2px 8px rgba(var(--accent-rgb), 0.4))'
              }}>💬</span>}
              {isFullscreen ? 'Conversation' : 'ECHO AI'}
              {messages.length > 0 && (
                <span style={{
                  fontSize: isFullscreen ? '0.8rem' : '0.7rem',
                  color: 'var(--muted)',
                  background: 'rgba(var(--accent-rgb), 0.08)',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '20px',
                  border: '2px solid rgba(var(--accent-rgb), 0.15)',
                  fontWeight: 600
                }}>
                  {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                </span>
              )}
            </h3>
            {isFullscreen && (
              <div style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: colors.status.success,
                padding: '0.375rem 0.875rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '20px',
                border: '2px solid rgba(34, 197, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '0.625rem', animation: 'pulse 2s infinite' }}>●</span> Online
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Exit Fullscreen Button (only in fullscreen) */}
            {isFullscreen && (
              <button
                onClick={() => setIsFullscreen(false)}
                className="hover-lift"
                style={{
                  background: 'rgba(var(--accent-rgb), 0.1)',
                  border: '2px solid rgba(var(--accent-rgb), 0.3)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--accent)',
                  padding: '0.625rem 1.25rem',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 2px 8px rgba(var(--accent-rgb), 0.15)'
                }}
                title="Exit fullscreen (Esc)"
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.15)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(var(--accent-rgb), 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(var(--accent-rgb), 0.15)';
                }}
              >
                <span style={{ fontSize: '1rem' }}>↙</span>
                <span>Exit Fullscreen</span>
              </button>
            )}

            {/* Fullscreen Toggle (only when not fullscreen) */}
            {!isFullscreen && (
              <button
                onClick={toggleFullscreen}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: 'var(--fg)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '32px',
                  minHeight: '32px',
                  transition: 'all 0.2s ease'
                }}
                title="Enter fullscreen"
              >
                ⛶
              </button>
            )}

            {/* Menu Button (only in non-fullscreen) */}
            {!isFullscreen && (
              <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: showMenu ? 'var(--accent)' : 'rgba(var(--accent-rgb), 0.1)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: showMenu ? 'white' : 'var(--fg)',
                padding: '0.5rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '32px',
                minHeight: '32px',
                transition: 'all 0.2s ease'
              }}
              title="Chat options"
              onMouseEnter={(e) => {
                if (!showMenu) {
                  e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showMenu) {
                  e.currentTarget.style.background = 'rgba(var(--accent-rgb), 0.1)';
                }
              }}
            >
              ⚙️
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '0.5rem 0',
                minWidth: '140px',
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <button
                  onClick={startNewChat}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--fg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderRadius: '4px',
                    margin: '0 0.5rem',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.background = 'rgba(var(--accent-rgb), 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.background = 'none';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>✨</span>
                  <span>New Chat</span>
                </button>
                <hr style={{
                  margin: '0.5rem 0',
                  border: 'none',
                  borderTop: '1px solid var(--border)'
                }} />
                <button
                  onClick={clearChat}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--fg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderRadius: '4px',
                    margin: '0 0.5rem',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.background = 'rgba(255, 59, 48, 0.1)';
                    target.style.color = colors.status.error;
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.background = 'none';
                    target.style.color = 'var(--fg)';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>🗑️</span>
                  <span>Clear Chat</span>
                </button>
                <hr style={{
                  margin: '0.5rem 0',
                  border: 'none',
                  borderTop: '1px solid var(--border)'
                }} />
                <button
                  onClick={() => {
                    setShowSettings(true);
                    setShowMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    color: 'var(--fg)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderRadius: '4px',
                    margin: '0 0.5rem',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.background = 'rgba(var(--accent-rgb), 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    const target = e.target as HTMLElement;
                    target.style.background = 'none';
                  }}
                >
                  <span style={{ fontSize: '1.1rem' }}>⚙️</span>
                  <span>AI Settings</span>
                </button>
                </div>
              )}
            </div>
            )}

            {/* Minimize Button */}
            {!isFullscreen && (
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  color: 'var(--muted)',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  minWidth: '32px',
                  minHeight: '32px',
                  transition: 'all 0.2s ease'
                }}
                title={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? '⬆' : '⬇'}
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                setIsFullscreen(false);
                setIsMinimized(false);
              }}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                fontSize: '1rem',
                color: 'var(--muted)',
                padding: '0.5rem',
                borderRadius: '6px',
                minWidth: '32px',
                minHeight: '32px',
                transition: 'all 0.2s ease'
              }}
              title="Close Echo AI"
            >
              ×
            </button>
          </div>
        </div>

        {/* Messages */}
        {!isMinimized && (
        <div style={{
          flex: 1,
          padding: isFullscreen ? '2.5rem 3rem' : '1rem',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: isFullscreen ? '2rem' : '1.5rem',
          maxWidth: isFullscreen ? '900px' : 'none',
          margin: isFullscreen ? '0 auto' : 0,
          width: isFullscreen ? '100%' : 'auto'
        }}>
          {messages.length === 0 && (
            <div style={{
              textAlign: 'center',
              color: 'var(--muted)',
              padding: isFullscreen ? '5rem 2rem' : '2rem',
              fontSize: '0.9rem'
            }}>
              <div style={{
                fontSize: isFullscreen ? '6rem' : '4rem',
                marginBottom: isFullscreen ? '2.5rem' : '2rem',
                animation: 'bounce 3s infinite',
                filter: 'drop-shadow(0 6px 20px rgba(var(--accent-rgb), 0.5))'
              }}>🌟</div>
              <h2 className="echo-logo" style={{
                margin: '0 0 1.25rem 0',
                fontSize: isFullscreen ? '3rem' : '2rem',
                fontWeight: 900,
                textAlign: 'center',
                letterSpacing: '1.5px'
              }}>Welcome to ECHO AI!</h2>
              <p className="text-gradient" style={{
                margin: '0 0 2.5rem 0',
                fontSize: isFullscreen ? '1.5rem' : '1.1rem',
                fontWeight: 700,
                textAlign: 'center',
                opacity: 0.95
              }}>Your Intelligent Companion</p>
              <p style={{
                margin: '0 auto 3rem',
                lineHeight: 1.7,
                fontSize: isFullscreen ? '1.15rem' : '1rem',
                maxWidth: isFullscreen ? '700px' : '600px',
                color: 'var(--fg)',
                opacity: 0.9
              }}>
                Your intelligent companion powered by advanced AI. I can help you with Echo features,
                answer questions, provide insights, have conversations, and assist with various tasks.
              </p>

              {/* Quick Start Suggestions */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isFullscreen ? 'repeat(2, 1fr)' : '1fr',
                gap: '1rem',
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <button
                  onClick={() => setInputValue("What can you help me with?")}
                  className="hover-lift"
                  style={{
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(139, 92, 246, 0.1))',
                    border: '2px solid rgba(var(--accent-rgb), 0.2)',
                    borderRadius: '16px',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.2), rgba(139, 92, 246, 0.2))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(var(--accent-rgb), 0.2)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(139, 92, 246, 0.1))';
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem', animation: 'bounce 2s infinite' }}>❓</div>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Get Help</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', opacity: 0.8 }}>Learn what I can do</div>
                </button>
                <button
                  onClick={() => setInputValue("Tell me about Echo's features")}
                  className="hover-lift"
                  style={{
                    padding: '1.25rem',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(6, 182, 212, 0.1))',
                    border: '2px solid rgba(34, 197, 94, 0.2)',
                    borderRadius: '16px',
                    color: 'var(--fg)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = colors.status.success;
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(6, 182, 212, 0.2))';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.2)';
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(6, 182, 212, 0.1))';
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem', animation: 'bounce 2.5s infinite' }}>🌟</div>
                  <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Explore Echo</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)', opacity: 0.8 }}>Discover platform features</div>
                </button>
                {isFullscreen && (
                  <button
                    onClick={() => setInputValue("Generate an image of a sunset over mountains")}
                    className="hover-lift"
                    style={{
                      padding: '1.25rem',
                      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))',
                      border: '2px solid rgba(236, 72, 153, 0.2)',
                      borderRadius: '16px',
                      color: 'var(--fg)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      textAlign: 'left',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#ec4899';
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(168, 85, 247, 0.2))';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)';
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(168, 85, 247, 0.1))';
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem', animation: 'bounce 3s infinite' }}>🎨</div>
                    <div style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1rem' }}>Generate Image</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', opacity: 0.8 }}>Create AI-generated visuals</div>
                  </button>
                )}
              </div>
            </div>
          )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={message.role === 'user' ? 'user-message' : 'typing-text'}
            style={{
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              gap: isFullscreen ? '1rem' : '0.75rem',
              marginBottom: '0.5rem'
            }}
          >
            <div className="hover-lift" style={{
              width: isFullscreen ? '48px' : '40px',
              height: isFullscreen ? '48px' : '40px',
              borderRadius: '50%',
              background: message.role === 'user'
                ? 'linear-gradient(135deg, var(--accent), #8b5cf6)'
                : 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isFullscreen ? '1.25rem' : '1rem',
              color: 'white',
              flexShrink: 0,
              boxShadow: message.role === 'user'
                ? '0 4px 15px rgba(var(--accent-rgb), 0.4)'
                : '0 4px 15px rgba(6, 182, 212, 0.4)',
              transition: 'all 0.3s ease',
              border: '3px solid rgba(255, 255, 255, 0.2)'
            }}>
              {message.role === 'user' ? '👤' : '🌟'}
            </div>
            <div
              className={`${message.role === 'assistant' ? 'ai-message-bubble' : ''} ${message.isTyping ? 'typing' : ''}`}
              style={{
                background: message.role === 'user'
                  ? 'linear-gradient(135deg, var(--accent), #8b5cf6)'
                  : 'var(--card)',
                color: message.role === 'user' ? 'white' : 'var(--fg)',
                padding: isFullscreen ? '1.25rem 1.5rem' : '1rem 1.25rem',
                borderRadius: message.role === 'user' ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                maxWidth: isFullscreen ? '70%' : '75%',
                fontSize: isFullscreen ? '1.05rem' : '0.95rem',
                lineHeight: 1.6,
                border: message.role === 'assistant' ? '2px solid var(--border)' : 'none',
                position: 'relative',
                transform: message.role === 'assistant' && message.isTyping ? 'scale(1.01)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: message.role === 'user'
                  ? '0 6px 20px rgba(var(--accent-rgb), 0.35)'
                  : message.role === 'assistant' && message.isTyping
                    ? '0 8px 25px rgba(6, 182, 212, 0.25)'
                    : message.role === 'assistant'
                      ? '0 4px 15px rgba(0,0,0,0.08)'
                      : 'none',
                backdropFilter: message.role === 'assistant' ? 'blur(10px)' : 'none'
              }}
            >
              {message.role === 'assistant' ? (
                <div className="typing-text">
                  <span style={{ position: 'relative', zIndex: 1 }}>
                    {message.displayedContent || message.content}
                    {message.isTyping && (
                      <span style={{
                        animation: 'blink 1s infinite',
                        marginLeft: '2px',
                        fontWeight: 'bold',
                        color: 'var(--accent)',
                        fontSize: '1.1em'
                      }}>|</span>
                    )}
                  </span>

                  {/* Display generated image */}
                  {message.image_url && (
                    <div style={{
                      marginTop: '1rem',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      border: '1px solid var(--border)'
                    }}>
                      <img
                        src={message.image_url}
                        alt={message.image_prompt || 'Generated image'}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block'
                        }}
                        onError={(e) => {

                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      {message.image_prompt && (
                        <div style={{
                          padding: '0.5rem',
                          background: 'var(--bg)',
                          fontSize: '0.8rem',
                          color: 'var(--muted)',
                          borderTop: '1px solid var(--border)'
                        }}>
                          🎨 &quot;{message.image_prompt}&quot;
                        </div>
                      )}
                    </div>
                  )}

                  {/* Progress bar for typing */}
                  {message.isTyping && message.progress !== undefined && (
                    <div
                      className="typing-progress"
                      style={{
                        width: `${message.progress}%`
                      }}
                    />
                  )}
                </div>
              ) : (
                <div style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                  {message.content}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              color: 'white'
            }}>
              🤖
            </div>
            <div style={{
              background: 'var(--card)',
              padding: '0.75rem',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              fontSize: '0.9rem',
              color: 'var(--muted)'
            }}>
              Thinking...
            </div>
          </div>
        )}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>
        )}

        {/* Enhanced Input Area */}
        {!isMinimized && (
        <div style={{
          padding: isFullscreen ? '2.5rem 3rem 3rem' : '1.5rem 1rem',
          borderTop: isFullscreen ? '2px solid var(--border)' : '2px solid var(--border)',
          background: isFullscreen
            ? 'linear-gradient(135deg, rgba(var(--accent-rgb), 0.03), rgba(139, 92, 246, 0.03))'
            : 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          boxShadow: isFullscreen ? '0 -4px 20px rgba(0,0,0,0.05)' : 'none'
        }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            maxWidth: isFullscreen ? '900px' : 'none',
            margin: isFullscreen ? '0 auto' : 0
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isFullscreen ? "Type your message to ECHO AI... ✨" : "Ask ECHO AI anything... ✨"}
                disabled={isLoading}
                className="hover-lift"
                style={{
                  width: '100%',
                  padding: isFullscreen ? '1.5rem 5rem 1.5rem 1.75rem' : '1.25rem 4rem 1.25rem 1.5rem',
                  border: '3px solid var(--border)',
                  borderRadius: isFullscreen ? '28px' : '25px',
                  background: 'var(--bg)',
                  color: 'var(--fg)',
                  resize: 'none',
                  minHeight: isFullscreen ? '80px' : '60px',
                  maxHeight: isFullscreen ? '200px' : '150px',
                  fontFamily: 'inherit',
                  fontSize: isFullscreen ? '1.05rem' : '1rem',
                  lineHeight: 1.6,
                  outline: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent)';
                  e.target.style.boxShadow = '0 0 0 4px rgba(var(--accent-rgb), 0.15), 0 8px 25px rgba(0,0,0,0.1)';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                  e.target.style.transform = 'translateY(0)';
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="hover-lift"
                style={{
                  position: 'absolute',
                  right: isFullscreen ? '1rem' : '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: isFullscreen ? '56px' : '48px',
                  height: isFullscreen ? '56px' : '48px',
                  backgroundImage: inputValue.trim() && !isLoading
                    ? 'linear-gradient(135deg, var(--accent), #8b5cf6, #06b6d4)'
                    : 'none',
                  backgroundColor: inputValue.trim() && !isLoading
                    ? 'transparent'
                    : 'var(--muted)',
                  backgroundSize: inputValue.trim() && !isLoading ? '200% 200%' : 'auto',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  cursor: inputValue.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: isFullscreen ? '1.5rem' : '1.3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: inputValue.trim() && !isLoading
                    ? '0 6px 20px rgba(var(--accent-rgb), 0.4)'
                    : 'none',
                  animation: isLoading ? 'pulse 1.5s infinite' : 'none'
                }}
                title="Send message to ECHO AI"
                onMouseEnter={(e) => {
                  if (inputValue.trim() && !isLoading) {
                    e.currentTarget.style.backgroundPosition = '100% 50%';
                    e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(var(--accent-rgb), 0.6)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundPosition = '0% 50%';
                  e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                  e.currentTarget.style.boxShadow = inputValue.trim() && !isLoading
                    ? '0 6px 20px rgba(var(--accent-rgb), 0.4)'
                    : 'none';
                }}
              >
                {isLoading ? <span style={{ animation: 'bounce 1s infinite' }}>⏳</span> : '🚀'}
              </button>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* AI Settings Modal */}
      <AISettingsComponent
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentSettings={aiSettings}
        onSettingsChange={handleSettingsChange}
      />
    </div>
    </>
  );
}