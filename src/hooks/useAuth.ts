"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  parkId: string | null | undefined;
  phone: string | null | undefined;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say' | null | undefined;
  age: number;
  passportNationalId: string | null | undefined;
  nationality: string | null | undefined;
  isActive: boolean;
};

export function useAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check localStorage only on client side
    const token = localStorage.getItem('access-token');
    const profile = localStorage.getItem('user-profile');  
    setAccessToken(token);
    setUserProfile(profile ? JSON.parse(profile) : null);
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!accessToken && !!userProfile;

  const login = (token: string, profile: UserProfile) => {
    localStorage.setItem('access-token', token);
    localStorage.setItem('user-profile', JSON.stringify(profile));
    setAccessToken(token);
    setUserProfile(profile);
  };

  const logout = () => {
    localStorage.removeItem('access-token');
    localStorage.removeItem('user-profile');
    setAccessToken(null);
    setUserProfile(null);
    router.replace('/');
  };

  const requireAuth = (redirectUrl = '/auth/signin') => {
    if (!isAuthenticated && !isLoading) {
      router.push(redirectUrl);
      return false;
    }
    return true;
  };

  return {
    accessToken,
    userProfile,
    isAuthenticated,
    isLoading,
    login,
    logout,
    requireAuth,
  };
}