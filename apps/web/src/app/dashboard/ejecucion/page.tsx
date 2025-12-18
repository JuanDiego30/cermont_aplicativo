/**
 * @file page.tsx
 * @description Página de ejecución - Server Component
 */

import { Suspense } from 'react';
import { PlayCircle } from 'lucide-react';
import { EjecucionCardSkeleton } from '@/features/ejecucion';
import { EjecucionDashboard } from './client';

export const metadata = {
  title: 'Ejecución | Cermont',
  description: 'Seguimiento de trabajos en campo',
};

// TODO: Implementar fetch real
async function getEjecucionStats() {
  return {
    enProgreso: 5,
    pausadas: 2,
    finalizadasHoy: 8,
  };
}

export default async function EjecucionPage() {
  const stats = await getEjecucionStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          <PlayCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Ejecución
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Seguimiento de trabajos en campo en tiempo real
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">En Progreso</p>
          <p className="text-2xl font-bold text-blue-600">{stats.enProgreso}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Pausadas</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pausadas}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Finalizadas Hoy</p>
          <p className="text-2xl font-bold text-green-600">{stats.finalizadasHoy}</p>
        </div>
      </div>

      {/* Dashboard interactivo */}
      <Suspense fallback={<EjecucionGridSkeleton />}>
        <EjecucionDashboard />
      </Suspense>
    </div>
  );
}

function EjecucionGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <EjecucionCardSkeleton key={i} />
      ))}
    </div>
  );
}
