/**
 * @module Utils
 * @description Punto de entrada central para utilidades compartidas
 * 
 * Principio DRY: Exporta todas las utilidades desde un único punto
 */

export * from './financial';
export * from './date';
export * from './string';

// Utilidades de parámetros URL (DRY: filtersToParams centralizado)
export * from './params';

// Utilidades de manejo de errores (DRY: getErrorMessage centralizado)
export * from './error';

// Re-export cn from parent lib folder
export { cn } from '../cn';
