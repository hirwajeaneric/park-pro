'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import SkeletonCardThree from '@/components/widget/SkeletonCardThree';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, requireAuth } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      requireAuth();
    }
  }, [isLoading, requireAuth]);

  if (isLoading || !isAuthenticated) {
    return <SkeletonCardThree />;
  }

  return <>{children}</>;
}