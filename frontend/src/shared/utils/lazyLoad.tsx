'use client';

import dynamic from 'next/dynamic';
import { ComponentType, ReactNode } from 'react';
import { Skeleton } from '@/components/common/Skeleton';

/**
 * Lazy Loading Utilities
 * 
 * Provides utilities for code splitting and lazy loading heavy components.
 * Uses Next.js dynamic imports with loading fallbacks.
 */

interface LazyLoadOptions {
  /** Custom loading component */
  loading?: ReactNode;
  /** Whether to skip SSR */
  ssr?: boolean;
}

/**
 * Creates a lazy-loaded component with a loading fallback
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  options: LazyLoadOptions = {}
) {
  const { loading, ssr = false } = options;
  
  return dynamic(importFn, {
    loading: () => (loading as React.ReactNode) || <ComponentLoadingFallback />,
    ssr,
  });
}

/**
 * Default loading fallback for lazy components
 */
function ComponentLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Cargando...</p>
      </div>
    </div>
  );
}

/**
 * Chart loading fallback
 */
export function ChartLoadingFallback() {
  return (
    <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="w-full h-48" />
      </div>
    </div>
  );
}

/**
 * Modal loading fallback
 */
export function ModalLoadingFallback() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent mx-auto" />
      </div>
    </div>
  );
}

// ============================================================================
// Pre-configured Lazy Components
// ============================================================================

/**
 * Lazy-loaded Chart component (heavy dependency)
 */
export const LazyApexChart = dynamic(
  () => import('react-apexcharts'),
  {
    loading: () => <ChartLoadingFallback />,
    ssr: false,
  }
);

/**
 * Lazy-loaded Calendar component
 */
export const LazyCalendar = dynamic(
  () => import('@/components/calendar/Calendar').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="h-96 flex items-center justify-center">
        <Skeleton className="w-full h-full rounded-xl" />
      </div>
    ),
    ssr: false,
  }
);

/**
 * Lazy-loaded Map component (if exists)
 */
export const LazyWeatherMap = dynamic(
  () => import('@/features/weather/components/WeatherMap').then(mod => ({ default: mod.WeatherMap })),
  {
    loading: () => (
      <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-xl">
        <div className="text-gray-500">Cargando mapa...</div>
      </div>
    ),
    ssr: false,
  }
);

export default {
  createLazyComponent,
  LazyApexChart,
  LazyCalendar,
  LazyWeatherMap,
};
