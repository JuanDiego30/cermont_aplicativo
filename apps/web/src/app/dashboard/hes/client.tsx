/**
 * @file client.tsx
 * @description Componentes client para HES
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Plus, 
  Shield, 
  Cable, 
  HardHat, 
  FileCheck,
  Filter,
  Search,
} from 'lucide-react';
import { 
  useEquiposHES,
  EquipoHESCard,
  TipoInspeccion,
  TIPO_INSPECCION_CONFIG,
  ESTADO_EQUIPO_CONFIG,
  EstadoEquipo,
  EquipoHESCardSkeleton,
} from '@/features/hes';

// Módulos HES
const MODULOS_HES = [
  {
    titulo: 'Inspecciones de Equipos',
    descripcion: 'Arneses, cascos, líneas de vida',
    icono: Shield,
    href: '/dashboard/hes',
    color: 'bg-blue-500',
    activo: true
  },
  {
    titulo: 'Líneas de Vida',
    descripcion: 'OPE-006 - Inspección de sistemas de anclaje',
    icono: Cable,
    href: '/dashboard/hes/lineas-vida',
    color: 'bg-amber-500',
    activo: true
  },
  {
    titulo: 'Certificaciones',
    descripcion: 'Gestión de certificados y vencimientos',
    icono: FileCheck,
    href: '/dashboard/hes/certificaciones',
    color: 'bg-green-500',
    activo: false
  },
  {
    titulo: 'EPP',
    descripcion: 'Equipos de protección personal',
    icono: HardHat,
    href: '/dashboard/hes/epp',
    color: 'bg-purple-500',
    activo: false
  }
];

export function HESDashboard() {
  const router = useRouter();
  const [showNuevaInspeccion, setShowNuevaInspeccion] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState<TipoInspeccion | ''>('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoEquipo | ''>('');
  const [busqueda, setBusqueda] = useState('');

  const { data: equiposData, isLoading } = useEquiposHES({
    tipo: filtroTipo || undefined,
    estado: filtroEstado || undefined,
  });

  const equipos = equiposData?.data || [];
  
  const equiposFiltrados = equipos.filter((e) => {
    if (busqueda) {
      const search = busqueda.toLowerCase();
      return (
        e.codigo.toLowerCase().includes(search) ||
        e.marca.toLowerCase().includes(search)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Módulos HES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MODULOS_HES.map((modulo) => (
          <Link
            key={modulo.titulo}
            href={modulo.activo ? modulo.href : '#'}
            className={`block p-4 rounded-lg border transition-all ${
              modulo.activo 
                ? 'bg-white dark:bg-gray-800 hover:shadow-lg hover:border-blue-300 cursor-pointer' 
                : 'bg-gray-100 dark:bg-gray-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${modulo.color} text-white`}>
                <modulo.icono className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {modulo.titulo}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {modulo.descripcion}
                </p>
                {!modulo.activo && (
                  <span className="inline-block mt-2 text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded">
                    Próximamente
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4">
          {/* Búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar equipo..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-64"
            />
          </div>

          {/* Filtro por tipo */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value as TipoInspeccion | '')}
              className="pl-10 pr-8 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
            >
              <option value="">Todos los tipos</option>
              {Object.entries(TIPO_INSPECCION_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Filtro por estado */}
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as EstadoEquipo | '')}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm appearance-none cursor-pointer"
          >
            <option value="">Todos los estados</option>
            {Object.entries(ESTADO_EQUIPO_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowNuevaInspeccion(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nueva Inspección
        </button>
      </div>

      {/* Grid de equipos */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <EquipoHESCardSkeleton key={i} />
          ))}
        </div>
      ) : equiposFiltrados.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-500 mb-2">Sin equipos registrados</p>
          <p className="text-sm text-gray-400">
            {filtroTipo || filtroEstado || busqueda
              ? 'No hay equipos que coincidan con los filtros'
              : 'Registra un nuevo equipo para comenzar'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {equiposFiltrados.map((equipo) => (
            <EquipoHESCard
              key={equipo.id}
              equipo={equipo}
              onView={() => router.push(`/dashboard/hes/equipos/${equipo.id}`)}
              onInspeccionar={() => setShowNuevaInspeccion(true)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
