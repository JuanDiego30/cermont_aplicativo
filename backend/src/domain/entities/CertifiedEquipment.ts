/**
 * Domain Entity: CertifiedEquipment
 * Representa equipos y herramientas con certificaciones vigentes
 * 
 * Resuelve: Falla #1 - Falta de control de certificaciones
 * @file backend/src/domain/entities/CertifiedEquipment.ts
 */

export enum EquipmentCategory {
  TOOL = 'TOOL',           // Herramientas manuales
  EQUIPMENT = 'EQUIPMENT', // Equipos eléctricos/mecánicos
  PPE = 'PPE',             // Elementos de protección personal
  VEHICLE = 'VEHICLE',     // Vehículos y transporte
  INSTRUMENT = 'INSTRUMENT', // Instrumentos de medición
}

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',       // Disponible para uso
  IN_USE = 'IN_USE',             // Actualmente en uso
  MAINTENANCE = 'MAINTENANCE',   // En mantenimiento
  EXPIRED = 'EXPIRED',           // Certificación vencida
  RETIRED = 'RETIRED',           // Dado de baja
}

export interface Certification {
  type: string;              // "ISO 9001", "RETIE", "ANSI Z87.1", etc.
  number: string;            // Número de certificación
  issueDate: Date;           // Fecha de emisión
  expiryDate: Date;          // Fecha de vencimiento
  issuedBy: string;          // Entidad certificadora
  documentUrl?: string;      // URL del documento (PDF)
  verifiedBy?: string;       // Usuario que verificó
  verifiedAt?: Date;         // Fecha de verificación
  notes?: string;            // Notas adicionales
}

export interface MaintenanceSchedule {
  lastMaintenance: Date;     // Última fecha de mantenimiento
  nextMaintenance: Date;     // Próxima fecha programada
  frequencyInDays: number;   // Frecuencia en días (ej: 90, 180, 365)
  maintenanceType: string;   // Tipo de mantenimiento
  lastMaintenanceBy?: string; // Realizado por
  notes?: string;
}

export interface CertifiedEquipment {
  id: string;
  name: string;
  description?: string;
  category: EquipmentCategory;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  
  // Certificación principal
  certification: Certification;
  
  // Certificaciones adicionales (opcional)
  additionalCertifications?: Certification[];
  
  // Mantenimiento
  maintenanceSchedule?: MaintenanceSchedule;
  
  // Estado
  status: EquipmentStatus;
  location?: string;         // Ubicación física
  assignedTo?: string | null;       // Usuario asignado (si está en uso)
  
  // Auditoría
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

/**
 * Tipo para creación de nuevo equipo
 */
export type CreateCertifiedEquipmentDTO = Omit<
  CertifiedEquipment,
  'id' | 'createdAt' | 'updatedAt' | 'lastUsedAt'
>;

/**
 * Tipo para actualización de equipo
 */
export type UpdateCertifiedEquipmentDTO = Partial<
  Omit<CertifiedEquipment, 'id' | 'createdBy' | 'createdAt'>
>;

/**
 * Helper: Determina si la certificación está próxima a vencer
 */
export function isCertificationExpiringSoon(
  expiryDate: Date,
  daysThreshold: number = 30
): boolean {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays > 0;
}

/**
 * Helper: Determina si la certificación está vencida
 */
export function isCertificationExpired(expiryDate: Date): boolean {
  return expiryDate < new Date();
}

/**
 * Helper: Calcula días hasta el vencimiento
 */
export function getDaysUntilExpiry(expiryDate: Date): number {
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Helper: Determina el estado del equipo basado en certificación
 */
export function determineEquipmentStatus(
  currentStatus: EquipmentStatus,
  certification: Certification
): EquipmentStatus {
  // Si está retirado, mantener ese estado
  if (currentStatus === EquipmentStatus.RETIRED) {
    return currentStatus;
  }

  // Si está en mantenimiento, mantener ese estado
  if (currentStatus === EquipmentStatus.MAINTENANCE) {
    return currentStatus;
  }

  // Verificar certificación
  if (isCertificationExpired(certification.expiryDate)) {
    return EquipmentStatus.EXPIRED;
  }

  // Si está en uso, mantener
  if (currentStatus === EquipmentStatus.IN_USE) {
    return currentStatus;
  }

  // Por defecto, disponible
  return EquipmentStatus.AVAILABLE;
}
