/**
 * @file client.tsx
 * @description Componentes client para kits
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Filter, Search } from 'lucide-react';
import { useKits, KitCard, EstadoKit, ESTADO_KIT_CONFIG } from '@/features/kits';

export function KitsDashboard() {
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState<EstadoKit | ''>('');
  const [busqueda, setBusqueda] = useState('');
  
  const { data, isLoading } = useKits();

  const kits = data?.data || [];
  
  const kitsFiltrados = kits.filter((k) => {
    if (filtroEstado && k.estado !== filtroEstado) return false;
    if (busqueda) {
      const search = busqueda.toLowerCase();
      return (
        k.codigo.toLowerCase().includes(search) ||
        k.nombre.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="text-center py-12 text-gray-500">
        Cargando kits...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-4 w-full sm:w-auto">
          {/* Búsqueda */}
          <div className="relative flex-1 sm:flex-none sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar kit..."
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
              onChange={(e) => setFiltroEstado(e.target.value as EstadoKit | '')}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADO_KIT_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón nuevo kit */}
        <button
          onClick={() => router.push('/dashboard/kits/nuevo')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Kit
        </button>
      </div>

      {/* Grid de kits */}
      {kitsFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-lg text-gray-500 mb-2">Sin kits</p>
          <p className="text-sm text-gray-400">
            {filtroEstado || busqueda 
              ? 'No hay kits que coincidan con los filtros' 
              : 'Crea un nuevo kit para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitsFiltrados.map((kit) => (
            <KitCard
              key={kit.id}
              kit={kit}
              onView={() => router.push(`/dashboard/kits/${kit.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
