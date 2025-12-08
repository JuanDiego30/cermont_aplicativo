'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  ArrowLeft,
  Plus,
  Cable,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter
} from 'lucide-react';

interface InspeccionLineaVida {
  id: string;
  numeroLinea: string;
  fabricante: string;
  ubicacion: string;
  estado: 'CONFORME' | 'NO_CONFORME' | 'PENDIENTE';
  fechaInspeccion: string;
  inspector?: { name: string };
}

const estadoConfig = {
  CONFORME: { label: 'Conforme', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  NO_CONFORME: { label: 'No Conforme', color: 'bg-red-100 text-red-700', icon: XCircle },
  PENDIENTE: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
};

export default function LineasVidaPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['lineas-vida', filterEstado],
    queryFn: async () => {
      const params = filterEstado ? `?estado=${filterEstado}` : '';
      const res = await apiClient.get<{ status: string; inspecciones: InspeccionLineaVida[] }>(`/hes/lineas-vida${params}`);
      return res.inspecciones || [];
    },
  });

  const filteredData = (data || []).filter((item: InspeccionLineaVida) =>
    item.numeroLinea.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ubicacion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-center text-red-500">
        Error al cargar las inspecciones de líneas de vida
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/hes"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Inspección de Líneas de Vida
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            OPE-006 - Sistemas de anclaje y líneas de vida
          </p>
        </div>
        <Link
          href="/dashboard/hes/lineas-vida/nueva"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          Nueva Inspección
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por número o ubicación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="">Todos los estados</option>
          <option value="CONFORME">Conforme</option>
          <option value="NO_CONFORME">No Conforme</option>
          <option value="PENDIENTE">Pendiente</option>
        </select>
      </div>

      {/* Results */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <Cable className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No hay inspecciones registradas
          </p>
          <Link
            href="/dashboard/hes/lineas-vida/nueva"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline"
          >
            <Plus className="w-4 h-4" />
            Crear primera inspección
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredData.map((inspeccion: InspeccionLineaVida) => {
            const config = estadoConfig[inspeccion.estado];
            const IconComponent = config.icon;

            return (
              <Link
                key={inspeccion.id}
                href={`/dashboard/hes/lineas-vida/${inspeccion.id}`}
                className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border hover:shadow-md transition"
              >
                <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                  <Cable className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                      {inspeccion.numeroLinea}
                    </h3>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
                      <IconComponent className="w-3 h-3" />
                      {config.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {inspeccion.ubicacion} • {inspeccion.fabricante}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  <p>{new Date(inspeccion.fechaInspeccion).toLocaleDateString('es-CO')}</p>
                  {inspeccion.inspector && (
                    <p className="text-xs">{inspeccion.inspector.name}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
