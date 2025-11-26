/**
 * Professional Input component with icons, validation, and animations.
 */
import { InputHTMLAttributes, forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      icon,
      rightIcon,
      showPasswordToggle,
      type = 'text',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const inputType = showPasswordToggle && showPassword ? 'text' : type;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {icon}
            </div>
          )}

          {/* Input Field */}
          <motion.input
            ref={ref}
            type={inputType}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`
              w-full px-4 py-3 rounded-lg border-2
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${icon ? 'pl-10' : ''}
              ${showPasswordToggle || rightIcon ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : success
                    ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                    : isFocused
                      ? 'border-blue-500 ring-2 ring-blue-500'
                      : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              }
              ${className}
            `}
            {...props}
          />

          {/* Right Icon / Password Toggle */}
          {(showPasswordToggle || rightIcon) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              ) : (
                <div className="text-gray-400">{rightIcon}</div>
              )}
            </div>
          )}

          {/* Validation Icons */}
          {!showPasswordToggle && !rightIcon && (error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle size={20} className="text-red-500" />
              ) : (
                <CheckCircle size={20} className="text-green-500" />
              )}
            </div>
          )}
        </div>

        {/* Error/Success Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle size={14} />
              {error}
            </motion.p>
          )}
          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <CheckCircle size={14} />
              {success}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
