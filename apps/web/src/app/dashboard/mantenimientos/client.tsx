/**
 * ARCHIVO: mantenimientos/client.tsx
 * FUNCION: Dashboard interactivo para mantenimientos con filtros múltiples
 * IMPLEMENTACION: Filtrado por estado/tipo/búsqueda, grid de MantenimientoCards
 * DEPENDENCIAS: React hooks, next/navigation, lucide-react, @/features/mantenimientos
 * EXPORTS: MantenimientosDashboard
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Search, Calendar } from 'lucide-react';
import {
  useMantenimientos,
  MantenimientoCard,
  EstadoMantenimiento,
  TipoMantenimiento,
  ESTADO_MANTENIMIENTO_CONFIG,
  TIPO_MANTENIMIENTO_CONFIG,
} from '@/features/mantenimientos';

export function MantenimientosDashboard() {
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState<EstadoMantenimiento | ''>('');
  const [filtroTipo, setFiltroTipo] = useState<TipoMantenimiento | ''>('');
  const [busqueda, setBusqueda] = useState('');

  const { data: mantenimientos = [], isLoading } = useMantenimientos();

  const mantenimientosFiltrados = mantenimientos.filter((m) => {
    if (filtroEstado && m.estado !== filtroEstado) return false;
    if (filtroTipo && m.tipo !== filtroTipo) return false;
    if (busqueda) {
      const search = busqueda.toLowerCase();
      return (
        m.observaciones?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Cargando mantenimientos...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 w-full sm:w-auto">
          {/* Búsqueda */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar equipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />
          </div>

          {/* Filtro por estado */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoMantenimiento | '')}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADO_MANTENIMIENTO_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoMantenimiento | '')}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TIPO_MANTENIMIENTO_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón nuevo mantenimiento */}
        <button
          onClick={() => router.push('/dashboard/mantenimientos/nuevo')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 text-white font-medium hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Programar Mantenimiento
        </button>
      </div>

      {/* Grid de mantenimientos */}
      {mantenimientosFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-lg text-gray-500 mb-2">Sin mantenimientos</p>
          <p className="text-sm text-gray-400">
            {filtroEstado || filtroTipo || busqueda
              ? 'No hay mantenimientos que coincidan con los filtros'
              : 'Programa un nuevo mantenimiento para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mantenimientosFiltrados.map((mantenimiento) => (
            <MantenimientoCard
              key={mantenimiento.id}
              mantenimiento={mantenimiento}
              onView={() => router.push(`/dashboard/mantenimientos/${mantenimiento.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
