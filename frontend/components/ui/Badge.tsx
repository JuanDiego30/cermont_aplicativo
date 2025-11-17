// components/ui/Badge.tsx
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { OrderState } from '@/lib/types/order';

type BadgeProps = {
  state: OrderState | string;
  className?: string;
  children?: ReactNode;
};

type StateStyle = {
  badge: string;
  text: string;
  dot: string;
};

const DEFAULT_STATE_STYLE: StateStyle = {
  badge: 'bg-neutral-50 border-neutral-200 dark:bg-neutral-900 dark:border-neutral-700',
  text: 'text-neutral-700 dark:text-neutral-300',
  dot: 'bg-neutral-400',
};

const STATE_STYLES: Record<OrderState, StateStyle> = {
  [OrderState.SOLICITUD]: {
    badge: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
    text: 'text-blue-700 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
  [OrderState.VISITA]: {
    badge: 'bg-purple-50 border-purple-200 dark:bg-purple-950 dark:border-purple-800',
    text: 'text-purple-700 dark:text-purple-300',
    dot: 'bg-purple-500',
  },
  [OrderState.PO]: {
    badge: 'bg-teal-50 border-teal-200 dark:bg-teal-950 dark:border-teal-800',
    text: 'text-teal-700 dark:text-teal-300',
    dot: 'bg-teal-500',
  },
  [OrderState.PLANEACION]: {
    badge: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
    text: 'text-orange-700 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  [OrderState.EJECUCION]: {
    badge: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    text: 'text-red-700 dark:text-red-300',
    dot: 'bg-red-500',
  },
  [OrderState.INFORME]: {
    badge: 'bg-indigo-50 border-indigo-200 dark:bg-indigo-950 dark:border-indigo-800',
    text: 'text-indigo-700 dark:text-indigo-300',
    dot: 'bg-indigo-500',
  },
  [OrderState.ACTA]: {
    badge: 'bg-lime-50 border-lime-200 dark:bg-lime-950 dark:border-lime-800',
    text: 'text-lime-700 dark:text-lime-300',
    dot: 'bg-lime-500',
  },
  [OrderState.SES]: {
    badge: 'bg-cyan-50 border-cyan-200 dark:bg-cyan-950 dark:border-cyan-800',
    text: 'text-cyan-700 dark:text-cyan-300',
    dot: 'bg-cyan-500',
  },
  [OrderState.FACTURA]: {
    badge: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    text: 'text-amber-700 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  [OrderState.PAGO]: {
    badge: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950 dark:border-emerald-800',
    text: 'text-emerald-700 dark:text-emerald-300',
    dot: 'bg-emerald-500',
  },
};

const STATE_LABELS: Record<OrderState, string> = {
  [OrderState.SOLICITUD]: 'Solicitud',
  [OrderState.VISITA]: 'Visita',
  [OrderState.PO]: 'PO',
  [OrderState.PLANEACION]: 'Planeación',
  [OrderState.EJECUCION]: 'En Ejecución',
  [OrderState.INFORME]: 'Informe',
  [OrderState.ACTA]: 'Acta',
  [OrderState.SES]: 'SES',
  [OrderState.FACTURA]: 'Factura',
  [OrderState.PAGO]: 'Pago',
};

/**
 * Obtiene la etiqueta en español de un estado
 */
export function getOrderStateLabel(state: OrderState | string): string {
  const orderState = OrderState[state as keyof typeof OrderState] as OrderState;
  return STATE_LABELS[orderState] ?? String(state);
}

/**
 * Componente Badge para mostrar estados de órdenes
 * con estilos consistentes y soporte para dark mode
 */
export function Badge({ state, className, children }: BadgeProps) {
  const orderState =
    (OrderState[state as keyof typeof OrderState] as OrderState) || OrderState.SOLICITUD;
  const styles = STATE_STYLES[orderState] || DEFAULT_STATE_STYLE;
  const label = children || getOrderStateLabel(state);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        styles.badge,
        styles.text,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} aria-hidden="true" />
      {label}
    </span>
  );
}




