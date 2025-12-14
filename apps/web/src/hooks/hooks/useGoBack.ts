/**
 * ARCHIVO: useGoBack.ts
 * FUNCION: Hook para navegación hacia atrás con fallback a home
 * IMPLEMENTACION: Usa router.back() si hay historial, sino redirige a "/"
 * DEPENDENCIAS: next/navigation (useRouter)
 * EXPORTS: useGoBack (default)
 */
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
export function useGoBack() {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }, [router]);
  return goBack;
}
export default useGoBack;
