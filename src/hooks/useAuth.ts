/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getProfileData } from '@/lib/api';
import { User } from '@/types';
import { toast } from 'sonner';

interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: (redirect: string) => void;
  requireAuth: (options?: { redirectUrl?: string }) => boolean;
}

const roleToAuthRoute: Record<User['role'], string> = {
  VISITOR: '/auth/signin',
  ADMIN: '/auth/admin',
  FINANCE_OFFICER: '/auth/finance',
  PARK_MANAGER: '/auth/manager',
  GOVERNMENT_OFFICER: '/auth/government',
  AUDITOR: '/auth/auditor',
};

const protectedRoutePrefixes: Record<string, User['role']> = {
  '/admin': 'ADMIN',
  '/finance': 'FINANCE_OFFICER',
  '/manager': 'PARK_MANAGER',
  '/government': 'GOVERNMENT_OFFICER',
  '/auditor': 'AUDITOR',
};

export function useAuth(): AuthState {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedProfile = localStorage.getItem('user-profile');
        if (storedProfile) {
          setUser(JSON.parse(storedProfile));
        }

        try {
          const profile = await getProfileData();
          localStorage.setItem('user-profile', JSON.stringify(profile));
          setUser(profile);
          setAccessToken('verified');
        } catch {
          localStorage.removeItem('user-profile');
          localStorage.removeItem('access-token');
          setUser(null);
          setAccessToken(null);
          toast.error('Session expired. Please log in again.');
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]); // Added router to deps for completeness

  // Check access on route changes
  useEffect(() => {
    if (isLoading || !pathname || isLoggingOut) return;

    if (pathname.startsWith('/auth')) return;

    const prefix = Object.keys(protectedRoutePrefixes).find((p) =>
      pathname.startsWith(p)
    );

    if (prefix) {
      if (!user) {
        console.log('Unauthenticated, redirecting to:', roleToAuthRoute.VISITOR);
        router.push(
          `${roleToAuthRoute.VISITOR}?redirect=${encodeURIComponent(pathname)}`
        );
      } else if (user.role !== protectedRoutePrefixes[prefix]) {
        console.log('Unauthorized, redirecting to:', roleToAuthRoute[user.role]);
        router.push(
          `${roleToAuthRoute[user.role]}?redirect=${encodeURIComponent(pathname)}`
        );
      }
    }
  }, [pathname, user, isLoading, isLoggingOut, router]);

  const login = useCallback(
    async (token: string) => {
      try {
        localStorage.setItem('access-token', token);
        setAccessToken(token);
        const profile = await getProfileData();
        localStorage.setItem('user-profile', JSON.stringify(profile));
        setUser(profile);
        toast.success('Logged in successfully');
      } catch (error) {
        toast.error('Failed to fetch user profile');
        localStorage.removeItem('access-token');
        localStorage.removeItem('user-profile');
        setAccessToken(null);
        setUser(null);
      }
    },
    []
  );

  const logout = useCallback((redirect: string) => {
    try {
      // const redirectTo = `/auth/${redirect}`;
      // router.push(redirectTo);
      toast.success('Logged out successfully!!!');
      setIsLoggingOut(true);
      localStorage.removeItem('access-token');
      localStorage.removeItem('user-profile');
      setAccessToken(null);
      setUser(null);
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  }, [router, user]);

  let redirecting = false;
  const requireAuth = useCallback(({ redirectUrl = roleToAuthRoute.VISITOR } = {}) => {
      if (redirecting || isLoading || isLoggingOut) return false;

      if (!user || !accessToken) {
        console.log('requireAuth redirecting to:', redirectUrl);
        redirecting = true;
        router.push(
          `${redirectUrl}?redirect=${encodeURIComponent(pathname || '/')}`
        );
        return false;
      }

      const prefix = Object.keys(protectedRoutePrefixes).find((p) =>
        pathname?.startsWith(p)
      );

      if (prefix && user.role !== protectedRoutePrefixes[prefix]) {
        console.log('requireAuth role mismatch, redirecting to:', roleToAuthRoute[user.role]);
        router.push(
          `${roleToAuthRoute[user.role]}?redirect=${encodeURIComponent(
            pathname || '/'
          )}`
        );
        return false;
      }

      return true;
    },
    [accessToken, user, isLoading, isLoggingOut, router, pathname]
  );

  return {
    accessToken,
    user,
    isAuthenticated: !!accessToken && !!user,
    isLoading,
    login,
    logout,
    requireAuth,
  };
}