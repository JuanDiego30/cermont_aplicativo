/**
 * ARCHIVO: providers.tsx
 * FUNCION: Configuración centralizada de providers para la aplicación Next.js
 * IMPLEMENTACION: Envuelve children con SWRConfig, ThemeProvider y Toaster. Inicializa autenticación y Service Worker via hooks.
 * DEPENDENCIAS: react, swr, sonner, @/context/ThemeContext, @/stores/authStore, @/lib/api-client, @/lib/swr-config
 * EXPORTS: Providers (componente cliente)
 */
'use client';

import { useEffect, type ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api-client';
import { swrConfig } from '@/lib/swr-config';

// ============================================================================
// Auth Initialization Hook
// ============================================================================



// ============================================================================
// Service Worker Registration Hook
// ============================================================================

/**
 * Hook para registrar el Service Worker (PWA)
 */
function useServiceWorkerRegistration() {
  useEffect(() => {
    // Solo ejecutar en el cliente con soporte de Service Workers
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    // Skip en desarrollo para evitar problemas de cache
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    let subscribed = true;

    navigator.serviceWorker.getRegistration('/sw.js').then((registration) => {
      if (!subscribed) return;

      if (registration) {
        console.log('✅ Service Worker already registered');
        return;
      }

      navigator.serviceWorker
        .register('/sw.js')
        .then((newRegistration) => {
          console.log('✅ Service Worker registered:', newRegistration.scope);
        })
        .catch((error) => {
          console.warn('⚠️ Service Worker registration failed:', error);
        });
    });

    return () => {
      subscribed = false;
    };
  }, []);
}

// ============================================================================
// Providers Component
// ============================================================================

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  // Configurar cliente API y verificar sesión al inicio
  useEffect(() => {
    // 1. Configurar cliente
    apiClient.configure(
      () => useAuthStore.getState().token,
      (token) => useAuthStore.getState().setToken(token),
      () => useAuthStore.getState().logout()
    );

    // 2. Verificar sesión
    const initAuth = async () => {
      const { token, clearAuth } = useAuthStore.getState();

      if (token) {
        try {
          // Verificar si el token sigue siendo válido
          await apiClient.get('/auth/me');
        } catch (error: any) {
          // Solo limpiar si es error de autenticación (401)
          // Si es error de red (offline), mantenemos la sesión para permitir trabajo offline
          if (error?.statusCode === 401 || error?.status === 401) {
            clearAuth();
          } else {
            console.warn('⚠️ Error verificando sesión (posible offline):', error);
          }
        }
      }
    };

    initAuth();
  }, []);

  // Registrar Service Worker
  useServiceWorkerRegistration();

  return (
    <SWRConfig value={swrConfig}>
      <ThemeProvider>
        {children}

        {/* Toaster para notificaciones */}
        <Toaster
          position="top-right"
          richColors
          closeButton
          expand={false}
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: 'group',
              title: 'font-medium',
              description: 'text-sm opacity-80',
            },
          }}
        />
      </ThemeProvider>
    </SWRConfig>
  );
}
