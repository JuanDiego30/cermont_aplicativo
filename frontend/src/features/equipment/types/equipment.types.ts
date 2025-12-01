/**
 * Types: Equipment
 * Tipos TypeScript para equipos certificados
 * 
 * @file frontend/src/features/equipment/types/equipment.types.ts
 */

export type EquipmentCategory = 'TOOL' | 'EQUIPMENT' | 'PPE' | 'VEHICLE' | 'INSTRUMENT';

export type EquipmentStatus = 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE' | 'EXPIRED' | 'RETIRED';

export type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Certification {
  type: string;
  number: string;
  issueDate: string;
  expiryDate: string;
  issuedBy: string;
  documentUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface MaintenanceSchedule {
  lastMaintenance: string;
  nextMaintenance: string;
  frequencyInDays: number;
  maintenanceType: string;
  lastMaintenanceBy?: string;
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
  certification: Certification;
  additionalCertifications?: Certification[];
  maintenanceSchedule?: MaintenanceSchedule;
  status: EquipmentStatus;
  location?: string;
  assignedTo?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export interface CertificationAlert {
  equipment: CertifiedEquipment;
  daysUntilExpiry: number;
  severity: AlertSeverity;
  message: string;
}

export interface EquipmentFilters {
  category?: EquipmentCategory;
  status?: EquipmentStatus;
  search?: string;
  location?: string;
  assignedTo?: string;
  page?: number;
  limit?: number;
}

export interface CreateEquipmentDTO {
  name: string;
  description?: string;
  category: EquipmentCategory;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  certification: {
    type: string;
    number: string;
    issueDate: string;
    expiryDate: string;
    issuedBy: string;
    documentUrl?: string;
    notes?: string;
  };
  maintenanceSchedule?: {
    lastMaintenance: string;
    frequencyInDays: number;
    maintenanceType: string;
    notes?: string;
  };
  location?: string;
}

export interface UpdateEquipmentDTO extends Partial<CreateEquipmentDTO> {
  status?: EquipmentStatus;
  assignedTo?: string;
}

export interface EquipmentStats {
  byStatus: Record<EquipmentStatus, number>;
  byCategory: Record<EquipmentCategory, number>;
  total: number;
}

export interface PaginatedEquipmentResponse {
  data: CertifiedEquipment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface AlertsResponse {
  data: CertificationAlert[];
  meta: {
    total: number;
    high: number;
    medium: number;
    low: number;
  };
}

// Category labels
export const CATEGORY_LABELS: Record<EquipmentCategory, string> = {
  TOOL: 'Herramienta',
  EQUIPMENT: 'Equipo',
  PPE: 'EPP',
  VEHICLE: 'Vehículo',
  INSTRUMENT: 'Instrumento',
};

// Status labels and colors
export const STATUS_CONFIG: Record<EquipmentStatus, { label: string; color: string }> = {
  AVAILABLE: { label: 'Disponible', color: 'success' },
  IN_USE: { label: 'En Uso', color: 'info' },
  MAINTENANCE: { label: 'Mantenimiento', color: 'warning' },
  EXPIRED: { label: 'Vencido', color: 'error' },
  RETIRED: { label: 'Retirado', color: 'neutral' },
};

// Severity config
export const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string; icon: string }> = {
  HIGH: { label: 'Alta', color: 'error', icon: '🔴' },
  MEDIUM: { label: 'Media', color: 'warning', icon: '🟡' },
  LOW: { label: 'Baja', color: 'info', icon: '🟢' },
};
