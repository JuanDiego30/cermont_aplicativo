/**
 * @util Financial Utilities (Colombia)
 * @description Utilidades para cálculos financieros en el frontend
 * 
 * Principio DRY: Centraliza lógica de cálculos usada en múltiples componentes
 */

/**
 * Tasa de IVA en Colombia (19%)
 */
export const IVA_COLOMBIA = 0.19;

/**
 * Calcula el IVA de un monto
 */
export function calcularIVA(base: number): number {
  return base * IVA_COLOMBIA;
}

/**
 * Calcula el total con IVA incluido
 */
export function calcularTotalConIVA(base: number): number {
  return base + calcularIVA(base);
}

/**
 * Formatea un monto como moneda colombiana
 */
export function formatearMonedaCOP(monto: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(monto);
}

/**
 * Formatea un monto de forma compacta (1.5M, 500K)
 */
export function formatearMonedaCompacta(monto: number): string {
  if (monto >= 1_000_000) {
    return `$${(monto / 1_000_000).toFixed(1)}M`;
  }
  if (monto >= 1_000) {
    return `$${(monto / 1_000).toFixed(0)}K`;
  }
  return formatearMonedaCOP(monto);
}

/**
 * Calcula el porcentaje de variación entre dos valores
 */
export function calcularVarianzaPorcentaje(
  valorBase: number,
  valorActual: number,
): number {
  if (valorBase === 0) return 0;
  return Number((((valorActual - valorBase) / valorBase) * 100).toFixed(2));
}

/**
 * Determina el color de estado según varianza de presupuesto
 */
export function getColorPresupuesto(varianzaPorcentaje: number): 'success' | 'warning' | 'destructive' {
  if (varianzaPorcentaje > 20) return 'destructive';
  if (varianzaPorcentaje > 10) return 'warning';
  return 'success';
}

/**
 * Formatea porcentaje
 */
export function formatearPorcentaje(valor: number): string {
  return `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
}
