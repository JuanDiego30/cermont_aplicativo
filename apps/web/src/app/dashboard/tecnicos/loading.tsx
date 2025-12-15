/**
 * ARCHIVO: tecnicos/loading.tsx
 * FUNCION: Estado de carga para la pagina de tecnicos
 * IMPLEMENTACION: Skeletons para header, stats y grid
 * DEPENDENCIAS: TecnicosStatsSkeleton, TecnicosGridSkeleton
 * EXPORTS: TecnicosLoading (default)
 */
import { TecnicosStatsSkeleton, TecnicosGridSkeleton } from '@/features/tecnicos';

export default function TecnicosLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
      </div>

      {/* Stats */}
      <TecnicosStatsSkeleton />

      {/* Grid */}
      <TecnicosGridSkeleton />
    </div>
  );
}
