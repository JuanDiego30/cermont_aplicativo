/**
 * @file tecnico-status.utils.ts
 * @description Utilidades para estados y cálculos de técnicos
 */

import type { Tecnico, TecnicoStats, TecnicoEstado } from '../api/tecnicos.types';

/**
 * Calcula estadísticas a partir de un array de técnicos
 */
export function calculateTecnicosStats(tecnicos: Tecnico[]): TecnicoStats {
  const total = tecnicos.length;
  const disponibles = tecnicos.filter((t) => t.disponible).length;
  const enServicio = tecnicos.filter(
    (t) => !t.disponible && t.estado === 'activo'
  ).length;
  const calificacionPromedio =
    total > 0
      ? tecnicos.reduce((acc, t) => acc + t.calificacion, 0) / total
      : 0;
  const ordenesCompletadasTotal = tecnicos.reduce(
    (acc, t) => acc + t.ordenesCompletadas,
    0
  );

  return {
    total,
    disponibles,
    enServicio,
    calificacionPromedio: Number(calificacionPromedio.toFixed(1)),
    ordenesCompletadasTotal,
  };
}

/**
 * Obtiene colores del badge según estado
 */
export function getTecnicoEstadoColor(estado: TecnicoEstado): {
  bg: string;
  text: string;
  dot: string;
} {
  const colors: Record<TecnicoEstado, { bg: string; text: string; dot: string }> = {
    activo: {
      bg: 'bg-emerald-100 dark:bg-emerald-500/20',
      text: 'text-emerald-700 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    },
    inactivo: {
      bg: 'bg-gray-100 dark:bg-gray-500/20',
      text: 'text-gray-700 dark:text-gray-400',
      dot: 'bg-gray-400',
    },
    vacaciones: {
      bg: 'bg-blue-100 dark:bg-blue-500/20',
      text: 'text-blue-700 dark:text-blue-400',
      dot: 'bg-blue-500',
    },
  };

  return colors[estado] || colors.inactivo;
}

/**
 * Obtiene colores según disponibilidad
 */
export function getDisponibilidadColor(disponible: boolean): {
  bg: string;
  text: string;
  dot: string;
} {
  if (disponible) {
    return {
      bg: 'bg-emerald-100 dark:bg-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      dot: 'bg-emerald-500',
    };
  }

  return {
    bg: 'bg-amber-100 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
  };
}

/**
 * Obtiene iniciales del nombre
 */
export function getTecnicoInitials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

/**
 * Obtiene la etiqueta de disponibilidad
 */
export function getDisponibilidadLabel(disponible: boolean): string {
  return disponible ? 'Disponible' : 'En servicio';
}

/**
 * Obtiene la etiqueta del estado
 */
export function getEstadoLabel(estado: TecnicoEstado): string {
  const labels: Record<TecnicoEstado, string> = {
    activo: 'Activo',
    inactivo: 'Inactivo',
    vacaciones: 'En vacaciones',
  };

  return labels[estado] || estado;
}

/**
 * Genera color de avatar basado en nombre
 */
export function getAvatarGradient(nombre: string): string {
  const gradients = [
    'from-blue-500 to-blue-600',
    'from-emerald-500 to-emerald-600',
    'from-purple-500 to-purple-600',
    'from-orange-500 to-orange-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600',
    'from-rose-500 to-rose-600',
  ];

  // Hash simple del nombre para seleccionar color
  const hash = nombre.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return gradients[hash % gradients.length];
}

/**
 * Formatea número de órdenes
 */
export function formatOrdenesCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return String(count);
}
