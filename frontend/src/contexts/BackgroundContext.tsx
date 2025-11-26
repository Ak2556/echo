'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

export type BackgroundMode = 'minimal' | 'enhanced' | 'off';

interface BackgroundContextType {
  mode: BackgroundMode;
  setMode: (mode: BackgroundMode) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(
  undefined
);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<BackgroundMode>('minimal');
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    const savedMode = localStorage.getItem('backgroundMode') as BackgroundMode;
    if (savedMode && ['minimal', 'enhanced', 'off'].includes(savedMode)) {
      setMode(savedMode);
    }
    setIsInitialized(true);
  }, []);

  // Save to localStorage whenever mode changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('backgroundMode', mode);
    }
  }, [mode, isInitialized]);

  return (
    <BackgroundContext.Provider value={{ mode, setMode }}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}
