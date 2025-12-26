'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SettingsSubPage, SettingsSection } from './SettingsSubPage';
import { useModernTheme } from '@/contexts/ModernThemeContext';
import { Sun, Moon, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGSAP, gsap } from '@/hooks/useGSAP';
import { ANIMATION } from '@/lib/animation-constants';

export function AppearanceSettings({ onBack }: { onBack?: () => void }) {
  const {
    colors,
    colorMode,
    setColorMode,
    variant,
    setVariant,
    accessibility,
    setAccessibility,
  } = useModernTheme();
  const [textSize, setTextSize] = useState(accessibility?.fontSize || 16);
  const [reducedMotion, setReducedMotion] = useState(
    accessibility?.reducedMotion || false
  );
  const [highContrast, setHighContrast] = useState(
    accessibility?.highContrast || false
  );

  const reducedMotionToggleRef = useRef<HTMLButtonElement>(null);
  const highContrastToggleRef = useRef<HTMLButtonElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  // Load settings from accessibility
  useEffect(() => {
    if (accessibility) {
      setTextSize(accessibility.fontSize || 16);
      setReducedMotion(accessibility.reducedMotion || false);
      setHighContrast(accessibility.highContrast || false);
    }
  }, [accessibility]);

  // Apply text size globally whenever it changes
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--global-font-size',
      `${textSize}px`
    );
    setAccessibility({ ...accessibility, fontSize: textSize });
  }, [textSize]);

  // Apply reduced motion globally
  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.style.setProperty(
        '--animation-duration',
        '0.01ms'
      );
      document.documentElement.style.setProperty(
        '--transition-duration',
        '0.01ms'
      );
    } else {
      document.documentElement.style.setProperty(
        '--animation-duration',
        '300ms'
      );
      document.documentElement.style.setProperty(
        '--transition-duration',
        '200ms'
      );
    }
    setAccessibility({ ...accessibility, reducedMotion });
  }, [reducedMotion]);

  // Apply high contrast globally
  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
    setAccessibility({ ...accessibility, highContrast });
  }, [highContrast]);

  // GSAP animations for toggle switches
  useGSAP(() => {
    if (reducedMotionToggleRef.current) {
      gsap.to(reducedMotionToggleRef.current, {
        scale: 1.05,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: ANIMATION.easing.apple,
      });
    }
  }, [reducedMotion]);

  useGSAP(() => {
    if (highContrastToggleRef.current) {
      gsap.to(highContrastToggleRef.current, {
        scale: 1.05,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        ease: ANIMATION.easing.apple,
      });
    }
  }, [highContrast]);

  const colorModes = [
    { id: 'light', name: 'Light', icon: Sun, description: 'Clean and bright' },
    { id: 'dark', name: 'Dark', icon: Moon, description: 'Easy on the eyes' },
    { id: 'auto', name: 'Auto', icon: Globe, description: 'Match your system' },
  ];

  const themeVariants = [
    {
      id: 'default',
      name: 'Default Blue',
      primary: '#3b82f6',
      secondary: '#8b5cf6',
    },
    {
      id: 'ocean',
      name: 'Ocean Teal',
      primary: '#14b8a6',
      secondary: '#06b6d4',
    },
    {
      id: 'sunset',
      name: 'Sunset Orange',
      primary: '#f97316',
      secondary: '#ec4899',
    },
    {
      id: 'forest',
      name: 'Forest Green',
      primary: '#10b981',
      secondary: '#84cc16',
    },
    {
      id: 'lavender',
      name: 'Lavender Purple',
      primary: '#a855f7',
      secondary: '#ec4899',
    },
    { id: 'rose', name: 'Rose Pink', primary: '#f43f5e', secondary: '#fb923c' },
  ];

  return (
    <SettingsSubPage
      title="Appearance"
      description="Customize colors, themes, and visual preferences"
      onBack={onBack}
    >
      {/* Color Mode Section */}
      <SettingsSection
        title="Color Mode"
        description="Choose between light, dark, or auto mode"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 'var(--settings-space-4)',
          }}
        >
          {colorModes.map((mode) => {
            const Icon = mode.icon;
            const isActive = colorMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  setColorMode(mode.id as 'light' | 'dark' | 'auto');
                  toast.success(`Color mode changed to ${mode.name}`);
                }}
                style={{
                  padding: 'var(--settings-space-6)',
                  borderRadius: 'var(--settings-radius-md)',
                  border: isActive
                    ? `2px solid ${colors.primary}`
                    : `1px solid ${colors.border}`,
                  background: isActive ? `${colors.primary}10` : colors.surface,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
              >
                <Icon
                  size={24}
                  style={{
                    color: isActive ? colors.primary : colors.textSecondary,
                    marginBottom: 'var(--settings-space-3)',
                  }}
                />
                <div
                  style={{
                    fontSize: 'var(--settings-text-base)',
                    fontWeight: 'var(--settings-weight-semibold)',
                    color: colors.text,
                    marginBottom: 'var(--settings-space-1)',
                  }}
                >
                  {mode.name}
                </div>
                <div
                  style={{
                    fontSize: 'var(--settings-text-sm)',
                    color: colors.textSecondary,
                  }}
                >
                  {mode.description}
                </div>
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Theme Variant Section */}
      <SettingsSection
        title="Theme Variant"
        description="Select your preferred color palette"
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 'var(--settings-space-4)',
          }}
        >
          {themeVariants.map((themeVariant) => {
            const isActive = variant === themeVariant.id;

            return (
              <button
                key={themeVariant.id}
                onClick={() => {
                  setVariant(themeVariant.id as any);
                  toast.success(`Theme changed to ${themeVariant.name}`);
                }}
                style={{
                  padding: 'var(--settings-space-4)',
                  borderRadius: 'var(--settings-radius-md)',
                  border: isActive
                    ? `2px solid ${colors.primary}`
                    : `1px solid ${colors.border}`,
                  background: colors.surface,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'scale(1.02)';
                    e.currentTarget.style.borderColor = colors.primary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: 'var(--settings-space-2)',
                    marginBottom: 'var(--settings-space-3)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--settings-radius-sm)',
                      background: themeVariant.primary,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--settings-radius-sm)',
                      background: themeVariant.secondary,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                </div>
                <div
                  style={{
                    fontSize: 'var(--settings-text-sm)',
                    fontWeight: 'var(--settings-weight-medium)',
                    color: colors.text,
                  }}
                >
                  {themeVariant.name}
                </div>
                {isActive && (
                  <div
                    style={{
                      fontSize: 'var(--settings-text-xs)',
                      color: colors.primary,
                      marginTop: '4px',
                    }}
                  >
                    ✓ Active
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SettingsSection>

      {/* Text Size Section */}
      <SettingsSection
        title="Text Size"
        description="Adjust the default text size across the app"
      >
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--settings-space-4)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--settings-text-sm)',
                color: colors.textSecondary,
              }}
            >
              Small (14px)
            </span>
            <span
              style={{
                fontSize: `${textSize}px`,
                fontWeight: 'var(--settings-weight-semibold)',
                color: colors.text,
              }}
            >
              Aa
            </span>
            <span
              style={{
                fontSize: 'var(--settings-text-sm)',
                color: colors.textSecondary,
              }}
            >
              Large (20px)
            </span>
          </div>

          <input
            type="range"
            min="14"
            max="20"
            step="1"
            value={textSize}
            onChange={(e) => setTextSize(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '3px',
              background: colors.border,
              outline: 'none',
              cursor: 'pointer',
              accentColor: colors.primary,
            }}
          />

          <div
            style={{
              marginTop: 'var(--settings-space-6)',
              padding: 'var(--settings-space-6)',
              background: colors.surfaceElevated,
              borderRadius: 'var(--settings-radius-md)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <p
              style={{
                fontSize: `${textSize}px`,
                lineHeight: '1.6',
                color: colors.text,
              }}
            >
              The quick brown fox jumps over the lazy dog. This is a preview of
              how text will appear at your selected size.
            </p>
          </div>
        </div>
      </SettingsSection>

      {/* Accessibility Options */}
      <SettingsSection
        title="Accessibility"
        description="Additional accessibility preferences"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--settings-space-4)',
          }}
        >
          {/* Reduced Motion Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--settings-space-4)',
              background: colors.surface,
              borderRadius: 'var(--settings-radius-md)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--settings-text-base)',
                  fontWeight: 'var(--settings-weight-medium)',
                  color: colors.text,
                  marginBottom: '4px',
                }}
              >
                Reduced Motion
              </div>
              <div
                style={{
                  fontSize: 'var(--settings-text-sm)',
                  color: colors.textSecondary,
                }}
              >
                Minimize animations and transitions
              </div>
            </div>
            <button
              ref={reducedMotionToggleRef}
              onClick={() => setReducedMotion(!reducedMotion)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                background: reducedMotion ? colors.primary : colors.border,
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${reducedMotion ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>

          {/* High Contrast Toggle */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 'var(--settings-space-4)',
              background: colors.surface,
              borderRadius: 'var(--settings-radius-md)',
              border: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 'var(--settings-text-base)',
                  fontWeight: 'var(--settings-weight-medium)',
                  color: colors.text,
                  marginBottom: '4px',
                }}
              >
                High Contrast
              </div>
              <div
                style={{
                  fontSize: 'var(--settings-text-sm)',
                  color: colors.textSecondary,
                }}
              >
                Increase contrast for better readability
              </div>
            </div>
            <button
              ref={highContrastToggleRef}
              onClick={() => setHighContrast(!highContrast)}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
              style={{
                background: highContrast ? colors.primary : colors.border,
              }}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${highContrast ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--settings-space-4)',
          paddingTop: 'var(--settings-space-8)',
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <button
          onClick={() => {
            // Reset to defaults
            setTextSize(16);
            setReducedMotion(false);
            setHighContrast(false);
            setAccessibility({
              fontSize: 16,
              reducedMotion: false,
              highContrast: false,
            });
            toast.success('Reset to default settings');
          }}
          style={{
            padding: '12px 24px',
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-medium)',
            borderRadius: 'var(--settings-radius-md)',
            border: `1px solid ${colors.border}`,
            background: colors.surface,
            color: colors.text,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = colors.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = colors.surface;
          }}
        >
          Reset to Defaults
        </button>

        <button
          ref={saveButtonRef}
          onClick={() => {
            // Success animation
            if (saveButtonRef.current) {
              gsap.to(saveButtonRef.current, {
                scale: 0.95,
                duration: 0.1,
                yoyo: true,
                repeat: 1,
                ease: ANIMATION.easing.apple,
                onComplete: () => {
                  gsap.to(saveButtonRef.current, {
                    rotateZ: 5,
                    duration: 0.05,
                    yoyo: true,
                    repeat: 3,
                  });
                },
              });
            }
            toast.success('✓ All changes are automatically saved!', {
              icon: '💾',
              duration: 2000,
            });
          }}
          style={{
            padding: '12px 32px',
            fontSize: 'var(--settings-text-base)',
            fontWeight: 'var(--settings-weight-semibold)',
            borderRadius: 'var(--settings-radius-md)',
            border: 'none',
            background: `linear-gradient(135deg, ${colors.success}, ${colors.primary})`,
            color: 'white',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginLeft: 'auto',
            boxShadow: `0 4px 12px ${colors.success}40`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = `0 6px 16px ${colors.success}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.success}40`;
          }}
        >
          ✓ Auto-Saved
        </button>
      </div>
    </SettingsSubPage>
  );
}
