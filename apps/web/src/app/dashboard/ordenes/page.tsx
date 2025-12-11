"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  User
} from "lucide-react";

// Mock data para órdenes
const mockOrdenes = [
  { id: "1", numero: "ORD-2024-001", cliente: "Ecopetrol S.A.", ubicacion: "Barrancabermeja", tecnico: "Juan Pérez", estado: "completada", fecha: "2024-12-08", prioridad: "alta", tipo: "Mantenimiento preventivo" },
  { id: "2", numero: "ORD-2024-002", cliente: "Cementos Argos", ubicacion: "Cartagena", tecnico: "Carlos López", estado: "ejecucion", fecha: "2024-12-07", prioridad: "media", tipo: "Inspección técnica" },
  { id: "3", numero: "ORD-2024-003", cliente: "Drummond Ltd", ubicacion: "La Loma, Cesar", tecnico: "María García", estado: "planeacion", fecha: "2024-12-06", prioridad: "urgente", tipo: "Reparación correctiva" },
  { id: "4", numero: "ORD-2024-004", cliente: "Cerrejón", ubicacion: "La Guajira", tecnico: "Pedro Martínez", estado: "ejecucion", fecha: "2024-12-05", prioridad: "baja", tipo: "Instalación de equipos" },
  { id: "5", numero: "ORD-2024-005", cliente: "Pacific Rubiales", ubicacion: "Meta", tecnico: "Ana Rodríguez", estado: "pausada", fecha: "2024-12-04", prioridad: "alta", tipo: "Mantenimiento preventivo" },
  { id: "6", numero: "ORD-2024-006", cliente: "Occidental Petroleum", ubicacion: "Arauca", tecnico: "Luis Hernández", estado: "planeacion", fecha: "2024-12-03", prioridad: "media", tipo: "Auditoría de seguridad" },
];

const estadoConfig: Record<string, { label: string; color: string }> = {
  completada: { label: "Completada", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" },
  ejecucion: { label: "En Ejecución", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  planeacion: { label: "Planeación", color: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" },
  pausada: { label: "Pausada", color: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400" },
};

const prioridadConfig: Record<string, { label: string; color: string }> = {
  urgente: { label: "Urgente", color: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" },
  alta: { label: "Alta", color: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400" },
  media: { label: "Media", color: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400" },
  baja: { label: "Baja", color: "bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400" },
};

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("todos");

  const filteredOrdenes = mockOrdenes.filter((orden) => {
    const matchesSearch = 
      orden.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.tecnico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === "todos" || orden.estado === filterEstado;
    return matchesSearch && matchesEstado;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Órdenes de Trabajo
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestión completa de órdenes de servicio
          </p>
        </div>
        <Link
          href="/dashboard/ordenes/nueva"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Nueva Orden
        </Link>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total", value: mockOrdenes.length, color: "text-blue-600" },
          { label: "En Ejecución", value: mockOrdenes.filter(o => o.estado === "ejecucion").length, color: "text-amber-600" },
          { label: "Completadas", value: mockOrdenes.filter(o => o.estado === "completada").length, color: "text-emerald-600" },
          { label: "Urgentes", value: mockOrdenes.filter(o => o.prioridad === "urgente").length, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros y búsqueda */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 dark:border-gray-800">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, cliente o técnico..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="todos">Todos los estados</option>
                <option value="planeacion">Planeación</option>
                <option value="ejecucion">Ejecución</option>
                <option value="completada">Completada</option>
                <option value="pausada">Pausada</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
              <Filter className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
              <Download className="w-5 h-5 text-gray-500" />
            </button>
            <button className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
              <RefreshCw className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabla de órdenes */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orden</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente / Ubicación</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Técnico</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {filteredOrdenes.map((orden) => (
                <tr key={orden.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <Link href={`/dashboard/ordenes/${orden.id}`} className="font-semibold text-blue-600 hover:underline">
                        {orden.numero}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{orden.tipo}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{orden.cliente}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {orden.ubicacion}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{orden.tecnico}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${estadoConfig[orden.estado]?.color}`}>
                      {estadoConfig[orden.estado]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${prioridadConfig[orden.prioridad]?.color}`}>
                      {prioridadConfig[orden.prioridad]?.label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      {new Date(orden.fecha).toLocaleDateString('es-CO')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/ordenes/${orden.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" title="Editar">
                        <Edit className="w-4 h-4 text-gray-500" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" title="Eliminar">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Mostrando <span className="font-medium">{filteredOrdenes.length}</span> de <span className="font-medium">{mockOrdenes.length}</span> órdenes
          </p>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors disabled:opacity-50" disabled>
              Anterior
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors">
              1
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
              2
            </button>
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
