/**
 * @file shared-types.ts
 * @description Tipos compartidos para DTOs de Ordenes
 * @layer Application
 *
 * Este archivo centraliza los tipos de estado y prioridad para evitar
 * incompatibilidades entre ClassValidator (enums) y Zod (string literals).
 *
 * REGLA: Usar estos tipos en lugar de definir enums duplicados.
 */

import { OrdenEstado } from "../../domain/orden-state-machine";

// Re-export for backwards compatibility
export { OrdenEstado };

// ==========================================
// Estado de Orden - Tipo Base
// ==========================================

/**
 * Estados posibles de una orden de trabajo.
 * Definido como const para que TypeScript infiera el tipo literal.
 */
export const ORDEN_ESTADOS = [
  "pendiente",
  "planeacion",
  "ejecucion",
  "pausada",
  "completada",
  "cancelada",
] as const;

/**
 * Tipo union de estados (compatible con Zod y ClassValidator)
 */
export type OrdenEstadoType = (typeof ORDEN_ESTADOS)[number];

/**
 * @deprecated Use OrdenEstado from domain/orden-state-machine.ts
 * Kept for backwards compatibility with existing code.
 */
export const OrdenEstadoEnum = OrdenEstado;
export type OrdenEstadoEnum = OrdenEstado;

// ==========================================
// Prioridad de Orden - Tipo Base
// ==========================================

/**
 * Prioridades posibles de una orden de trabajo.
 */
export const ORDEN_PRIORIDADES = ["baja", "media", "alta", "urgente"] as const;

/**
 * Tipo union de prioridades (compatible con Zod y ClassValidator)
 */
export type OrdenPrioridadType = (typeof ORDEN_PRIORIDADES)[number];

/**
 * Enum para compatibilidad con ClassValidator/Swagger
 */
export enum OrdenPrioridadEnum {
  BAJA = "baja",
  MEDIA = "media",
  ALTA = "alta",
  URGENTE = "urgente",
}

// ==========================================
// Helpers de Tipo
// ==========================================

/**
 * Verifica si un string es un estado válido de orden.
 * Útil para validación en runtime sin type casting.
 */
export function isOrdenEstado(value: string): value is OrdenEstadoType {
  return ORDEN_ESTADOS.includes(value as OrdenEstadoType);
}

/**
 * Verifica si un string es una prioridad válida de orden.
 */
export function isOrdenPrioridad(value: string): value is OrdenPrioridadType {
  return ORDEN_PRIORIDADES.includes(value as OrdenPrioridadType);
}

/**
 * Convierte un enum de estado a tipo literal (sin casting inseguro).
 */
export function toOrdenEstado(
  estado: OrdenEstadoEnum | string | undefined,
): OrdenEstadoType | undefined {
  if (estado === undefined) return undefined;
  const value = typeof estado === "string" ? estado : estado;
  return isOrdenEstado(value) ? value : undefined;
}

/**
 * Convierte un enum de prioridad a tipo literal (sin casting inseguro).
 */
export function toOrdenPrioridad(
  prioridad: OrdenPrioridadEnum | string | undefined,
): OrdenPrioridadType | undefined {
  if (prioridad === undefined) return undefined;
  const value = typeof prioridad === "string" ? prioridad : prioridad;
  return isOrdenPrioridad(value) ? value : undefined;
}
