'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import SkeletonCardThree from '@/components/widget/SkeletonCardThree';

const routeToRedirect: Record<string, string> = {
  '/admin': '/auth/admin',
  '/finance': '/auth/finance',
  '/manager': '/auth/manager',
  '/government': '/auth/government',
  '/auditor': '/auth/auditor',
};

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, requireAuth } = useAuth();
  const pathname = usePathname();

  useEffect(() => {    
    if (!isLoading) {
      const prefix = Object.keys(routeToRedirect).find((p) =>
        pathname?.startsWith(p)
      );
      const redirectUrl = prefix ? routeToRedirect[prefix] : '/auth/signin';
      requireAuth({ redirectUrl });
    }
  }, [isLoading, requireAuth, pathname]);

  if (isLoading || !isAuthenticated) {
    return <SkeletonCardThree />;
  }

  return <>{children}</>;
}