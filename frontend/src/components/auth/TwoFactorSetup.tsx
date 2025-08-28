/**
 * Two-factor authentication setup component with QR code.
 */
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import OTPInput from './OTPInput';
import { apiClient, APIError } from '@/lib/api-client';
import type { Setup2FAResponse } from '@/lib/auth-schemas';

interface TwoFactorSetupProps {
  onComplete?: (backupCodes: string[]) => void;
  onCancel?: () => void;
  className?: string;
}

type SetupStep = 'scan' | 'verify' | 'backup';

export default function TwoFactorSetup({ onComplete, onCancel, className = '' }: TwoFactorSetupProps) {
  const [step, setStep] = useState<SetupStep>('scan');
  const [setupData, setSetupData] = useState<Setup2FAResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize 2FA setup - get QR code.
   */
  const handleInitialize = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.setup2FA();
      setSetupData(data);
      setStep('scan');
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Failed to initialize 2FA';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify setup code.
   */
  const handleVerify = async (code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.verify2FASetup({ code });
      setBackupCodes(response.backup_codes);
      setStep('backup');
    } catch (err) {
      const message = err instanceof APIError ? err.message : 'Invalid verification code';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Complete setup.
   */
  const handleComplete = () => {
    onComplete?.(backupCodes);
  };

  /**
   * Download backup codes as text file.
   */
  const handleDownloadBackupCodes = () => {
    const text = `Echo Account - Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nIMPORTANT: Save these codes in a secure location. Each code can only be used once.\n\n${backupCodes.join('\n')}\n`;

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echo-2fa-backup-codes-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Initialize on mount
  if (!setupData && !loading && !error) {
    handleInitialize();
  }

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <AnimatePresence mode="wait">
        {/* Step 1: Scan QR Code */}
        {step === 'scan' && setupData && (
          <motion.div
            key="scan"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Scan QR Code
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Use an authenticator app like Google Authenticator or Authy to scan this QR code
              </p>
            </div>

            {/* QR Code */}
            <div className="flex justify-center p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="relative w-64 h-64">
                <Image
                  src={`data:image/png;base64,${setupData.qr_code}`}
                  alt="2FA QR Code"
                  fill
                  className="object-contain"
                />
              </div>
            </div>

            {/* Manual entry option */}
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                Can't scan? Enter manually
              </summary>
              <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Secret Key:</p>
                <code className="block p-2 bg-white dark:bg-gray-900 rounded font-mono text-xs break-all">
                  {setupData.secret}
                </code>
              </div>
            </details>

            {/* Next button */}
            <button
              onClick={() => setStep('verify')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Continue to Verification
            </button>
          </motion.div>
        )}

        {/* Step 2: Verify Code */}
        {step === 'verify' && (
          <motion.div
            key="verify"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Verify Setup
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>

            {/* OTP Input */}
            <OTPInput
              length={6}
              onComplete={handleVerify}
              error={error || undefined}
              loading={loading}
            />

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-600 dark:text-red-400 text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Back button */}
            <button
              onClick={() => setStep('scan')}
              disabled={loading}
              className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50"
            >
              ← Back to QR Code
            </button>
          </motion.div>
        )}

        {/* Step 3: Backup Codes */}
        {step === 'backup' && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-3xl mb-4">
                ✓
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                2FA Enabled Successfully!
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Save these backup codes in a secure location
              </p>
            </div>

            {/* Backup codes */}
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                {backupCodes.map((code, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-2 bg-white dark:bg-gray-900 rounded text-center"
                  >
                    {code}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Warning */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Important:</strong> Each backup code can only be used once. Store them securely.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDownloadBackupCodes}
                className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-medium rounded-lg transition-colors"
              >
                📥 Download Backup Codes
              </button>

              <button
                onClick={handleComplete}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                Complete Setup
              </button>
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        {loading && !setupData && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              Initializing 2FA setup...
            </p>
          </motion.div>
        )}

        {/* Error state */}
        {error && !setupData && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={handleInitialize}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel button (always visible) */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-6 w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
