'use client';

import React, { useState, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Upload,
  Search,
} from 'lucide-react';

/**
 * Advanced Form Components
 * Beautiful, validated form inputs with premium styling
 */

// Input with validation
export function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  success,
  placeholder,
  required = false,
  disabled = false,
  icon,
  helper,
  maxLength,
}: {
  label?: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  success?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  helper?: string;
  maxLength?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: error ? '#ef4444' : success ? '#10b981' : 'var(--fg)',
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        {icon && (
          <div
            style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--muted)',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </div>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className="input-enhanced transition-smooth"
          style={{
            paddingLeft: icon ? '3rem' : '1rem',
            paddingRight: error || success ? '3rem' : '1rem',
            borderColor: error
              ? '#ef4444'
              : success
                ? '#10b981'
                : focused
                  ? 'var(--accent)'
                  : 'rgba(255, 255, 255, 0.05)',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />

        {/* Status Icon */}
        {(error || success) && (
          <div
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: error ? '#ef4444' : '#10b981',
            }}
          >
            {error ? <X size={20} /> : <Check size={20} />}
          </div>
        )}
      </div>

      {/* Helper/Error Text */}
      {(helper || error || success || maxLength) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
            fontSize: '0.75rem',
          }}
        >
          <span
            style={{
              color: error ? '#ef4444' : success ? '#10b981' : 'var(--muted)',
            }}
          >
            {error || success || helper}
          </span>
          {maxLength && (
            <span style={{ color: 'var(--muted)' }}>
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Password Input with visibility toggle
export function PasswordField(props: Parameters<typeof InputField>[0]) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <InputField {...props} type={showPassword ? 'text' : 'password'} />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: 'absolute',
          right: '1rem',
          top: props.label ? 'calc(50% + 0.625rem)' : '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--muted)',
          padding: '0.25rem',
        }}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
}

// Textarea with character count
export function TextareaField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  required = false,
  maxLength,
  rows = 4,
}: {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  rows?: number;
}) {
  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: error ? '#ef4444' : 'var(--fg)',
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className="input-enhanced transition-smooth custom-scrollbar"
        style={{
          width: '100%',
          resize: 'vertical',
          minHeight: `${rows * 1.5}rem`,
          borderColor: error ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '0.5rem',
          fontSize: '0.75rem',
        }}
      >
        <span style={{ color: error ? '#ef4444' : 'var(--muted)' }}>
          {error}
        </span>
        {maxLength && (
          <span style={{ color: 'var(--muted)' }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

// Select Dropdown
export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = 'Select an option',
}: {
  label?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: '1.5rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: error ? '#ef4444' : 'var(--fg)',
          }}
        >
          {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>
      )}

      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-enhanced transition-smooth"
        style={{
          width: '100%',
          cursor: 'pointer',
          borderColor: error ? '#ef4444' : 'rgba(255, 255, 255, 0.05)',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <div
          style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444' }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// Checkbox
export function Checkbox({
  label,
  checked,
  onChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        marginBottom: '1rem',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        style={{ display: 'none' }}
      />
      <div
        className="transition-smooth"
        style={{
          width: '20px',
          height: '20px',
          borderRadius: 'var(--radius-sm)',
          border: `2px solid ${checked ? 'var(--accent)' : 'var(--border)'}`,
          background: checked ? 'var(--accent)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {checked && <Check size={14} color="white" />}
      </div>
      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
    </label>
  );
}

// Radio Group
export function RadioGroup({
  label,
  name,
  options,
  value,
  onChange,
  error,
}: {
  label?: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {label && (
        <div
          style={{
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {options.map((option) => (
          <label
            key={option.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
            }}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              style={{ display: 'none' }}
            />
            <div
              className="transition-smooth"
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: `2px solid ${value === option.value ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {value === option.value && (
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    background: 'var(--accent)',
                  }}
                />
              )}
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
              {option.label}
            </span>
          </label>
        ))}
      </div>

      {error && (
        <div
          style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#ef4444' }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// File Upload
export function FileUpload({
  label,
  accept,
  multiple = false,
  onUpload,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: {
  label?: string;
  accept?: string;
  multiple?: boolean;
  onUpload: (files: File[]) => void;
  maxSize?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    setError('');
    const fileArray = Array.from(files);

    // Validate file size
    const oversized = fileArray.filter((f) => f.size > maxSize);
    if (oversized.length > 0) {
      setError(
        `File size must be less than ${(maxSize / (1024 * 1024)).toFixed(0)}MB`
      );
      return;
    }

    onUpload(fileArray);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {label && (
        <div
          style={{
            marginBottom: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          {label}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
        style={{ display: 'none' }}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className="transition-smooth hover-lift"
        style={{
          border: `2px dashed ${dragOver ? 'var(--accent)' : error ? '#ef4444' : 'var(--border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver
            ? 'rgba(var(--accent-rgb), 0.05)'
            : 'var(--bg-secondary)',
        }}
      >
        <Upload size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
        <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>
          {dragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
        </p>
        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted)' }}>
          {accept || 'Any file type'} • Max{' '}
          {(maxSize / (1024 * 1024)).toFixed(0)}MB
        </p>
      </div>

      {error && (
        <div
          style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}
        >
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </div>
  );
}

// Search Input
export function SearchInput({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  loading = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
  loading?: boolean;
}) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search
        size={20}
        style={{
          position: 'absolute',
          left: '1rem',
          top: '50%',
          transform: 'translateY(-50%)',
          color: 'var(--muted)',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch?.()}
        placeholder={placeholder}
        className="input-enhanced transition-smooth"
        style={{
          paddingLeft: '3rem',
          paddingRight: loading ? '3rem' : '1rem',
        }}
      />
      {loading && (
        <div
          className="animate-spin"
          style={{
            position: 'absolute',
            right: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '20px',
            border: '2px solid rgba(var(--accent-rgb), 0.2)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
          }}
        />
      )}
    </div>
  );
}

export default {
  InputField,
  PasswordField,
  TextareaField,
  SelectField,
  Checkbox,
  RadioGroup,
  FileUpload,
  SearchInput,
};
