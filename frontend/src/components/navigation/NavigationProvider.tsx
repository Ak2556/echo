'use client';

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from 'react';

interface NavigationContextType {
  currentRoute: string;
  navigate: (route: string) => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [currentRoute, setCurrentRoute] = useState('feed');

  const navigate = (route: string) => {
    setCurrentRoute(route);
  };

  // Listen for custom navigation events
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const route = event.detail;
      if (route) {
        navigate(route);
      }
    };

    window.addEventListener('navigate' as any, handleNavigate);
    return () => window.removeEventListener('navigate' as any, handleNavigate);
  }, []);

  const value: NavigationContextType = {
    currentRoute,
    navigate,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export default NavigationProvider;
