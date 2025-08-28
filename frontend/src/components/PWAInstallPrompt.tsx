'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/lib/pwa';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor, Share } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PWAInstallPromptProps {
  onClose?: () => void;
}

export default function PWAInstallPrompt({ onClose }: PWAInstallPromptProps) {
  const { t } = useLanguage();
  const {
    showInstallPrompt,
    getInstallationState,
    isInstallationSupported,
    getIOSInstallInstructions,
  } = usePWA();

  const [installState, setInstallState] = useState(getInstallationState());
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    const handleInstallabilityChange = (event: CustomEvent) => {
      setInstallState(event.detail);
    };

    // Check if we should show the prompt
    const shouldShow = isInstallationSupported() &&
                     !installState.isInstalled &&
                     !localStorage.getItem('pwa-install-dismissed');

    setIsVisible(shouldShow);

    window.addEventListener('pwa-installability-change', handleInstallabilityChange as EventListener);

    return () => {
      window.removeEventListener('pwa-installability-change', handleInstallabilityChange as EventListener);
    };
  }, [installState.isInstalled]);

  const handleInstall = async () => {
    if (installState.platform === 'ios') {
      setShowIOSInstructions(true);
      return;
    }

    setIsInstalling(true);
    try {
      const success = await showInstallPrompt();
      if (success) {
        setIsVisible(false);
      }
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible || installState.isInstalled) {
    return null;
  }

  const getPlatformIcon = () => {
    switch (installState.platform) {
      case 'ios':
      case 'android':
        return <Smartphone className="w-5 h-5" />;
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      default:
        return <Download className="w-5 h-5" />;
    }
  };

  const getPlatformText = () => {
    switch (installState.platform) {
      case 'ios':
        return 'Add Echo to your iPhone';
      case 'android':
        return 'Install Echo on your Android';
      case 'desktop':
        return 'Install Echo on your computer';
      default:
        return 'Install Echo app';
    }
  };

  if (showIOSInstructions) {
    return (
      <Card className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto border-primary shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Share className="w-5 h-5" />
              Install Echo
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowIOSInstructions(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <CardDescription>
            To install Echo on your iPhone:
          </CardDescription>

          <ol className="text-sm space-y-2 text-muted-foreground">
            {getIOSInstallInstructions().map((instruction, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                {instruction}
              </li>
            ))}
          </ol>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIOSInstructions(false)}
              className="flex-1"
            >
              Got it
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="flex-1"
            >
              Not now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto border-primary shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getPlatformIcon()}
            Install Echo
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CardDescription>
          {getPlatformText()} for faster access and offline functionality.
        </CardDescription>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            Offline access to content
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            Faster loading times
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            Desktop shortcut access
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleInstall}
            disabled={isInstalling}
            className="flex-1"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            {isInstalling ? 'Installing...' : 'Install'}
          </Button>
          <Button
            variant="outline"
            onClick={handleDismiss}
            size="sm"
            className="flex-1"
          >
            Not now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}