/**
 * Domain Enums - Shared between Backend and Frontend
 * Keep in sync with Prisma schema enums
 */

export enum OrderStatus {
  PENDIENTE = 'pendiente',
  PLANEACION = 'planeacion',
  EJECUCION = 'ejecucion',
  COMPLETADA = 'completada',
  CANCELADA = 'cancelada',
  PAUSADA = 'pausada',
}

export enum OrderPriority {
  BAJA = 'baja',
  MEDIA = 'media',
  ALTA = 'alta',
  URGENTE = 'urgente',
}

export enum OrderType {
  CORRECTIVO = 'CORRECTIVO',
  PREVENTIVO = 'PREVENTIVO',
  PREDICTIVO = 'PREDICTIVO',
  INSTALACION = 'INSTALACION',
}

export enum TechnicianStatus {
  DISPONIBLE = 'DISPONIBLE',
  OCUPADO = 'OCUPADO',
  EN_DESCANSO = 'EN_DESCANSO',
  INACTIVO = 'INACTIVO',
}

export enum InvoiceStatus {
  BORRADOR = 'BORRADOR',
  ENVIADA = 'ENVIADA',
  PAGADA = 'PAGADA',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL',
}

export enum EvidenceType {
  FOTO = 'FOTO',
  VIDEO = 'VIDEO',
  DOCUMENTO = 'DOCUMENTO',
  FIRMA = 'FIRMA',
}
