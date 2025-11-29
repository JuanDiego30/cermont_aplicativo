/**
 * Estados posibles de un Plan de Trabajo
 */
export enum WorkPlanStatus {
  /** Borrador inicial */
  DRAFT = 'DRAFT',
  /** Pendiente de aprobación */
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  /** Aprobado y listo para ejecución */
  APPROVED = 'APPROVED',
  /** En ejecución activa */
  IN_PROGRESS = 'IN_PROGRESS',
  /** Completado exitosamente */
  COMPLETED = 'COMPLETED',
  /** Rechazado */
  REJECTED = 'REJECTED',
  /** Cancelado */
  CANCELLED = 'CANCELLED',
}
