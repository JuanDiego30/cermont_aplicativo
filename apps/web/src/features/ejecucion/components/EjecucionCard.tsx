/**
 * @file EjecucionCard.tsx
 * @description Componente mejorado para tarjetas de ejecución con mejor UI/UX
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Play, Pause, CheckCircle2, Eye, Clock, User, MapPin } from 'lucide-react';
import { cn } from '@/lib/cn';
import Link from 'next/link';

interface EjecucionCardProps {
  ejecucion: {
    id: string;
    ordenId: string;
    orden?: {
      numero: string;
      titulo?: string;
      cliente?: string;
    };
    estado: string;
    avancePercentaje?: number;
    horasActuales?: number;
    horasEstimadas?: number;
    fechaInicio?: string;
    observaciones?: string;
  };
  onPause?: () => void;
  onResume?: () => void;
  onFinish?: () => void;
  onView?: () => void;
}

const getEstadoColor = (estado: string) => {
  switch (estado) {
    case 'en_progreso':
    case 'ejecucion':
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
    case 'pausada':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    case 'completada':
      return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700';
  }
};

export function EjecucionCard({ ejecucion, onPause, onResume, onFinish, onView }: EjecucionCardProps) {
  const avance = ejecucion.avancePercentaje || 0;
  const horasActuales = ejecucion.horasActuales || 0;
  const horasEstimadas = ejecucion.horasEstimadas || 0;
  const horasRestantes = Math.max(0, horasEstimadas - horasActuales);

  return (
    <Card className={cn(
      'p-5 transition-all hover:shadow-lg border-l-4',
      ejecucion.estado === 'en_progreso' && 'border-l-blue-500',
      ejecucion.estado === 'pausada' && 'border-l-yellow-500',
      ejecucion.estado === 'completada' && 'border-l-green-500'
    )}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={`/dashboard/ordenes/${ejecucion.ordenId}`}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              #{ejecucion.orden?.numero || ejecucion.ordenId.slice(0, 8)}
            </Link>
            <Badge className={getEstadoColor(ejecucion.estado)}>
              {ejecucion.estado === 'en_progreso' ? 'En Progreso' :
               ejecucion.estado === 'pausada' ? 'Pausada' :
               ejecucion.estado === 'completada' ? 'Completada' : ejecucion.estado}
            </Badge>
          </div>
          {ejecucion.orden?.titulo && (
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
              {ejecucion.orden.titulo}
            </h3>
          )}
          {ejecucion.orden?.cliente && (
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
              <User className="w-3 h-3" />
              {ejecucion.orden.cliente}
            </p>
          )}
        </div>
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            aria-label="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Progreso */}
      {ejecucion.estado === 'en_progreso' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progreso
            </span>
            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
              {avance}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${avance}%` }}
              role="progressbar"
              aria-valuenow={avance}
              aria-valuemin={0}
              aria-valuemax={100}
            ></div>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{horasActuales.toFixed(1)}h / {horasEstimadas.toFixed(1)}h</span>
        </div>
        {horasRestantes > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {horasRestantes.toFixed(1)}h restantes
          </div>
        )}
      </div>

      {/* Observaciones */}
      {ejecucion.observaciones && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
          {ejecucion.observaciones}
        </p>
      )}

      {/* Acciones */}
      <div className="flex gap-2">
        {ejecucion.estado === 'en_progreso' && (
          <>
            {onPause && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onPause}
                className="flex-1"
                aria-label="Pausar ejecución"
              >
                <Pause className="w-4 h-4" />
                Pausar
              </Button>
            )}
            {onFinish && (
              <Button
                variant="success"
                size="sm"
                onClick={onFinish}
                className="flex-1"
                aria-label="Finalizar ejecución"
              >
                <CheckCircle2 className="w-4 h-4" />
                Finalizar
              </Button>
            )}
          </>
        )}
        {ejecucion.estado === 'pausada' && onResume && (
          <Button
            variant="primary"
            size="sm"
            onClick={onResume}
            className="flex-1"
            aria-label="Reanudar ejecución"
          >
            <Play className="w-4 h-4" />
            Reanudar
          </Button>
        )}
        {onView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onView}
            aria-label="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}
      </div>
    </Card>
  );
}
