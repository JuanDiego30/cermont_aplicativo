/**
 * @file page.tsx
 * @description Página de Archivado con mejor UI/UX
 */

'use client';

import React, { useState } from 'react';
import { useArchivadas, useEstadisticasArchivado, useArchivosHistoricos, useArchivarMes, useArchivarAhora } from '@/features/archivado';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Archive, Download, FileArchive, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function ArchivadoPage() {
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const { data: archivadas, isLoading } = useArchivadas(filters);
  const { data: estadisticas } = useEstadisticasArchivado();
  const { data: archivos } = useArchivosHistoricos();
  const archivarMes = useArchivarMes();
  const archivarAhora = useArchivarAhora();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Archive className="w-6 h-6" />
            Archivado
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona archivos históricos y órdenes archivadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => archivarAhora.trigger()}
            disabled={archivarAhora.isMutating}
          >
            <FileArchive className="w-4 h-4" />
            Archivar Ahora
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Archivos</span>
              <FileArchive className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {estadisticas.totalArchivos || 0}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Órdenes Archivadas</span>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {estadisticas.totalOrdenesArchivadas || 0}
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Espacio Usado</span>
              <Archive className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {(estadisticas.espacioUsado / 1024 / 1024).toFixed(2)} MB
            </p>
          </Card>

          <Card className="p-6 border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Archivos por Año</span>
              <Calendar className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {Object.keys(estadisticas.archivosPorAnio || {}).length}
            </p>
          </Card>
        </div>
      )}

      {/* Archivos Históricos */}
      {archivos && archivos.data && archivos.data.length > 0 && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Archivos Históricos Disponibles
          </h2>
          <div className="space-y-3">
            {archivos.data.map((archivo) => (
              <div
                key={archivo.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <FileArchive className="w-8 h-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {archivo.nombreArchivo}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {archivo.mes}/{archivo.anio} • {archivo.cantidadOrdenes} órdenes • {(archivo.tamanioBytes / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    // Implementar descarga
                    window.open(`/api/archivado/descargar/${archivo.id}`, '_blank');
                  }}
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de Archivadas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Órdenes Archivadas
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ))}
          </div>
        ) : archivadas?.data && archivadas.data.length > 0 ? (
          <div className="space-y-3">
            {archivadas.data.map((item: any) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
              >
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {item.numero || item.ordenId}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Archivada el {new Date(item.fechaArchivado).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Ver detalles
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Archive className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              No hay órdenes archivadas
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
