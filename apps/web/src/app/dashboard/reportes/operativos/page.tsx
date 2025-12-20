/**
 * @file page.tsx
 * @description Página de Reportes Operativos mejorada
 */

'use client';

import React, { useState } from 'react';
import { useReporteOrdenes, useDescargarReporte } from '@/features/reportes';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Download, Calendar, Filter, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function ReportesOperativosPage() {
  const [filters, setFilters] = useState({
    fechaInicio: new Date(new Date().setDate(1)).toISOString().split('T')[0], // Primer día del mes
    fechaFin: new Date().toISOString().split('T')[0], // Hoy
    estado: '',
    tecnicoId: '',
  });

  const { data, isLoading, error } = useReporteOrdenes({
    fechaInicio: filters.fechaInicio,
    fechaFin: filters.fechaFin,
    estado: filters.estado || undefined,
    tecnicoId: filters.tecnicoId || undefined,
  });

  const descargarReporte = useDescargarReporte();

  const handleDownload = (formato: 'pdf' | 'excel') => {
    descargarReporte.trigger({
      ...filters,
      formato,
      fechaInicio: filters.fechaInicio,
      fechaFin: filters.fechaFin,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            Reportes Operativos
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Genera reportes detallados de órdenes de trabajo
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => handleDownload('pdf')}
            disabled={descargarReporte.isMutating || isLoading}
          >
            <Download className="w-4 h-4" />
            PDF
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleDownload('excel')}
            disabled={descargarReporte.isMutating || isLoading}
          >
            <Download className="w-4 h-4" />
            Excel
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Filtros
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Inicio
            </label>
            <Input
              type="date"
              value={filters.fechaInicio}
              onChange={(e) => setFilters({ ...filters, fechaInicio: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha Fin
            </label>
            <Input
              type="date"
              value={filters.fechaFin}
              onChange={(e) => setFilters({ ...filters, fechaFin: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={filters.estado}
              onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">Todos</option>
              <option value="planeacion">Planeación</option>
              <option value="ejecucion">En Ejecución</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="primary"
              onClick={() => {
                // Refetch con nuevos filtros
              }}
              className="w-full"
            >
              <Filter className="w-4 h-4" />
              Aplicar Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Resumen */}
      {data?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Órdenes</span>
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.summary.totalOrdenes}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completadas</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.summary.completadas}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-amber-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">En Progreso</span>
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.summary.enProgreso}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Canceladas</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.summary.canceladas}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Horas Totales</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {data.summary.horasTotales}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Promedio: {data.summary.promedioHorasPorOrden}h/orden
            </p>
          </Card>
        </div>
      )}

      {/* Tabla de Órdenes */}
      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        </Card>
      ) : error ? (
        <Card className="p-6 text-center">
          <p className="text-red-600 dark:text-red-400">
            Error al cargar reporte. Por favor, intenta nuevamente.
          </p>
        </Card>
      ) : data?.ordenes && data.ordenes.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Órdenes del Período
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Orden
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Título
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Técnico
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Horas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {data.ordenes.map((orden) => (
                  <tr key={orden.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400">
                      #{orden.numero}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {orden.titulo}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'px-2 py-1 text-xs font-medium rounded-full',
                        orden.estado === 'completada' && 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
                        orden.estado === 'ejecucion' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
                        orden.estado === 'planeacion' && 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
                        orden.estado === 'cancelada' && 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
                        !['completada', 'ejecucion', 'planeacion', 'cancelada'].includes(orden.estado) && 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                      )}>
                        {orden.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {orden.tecnico || 'Sin asignar'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {orden.horasTrabajadas}h
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(orden.fechaCreacion).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No hay datos
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No se encontraron órdenes para el período seleccionado
          </p>
        </Card>
      )}
    </div>
  );
}
