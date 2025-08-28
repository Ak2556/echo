'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',  // Home page is public for testing
    '/auth/login',
    '/auth/login-experience',
    '/auth/signup',
    '/auth/signup-experience',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
  ];

  useEffect(() => {
    const checkAuth = () => {
      // Check if current route is public
      const isPublicRoute = publicRoutes.some(route => pathname?.startsWith(route));

      if (isPublicRoute) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      // Check for authentication token
      const accessToken = localStorage.getItem('access_token');
      const user = localStorage.getItem('user');

      if (accessToken && user) {
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {
        // Redirect to login with return URL
        const returnUrl = encodeURIComponent(pathname || '/');
        router.push(`/auth/login-experience?returnUrl=${returnUrl}`);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900/20 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full"
          />
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading Echo...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
