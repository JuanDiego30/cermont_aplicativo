/**
 * @file AlertasList.tsx
 * @description Componente mejorado para listar alertas con mejor UI/UX
 */

'use client';

import React from 'react';
import { useMisAlertas, useMarcarAlertaLeida, useMarcarAlertaResuelta } from '../hooks/use-alertas';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AlertCircle, CheckCircle2, XCircle, Bell, BellOff } from 'lucide-react';
import { cn } from '@/lib/cn';

const getPrioridadColor = (prioridad: string) => {
  switch (prioridad) {
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
    case 'error':
      return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
    case 'warning':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800';
  }
};

const getPrioridadIcon = (prioridad: string) => {
  switch (prioridad) {
    case 'critical':
      return <XCircle className="w-5 h-5" />;
    case 'error':
      return <AlertCircle className="w-5 h-5" />;
    case 'warning':
      return <AlertCircle className="w-5 h-5" />;
    default:
      return <Bell className="w-5 h-5" />;
  }
};

export function AlertasList() {
  const { data, isLoading, error } = useMisAlertas();
  const marcarLeida = useMarcarAlertaLeida();
  const marcarResuelta = useMarcarAlertaResuelta();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertCircle className="w-12 h-12 mx-auto text-red-500 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Error al cargar alertas. Por favor, intenta nuevamente.
        </p>
      </Card>
    );
  }

  const alertas = data?.data || [];

  if (alertas.length === 0) {
    return (
      <Card className="p-12 text-center">
        <BellOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          No hay alertas
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          No tienes alertas pendientes en este momento.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {alertas.map((alerta) => (
        <Card
          key={alerta.id}
          className={cn(
            'p-4 transition-all hover:shadow-md',
            !alerta.leida && 'border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10',
            alerta.resuelta && 'opacity-75'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('text-current', getPrioridadColor(alerta.prioridad).split(' ')[1])}>
                  {getPrioridadIcon(alerta.prioridad)}
                </div>
                <Badge className={getPrioridadColor(alerta.prioridad)}>
                  {alerta.prioridad.toUpperCase()}
                </Badge>
                {!alerta.leida && (
                  <Badge className="bg-blue-500 text-white">
                    Nueva
                  </Badge>
                )}
              </div>

              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {alerta.titulo}
              </h4>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {alerta.mensaje}
              </p>

              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span>Tipo: {alerta.tipo}</span>
                <span>•</span>
                <span>
                  {new Date(alerta.createdAt).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {!alerta.leida && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => marcarLeida.trigger(alerta.id)}
                  disabled={marcarLeida.isMutating}
                  aria-label={`Marcar alerta ${alerta.titulo} como leída`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Marcar leída
                </Button>
              )}

              {!alerta.resuelta && (
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => marcarResuelta.trigger(alerta.id)}
                  disabled={marcarResuelta.isMutating}
                  aria-label={`Resolver alerta ${alerta.titulo}`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Resolver
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
