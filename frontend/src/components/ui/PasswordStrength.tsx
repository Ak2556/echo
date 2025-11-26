/**
 * Professional password strength indicator with visual feedback.
 */
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  met: boolean;
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const requirements: Requirement[] = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'One uppercase letter',
      met: /[A-Z]/.test(password),
    },
    {
      label: 'One lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'One number',
      met: /[0-9]/.test(password),
    },
  ];

  const metCount = requirements.filter((r) => r.met).length;
  const strength =
    metCount === 0
      ? 0
      : metCount <= 1
        ? 25
        : metCount === 2
          ? 50
          : metCount === 3
            ? 75
            : 100;

  const strengthColor =
    strength === 0
      ? 'bg-gray-300'
      : strength <= 25
        ? 'bg-red-500'
        : strength <= 50
          ? 'bg-orange-500'
          : strength <= 75
            ? 'bg-yellow-500'
            : 'bg-green-500';

  const strengthLabel =
    strength === 0
      ? ''
      : strength <= 25
        ? 'Weak'
        : strength <= 50
          ? 'Fair'
          : strength <= 75
            ? 'Good'
            : 'Strong';

  if (!password) return null;

  return (
    <div className="space-y-3 mt-2">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Password Strength
          </span>
          {strengthLabel && (
            <span
              className={`text-xs font-semibold ${
                strength <= 25
                  ? 'text-red-600 dark:text-red-400'
                  : strength <= 50
                    ? 'text-orange-600 dark:text-orange-400'
                    : strength <= 75
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-green-600 dark:text-green-400'
              }`}
            >
              {strengthLabel}
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`h-full ${strengthColor} transition-colors duration-300`}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1.5">
        {requirements.map((req, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2 text-xs"
          >
            <div
              className={`flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                req.met
                  ? 'bg-green-500 text-white scale-100'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 scale-90'
              }`}
            >
              {req.met ? (
                <Check size={10} strokeWidth={3} />
              ) : (
                <X size={10} strokeWidth={2} />
              )}
            </div>
            <span
              className={`transition-colors duration-200 ${
                req.met
                  ? 'text-gray-700 dark:text-gray-300'
                  : 'text-gray-500 dark:text-gray-500'
              }`}
            >
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
