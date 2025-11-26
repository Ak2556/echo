'use client';

import React, { useState, useEffect } from 'react';

export interface ModalField {
  id: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'date'
    | 'time'
    | 'checkbox'
    | 'radio'
    | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: (value: any) => string | null;
  defaultValue?: any;
}

export interface ModalAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  onClick: (data: Record<string, any>) => void | Promise<void>;
}

export interface UniversalModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  description?: string;
  fields?: ModalField[];
  actions?: ModalAction[];
  children?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showHeader?: boolean;
  showFooter?: boolean;
  isDarkMode?: boolean;
}

export default function UniversalModal({
  isVisible,
  onClose,
  title,
  icon,
  description,
  fields = [],
  actions = [],
  children,
  size = 'md',
  showHeader = true,
  showFooter = true,
  isDarkMode = true,
}: UniversalModalProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isVisible && fields.length > 0) {
      const initialData: Record<string, any> = {};
      fields.forEach((field) => {
        initialData[field.id] = field.defaultValue || '';
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [isVisible, fields]);

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.id];

      if (
        field.required &&
        (!value || (typeof value === 'string' && !value.trim()))
      ) {
        newErrors[field.id] = `${field.label} is required`;
      }

      if (field.validation && value) {
        const validationError = field.validation(value);
        if (validationError) {
          newErrors[field.id] = validationError;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleActionClick = async (action: ModalAction) => {
    if (fields.length > 0 && !validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await action.onClick(formData);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: ModalField) => {
    const value = formData[field.id] || '';
    const error = errors[field.id];

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className={`modal-textarea ${error ? 'error' : ''}`}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className={`modal-select ${error ? 'error' : ''}`}
          >
            <option value="">
              {field.placeholder || `Select ${field.label}`}
            </option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="modal-checkbox">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
            />
            <span className="checkmark"></span>
            {field.placeholder}
          </label>
        );

      case 'radio':
        return (
          <div className="modal-radio-group">
            {field.options?.map((option) => (
              <label key={option.value} className="modal-radio">
                <input
                  type="radio"
                  name={field.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                />
                <span className="radio-mark"></span>
                {option.label}
              </label>
            ))}
          </div>
        );

      case 'file':
        return (
          <input
            type="file"
            onChange={(e) =>
              handleInputChange(field.id, e.target.files?.[0] || null)
            }
            className={`modal-file ${error ? 'error' : ''}`}
          />
        );

      default:
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={`modal-input ${error ? 'error' : ''}`}
          />
        );
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm':
        return 'modal-sm';
      case 'lg':
        return 'modal-lg';
      case 'xl':
        return 'modal-xl';
      default:
        return 'modal-md';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`modal-overlay ${isDarkMode ? 'dark' : 'light'}`}
      onClick={onClose}
    >
      <div
        className={`modal-container ${getSizeClass()}`}
        onClick={(e) => e.stopPropagation()}
      >
        {showHeader && (
          <div className="modal-header">
            <div className="modal-title">
              {icon && <span className="modal-icon">{icon}</span>}
              <h2>{title}</h2>
            </div>
            <button className="modal-close" onClick={onClose}>
              ×
            </button>
          </div>
        )}

        <div className="modal-body">
          {description && <p className="modal-description">{description}</p>}

          {fields.length > 0 && (
            <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
              {fields.map((field) => (
                <div key={field.id} className="modal-field">
                  <label className="modal-label">
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {renderField(field)}
                  {errors[field.id] && (
                    <span className="modal-error">{errors[field.id]}</span>
                  )}
                </div>
              ))}
            </form>
          )}

          {children}
        </div>

        {showFooter && actions.length > 0 && (
          <div className="modal-footer">
            {actions.map((action, index) => (
              <button
                key={index}
                className={`modal-btn modal-btn-${action.type}`}
                onClick={() => handleActionClick(action)}
                disabled={isLoading}
              >
                {isLoading ? '...' : action.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 1rem;
        }

        .modal-container {
          background: var(--nothing-surface);
          border-radius: 20px;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
          border: 1px solid var(--nothing-border);
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: modalSlideUp 0.3s ease-out;
        }

        .modal-sm {
          max-width: 400px;
        }
        .modal-md {
          max-width: 600px;
        }
        .modal-lg {
          max-width: 800px;
        }
        .modal-xl {
          max-width: 1200px;
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid var(--nothing-border);
          background: var(--nothing-elevated);
        }

        .modal-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-icon {
          font-size: 1.5rem;
        }

        .modal-title h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--nothing-text);
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--nothing-text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: var(--nothing-hover);
          color: var(--nothing-text);
        }

        .modal-body {
          padding: 2rem;
          overflow-y: auto;
          flex: 1;
        }

        .modal-description {
          margin: 0 0 1.5rem 0;
          color: var(--nothing-text-secondary);
          line-height: 1.6;
        }

        .modal-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .modal-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .modal-label {
          font-weight: 500;
          color: var(--nothing-text);
          font-size: 0.9rem;
        }

        .required {
          color: var(--nothing-error);
          margin-left: 2px;
        }

        .modal-input,
        .modal-textarea,
        .modal-select,
        .modal-file {
          padding: 0.75rem 1rem;
          border: 2px solid var(--nothing-border);
          border-radius: 12px;
          background: var(--nothing-surface);
          color: var(--nothing-text);
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .modal-input:focus,
        .modal-textarea:focus,
        .modal-select:focus {
          outline: none;
          border-color: var(--nothing-accent);
          box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        }

        .modal-input.error,
        .modal-textarea.error,
        .modal-select.error {
          border-color: var(--nothing-error);
        }

        .modal-checkbox,
        .modal-radio {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.5rem 0;
        }

        .modal-checkbox input[type='checkbox'],
        .modal-radio input[type='radio'] {
          display: none;
        }

        .checkmark,
        .radio-mark {
          width: 20px;
          height: 20px;
          border: 2px solid var(--nothing-border);
          border-radius: 4px;
          position: relative;
          transition: all 0.2s ease;
        }

        .radio-mark {
          border-radius: 50%;
        }

        .modal-checkbox input:checked + .checkmark {
          background: var(--nothing-accent);
          border-color: var(--nothing-accent);
        }

        .modal-checkbox input:checked + .checkmark::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
        }

        .modal-radio input:checked + .radio-mark {
          border-color: var(--nothing-accent);
        }

        .modal-radio input:checked + .radio-mark::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--nothing-accent);
        }

        .modal-radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .modal-error {
          color: var(--nothing-error);
          font-size: 0.85rem;
          margin-top: 0.25rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid var(--nothing-border);
          background: var(--nothing-elevated);
        }

        .modal-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
          min-width: 100px;
        }

        .modal-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .modal-btn-primary {
          background: var(--nothing-accent);
          color: white;
        }

        .modal-btn-primary:hover:not(:disabled) {
          background: var(--nothing-accent-hover);
          transform: translateY(-1px);
        }

        .modal-btn-secondary {
          background: var(--nothing-surface);
          color: var(--nothing-text);
          border: 2px solid var(--nothing-border);
        }

        .modal-btn-secondary:hover:not(:disabled) {
          background: var(--nothing-hover);
        }

        .modal-btn-danger {
          background: var(--nothing-error);
          color: white;
        }

        .modal-btn-danger:hover:not(:disabled) {
          background: var(--nothing-error-hover);
        }

        /* Dark mode */
        .modal-overlay.dark {
          --nothing-surface: #1a1a1a;
          --nothing-elevated: #262626;
          --nothing-border: #404040;
          --nothing-text: #ffffff;
          --nothing-text-secondary: #a0a0a0;
          --nothing-accent: #ffffff;
          --nothing-accent-hover: #e0e0e0;
          --nothing-error: #ff4444;
          --nothing-error-hover: #cc3333;
          --nothing-hover: #333333;
        }

        /* Light mode */
        .modal-overlay.light {
          --nothing-surface: #ffffff;
          --nothing-elevated: #f8f8f8;
          --nothing-border: #e0e0e0;
          --nothing-text: #000000;
          --nothing-text-secondary: #666666;
          --nothing-accent: #000000;
          --nothing-accent-hover: #333333;
          --nothing-error: #dc3545;
          --nothing-error-hover: #c82333;
          --nothing-hover: #f0f0f0;
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 1rem;
          }

          .modal-container {
            margin: 0;
            max-height: 95vh;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding: 1rem 1.5rem;
          }

          .modal-footer {
            flex-direction: column;
          }

          .modal-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
