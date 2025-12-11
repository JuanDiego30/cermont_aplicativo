'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '../context/ThemeContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    let subscribed = true;

    navigator.serviceWorker.getRegistration('/sw.js').then((registration) => {
      if (!subscribed) {
        return;
      }

      if (registration) {
        console.log('SW already registered: ', registration);
        return;
      }

      navigator.serviceWorker
        .register('/sw.js')
        .then((newRegistration) => {
          console.log('SW registered: ', newRegistration);
        })
        .catch((error) => {
          console.log('SW registration failed: ', error);
        });
    });

    return () => {
      subscribed = false;
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
