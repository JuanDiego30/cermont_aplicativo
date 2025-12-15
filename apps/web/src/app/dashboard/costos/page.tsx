/**
 * @file page.tsx
 * @description Página de costos - Server Component
 */

import { Suspense } from 'react';
import { DollarSign } from 'lucide-react';
import { CostoCardSkeleton } from '@/features/costos';
import { CostosDashboard } from './client';

export const metadata = {
  title: 'Análisis de Costos | Cermont',
  description: 'Presupuesto vs costo real',
};

export default async function CostosPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Análisis de Costos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Presupuesto vs costo real
          </p>
        </div>
      </div>

      {/* Dashboard interactivo */}
      <Suspense fallback={<CostosLoadingSkeleton />}>
        <CostosDashboard />
      </Suspense>
    </div>
  );
}

function CostosLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filtros skeleton */}
      <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      
      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-2xl animate-pulse" />
        ))}
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <CostoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
