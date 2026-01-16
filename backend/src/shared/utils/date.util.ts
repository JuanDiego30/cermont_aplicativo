/**
 * @util Date Utilities
 * @description Utilidades para manejo de fechas
 *
 * Principio DRY: Centraliza lógica de fechas usada en múltiples módulos
 */

/**
 * Calcula días entre dos fechas
 */
export function calcularDiasEntre(fechaInicio: Date, fechaFin: Date): number {
  const diff = fechaFin.getTime() - fechaInicio.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calcula días desde una fecha hasta hoy
 */
export function diasDesde(fecha: Date): number {
  return calcularDiasEntre(fecha, new Date());
}

/**
 * Calcula días hasta una fecha desde hoy
 */
export function diasHasta(fecha: Date): number {
  return calcularDiasEntre(new Date(), fecha);
}

/**
 * Verifica si una fecha está vencida
 */
export function estaVencida(fecha: Date): boolean {
  return diasHasta(fecha) < 0;
}

/**
 * Obtiene fecha hace N días
 */
export function fechaHaceDias(dias: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias);
  return fecha;
}

/**
 * Obtiene fecha en N días
 */
export function fechaEnDias(dias: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha;
}

/**
 * Formatea fecha a formato colombiano
 */
export function formatearFechaColombia(fecha: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(fecha);
}

/**
 * Formatea fecha y hora a formato colombiano
 */
export function formatearFechaHoraColombia(fecha: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}

/**
 * Inicio del día actual
 */
export function inicioDelDia(fecha: Date = new Date()): Date {
  const inicio = new Date(fecha);
  inicio.setHours(0, 0, 0, 0);
  return inicio;
}

/**
 * Fin del día actual
 */
export function finDelDia(fecha: Date = new Date()): Date {
  const fin = new Date(fecha);
  fin.setHours(23, 59, 59, 999);
  return fin;
}

/**
 * Rango de fechas del último mes
 */
export function rangoUltimoMes(): { inicio: Date; fin: Date } {
  return {
    inicio: fechaHaceDias(30),
    fin: new Date(),
  };
}

/**
 * Rango de fechas del último trimestre
 */
export function rangoUltimoTrimestre(): { inicio: Date; fin: Date } {
  return {
    inicio: fechaHaceDias(90),
    fin: new Date(),
  };
}
