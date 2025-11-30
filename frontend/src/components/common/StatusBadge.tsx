'use client';

import { ReactNode } from 'react';

/**
 * Available status types
 */
export type StatusType = 
  | 'solicitud' | 'visita' | 'po' | 'planeacion' 
  | 'ejecucion' | 'informe' | 'acta' | 'ses' 
  | 'factura' | 'pago' | 'completado' | 'pendiente'
  | 'aprobado' | 'rechazado' | 'cancelado'
  | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  /** Status type or custom label */
  status: StatusType | string;
  /** Custom label override */
  label?: string;
  /** Size of the badge */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Show as pill (more rounded) */
  pill?: boolean;
  /** Optional icon */
  icon?: ReactNode;
  /** Custom className */
  className?: string;
  /** Show dot indicator */
  withDot?: boolean;
}

// Predefined status colors
const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  // Order states
  solicitud: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  visita: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
  po: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  planeacion: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  ejecucion: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', dot: 'bg-cyan-500' },
  informe: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', dot: 'bg-indigo-500' },
  acta: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
  ses: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
  factura: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300', dot: 'bg-pink-500' },
  pago: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500' },
  
  // Generic states
  completado: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  pendiente: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', dot: 'bg-amber-500' },
  aprobado: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  rechazado: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  cancelado: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
  
  // Semantic states
  success: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
  warning: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', dot: 'bg-yellow-500' },
  error: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  info: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
  neutral: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-300', dot: 'bg-gray-500' },
};

// Human-readable labels for status types
const STATUS_LABELS: Record<string, string> = {
  solicitud: 'Solicitud',
  visita: 'Visita',
  po: 'PO',
  planeacion: 'Planeación',
  ejecucion: 'En Ejecución',
  informe: 'Informe',
  acta: 'Acta',
  ses: 'SES',
  factura: 'Factura',
  pago: 'PAGO',
  completado: 'Completado',
  pendiente: 'Pendiente',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  cancelado: 'Cancelado',
  success: 'Éxito',
  warning: 'Advertencia',
  error: 'Error',
  info: 'Info',
  neutral: 'Neutral',
};

const SIZE_CLASSES = {
  xs: 'px-1.5 py-0.5 text-xs',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

/**
 * StatusBadge - Badge de estado reutilizable
 * 
 * @example
 * // Badge simple
 * <StatusBadge status="solicitud" />
 * 
 * @example
 * // Badge con punto indicador
 * <StatusBadge status="ejecucion" withDot />
 * 
 * @example
 * // Badge personalizado
 * <StatusBadge status="success" label="Activo" size="lg" pill />
 */
export function StatusBadge({
  status,
  label,
  size = 'sm',
  pill = false,
  icon,
  className = '',
  withDot = false,
}: StatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();
  const colors = STATUS_COLORS[normalizedStatus] || STATUS_COLORS.neutral;
  const displayLabel = label || STATUS_LABELS[normalizedStatus] || status;
  
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 font-medium
        ${colors.bg} ${colors.text}
        ${SIZE_CLASSES[size]}
        ${pill ? 'rounded-full' : 'rounded-md'}
        ${className}
      `}
    >
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
      )}
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {displayLabel}
    </span>
  );
}

export default StatusBadge;
