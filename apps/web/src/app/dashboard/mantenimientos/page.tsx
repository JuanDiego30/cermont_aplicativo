/**
 * ARCHIVO: mantenimientos/page.tsx
 * FUNCION: Server Component para gestión de mantenimientos preventivos/correctivos
 * IMPLEMENTACION: Renderiza header, estadísticas y dashboard con Suspense
 * DEPENDENCIAS: React Suspense, lucide-react, @/features/mantenimientos, ./client
 * EXPORTS: metadata, MantenimientosPage (default)
 */
import { Suspense } from 'react';
import { Wrench } from 'lucide-react';
import { MantenimientoCardSkeleton } from '@/features/mantenimientos';
import { MantenimientosDashboard } from './client';

export const metadata = {
  title: 'Mantenimientos | Cermont',
  description: 'Gestión de mantenimientos preventivos y correctivos',
};

// TODO: Implementar fetch real
async function getMantenimientosStats() {
  return {
    programados: 12,
    enProgreso: 3,
    vencidos: 2,
    completadosMes: 28,
  };
}

export default async function MantenimientosPage() {
  const stats = await getMantenimientosStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-teal-500 to-teal-600 flex items-center justify-center">
          <Wrench className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mantenimientos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestión de mantenimientos preventivos y correctivos
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Programados</p>
          <p className="text-2xl font-bold text-blue-600">{stats.programados}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">En Progreso</p>
          <p className="text-2xl font-bold text-purple-600">{stats.enProgreso}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Vencidos</p>
          <p className="text-2xl font-bold text-red-600">{stats.vencidos}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
          <p className="text-sm text-gray-500">Completados (mes)</p>
          <p className="text-2xl font-bold text-green-600">{stats.completadosMes}</p>
        </div>
      </div>

      {/* Dashboard interactivo */}
      <Suspense fallback={<MantenimientosGridSkeleton />}>
        <MantenimientosDashboard />
      </Suspense>
    </div>
  );
}

function MantenimientosGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <MantenimientoCardSkeleton key={i} />
      ))}
    </div>
  );
}
