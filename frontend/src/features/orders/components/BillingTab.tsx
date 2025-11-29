/**
 * BillingTab Component
 * Pestaña de facturación para el detalle de orden
 */

'use client';

import { useState } from 'react';
import { billingApi } from '@/features/billing';
import { CreditCard, FileText, CheckCircle } from 'lucide-react';

interface BillingTabProps {
  order: {
    id: string;
    billingState?: string;
  };
  onUpdate: () => void;
}

export function BillingTab({ order, onUpdate }: BillingTabProps) {
  const [loading, setLoading] = useState(false);

  const handleStateChange = async (newState: string) => {
    if (!confirm(`¿Estás seguro de cambiar el estado a ${newState}?`)) return;

    setLoading(true);
    try {
      await billingApi.updateState({ orderId: order.id, newState: newState as 'PENDING' | 'INVOICED' | 'PAID' });
      onUpdate();
    } catch (error) {
      console.error('Error updating state:', error);
      alert('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { key: 'PENDING', label: 'Pendiente Acta', icon: FileText },
    { key: 'INVOICED', label: 'Facturada', icon: CreditCard },
    { key: 'PAID', label: 'Pagada', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === order.billingState) ?? 0;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
          Estado de Facturación
        </h3>
        
        <div className="flex justify-between">
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex;
            const isPast = index < currentStepIndex;
            const StepIcon = step.icon;
            
            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                    isPast
                      ? 'border-green-500 bg-green-500 text-white'
                      : isCurrent
                      ? 'border-brand-500 bg-brand-500 text-white'
                      : 'border-neutral-300 bg-white text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800'
                  }`}
                >
                  <StepIcon className="h-5 w-5" />
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-end gap-3">
          {currentStepIndex < steps.length - 1 && (
            <button
              className="inline-flex items-center justify-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50"
              onClick={() => handleStateChange(steps[currentStepIndex + 1].key)}
              disabled={loading}
            >
              {loading ? 'Procesando...' : `Avanzar a ${steps[currentStepIndex + 1].label}`}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-4 text-lg font-bold text-neutral-900 dark:text-neutral-50">
            Documentos
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <FileText className="h-5 w-5 text-neutral-500" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Acta de Entrega</p>
                  <p className="text-xs text-neutral-500">Pendiente de carga</p>
                </div>
              </div>
              <button className="px-3 py-1 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                Subir
              </button>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 dark:border-neutral-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
                  <FileText className="h-5 w-5 text-neutral-500" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900 dark:text-neutral-50">Factura</p>
                  <p className="text-xs text-neutral-500">Pendiente de carga</p>
                </div>
              </div>
              <button className="px-3 py-1 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">
                Subir
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
