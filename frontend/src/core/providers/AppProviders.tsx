'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useMemo } from 'react';
import { AuthProvider } from '@/features/auth';
import { env } from '@/core/config';
import { SidebarProvider } from './SidebarContext';
import { ThemeProvider } from './ThemeContext';
import { ServiceWorkerProvider } from '@/core/offline/ServiceWorkerProvider';
import '@/core/offline/sync-service';

// ============================================================================
// Query Client Configuration
// ============================================================================

const QUERY_CONFIG = {
  staleTime: 60 * 1000, // 1 minute
  retry: 1,
  refetchOnWindowFocus: false,
} as const;

const MUTATIONS_CONFIG = {
  retry: 0,
} as const;

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: QUERY_CONFIG,
      mutations: MUTATIONS_CONFIG,
    },
  });
}

// ============================================================================
// Component
// ============================================================================

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  const queryClient = useMemo(createQueryClient, []);
  const isDevelopment = env.IS_DEVELOPMENT;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
            <ServiceWorkerProvider>
              {children}
            </ServiceWorkerProvider>
            {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
