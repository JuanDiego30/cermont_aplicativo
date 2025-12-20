/**
 * @file ResumenAlertas.tsx
 * @description Componente para mostrar resumen de alertas en dashboard
 */

'use client';

import React from 'react';
import { useResumenAlertas } from '../hooks/use-alertas';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Bell, AlertTriangle, XCircle, Info } from 'lucide-react';
import Link from 'next/link';

export function ResumenAlertas() {
  const { data, isLoading } = useResumenAlertas();

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Alertas
          </h3>
        </div>
        <Link href="/dashboard/alertas">
          <Badge variant="secondary" className="cursor-pointer hover:bg-gray-100">
            Ver todas
          </Badge>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.total}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {data.pendientes}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Pendientes</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {data.criticas}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Críticas</p>
        </div>

        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {Object.keys(data.porTipo || {}).length}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Tipos</p>
        </div>
      </div>

      {data.criticas > 0 && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2 text-red-800 dark:text-red-400">
            <XCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Tienes {data.criticas} alerta(s) crítica(s) que requieren atención inmediata
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
