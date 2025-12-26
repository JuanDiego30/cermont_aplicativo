/**
 * Tecnico Model - Sincronizado con backend NestJS
 */

export enum DisponibilidadLevel {
  DISPONIBLE = 'disponible',
  OCUPADO = 'ocupado',
  NO_DISPONIBLE = 'no_disponible',
  EN_VACACIONES = 'en_vacaciones'
}

export interface Tecnico {
  id: string;
  name: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  disponibilidad: DisponibilidadLevel;
  activo: boolean;
  ordenesAsignadas?: number;
  ordenesCompletadas?: number;
  eficiencia?: number;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface QueryTecnicosDto {
  search?: string;
  active?: boolean;
  disponibilidad?: DisponibilidadLevel;
}

export interface PaginatedTecnicos {
  data: Tecnico[];
  total: number;
}

