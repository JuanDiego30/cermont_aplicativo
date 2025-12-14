/**
 * @util Date Utilities
 * @description Utilidades para manejo de fechas en el frontend
 * 
 * Principio DRY: Centraliza lógica de fechas usada en múltiples componentes
 */

/**
 * Formatea fecha a formato colombiano
 */
export function formatearFecha(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Formatea fecha corta (12 dic 2025)
 */
export function formatearFechaCorta(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

/**
 * Formatea fecha y hora
 */
export function formatearFechaHora(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Calcula tiempo relativo (hace 2 días, en 3 horas)
 */
export function tiempoRelativo(fecha: Date | string): string {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (Math.abs(diffDays) >= 1) {
    return rtf.format(diffDays, 'day');
  }
  if (Math.abs(diffHours) >= 1) {
    return rtf.format(diffHours, 'hour');
  }
  if (Math.abs(diffMins) >= 1) {
    return rtf.format(diffMins, 'minute');
  }
  return 'ahora';
}

/**
 * Calcula días hasta una fecha
 */
export function diasHasta(fecha: Date | string): number {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const diff = date.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Verifica si una fecha está vencida
 */
export function estaVencida(fecha: Date | string): boolean {
  return diasHasta(fecha) < 0;
}

/**
 * Obtiene el color de badge según días hasta vencimiento
 */
export function getColorVencimiento(diasRestantes: number): 'destructive' | 'warning' | 'default' {
  if (diasRestantes < 0) return 'destructive';
  if (diasRestantes <= 3) return 'warning';
  return 'default';
}

/**
 * Formatea duración en formato legible
 */
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) {
    return `${minutos} min`;
  }
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (mins === 0) {
    return `${horas}h`;
  }
  return `${horas}h ${mins}m`;
}
