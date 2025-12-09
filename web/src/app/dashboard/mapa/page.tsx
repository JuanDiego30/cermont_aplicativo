'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  FilterIcon,
  RefreshCwIcon,
  MapPinIcon,
  UsersIcon,
  TruckIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  NavigationIcon,
  LayersIcon,
  MaximizeIcon,
  LocateIcon,
} from 'lucide-react';

// Importar Leaflet dinámicamente para evitar SSR
const MapaGPS = dynamic(
  () => import('@/components/maps/MapaGPS'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 dark:text-gray-400">Cargando mapa...</p>
        </div>
      </div>
    )
  }
);

// ============================================
// PÁGINA DEL MAPA GPS
// ============================================

// Datos mock de técnicos
const mockTecnicos = [
  {
    id: '1',
    nombre: 'Carlos Rodríguez',
    estado: 'en_ruta',
    ubicacion: { lat: 7.8891, lng: -72.4967 },
    ordenActual: 'ORD-2025-001',
    velocidad: 45,
  },
  {
    id: '2',
    nombre: 'María González',
    estado: 'en_servicio',
    ubicacion: { lat: 7.9123, lng: -72.5034 },
    ordenActual: 'ORD-2025-003',
    velocidad: 0,
  },
  {
    id: '3',
    nombre: 'Juan Pérez',
    estado: 'disponible',
    ubicacion: { lat: 7.8756, lng: -72.4823 },
    ordenActual: null,
    velocidad: 0,
  },
];

// Datos mock de órdenes
const mockOrdenes = [
  {
    id: '1',
    numero: 'ORD-2025-001',
    cliente: 'Empresa ABC',
    direccion: 'Calle 10 #15-20',
    estado: 'en_progreso',
    ubicacion: { lat: 7.8950, lng: -72.5100 },
    tecnicoAsignado: 'Carlos Rodríguez',
  },
  {
    id: '2',
    numero: 'ORD-2025-002',
    cliente: 'Comercial XYZ',
    direccion: 'Av. Principal #45-67',
    estado: 'pendiente',
    ubicacion: { lat: 7.9034, lng: -72.4890 },
    tecnicoAsignado: null,
  },
  {
    id: '3',
    numero: 'ORD-2025-003',
    cliente: 'Industrias 123',
    direccion: 'Zona Industrial Lote 5',
    estado: 'en_progreso',
    ubicacion: { lat: 7.9123, lng: -72.5034 },
    tecnicoAsignado: 'María González',
  },
  {
    id: '4',
    numero: 'ORD-2025-004',
    cliente: 'Retail Store',
    direccion: 'Centro Comercial Local 12',
    estado: 'completada',
    ubicacion: { lat: 7.8820, lng: -72.4756 },
    tecnicoAsignado: 'Juan Pérez',
  },
];

export default function MapaPage() {
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [mostrarTecnicos, setMostrarTecnicos] = useState(true);
  const [mostrarOrdenes, setMostrarOrdenes] = useState(true);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<string | null>(null);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState<string | null>(null);

  // Filtrar órdenes por estado
  const ordenesFiltradas = mockOrdenes.filter(o =>
    filtroEstado === 'todos' || o.estado === filtroEstado
  );

  // Stats
  const stats = {
    tecnicosActivos: mockTecnicos.filter(t => t.estado !== 'disponible').length,
    ordenesEnProgreso: mockOrdenes.filter(o => o.estado === 'en_progreso').length,
    ordenesPendientes: mockOrdenes.filter(o => o.estado === 'pendiente').length,
    ordenesCompletadas: mockOrdenes.filter(o => o.estado === 'completada').length,
  };

  // Convertir datos para el componente MapaGPS
  const markers = [
    // Marcadores de técnicos
    ...(mostrarTecnicos ? mockTecnicos.map(t => ({
      id: `tec-${t.id}`,
      position: { lat: t.ubicacion.lat, lng: t.ubicacion.lng },
      type: 'tecnico' as const,
      title: t.nombre,
      subtitle: t.ordenActual ? `Orden: ${t.ordenActual}` : 'Disponible',
      status: t.estado,
    })) : []),
    // Marcadores de órdenes
    ...(mostrarOrdenes ? ordenesFiltradas.map(o => ({
      id: `ord-${o.id}`,
      position: { lat: o.ubicacion.lat, lng: o.ubicacion.lng },
      type: 'orden' as const,
      title: o.numero,
      subtitle: `${o.cliente} - ${o.direccion}`,
      status: o.estado,
    })) : []),
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Mapa GPS
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Monitoreo en tiempo real de técnicos y órdenes de servicio
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <UsersIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Técnicos Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tecnicosActivos}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <TruckIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">En Progreso</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ordenesEnProgreso}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pendientes</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ordenesPendientes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completadas Hoy</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ordenesCompletadas}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Filtros y Lista */}
        <div className="lg:col-span-1 space-y-4">
          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FilterIcon className="w-4 h-4" />
              Filtros
            </h3>

            {/* Toggle capas */}
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarTecnicos}
                  onChange={(e) => setMostrarTecnicos(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <UsersIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Técnicos</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={mostrarOrdenes}
                  onChange={(e) => setMostrarOrdenes(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <MapPinIcon className="w-4 h-4 text-red-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Órdenes</span>
              </label>
            </div>

            {/* Estado de órdenes */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Estado de Órdenes</p>
              {['todos', 'pendiente', 'en_progreso', 'completada'].map((estado) => (
                <button
                  key={estado}
                  onClick={() => setFiltroEstado(estado)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filtroEstado === estado
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {estado === 'todos' && 'Todas'}
                  {estado === 'pendiente' && '🟡 Pendientes'}
                  {estado === 'en_progreso' && '🟠 En Progreso'}
                  {estado === 'completada' && '🟢 Completadas'}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de Técnicos */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Técnicos ({mockTecnicos.length})
            </h3>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {mockTecnicos.map((tecnico) => (
                <button
                  key={tecnico.id}
                  onClick={() => setTecnicoSeleccionado(tecnico.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${tecnicoSeleccionado === tecnico.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${tecnico.estado === 'en_ruta' ? 'bg-blue-500' :
                        tecnico.estado === 'en_servicio' ? 'bg-green-500' :
                          'bg-gray-400'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                        {tecnico.nombre}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {tecnico.estado === 'en_ruta' && `En ruta - ${tecnico.velocidad} km/h`}
                        {tecnico.estado === 'en_servicio' && `En servicio: ${tecnico.ordenActual}`}
                        {tecnico.estado === 'disponible' && 'Disponible'}
                      </p>
                    </div>
                    {tecnico.estado === 'en_ruta' && (
                      <NavigationIcon className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Toolbar del mapa */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <LayersIcon className="w-4 h-4" />
                <span>{markers.length} puntos en el mapa</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Mi ubicación"
                >
                  <LocateIcon className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Pantalla completa"
                >
                  <MaximizeIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Contenedor del mapa */}
            <div className="h-[600px]">
              <MapaGPS
                markers={markers}
                center={{ lat: 7.8941, lng: -72.5078 }}
                zoom={13}
                showClustering={true}
                showRoutes={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
