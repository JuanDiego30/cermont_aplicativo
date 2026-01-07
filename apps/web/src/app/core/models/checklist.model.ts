/**
 * Checklist Models
 * Models for checklists module matching backend DTOs
 */

export type ChecklistTipo = 'seguridad' | 'calidad' | 'herramientas' | 'epp' | 'general' | 'mantenimiento';

export type ChecklistStatus = 'PENDIENTE' | 'EN_PROGRESO' | 'COMPLETADO' | 'ARCHIVADO';

/**
 * Item de checklist para crear
 */
export interface ChecklistItemInputDto {
  label: string;
  isRequired?: boolean;
  orden?: number;
}

/**
 * DTO para crear un checklist
 */
export interface CreateChecklistDto {
  name: string;
  description?: string;
  tipo: string;
  categoria?: string;
  items: ChecklistItemInputDto[];
}

/**
 * Item de checklist en respuesta
 */
export interface ChecklistItemResponseDto {
  id: string;
  label: string;
  isRequired: boolean;
  isChecked: boolean;
  checkedAt?: string;
  observaciones?: string;
  orden: number;
}

/**
 * Response de un checklist
 */
export interface ChecklistResponseDto {
  id: string;
  name: string;
  description?: string;
  status: ChecklistStatus;
  tipo?: string;
  categoria?: string;
  items: ChecklistItemResponseDto[];
  ordenId?: string;
  ejecucionId?: string;
  templateId?: string;
  completada: boolean;
  completionRatio: number;
  completionPercentage: number;
  isTemplate: boolean;
  isAssigned: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query parameters para listar checklists
 */
export interface ListChecklistsQueryDto {
  page?: number;
  limit?: number;
  tipo?: string;
  categoria?: string;
  status?: ChecklistStatus;
  activo?: boolean;
  search?: string;
  ordenId?: string;
  ejecucionId?: string;
}

/**
 * Response paginado de checklists
 */
export interface PaginatedChecklistsResponseDto {
  items: ChecklistResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * DTO para asignar checklist a orden
 */
export interface AssignChecklistToOrdenDto {
  templateId: string;
  ordenId: string;
}

/**
 * DTO para asignar checklist a ejecución
 */
export interface AssignChecklistToEjecucionDto {
  templateId: string;
  ejecucionId: string;
}

/**
 * DTO para actualizar item de checklist
 */
export interface UpdateChecklistItemDto {
  observaciones?: string;
}

