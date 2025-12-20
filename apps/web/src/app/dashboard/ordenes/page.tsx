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
  User,
  AlertCircle
} from "lucide-react";
import { useOrdenes } from "@/features/ordenes/hooks/use-ordenes";

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

  // Real Data Hook
  const { data: response, isLoading, error, mutate } = useOrdenes();
  const ordenes = React.useMemo(() => {
    // Manejar diferentes formatos de respuesta posibles
    if (Array.isArray(response)) return response;
    // @ts-ignore - Handle backend response structure
    if (response?.data && Array.isArray(response.data)) return response.data;
    return [];
  }, [response]);

  const filteredOrdenes = ordenes.filter((orden: any) => {
    // Adapter for potential backend field mismatches
    const numero = orden.numero || orden.id;
    const cliente = orden.cliente?.nombre || orden.cliente || "Sin cliente";
    const tecnico = orden.tecnico?.nombre || orden.tecnico || "Sin asignar";
    const estado = orden.estado || "planeacion";

    const matchesSearch =
      numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tecnico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = filterEstado === "todos" || estado === filterEstado;
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
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium justify-center"
        >
          <Plus className="w-5 h-5" />
          Nueva Orden
        </Link>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"></div>
          ))}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>Error al cargar órdenes. Por favor intente nuevamente.</span>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {/* Estadísticas rápidas - Dinámicas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total", value: ordenes.length, color: "text-blue-600" },
              { label: "En Ejecución", value: ordenes.filter((o: any) => o.estado === "ejecucion").length, color: "text-amber-600" },
              { label: "Completadas", value: ordenes.filter((o: any) => o.estado === "completada").length, color: "text-emerald-600" },
              { label: "Urgentes", value: ordenes.filter((o: any) => o.prioridad === "urgente").length, color: "text-red-600" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/3">
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Filtros y búsqueda */}
          <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/3">
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
              <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
                <div className="relative min-w-35">
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="planeacion">Planeación</option>
                    <option value="ejecucion">Ejecución</option>
                    <option value="completada">Completada</option>
                    <option value="pausada">Pausada</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <button
                  onClick={() => mutate()}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                  title="Recargar datos"
                >
                  <RefreshCw className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* View Switching Logic could go here (Table vs Cards) */}

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
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
                  {filteredOrdenes.map((orden: any) => (
                    <tr key={orden.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <Link href={`/dashboard/ordenes/${orden.id}`} className="font-semibold text-blue-600 hover:underline">
                            {orden.numero}
                          </Link>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{orden.tipo || 'General'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{orden.cliente || 'Sin cliente'}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" /> {orden.ubicacion || 'Sin ubicación'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">{orden.tecnico || 'Sin asignar'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${estadoConfig[orden.estado]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {estadoConfig[orden.estado]?.label || orden.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${prioridadConfig[orden.prioridad]?.color || 'bg-gray-100 text-gray-700'}`}>
                          {prioridadConfig[orden.prioridad]?.label || orden.prioridad}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {orden.fecha ? new Date(orden.fecha).toLocaleDateString('es-CO') : '-'}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrdenes.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No se encontraron órdenes
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (Visible on small screens) */}
            <div className="md:hidden flex flex-col divide-y divide-gray-200 dark:divide-gray-800">
              {filteredOrdenes.map((orden: any) => (
                <div key={orden.id} className="p-4 space-y-3 bg-white dark:bg-transparent">
                  <div className="flex justify-between items-start">
                    <div>
                      <Link href={`/dashboard/ordenes/${orden.id}`} className="font-semibold text-blue-600">
                        {orden.numero}
                      </Link>
                      <p className="text-sm text-gray-900 font-medium">{orden.cliente || 'Sin cliente'}</p>
                    </div>
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${estadoConfig[orden.estado]?.color || 'bg-gray-100 text-gray-700'}`}>
                      {estadoConfig[orden.estado]?.label || orden.estado}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {orden.ubicacion || 'Sin ubicación'}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      <Calendar className="w-3 h-3" /> {orden.fecha ? new Date(orden.fecha).toLocaleDateString() : '-'}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{orden.tecnico || 'Sin asignar'}</span>
                    </div>
                    <Link
                      href={`/dashboard/ordenes/${orden.id}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Ver detalles
                      <Eye className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
              {filteredOrdenes.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No se encontraron órdenes
                </div>
              )}
            </div>

          </div>
        </>
      )}
    </div>
  );
}
