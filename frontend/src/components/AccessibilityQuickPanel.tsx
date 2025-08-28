/**
 * Accessibility Quick Panel
 * Floating panel for quick accessibility adjustments
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  Volume2,
  Eye,
  Keyboard,
  Settings,
  X,
  Play,
  Pause,
  RotateCcw,
  Download,
  TestTube,
} from 'lucide-react';
import useAccessibilitySettings from '@/hooks/useAccessibilitySettings';
import Button from '@/components/ui/Button';

interface AccessibilityQuickPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityQuickPanel({ isOpen, onClose }: AccessibilityQuickPanelProps) {
  const {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    speak,
    playUISound,
    startVoiceNavigation,
    runAccessibilityTest,
    isTestingMode,
    accessibilityScore,
  } = useAccessibilitySettings();

  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'keyboard' | 'test'>('visual');
  const [isListening, setIsListening] = useState(false);

  const handleVoiceToggle = () => {
    if (isListening) {
      setIsListening(false);
      speak('Voice navigation stopped');
    } else {
      setIsListening(true);
      startVoiceNavigation();
    }
  };

  const handleTestRun = async (testType: 'contrast' | 'keyboard' | 'screenreader' | 'focus') => {
    await runAccessibilityTest(testType);
    playUISound('success');
  };

  const tabs = [
    { id: 'visual' as const, label: 'Visual', icon: Eye },
    { id: 'audio' as const, label: 'Audio', icon: Volume2 },
    { id: 'keyboard' as const, label: 'Keyboard', icon: Keyboard },
    { id: 'test' as const, label: 'Test', icon: TestTube },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Accessibility size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Accessibility
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Score: {accessibilityScore}%
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close accessibility panel"
                >
                  <X size={16} className="text-gray-500 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      playUISound('click');
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-4 max-h-96 overflow-y-auto">
              {/* Visual Tab */}
              {activeTab === 'visual' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {/* High Contrast */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          High Contrast
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Increase visual contrast
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('highContrast', !settings.highContrast);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.highContrast ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.highContrast ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Large Text */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          Large Text
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Increase text size
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('largeText', !settings.largeText);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.largeText ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.largeText ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Reduced Motion */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          Reduce Motion
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Minimize animations
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('reducedMotion', !settings.reducedMotion);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.reducedMotion ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.reducedMotion ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Font Size */}
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm mb-2">
                        Font Size
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[
                          { value: 'small', label: 'S' },
                          { value: 'medium', label: 'M' },
                          { value: 'large', label: 'L' },
                          { value: 'x-large', label: 'XL' },
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              updateSetting('fontSize', option.value as any);
                              playUISound('click');
                            }}
                            className={`py-2 px-3 text-xs rounded-lg border transition-colors ${
                              settings.fontSize === option.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Audio Tab */}
              {activeTab === 'audio' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {/* Screen Reader */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          Screen Reader
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Enhanced screen reader support
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('screenReaderOptimization', !settings.screenReaderOptimization);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.screenReaderOptimization ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.screenReaderOptimization ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Audio Feedback */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          Audio Feedback
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Sound effects for interactions
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('audioFeedback', !settings.audioFeedback);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.audioFeedback ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.audioFeedback ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Voice Navigation */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          Voice Navigation
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Navigate using voice commands
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('voiceNavigation', !settings.voiceNavigation);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.voiceNavigation ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.voiceNavigation ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Voice Control */}
                    {settings.voiceNavigation && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={handleVoiceToggle}
                          className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                            isListening
                              ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                              : 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          }`}
                        >
                          {isListening ? <Pause size={16} /> : <Play size={16} />}
                          {isListening ? 'Stop Listening' : 'Start Voice Control'}
                        </button>
                      </div>
                    )}

                    {/* Volume Controls */}
                    <div className="space-y-2">
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        Audio Levels
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>UI Sounds</span>
                            <span>{settings.uiSoundsVolume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.uiSoundsVolume}
                            onChange={(e) => updateSetting('uiSoundsVolume', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                            <span>Voice Feedback</span>
                            <span>{settings.voiceFeedbackVolume}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={settings.voiceFeedbackVolume}
                            onChange={(e) => updateSetting('voiceFeedbackVolume', parseInt(e.target.value))}
                            className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Keyboard Tab */}
              {activeTab === 'keyboard' && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {/* Enhanced Focus */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          Enhanced Focus
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Improved focus indicators
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('enhancedFocusIndicators', !settings.enhancedFocusIndicators);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.enhancedFocusIndicators ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.enhancedFocusIndicators ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Skip Links */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          Skip Links
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Quick navigation shortcuts
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('skipNavigationLinks', !settings.skipNavigationLinks);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.skipNavigationLinks ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.skipNavigationLinks ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          Keyboard Shortcuts
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Enable keyboard shortcuts
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateSetting('keyboardShortcuts', !settings.keyboardShortcuts);
                          playUISound('click');
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          settings.keyboardShortcuts ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            settings.keyboardShortcuts ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Shortcuts Reference */}
                    {settings.keyboardShortcuts && (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Available Shortcuts:
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Toggle Accessibility</span>
                            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Alt+A</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Open Settings</span>
                            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Alt+S</kbd>
                          </div>
                          <div className="flex justify-between">
                            <span>Read Content</span>
                            <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-600 rounded text-xs">Alt+R</kbd>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Test Tab */}
              {activeTab === 'test' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {accessibilityScore}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Current Accessibility Score
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${accessibilityScore}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleTestRun('contrast')}
                      disabled={isTestingMode}
                      className="p-3 text-left bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Color Contrast
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        WCAG compliance
                      </div>
                    </button>

                    <button
                      onClick={() => handleTestRun('keyboard')}
                      disabled={isTestingMode}
                      className="p-3 text-left bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Keyboard Nav
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Tab navigation
                      </div>
                    </button>

                    <button
                      onClick={() => handleTestRun('screenreader')}
                      disabled={isTestingMode}
                      className="p-3 text-left bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Screen Reader
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ARIA support
                      </div>
                    </button>

                    <button
                      onClick={() => handleTestRun('focus')}
                      disabled={isTestingMode}
                      className="p-3 text-left bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors disabled:opacity-50"
                    >
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Focus Management
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Focus indicators
                      </div>
                    </button>
                  </div>

                  {isTestingMode && (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Running accessibility test...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetSettings();
                    playUISound('click');
                  }}
                  leftIcon={<RotateCcw size={14} />}
                  className="flex-1"
                >
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    exportSettings();
                    playUISound('success');
                  }}
                  leftIcon={<Download size={14} />}
                  className="flex-1"
                >
                  Export
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    window.location.href = '/settings';
                  }}
                  leftIcon={<Settings size={14} />}
                  className="flex-1"
                >
                  Settings
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}