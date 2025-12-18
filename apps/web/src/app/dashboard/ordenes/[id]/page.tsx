'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, User } from 'lucide-react';
import { useOrden } from '@/features/ordenes/hooks/use-ordenes';
import { OrdenStepIndicator } from '@/features/ordenes/components/OrdenStepIndicator';

export default function OrdenDetailPage() {
  const params = useParams<{ id: string }>();
  const ordenId = params?.id as string;

  const { data, isLoading, error } = useOrden(ordenId);

  // Adaptar diferentes formas de respuesta (directa o { data })
  const orden = data ? ((data as any).data ?? data) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/ordenes"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a órdenes
        </Link>
      </div>

      {isLoading && (
        <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 animate-pulse">
          <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-4 w-52 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          No se pudo cargar la orden.
        </div>
      )}

      {orden && (
        <>
          {/* Encabezado de la orden */}
          <div className="p-6 rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 space-y-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Orden de Trabajo
                </p>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {orden.numero}
                </h1>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-300">{orden.cliente}</p>
                <p className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <MapPin className="w-3 h-3" />
                  {orden.ubicacion || 'Sin ubicación'}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {orden.descripcion || 'Sin descripción'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-3">
              <span className="inline-flex items-center gap-1">
                <User className="w-3 h-3" />
                {orden.asignado?.name || orden.tecnico || 'Sin técnico asignado'}
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {orden.createdAt
                  ? new Date(orden.createdAt).toLocaleDateString('es-CO')
                  : '-'}
              </span>
            </div>
          </div>

          {/* Stepper de 14 pasos */}
          <OrdenStepIndicator ordenId={ordenId} />
        </>
      )}
    </div>
  );
}


