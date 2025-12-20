/**
 * @file page.tsx
 * @description Página de Alertas con mejor UI/UX
 */

'use client';

import React from 'react';
import { AlertasList, ResumenAlertasWidget } from '@/features/alertas';
import { useEjecutarVerificacion } from '@/features/alertas/hooks/use-alertas';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { RefreshCw, Bell } from 'lucide-react';
import { cn } from '@/lib/cn';

export default function AlertasPage() {
  const ejecutarVerificacion = useEjecutarVerificacion();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alertas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona y resuelve las alertas del sistema
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={() => ejecutarVerificacion.trigger()}
          disabled={ejecutarVerificacion.isMutating}
        >
          <RefreshCw className={cn('w-4 h-4', ejecutarVerificacion.isMutating && 'animate-spin')} />
          Ejecutar Verificación
        </Button>
      </div>

      {/* Resumen */}
      <ResumenAlertasWidget />

      {/* Lista de Alertas */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Mis Alertas
        </h2>
        <AlertasList />
      </Card>
    </div>
  );
}
