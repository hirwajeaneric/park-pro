/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProfileData } from '@/lib/api';
import { UserProfile } from '@/types';
import { toast } from 'sonner';

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access-token');
        const profile = localStorage.getItem('user-profile');

        if (token && profile) {
          setAccessToken(token);
          setUserProfile(JSON.parse(profile));

          // Verify token validity
          try {
            // await getProfileData(token);
            await getProfileData();
          } catch (error) {
            // Token invalid, clear auth
            localStorage.removeItem('access-token');
            localStorage.removeItem('user-profile');
            setAccessToken(null);
            setUserProfile(null);
            toast.error('Session expired. Please log in again.');
            router.push('/auth/signin');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  const login = useCallback(async (token: string) => {
    try {
      localStorage.setItem('access-token', token);
      setAccessToken(token);
      const profile = await getProfileData();
      localStorage.setItem('user-profile', JSON.stringify(profile));
      setUserProfile(profile);
    } catch (error) {
      toast.error('Failed to fetch user profile');
      localStorage.removeItem('access-token');
      setAccessToken(null);
    }
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('access-token');
      localStorage.removeItem('user-profile');
      setAccessToken(null);
      setUserProfile(null);
      router.replace('/auth/signin');
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  }, [router]);

  const requireAuth = useCallback(
    (redirectUrl = '/auth/signin') => {
      if (!isLoading && !accessToken) {
        router.push(`${redirectUrl}?redirect=${encodeURIComponent(window.location.pathname)}`);
        return false;
      }
      return true;
    },
    [accessToken, isLoading, router]
  );

  return {
    accessToken,
    userProfile,
    isAuthenticated: !!accessToken && !!userProfile,
    isLoading,
    login,
    logout,
    requireAuth,
  };
}