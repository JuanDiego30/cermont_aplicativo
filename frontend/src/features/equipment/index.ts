/**
 * Equipment Feature - Index
 * Barrel exports for equipment feature
 * 
 * @file frontend/src/features/equipment/index.ts
 */

// Types
export type {
  CertifiedEquipment,
  Certification,
  MaintenanceSchedule,
  CertificationAlert,
  EquipmentFilters,
  CreateEquipmentDTO,
  UpdateEquipmentDTO,
  EquipmentStats,
  EquipmentCategory,
  EquipmentStatus,
  AlertSeverity,
} from './types/equipment.types';

export {
  CATEGORY_LABELS,
  STATUS_CONFIG,
  SEVERITY_CONFIG,
} from './types/equipment.types';

// API
export { equipmentApi } from './api/equipment-service';

// Hooks
export {
  useEquipmentList,
  useEquipment,
  useCreateEquipment,
  useUpdateEquipment,
  useDeleteEquipment,
  useEquipmentAlerts,
  useEquipmentStats,
  useAssignEquipment,
  useReleaseEquipment,
} from './hooks/useEquipment';

// Components
export { EquipmentList } from './components/EquipmentList';
export { CertificationAlerts } from './components/CertificationAlerts';
