'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

/**
 * Hook para requerir autenticación en componentes.
 * Redirige automáticamente al login si no está autenticado.
 */
export function useRequireAuth(redirectUrl = '/login') {
  const router = useRouter();
  const { isAuthenticated, token, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.replace(redirectUrl);
    }
  }, [isAuthenticated, token, router, redirectUrl]);

  return { 
    isAuthenticated, 
    token, 
    user,
    isReady: isAuthenticated && !!token 
  };
}

export default useRequireAuth;
