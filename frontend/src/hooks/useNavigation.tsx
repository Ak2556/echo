'use client';

import { useEffect, useState, useCallback } from 'react';

export const useNavigation = () => {
  const [currentRoute, setCurrentRoute] = useState('home');

  const navigate = useCallback((route: string, push = true) => {
    try {
      const targetRoute = route || 'home';
      const validSections = ['home', 'feed', 'discover', 'live', 'messages', 'profile', 'settings', 'miniapps'];
      const target = validSections.includes(targetRoute) ? targetRoute : 'home';

      // Debug logging (matching original)

      setCurrentRoute(target);

      // Scroll to top respecting reduced motion preference
      if (typeof window !== 'undefined') {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

        // Push history state
        if (push) {
          history.pushState({ route: target }, '', `#/${target}`);
        }
      }
    } catch (error) {

    }
  }, [currentRoute]);

  useEffect(() => {
    // Handle popstate events (browser back/forward)
    const handlePopState = (e: PopStateEvent) => {
      const route = e.state?.route || (location.hash.startsWith('#/') ? location.hash.slice(2) : 'home');
      navigate(route, false);
    };

    // Handle hash changes (deep-linking)
    const handleHashChange = () => {
      const route = location.hash.startsWith('#/') ? location.hash.slice(2) : 'home';
      navigate(route, false);
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handleHashChange);

    // Parse initial route and navigate
    let initialRoute = 'home';
    if (location.hash.startsWith('#/')) {
      initialRoute = location.hash.slice(2);
    } else if (location.pathname && location.pathname !== '/') {
      // Handle direct paths like /settings
      initialRoute = location.pathname.slice(1);
    }
    requestAnimationFrame(() => {
      navigate(initialRoute, false);
    });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [navigate]);

  return { currentRoute, navigate };
};