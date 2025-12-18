/**
 * @file page.tsx
 * @description Página de kits - Server Component
 */

import { Suspense } from 'react';
import { Briefcase } from 'lucide-react';
import { KitCardSkeleton } from '@/features/kits';
import { KitsDashboard } from './client';

export const metadata = {
  title: 'Kits | Cermont',
  description: 'Gestión de kits de herramientas',
};

// TODO: Implementar fetch real
async function getKitsStats() {
  return {
    total: 24,
    disponibles: 18,
    enUso: 4,
    mantenimiento: 2,
  };
}

export default async function KitsPage() {
  const stats = await getKitsStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-amber-500 to-amber-600 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Kits de Herramientas
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control y seguimiento de equipos de trabajo
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Disponibles</p>
          <p className="text-2xl font-bold text-green-600">{stats.disponibles}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">En Uso</p>
          <p className="text-2xl font-bold text-blue-600">{stats.enUso}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Mantenimiento</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.mantenimiento}</p>
        </div>
      </div>

      {/* Dashboard interactivo */}
      <Suspense fallback={<KitsGridSkeleton />}>
        <KitsDashboard />
      </Suspense>
    </div>
  );
}

function KitsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <KitCardSkeleton key={i} />
      ))}
    </div>
  );
}
