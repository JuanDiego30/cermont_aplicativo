/**
 * @file currency.utils.ts
 * @description Utilidades para formateo de moneda y cálculos financieros
 */

/**
 * Formatea un valor numérico a moneda colombiana
 */
export function formatCurrency(value: number, options?: {
  compact?: boolean;
  currency?: string;
  locale?: string;
}): string {
  const { compact = true, currency = 'COP', locale = 'es-CO' } = options || {};

  if (compact) {
    if (Math.abs(value) >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(1)}B`;
    }
    if (Math.abs(value) >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    if (Math.abs(value) >= 1_000) {
      return `$${(value / 1_000).toFixed(1)}K`;
    }
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formatea un porcentaje
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calcula el margen de utilidad
 */
export function calculateMargin(ingresos: number, egresos: number): number {
  if (ingresos === 0) return 0;
  const utilidad = ingresos - egresos;
  return (utilidad / ingresos) * 100;
}

/**
 * Calcula la variación porcentual entre dos valores
 */
export function calculateVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Determina si un valor de tendencia es positivo según el contexto
 */
export function isTrendPositive(
  trend: number,
  context: 'ingresos' | 'egresos' | 'utilidad' | 'margen'
): boolean {
  if (context === 'egresos') {
    return trend < 0; // Menos egresos es positivo
  }
  return trend > 0; // Más ingresos/utilidad/margen es positivo
}

/**
 * Obtiene color según valor de margen
 */
export function getMarginColor(margin: number): {
  bg: string;
  text: string;
} {
  if (margin >= 30) {
    return {
      bg: 'bg-emerald-100 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
    };
  }
  if (margin >= 20) {
    return {
      bg: 'bg-yellow-100 dark:bg-yellow-500/20',
      text: 'text-yellow-700 dark:text-yellow-400',
    };
  }
  if (margin >= 10) {
    return {
      bg: 'bg-orange-100 dark:bg-orange-500/20',
      text: 'text-orange-700 dark:text-orange-400',
    };
  }
  return {
    bg: 'bg-red-100 dark:bg-red-500/20',
    text: 'text-red-700 dark:text-red-400',
  };
}

/**
 * Formatea número con separadores de miles
 */
export function formatNumber(value: number, locale = 'es-CO'): string {
  return new Intl.NumberFormat(locale).format(value);
}
