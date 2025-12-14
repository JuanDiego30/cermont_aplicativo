/**
 * @file tecnicos-grid.tsx
 * @description Grid de técnicos con data fetching
 * 
 * ✨ Client Component - Maneja estado y queries
 */

'use client';

import { useTecnicos } from '../hooks/use-tecnicos';
import { useTecnicosFilters } from '../hooks/use-tecnicos-filters';
import { TecnicoCard, TecnicoCardSkeleton } from './tecnico-card';
import { TecnicosFilters } from './tecnicos-filters';
import { Shield } from 'lucide-react';
import type { TecnicoFilters, PaginatedTecnicos } from '../api/tecnicos.types';

interface TecnicosGridProps {
  initialData?: PaginatedTecnicos;
  initialFilters?: TecnicoFilters;
}

export function TecnicosGrid({ initialData, initialFilters }: TecnicosGridProps) {
  const {
    filters,
    setFilters,
    setPage,
    resetFilters,
    hasActiveFilters,
  } = useTecnicosFilters(initialFilters, { syncWithUrl: true });

  const { data, isLoading, error, isValidating: isFetching } = useTecnicos(filters, {
    initialData,
  });

  // Loading
  if (isLoading && !initialData) {
    return <TecnicosGridSkeleton />;
  }

  // Error
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 mb-4">
          <Shield className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Error al cargar técnicos
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          {error?.message || 'Ocurrió un error inesperado'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const tecnicos = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || 1;
  const total = data?.total || 0;

  return (
    <div className="space-y-5">
      {/* Filtros */}
      <TecnicosFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Indicador de loading durante refetch */}
      {isFetching && !isLoading && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Actualizando...
          </span>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && tecnicos.length === 0 && (
        <div className="text-center py-12">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron técnicos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Intenta con otros criterios de búsqueda
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* Grid de tarjetas */}
      {tecnicos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tecnicos.map((tecnico) => (
            <TecnicoCard key={tecnico.id} tecnico={tecnico} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando {tecnicos.length} de {total} técnicos
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            <span className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Skeleton para loading
export function TecnicosGridSkeleton() {
  return (
    <div className="space-y-5">
      {/* Filtros skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="h-11 bg-gray-200 dark:bg-gray-700 rounded-xl flex-1 max-w-md animate-pulse" />
        <div className="flex gap-3">
          <div className="h-11 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          <div className="h-11 w-11 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <TecnicoCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
