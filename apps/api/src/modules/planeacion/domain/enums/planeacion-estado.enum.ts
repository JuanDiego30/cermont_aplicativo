/**
 * @fileoverview Enum canónico de estados de planeación
 * @module planeacion/domain/enums
 *
 * Este archivo usa el enum generado por Prisma como SSOT.
 * Valores: borrador, en_revision, aprobada, en_ejecucion, completada, cancelada
 *
 * @see REFACTOR_AUDIT_2026.md - Sprint 1.5
 * @see apps/api/prisma/schema.prisma enum EstadoPlaneacion
 */

import { EstadoPlaneacion } from "@prisma/client";

// Re-export Prisma enum as canonical PlaneacionEstado
export { EstadoPlaneacion as PlaneacionEstado };

// Type alias for convenience
export type PlaneacionEstadoType = EstadoPlaneacion;

/**
 * Array de todos los estados válidos (útil para validación)
 */
export const ALL_PLANEACION_ESTADOS = Object.values(EstadoPlaneacion);

/**
 * Verifica si un string es un PlaneacionEstado válido
 * @param estado - String a verificar
 * @returns true si es un estado válido
 */
export function isValidPlaneacionEstado(
  estado: unknown,
): estado is EstadoPlaneacion {
  return (
    typeof estado === "string" &&
    ALL_PLANEACION_ESTADOS.includes(estado as EstadoPlaneacion)
  );
}

/**
 * Estados que permiten modificación
 */
export const EDITABLE_ESTADOS: EstadoPlaneacion[] = [
  EstadoPlaneacion.borrador,
  EstadoPlaneacion.en_revision,
];

/**
 * Estados finales (no permiten cambios)
 */
export const FINAL_ESTADOS: EstadoPlaneacion[] = [
  EstadoPlaneacion.completada,
  EstadoPlaneacion.cancelada,
];

/**
 * Display labels para UI
 */
export const PLANEACION_ESTADO_LABELS: Record<EstadoPlaneacion, string> = {
  [EstadoPlaneacion.borrador]: "Borrador",
  [EstadoPlaneacion.en_revision]: "En Revisión",
  [EstadoPlaneacion.aprobada]: "Aprobada",
  [EstadoPlaneacion.en_ejecucion]: "En Ejecución",
  [EstadoPlaneacion.completada]: "Completada",
  [EstadoPlaneacion.cancelada]: "Cancelada",
};
