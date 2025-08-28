'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/lib/pwa';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X, Download } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function PWAUpdateNotification() {
  const { t } = useLanguage();
  const { updateServiceWorker, skipWaiting } = usePWA();
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const handleUpdateAvailable = () => {
      setShowUpdate(true);
    };

    window.addEventListener('pwa-update-available', handleUpdateAvailable);

    return () => {
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
    };
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      skipWaiting();
      // The page will reload automatically due to controllerchange event
    } catch (error) {

      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <Card className="fixed top-4 left-4 right-4 z-50 max-w-sm mx-auto border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-900/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <Download className="w-5 h-5" />
            Update Available
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-blue-700 dark:text-blue-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription className="text-blue-600 dark:text-blue-400">
          A new version of Echo is available with improvements and bug fixes.
        </CardDescription>

        <div className="space-y-2 text-sm text-blue-600 dark:text-blue-400">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            Performance improvements
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            Bug fixes and stability
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            New features and enhancements
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
            {isUpdating ? 'Updating...' : 'Update Now'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            size="sm"
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-900"
          >
            Later
          </Button>
        </div>

        {isUpdating && (
          <div className="text-xs text-blue-600 dark:text-blue-400 text-center">
            The app will restart automatically...
          </div>
        )}
      </CardContent>
    </Card>
  );
}