/**
 * 📁 app/providers.tsx
 *
 * ✨ Client Providers - Configuración centralizada de providers
 *
 * Este componente envuelve la aplicación con todos los providers necesarios:
 * - TanStack Query para data fetching y caching
 * - ThemeProvider para dark mode
 * - Toaster para notificaciones
 * - Service Worker para PWA
 */

'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/lib/api-client';

// ============================================================================
// Query Client Configuration
// ============================================================================

/**
 * Configuración optimizada del QueryClient
 */
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Tiempo que los datos se consideran "frescos"
        staleTime: 60 * 1000, // 1 minuto

        // Tiempo que los datos se mantienen en cache después de no usarse
        gcTime: 5 * 60 * 1000, // 5 minutos (antes cacheTime)

        // No refetch al volver a la ventana
        refetchOnWindowFocus: false,

        // Reintentos inteligentes
        retry: (failureCount, error) => {
          // No reintentar errores de autenticación
          if (error instanceof Error) {
            if (error.message.includes('401') || error.message.includes('403')) {
              return false;
            }
          }
          return failureCount < 3;
        },

        // Retraso exponencial entre reintentos
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 1,
        // Callback global para errores de mutación
        onError: (error) => {
          console.error('Mutation error:', error);
        },
      },
    },
  });
}

// ============================================================================
// Auth Initialization Hook
// ============================================================================

/**
 * Hook para inicializar y validar la autenticación al cargar la app
 */
function useAuthInitialization() {
  useEffect(() => {
    const initAuth = async () => {
      const { token, clearAuth } = useAuthStore.getState();

      if (token) {
        try {
          // Verificar si el token sigue siendo válido
          await apiClient.get('/auth/me');
        } catch {
          // Token inválido - limpiar autenticación
          clearAuth();
        }
      }
    };

    initAuth();
  }, []);
}

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
  // Crear QueryClient una sola vez (singleton pattern)
  const [queryClient] = useState(() => createQueryClient());

  // Inicializar autenticación
  useAuthInitialization();

  // Registrar Service Worker
  useServiceWorkerRegistration();

  return (
    <QueryClientProvider client={queryClient}>
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

      {/* React Query Devtools - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      )}
    </QueryClientProvider>
  );
}
