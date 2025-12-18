'use client';

import React from 'react';
import { useOrdenEstado } from '../hooks/use-ordenes';

interface OrdenStepIndicatorProps {
  ordenId: string;
}

const STEPS: { paso: number; label: string; description: string }[] = [
  { paso: 1, label: '1. Solicitud', description: 'Solicitud formal del cliente del trabajo a realizar.' },
  { paso: 2, label: '2. Visita técnica', description: 'Visita al área para aclarar dudas, mediciones y fotos.' },
  { paso: 3, label: '3. Propuesta económica', description: 'Elaboración y envío de la propuesta al cliente.' },
  { paso: 4, label: '4. Aprobación y PO', description: 'Aprobación de la propuesta con número de orden (PO).' },
  { paso: 5, label: '5. Planeación', description: 'Cronograma, mano de obra, herramientas y documentación de apoyo.' },
  { paso: 6, label: '6. Ejecución', description: 'Ejecución de la actividad y diligenciamiento de documentación HES.' },
  { paso: 7, label: '7. Informe técnico', description: 'Elaboración de informe con actividades ejecutadas y fotos.' },
  { paso: 8, label: '8. Acta de entrega', description: 'Elaboración de acta de entrega final y envío al cliente.' },
  { paso: 9, label: '9. Acta firmada', description: 'Recibo del acta firmada por el cliente.' },
  { paso: 11, label: '10–11. SES aprobada', description: 'Elaboración y aprobación de SES en plataforma Ariba.' },
  { paso: 13, label: '12–13. Factura aprobada', description: 'Elaboración y aprobación de factura en plataforma Ariba.' },
  { paso: 14, label: '14. Pago recibido', description: 'Confirmación de pago por parte del cliente.' },
];

export function OrdenStepIndicator({ ordenId }: OrdenStepIndicatorProps) {
  const { data, isLoading, error } = useOrdenEstado(ordenId);

  if (isLoading) {
    return (
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 animate-pulse">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 text-sm">
        No se pudo cargar el estado detallado de la orden.
      </div>
    );
  }

  const currentPaso = data.paso ?? 1;

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Estado actual
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            Paso {currentPaso}: {data.subEstado}
          </p>
        </div>
        {data.esFinal && (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            Flujo completado
          </span>
        )}
      </div>

      <div className="relative mt-2">
        <div className="absolute inset-y-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700" />
        <ol className="space-y-3">
          {STEPS.map((step) => {
            const isActive = step.paso === currentPaso;
            const isCompleted = step.paso < currentPaso;

            return (
              <li key={step.paso} className="relative flex items-start gap-3 pl-6">
                <span
                  className={[
                    'absolute left-0 flex h-6 w-6 items-center justify-center rounded-full border-2 text-xs font-bold',
                    isCompleted
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-400 dark:bg-gray-900 dark:border-gray-600',
                  ].join(' ')}
                >
                  {step.paso}
                </span>
                <div>
                  <p
                    className={[
                      'text-sm font-medium',
                      isActive
                        ? 'text-blue-700 dark:text-blue-300'
                        : isCompleted
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-gray-700 dark:text-gray-300',
                    ].join(' ')}
                  >
                    {step.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}


