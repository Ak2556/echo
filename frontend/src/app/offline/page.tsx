'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import Button from '@/components/ui/Button';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflinePage() {
  const { } = useLanguage(); // Remove unused 't' variable
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (navigator.onLine) {
      window.location.href = '/';
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          {isOnline ? (
            <Wifi className="w-16 h-16 mx-auto text-green-500" />
          ) : (
            <WifiOff className="w-16 h-16 mx-auto text-red-500" />
          )}

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              📱 Echo
            </h1>
            <h2 className="text-xl font-semibold text-foreground">
              {isOnline ? 'Connection Restored' : 'You\'re Offline'}
            </h2>
          </div>
        </div>

        <div className="space-y-4 text-muted-foreground">
          {isOnline ? (
            <p>
              Your internet connection has been restored. You can now return to Echo.
            </p>
          ) : (
            <>
              <p>
                It looks like you&apos;re not connected to the internet. Some features may not be available.
              </p>
              <p>
                Check your connection and try again.
              </p>
            </>
          )}
        </div>

        <div className="space-y-3">
          <Button onClick={handleRetry} className="w-full" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            {isOnline ? 'Return to Echo' : 'Retry'}
          </Button>

          {!isOnline && (
            <div className="text-sm text-muted-foreground">
              <p>While offline, you can still:</p>
              <ul className="mt-2 space-y-1 text-left max-w-xs mx-auto">
                <li>• View previously loaded content</li>
                <li>• Use cached mini-apps</li>
                <li>• Access stored data</li>
              </ul>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Echo works best with an internet connection, but some features are available offline.
          </p>
        </div>
      </div>
    </div>
  );
}