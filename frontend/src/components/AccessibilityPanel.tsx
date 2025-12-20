/**
 * Accessibility Control Panel
 * Provides user interface for accessibility settings and testing
 */

'use client';

import React, { useState } from 'react';
import { useAccessibilityContext } from '@/components/AccessibilityProvider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Button from '@/components/ui/Button';
import { X, RefreshCw, Search, Check, XCircle } from 'lucide-react';

interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccessibilityPanel({
  isOpen,
  onClose,
}: AccessibilityPanelProps) {
  const {
    report,
    isAnalyzing,
    analyzeAccessibility,
    settings,
    updateSettings,
    announce,
  } = useAccessibilityContext();

  const [activeTab, setActiveTab] = useState<'settings' | 'report'>('settings');

  if (!isOpen) return null;

  const handleSettingChange = (key: keyof typeof settings, value: unknown) => {
    updateSettings({ [key]: value });
    announce(`${key} ${value ? 'enabled' : 'disabled'}`, 'polite');
  };

  const runAccessibilityTest = async () => {
    announce('Running accessibility analysis', 'polite');
    await analyzeAccessibility();
    announce('Accessibility analysis complete', 'polite');
  };

  const getComplianceColor = (passes: boolean) => {
    return passes ? '#10b981' : '#ef4444';
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accessibility-panel-title"
    >
      <div
        className="card max-w-4xl max-h-[90vh] w-full m-4 overflow-hidden"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle
                id="accessibility-panel-title"
                className="text-xl font-semibold"
              >
                ♿ Accessibility Center
              </CardTitle>
              <CardDescription>
                Manage accessibility settings and monitor compliance
              </CardDescription>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              aria-label="Close accessibility panel"
              className="h-8 w-8 p-0"
            >
              <X size={18} />
            </Button>
          </div>
        </CardHeader>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'settings'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-fg'
            }`}
            role="tab"
            aria-selected={activeTab === 'settings'}
            aria-controls="settings-panel"
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'report'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-fg'
            }`}
            role="tab"
            aria-selected={activeTab === 'report'}
            aria-controls="report-panel"
          >
            Compliance Report
          </button>
        </div>

        <CardContent className="flex-1 overflow-y-auto p-6">
          {activeTab === 'settings' && (
            <div
              id="settings-panel"
              role="tabpanel"
              aria-labelledby="settings-tab"
            >
              <div className="space-y-6">
                {/* Visual Settings */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    Visual Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.enableHighContrast}
                          onChange={(e) =>
                            handleSettingChange(
                              'enableHighContrast',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span>High Contrast Mode</span>
                      </label>
                      <p className="text-sm text-muted ml-7">
                        Increases contrast between text and background
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.enableLargeText}
                          onChange={(e) =>
                            handleSettingChange(
                              'enableLargeText',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span>Large Text</span>
                      </label>
                      <p className="text-sm text-muted ml-7">
                        Increases text size for better readability
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="font-size" className="block font-medium">
                        Font Size
                      </label>
                      <select
                        id="font-size"
                        value={settings.fontSize}
                        onChange={(e) =>
                          handleSettingChange('fontSize', e.target.value)
                        }
                        className="w-full p-2 border border-border rounded-md bg-card"
                      >
                        <option value="small">Small (14px)</option>
                        <option value="medium">Medium (16px)</option>
                        <option value="large">Large (18px)</option>
                        <option value="x-large">Extra Large (20px)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="contrast-level"
                        className="block font-medium"
                      >
                        Contrast Level
                      </label>
                      <select
                        id="contrast-level"
                        value={settings.contrastLevel}
                        onChange={(e) =>
                          handleSettingChange('contrastLevel', e.target.value)
                        }
                        className="w-full p-2 border border-border rounded-md bg-card"
                      >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="maximum">Maximum</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* Motion Settings */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    Motion Preferences
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.enableReducedMotion}
                        onChange={(e) =>
                          handleSettingChange(
                            'enableReducedMotion',
                            e.target.checked
                          )
                        }
                        className="w-4 h-4"
                      />
                      <span>Reduced Motion</span>
                    </label>
                    <p className="text-sm text-muted ml-7">
                      Minimizes animations and transitions
                    </p>
                  </div>
                </section>

                {/* Navigation Settings */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">
                    Navigation Preferences
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.enableKeyboardNavigation}
                          onChange={(e) =>
                            handleSettingChange(
                              'enableKeyboardNavigation',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span>Enhanced Keyboard Navigation</span>
                      </label>
                      <p className="text-sm text-muted ml-7">
                        Improves focus indicators and keyboard shortcuts
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.enableScreenReaderOptimizations}
                          onChange={(e) =>
                            handleSettingChange(
                              'enableScreenReaderOptimizations',
                              e.target.checked
                            )
                          }
                          className="w-4 h-4"
                        />
                        <span>Screen Reader Optimizations</span>
                      </label>
                      <p className="text-sm text-muted ml-7">
                        Enhances compatibility with screen readers
                      </p>
                    </div>
                  </div>
                </section>

                {/* Quick Actions */}
                <section>
                  <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        updateSettings({
                          enableHighContrast: true,
                          enableLargeText: true,
                          enableReducedMotion: true,
                          fontSize: 'large',
                          contrastLevel: 'high',
                        });
                        announce('High accessibility mode enabled', 'polite');
                      }}
                      variant="outline"
                    >
                      Enable High Accessibility
                    </Button>
                    <Button
                      onClick={() => {
                        updateSettings({
                          enableHighContrast: false,
                          enableLargeText: false,
                          enableReducedMotion: false,
                          fontSize: 'medium',
                          contrastLevel: 'normal',
                        });
                        announce('Default settings restored', 'polite');
                      }}
                      variant="outline"
                    >
                      Reset to Default
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'report' && (
            <div id="report-panel" role="tabpanel" aria-labelledby="report-tab">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Compliance Analysis</h3>
                  <Button
                    onClick={runAccessibilityTest}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2"
                  >
                    {isAnalyzing ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                    {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
                  </Button>
                </div>

                {report && (
                  <>
                    {/* Overall Score */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div
                            className="text-3xl font-bold mb-2"
                            style={{ color: getScoreColor(report.score) }}
                          >
                            {report.score}/100
                          </div>
                          <div className="text-sm text-muted">
                            Overall Score
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div
                            className="text-2xl font-bold mb-2"
                            style={{
                              color: getComplianceColor(
                                report.compliance.wcagA
                              ),
                            }}
                          >
                            {report.compliance.wcagA ? <Check size={28} /> : <XCircle size={28} />}
                          </div>
                          <div className="text-sm text-muted">WCAG A</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div
                            className="text-2xl font-bold mb-2"
                            style={{
                              color: getComplianceColor(
                                report.compliance.wcagAA
                              ),
                            }}
                          >
                            {report.compliance.wcagAA ? <Check size={28} /> : <XCircle size={28} />}
                          </div>
                          <div className="text-sm text-muted">WCAG AA</div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <div
                            className="text-2xl font-bold mb-2"
                            style={{
                              color: getComplianceColor(
                                report.compliance.wcagAAA
                              ),
                            }}
                          >
                            {report.compliance.wcagAAA ? <Check size={28} /> : <XCircle size={28} />}
                          </div>
                          <div className="text-sm text-muted">WCAG AAA</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Issues */}
                    {report.issues.length > 0 && (
                      <section>
                        <h4 className="text-lg font-semibold mb-4">
                          Issues Found ({report.issues.length})
                        </h4>
                        <div className="space-y-3">
                          {report.issues.map((issue, index) => (
                            <Card key={index}>
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <span
                                    className="text-sm px-2 py-1 rounded-md font-medium"
                                    style={{
                                      backgroundColor:
                                        issue.severity === 'critical'
                                          ? '#fee2e2'
                                          : issue.severity === 'major'
                                            ? '#fef3c7'
                                            : '#f0f9ff',
                                      color:
                                        issue.severity === 'critical'
                                          ? '#dc2626'
                                          : issue.severity === 'major'
                                            ? '#d97706'
                                            : '#0369a1',
                                    }}
                                  >
                                    {issue.severity}
                                  </span>
                                  <div className="flex-1">
                                    <h5 className="font-medium mb-1">
                                      {issue.description}
                                    </h5>
                                    <p className="text-sm text-muted mb-2">
                                      {issue.recommendation}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-muted">
                                      <span>Element: {issue.element}</span>
                                      <span>
                                        Reference: {issue.wcagReference}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Recommendations */}
                    <section>
                      <h4 className="text-lg font-semibold mb-4">
                        Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {report.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-accent mt-1">•</span>
                            <span className="text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </>
                )}

                {!report && !isAnalyzing && (
                  <div className="text-center py-8 text-muted">
                    <p>No accessibility analysis has been run yet.</p>
                    <p className="text-sm mt-2">
                      Click &quot;Run Analysis&quot; to generate a compliance
                      report.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
}
