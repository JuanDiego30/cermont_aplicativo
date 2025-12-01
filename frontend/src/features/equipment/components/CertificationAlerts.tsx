'use client';

/**
 * Component: CertificationAlerts
 * Panel de alertas de certificaciones próximas a vencer
 * 
 * @file frontend/src/features/equipment/components/CertificationAlerts.tsx
 */

import { useState } from 'react';
import { useEquipmentAlerts } from '../hooks/useEquipment';
import { SEVERITY_CONFIG, CATEGORY_LABELS } from '../types/equipment.types';
import { Card } from '@/shared/components/ui/Card';
import Badge from '@/shared/components/ui/badge/Badge';
import { AlertTriangle, Clock, ExternalLink, RefreshCw } from 'lucide-react';

interface CertificationAlertsProps {
  compact?: boolean;
  maxItems?: number;
}

export function CertificationAlerts({ compact = false, maxItems = 10 }: CertificationAlertsProps) {
  const [daysAhead, setDaysAhead] = useState(30);
  const { data, isLoading, error, refetch, isFetching } = useEquipmentAlerts(daysAhead);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-gray-200 dark:bg-gray-700" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
        <p className="mt-2 text-sm text-red-600">Error al cargar alertas</p>
        <button
          onClick={() => refetch()}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Reintentar
        </button>
      </Card>
    );
  }

  const alerts = data?.data.slice(0, maxItems) || [];
  const summary = data?.meta;

  return (
    <Card className={compact ? 'p-4' : 'p-6'}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-lg'}`}>
            Alertas de Certificaciones
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {!compact && (
            <select
              value={daysAhead}
              onChange={e => setDaysAhead(Number(e.target.value))}
              className="rounded-lg border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value={7}>7 días</option>
              <option value={15}>15 días</option>
              <option value={30}>30 días</option>
              <option value={60}>60 días</option>
            </select>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary */}
      {summary && !compact && (
        <div className="mb-4 grid grid-cols-4 gap-2">
          <div className="rounded-lg bg-gray-100 p-2 text-center dark:bg-gray-800">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{summary.total}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
          <div className="rounded-lg bg-red-100 p-2 text-center dark:bg-red-900/30">
            <p className="text-lg font-bold text-red-600 dark:text-red-400">{summary.high}</p>
            <p className="text-xs text-red-600 dark:text-red-400">Alta</p>
          </div>
          <div className="rounded-lg bg-amber-100 p-2 text-center dark:bg-amber-900/30">
            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{summary.medium}</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Media</p>
          </div>
          <div className="rounded-lg bg-blue-100 p-2 text-center dark:bg-blue-900/30">
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{summary.low}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">Baja</p>
          </div>
        </div>
      )}

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="py-8 text-center">
          <Clock className="mx-auto h-10 w-10 text-green-500" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            No hay certificaciones próximas a vencer
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {alerts.map(alert => {
            const severityConfig = SEVERITY_CONFIG[alert.severity];

            return (
              <div
                key={alert.equipment.id}
                className={`rounded-lg border p-3 ${
                  alert.severity === 'HIGH'
                    ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    : alert.severity === 'MEDIUM'
                    ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/20'
                    : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span>{severityConfig.icon}</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {alert.equipment.name}
                      </p>
                      <Badge color={severityConfig.color as any} size="sm">
                        {alert.daysUntilExpiry <= 0
                          ? 'Vencido'
                          : `${alert.daysUntilExpiry} días`}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {alert.equipment.certification.type} - {CATEGORY_LABELS[alert.equipment.category]}
                    </p>
                    <p className="text-xs text-gray-500">
                      Vence: {new Date(alert.equipment.certification.expiryDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                  {alert.equipment.certification.documentUrl && (
                    <a
                      href={alert.equipment.certification.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {alerts.length > 0 && data && data.data.length > maxItems && (
        <p className="mt-4 text-center text-sm text-gray-500">
          Mostrando {maxItems} de {data.data.length} alertas
        </p>
      )}
    </Card>
  );
}

export default CertificationAlerts;
