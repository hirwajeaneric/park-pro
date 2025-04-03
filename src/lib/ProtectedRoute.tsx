"use client";

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, requireAuth } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      requireAuth();
    }
  }, [isAuthenticated, isLoading, requireAuth]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}