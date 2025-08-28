'use client';

import { useState, useEffect } from 'react';
import { apiService, AISettings, AIModel, AIPersonality } from '@/services/api';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: AISettings;
  onSettingsChange: (settings: AISettings) => void;
}

const defaultSettings: AISettings = {
  model: 'anthropic/claude-3-haiku',
  personality: 'helpful',
  temperature: 0.7,
  maxTokens: 500
};

export default function AISettingsComponent({ isOpen, onClose, currentSettings, onSettingsChange }: AISettingsProps) {
  const [settings, setSettings] = useState<AISettings>(currentSettings || defaultSettings);
  const [models, setModels] = useState<AIModel[]>([]);
  const [personalities, setPersonalities] = useState<AIPersonality[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [modelsResponse, personalitiesResponse] = await Promise.all([
          apiService.getAvailableModels(),
          apiService.getAvailablePersonalities()
        ]);
        setModels(modelsResponse.models);
        setPersonalities(personalitiesResponse.personalities);
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadOptions();
    }
  }, [isOpen]);

  const handleSave = () => {
    onSettingsChange(settings);
    // Save to localStorage for persistence
    localStorage.setItem('aiSettings', JSON.stringify(settings));
    onClose();
  };

  const handleReset = () => {
    setSettings(defaultSettings);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(5px)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--card)',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border)',
          background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
          borderRadius: 'var(--radius) var(--radius) 0 0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{
              margin: 0,
              color: 'white',
              fontSize: '1.3rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span>⚙️</span>
              AI Assistant Settings
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.2rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ padding: '1.5rem' }}>
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--muted)'
            }}>
              Loading settings...
            </div>
          ) : (
            <>
              {/* AI Model Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--fg)'
                }}>
                  AI Model
                </label>
                <select
                  value={settings.model}
                  onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '0.9rem'
                  }}
                >
                  {models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personality Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--fg)'
                }}>
                  Personality
                </label>
                <select
                  value={settings.personality}
                  onChange={(e) => setSettings(prev => ({ ...prev, personality: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    fontSize: '0.9rem'
                  }}
                >
                  {personalities.map(personality => (
                    <option key={personality.id} value={personality.id}>
                      {personality.name} - {personality.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Temperature Slider */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--fg)'
                }}>
                  <span>Creativity (Temperature)</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {settings.temperature.toFixed(1)}
                  </span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--border)',
                    outline: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: 'var(--muted)',
                  marginTop: '0.25rem'
                }}>
                  <span>Focused</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max Tokens Slider */}
              <div style={{ marginBottom: '2rem' }}>
                <label style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: 'var(--fg)'
                }}>
                  <span>Response Length</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                    {settings.maxTokens} tokens
                  </span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="100"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: 'var(--border)',
                    outline: 'none',
                    WebkitAppearance: 'none'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.7rem',
                  color: 'var(--muted)',
                  marginTop: '0.25rem'
                }}>
                  <span>Short</span>
                  <span>Long</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={handleReset}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Reset to Default
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(135deg, var(--accent), #8b5cf6)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 15px rgba(var(--accent-rgb), 0.3)'
                  }}
                >
                  Save Settings
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}