/**
 * @file page.tsx
 * @description Página de informes - Server Component
 */

import { Suspense } from 'react';
import { FileBarChart } from 'lucide-react';
import { InformeCardSkeleton } from '@/features/informes';
import { InformesDashboard } from './client';

export const metadata = {
  title: 'Informes | Cermont',
  description: 'Reportes y análisis',
};

export default async function InformesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
          <FileBarChart className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Informes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Reportes y análisis del sistema
          </p>
        </div>
      </div>

      {/* Dashboard interactivo */}
      <Suspense fallback={<InformesLoadingSkeleton />}>
        <InformesDashboard />
      </Suspense>
    </div>
  );
}

function InformesLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Plantillas skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        ))}
      </div>
      
      {/* Historial skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <InformeCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
