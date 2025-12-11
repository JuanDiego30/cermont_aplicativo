// 📁 web/src/features/auth/hooks/use-auth.ts
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = '/login', redirectIfFound = false } = options;
  const router = useRouter();
  const { user, token, isAuthenticated, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking auth - in real app this could verify token with server
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // If redirectIfFound is true, redirect when user is found
    if (redirectIfFound && isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If user is not authenticated and we should redirect
    if (!redirectIfFound && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, redirectTo, redirectIfFound, router]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    logout,
  };
}

export default useAuth;
