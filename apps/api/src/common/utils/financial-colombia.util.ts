/**
 * @util Cálculos Financieros Colombia
 * @description Utilidades para cálculos financieros específicos de Colombia
 * 
 * Principio DRY: Centraliza lógica de cálculos usada en múltiples módulos
 * (costos, ordenes, reportes, facturación)
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
 * Extrae el valor base desde un total con IVA
 */
export function extraerBaseDeTotal(totalConIVA: number): number {
  return totalConIVA / (1 + IVA_COLOMBIA);
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
 * Redondea a pesos (sin decimales)
 */
export function redondearPesos(monto: number): number {
  return Math.round(monto);
}

/**
 * Estructura de desglose de costos
 */
export interface CostBreakdown {
  subtotal: number;
  impuestos: number;
  total: number;
}

/**
 * Calcula desglose de costos con IVA
 */
export function calcularDesgloseConIVA(subtotal: number): CostBreakdown {
  const impuestos = calcularIVA(subtotal);
  const total = subtotal + impuestos;

  return {
    subtotal: redondearPesos(subtotal),
    impuestos: redondearPesos(impuestos),
    total: redondearPesos(total),
  };
}
