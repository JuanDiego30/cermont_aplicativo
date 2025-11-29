/**
 * useGoBack Hook
 * Hook de navegación para volver a la página anterior
 */

'use client';

import { useRouter } from 'next/navigation';

export function useGoBack() {
  const router = useRouter();

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return goBack;
}
