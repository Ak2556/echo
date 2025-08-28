/**
 * Enhanced Accessibility Settings Hook
 * Manages comprehensive audio and visual accessibility features
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccessibilityContext } from '@/components/AccessibilityProvider';

export interface AccessibilitySettings {
  // Visual Accessibility
  highContrast: boolean;
  largeText: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  colorBlindSupport: boolean;
  reducedMotion: boolean;
  contrastLevel: 'normal' | 'high' | 'maximum';
  
  // Audio Accessibility
  screenReaderOptimization: boolean;
  audioDescriptions: boolean;
  audioFeedback: boolean;
  voiceNavigation: boolean;
  
  // Audio Levels
  uiSoundsVolume: number;
  voiceFeedbackVolume: number;
  notificationVolume: number;
  
  // Keyboard & Navigation
  enhancedFocusIndicators: boolean;
  skipNavigationLinks: boolean;
  keyboardShortcuts: boolean;
  
  // Advanced Features
  speechRate: number;
  speechPitch: number;
  speechVoice: string;
  autoReadContent: boolean;
  announcePageChanges: boolean;
  announceFormErrors: boolean;
  
  // Captions & Subtitles
  enableCaptions: boolean;
  captionSize: 'small' | 'medium' | 'large';
  captionBackground: boolean;
  
  // Motor Accessibility
  clickDelay: number;
  hoverDelay: number;
  stickyKeys: boolean;
  mouseKeys: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  // Visual
  highContrast: false,
  largeText: false,
  fontSize: 'medium',
  colorBlindSupport: false,
  reducedMotion: false,
  contrastLevel: 'normal',
  
  // Audio
  screenReaderOptimization: true,
  audioDescriptions: false,
  audioFeedback: true,
  voiceNavigation: false,
  
  // Audio Levels
  uiSoundsVolume: 75,
  voiceFeedbackVolume: 80,
  notificationVolume: 60,
  
  // Keyboard
  enhancedFocusIndicators: true,
  skipNavigationLinks: true,
  keyboardShortcuts: true,
  
  // Advanced
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVoice: 'default',
  autoReadContent: false,
  announcePageChanges: true,
  announceFormErrors: true,
  
  // Captions
  enableCaptions: false,
  captionSize: 'medium',
  captionBackground: true,
  
  // Motor
  clickDelay: 0,
  hoverDelay: 500,
  stickyKeys: false,
  mouseKeys: false,
};

export function useAccessibilitySettings() {
  const { announce, updateSettings: updateContextSettings } = useAccessibilityContext();
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    
    const saved = localStorage.getItem('echo_accessibility_settings_v2');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [isTestingMode, setIsTestingMode] = useState(false);
  const [accessibilityScore, setAccessibilityScore] = useState(85);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: AccessibilitySettings) => {
    localStorage.setItem('echo_accessibility_settings_v2', JSON.stringify(newSettings));
    setSettings(newSettings);
    
    // Update context settings for compatibility
    updateContextSettings({
      enableHighContrast: newSettings.highContrast,
      enableReducedMotion: newSettings.reducedMotion,
      enableLargeText: newSettings.largeText,
      enableScreenReaderOptimizations: newSettings.screenReaderOptimization,
      enableKeyboardNavigation: newSettings.enhancedFocusIndicators,
      fontSize: newSettings.fontSize,
      contrastLevel: newSettings.contrastLevel,
    });
  }, [updateContextSettings]);

  // Update individual setting
  const updateSetting = useCallback(<K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
    
    // Announce changes for screen readers
    if (settings.announcePageChanges) {
      announce(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
    }
  }, [settings, saveSettings, announce]);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    saveSettings(DEFAULT_SETTINGS);
    announce('Accessibility settings reset to defaults');
  }, [saveSettings, announce]);

  // Export settings
  const exportSettings = useCallback(() => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `echo-accessibility-profile-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    announce('Accessibility profile exported successfully');
  }, [settings, announce]);

  // Import settings
  const importSettings = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedSettings = JSON.parse(event.target?.result as string);
        const mergedSettings = { ...DEFAULT_SETTINGS, ...importedSettings };
        saveSettings(mergedSettings);
        announce('Accessibility profile imported successfully');
      } catch (error) {
        announce('Failed to import accessibility profile', 'assertive');
      }
    };
    reader.readAsText(file);
  }, [saveSettings, announce]);

  // Text-to-Speech functionality
  const speak = useCallback((text: string, options?: {
    rate?: number;
    pitch?: number;
    voice?: string;
    interrupt?: boolean;
  }) => {
    if (!settings.audioFeedback && !settings.screenReaderOptimization) return;
    
    if ('speechSynthesis' in window) {
      if (options?.interrupt) {
        speechSynthesis.cancel();
      }
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate || settings.speechRate;
      utterance.pitch = options?.pitch || settings.speechPitch;
      utterance.volume = settings.voiceFeedbackVolume / 100;
      
      if (options?.voice && options.voice !== 'default') {
        const voices = speechSynthesis.getVoices();
        const selectedVoice = voices.find(voice => voice.name === options.voice);
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
      }
      
      speechSynthesis.speak(utterance);
    }
  }, [settings]);

  // Play UI sound
  const playUISound = useCallback((type: 'click' | 'hover' | 'error' | 'success' | 'notification') => {
    if (!settings.audioFeedback) return;
    
    // Create audio context for UI sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for different UI actions
    const frequencies = {
      click: 800,
      hover: 600,
      error: 300,
      success: 1000,
      notification: 750,
    };
    
    oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
    gainNode.gain.setValueAtTime(settings.uiSoundsVolume / 100 * 0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  }, [settings.audioFeedback, settings.uiSoundsVolume]);

  // Voice commands handler
  const startVoiceNavigation = useCallback(() => {
    if (!settings.voiceNavigation || !('webkitSpeechRecognition' in window)) {
      announce('Voice navigation not available', 'assertive');
      return;
    }
    
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
      announce('Voice navigation started. Say a command.');
    };
    
    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript.toLowerCase();
      handleVoiceCommand(command);
    };
    
    recognition.onerror = () => {
      announce('Voice recognition error', 'assertive');
    };
    
    recognition.start();
  }, [settings.voiceNavigation, announce]);

  // Handle voice commands
  const handleVoiceCommand = useCallback((command: string) => {
    const commands = {
      'go home': () => window.location.href = '/',
      'open settings': () => window.location.href = '/settings',
      'go back': () => window.history.back(),
      'scroll up': () => window.scrollBy(0, -200),
      'scroll down': () => window.scrollBy(0, 200),
      'read page': () => {
        const content = document.body.innerText;
        speak(content.substring(0, 500) + '...');
      },
    };
    
    const matchedCommand = Object.keys(commands).find(cmd => 
      command.includes(cmd)
    );
    
    if (matchedCommand) {
      commands[matchedCommand as keyof typeof commands]();
      announce(`Executed: ${matchedCommand}`);
    } else {
      announce('Command not recognized', 'assertive');
    }
  }, [speak, announce]);

  // Run accessibility tests
  const runAccessibilityTest = useCallback(async (testType: 'contrast' | 'keyboard' | 'screenreader' | 'focus' | 'full') => {
    setIsTestingMode(true);
    announce(`Running ${testType} accessibility test`);
    
    // Simulate test execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock test results
    const results = {
      contrast: 92,
      keyboard: 88,
      screenreader: 85,
      focus: 90,
      full: 85,
    };
    
    setAccessibilityScore(results[testType]);
    setIsTestingMode(false);
    
    announce(`${testType} test completed. Score: ${results[testType]}%`);
    
    return {
      score: results[testType],
      issues: [],
      recommendations: [
        'Consider increasing color contrast ratios',
        'Add more descriptive alt text to images',
        'Ensure all interactive elements are keyboard accessible',
      ],
    };
  }, [announce]);

  // Apply settings to DOM
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply visual settings
    root.style.setProperty('--accessibility-font-size', {
      small: '14px',
      medium: '16px',
      large: '18px',
      'x-large': '20px',
    }[settings.fontSize]);
    
    root.style.setProperty('--accessibility-contrast', {
      normal: '1',
      high: '1.5',
      maximum: '2',
    }[settings.contrastLevel]);
    
    // Apply classes
    root.classList.toggle('accessibility-high-contrast', settings.highContrast);
    root.classList.toggle('accessibility-large-text', settings.largeText);
    root.classList.toggle('accessibility-reduced-motion', settings.reducedMotion);
    root.classList.toggle('accessibility-color-blind-support', settings.colorBlindSupport);
    root.classList.toggle('accessibility-enhanced-focus', settings.enhancedFocusIndicators);
    
    // Set up keyboard shortcuts
    if (settings.keyboardShortcuts) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.altKey) {
          switch (event.key.toLowerCase()) {
            case 'a':
              event.preventDefault();
              // Toggle accessibility panel
              announce('Accessibility panel toggled');
              break;
            case 's':
              event.preventDefault();
              window.location.href = '/settings';
              break;
            case 'h':
              event.preventDefault();
              window.location.href = '/';
              break;
            case 'r':
              event.preventDefault();
              if (settings.autoReadContent) {
                const content = document.querySelector('main')?.innerText || document.body.innerText;
                speak(content.substring(0, 500) + '...');
              }
              break;
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [settings, speak, announce]);

  // Auto-read content when enabled
  useEffect(() => {
    if (settings.autoReadContent && settings.announcePageChanges) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            const addedText = Array.from(mutation.addedNodes)
              .filter(node => node.nodeType === Node.TEXT_NODE)
              .map(node => node.textContent)
              .join(' ')
              .trim();
            
            if (addedText.length > 10) {
              speak(addedText.substring(0, 100));
            }
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
      
      return () => observer.disconnect();
    }
  }, [settings.autoReadContent, settings.announcePageChanges, speak]);

  return {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    speak,
    playUISound,
    startVoiceNavigation,
    runAccessibilityTest,
    isTestingMode,
    accessibilityScore,
  };
}

export default useAccessibilitySettings;