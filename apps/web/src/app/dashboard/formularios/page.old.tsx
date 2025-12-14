'use client';

import React, { useState } from 'react';
import { 
  PlusIcon, 
  FileTextIcon, 
  SearchIcon,
  EditIcon,
  CopyIcon,
  TrashIcon,
  EyeIcon,
  BarChart3Icon,
  CheckCircleIcon,
  ClockIcon,
  LayoutGridIcon,
  ListIcon,
} from 'lucide-react';
import { FormBuilder } from '@/components/forms/FormBuilder';

// ============================================
// PÁGINA DE GESTIÓN DE FORMULARIOS
// ============================================

// Datos mock
const mockTemplates = [
  {
    id: '1',
    nombre: 'Inspección de Equipos',
    descripcion: 'Formulario estándar para inspección de equipos en campo',
    version: 2,
    activo: true,
    totalRespuestas: 156,
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2025-01-10'),
    camposCount: 12,
  },
  {
    id: '2',
    nombre: 'Checklist de Seguridad',
    descripcion: 'Verificación de condiciones de seguridad antes de iniciar trabajo',
    version: 1,
    activo: true,
    totalRespuestas: 89,
    createdAt: new Date('2024-08-20'),
    updatedAt: new Date('2024-12-05'),
    camposCount: 8,
  },
  {
    id: '3',
    nombre: 'Reporte de Incidentes',
    descripcion: 'Documentación de incidentes y accidentes en obra',
    version: 3,
    activo: true,
    totalRespuestas: 23,
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2025-01-08'),
    camposCount: 15,
  },
  {
    id: '4',
    nombre: 'Evaluación de Proveedor',
    descripcion: 'Formulario para evaluar desempeño de proveedores',
    version: 1,
    activo: false,
    totalRespuestas: 45,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-11-20'),
    camposCount: 10,
  },
];

export default function FormulariosPage() {
  const [vista, setVista] = useState<'lista' | 'grid'>('grid');
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState<boolean | null>(null);
  const [mostrarBuilder, setMostrarBuilder] = useState(false);

  // Filtrar templates
  const templatesFiltrados = mockTemplates.filter(t => {
    const matchBusqueda = t.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.descripcion?.toLowerCase().includes(busqueda.toLowerCase());
    const matchActivo = filtroActivo === null || t.activo === filtroActivo;
    return matchBusqueda && matchActivo;
  });

  // Stats
  const stats = {
    total: mockTemplates.length,
    activos: mockTemplates.filter(t => t.activo).length,
    respuestasTotal: mockTemplates.reduce((acc, t) => acc + t.totalRespuestas, 0),
  };

  if (mostrarBuilder) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <button
            onClick={() => setMostrarBuilder(false)}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            ← Volver a la lista
          </button>
        </div>
        <FormBuilder
          onSave={async (schema) => {
            console.log('Schema guardado:', schema);
            setMostrarBuilder(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Formularios Dinámicos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Crea y gestiona formularios personalizados para inspecciones y reportes
          </p>
        </div>
        
        <button
          onClick={() => setMostrarBuilder(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Nuevo Formulario
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Formularios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Activos</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activos}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <BarChart3Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Respuestas Totales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.respuestasTotal}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          {/* Búsqueda */}
          <div className="relative flex-1 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar formularios..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Filtro estado */}
            <select
              value={filtroActivo === null ? 'todos' : filtroActivo ? 'activos' : 'inactivos'}
              onChange={(e) => {
                if (e.target.value === 'todos') setFiltroActivo(null);
                else if (e.target.value === 'activos') setFiltroActivo(true);
                else setFiltroActivo(false);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            >
              <option value="todos">Todos</option>
              <option value="activos">Activos</option>
              <option value="inactivos">Inactivos</option>
            </select>

            {/* Toggle vista */}
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setVista('grid')}
                className={`p-2 rounded-md transition-colors ${
                  vista === 'grid' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGridIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVista('lista')}
                className={`p-2 rounded-md transition-colors ${
                  vista === 'lista' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Templates */}
      {vista === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templatesFiltrados.map((template) => (
            <div
              key={template.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    template.activo 
                      ? 'bg-blue-100 dark:bg-blue-900/30' 
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}>
                    <FileTextIcon className={`w-5 h-5 ${
                      template.activo 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.activo
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                  }`}>
                    {template.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <span className="text-xs text-gray-400">v{template.version}</span>
              </div>

              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {template.nombre}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                {template.descripcion}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                <span className="flex items-center gap-1">
                  <ClockIcon className="w-3 h-3" />
                  {template.camposCount} campos
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3Icon className="w-3 h-3" />
                  {template.totalRespuestas} respuestas
                </span>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                <button
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Ver"
                >
                  <EyeIcon className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => {
                    setMostrarBuilder(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Editar"
                >
                  <EditIcon className="w-4 h-4" />
                  Editar
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Duplicar"
                >
                  <CopyIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Estado</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Campos</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Respuestas</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Versión</th>
                <th className="text-right px-4 py-3 text-sm font-medium text-gray-500 dark:text-gray-400">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {templatesFiltrados.map((template) => (
                <tr key={template.id} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{template.nombre}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{template.descripcion}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      template.activo
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {template.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{template.camposCount}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{template.totalRespuestas}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">v{template.version}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <CopyIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {templatesFiltrados.length === 0 && (
        <div className="text-center py-12">
          <FileTextIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No se encontraron formularios
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {busqueda ? 'Intenta con otros términos de búsqueda' : 'Crea tu primer formulario para empezar'}
          </p>
          <button
            onClick={() => setMostrarBuilder(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            Crear Formulario
          </button>
        </div>
      )}
    </div>
  );
}
