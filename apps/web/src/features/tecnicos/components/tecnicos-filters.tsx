/**
 * @file tecnicos-filters.tsx
 * @description Componente de filtros de técnicos
 * 
 * ✨ Client Component - Necesita interactividad
 */

'use client';

import { Search, Filter, X } from 'lucide-react';
import type { TecnicoFilters } from '../api/tecnicos.types';

interface TecnicosFiltersProps {
  filters: TecnicoFilters;
  onFiltersChange: (filters: Partial<TecnicoFilters>) => void;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export function TecnicosFilters({
  filters,
  onFiltersChange,
  onReset,
  hasActiveFilters,
}: TecnicosFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, especialidad o ubicación..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        {filters.search && (
          <button
            onClick={() => onFiltersChange({ search: '' })}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Disponibilidad filter */}
      <div className="flex items-center gap-3">
        <select
          value={filters.disponible || 'todos'}
          onChange={(e) =>
            onFiltersChange({
              disponible: e.target.value as TecnicoFilters['disponible'],
            })
          }
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="todos">Todos</option>
          <option value="disponible">Disponibles</option>
          <option value="ocupado">En servicio</option>
        </select>

        {/* More filters button */}
        <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
          <Filter className="w-5 h-5 text-gray-500" />
        </button>

        {/* Reset filters */}
        {hasActiveFilters && onReset && (
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
