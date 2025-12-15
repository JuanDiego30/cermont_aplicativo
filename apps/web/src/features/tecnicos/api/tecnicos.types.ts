/**
 * ARCHIVO: tecnicos.types.ts
 * FUNCION: Definiciones de tipos TypeScript para el módulo técnicos
 * IMPLEMENTACION: Union types, interfaces para entidades, filtros, stats e inputs
 * DEPENDENCIAS: Ninguna (archivo de tipos puros)
 * EXPORTS: TecnicoEstado, TecnicoCargo, Tecnico, TecnicoFilters, TecnicoStats, CreateTecnicoInput, UpdateTecnicoInput, PaginatedTecnicos
 */
// Enums como union types (mejor para TypeScript)
export type TecnicoEstado = 'activo' | 'inactivo' | 'vacaciones';
export type TecnicoCargo = 
  | 'Técnico Senior' 
  | 'Técnico de Campo' 
  | 'Supervisor HES' 
  | 'Aprendiz'
  | 'Coordinador';

// Certificación
export interface Certificacion {
  id: string;
  nombre: string;
  fechaExpedicion: string;
  fechaVencimiento?: string;
  entidad: string;
}

// Entidad principal
export interface Tecnico {
  id: string;
  nombre: string;
  cargo: TecnicoCargo;
  especialidad: string;
  certificaciones: Certificacion[] | string[];
  telefono: string;
  email: string;
  estado: TecnicoEstado;
  ubicacion: string;
  ordenesCompletadas: number;
  calificacion: number;
  disponible: boolean;
  avatar?: string;
  fechaIngreso?: string;
  documento?: string;
}

// Filtros para búsqueda
export interface TecnicoFilters {
  search?: string;
  disponible?: 'todos' | 'disponible' | 'ocupado';
  estado?: TecnicoEstado;
  ubicacion?: string;
  especialidad?: string;
  page?: number;
  pageSize?: number;
}

// Estadísticas
export interface TecnicoStats {
  total: number;
  disponibles: number;
  enServicio: number;
  calificacionPromedio: number;
  ordenesCompletadasTotal: number;
}

// Input para crear técnico
export interface CreateTecnicoInput {
  nombre: string;
  cargo: TecnicoCargo;
  especialidad: string;
  telefono: string;
  email: string;
  ubicacion: string;
  documento?: string;
  certificaciones?: string[];
}

// Input para actualizar técnico
export interface UpdateTecnicoInput extends Partial<CreateTecnicoInput> {
  estado?: TecnicoEstado;
  disponible?: boolean;
}

// Respuesta paginada
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export type PaginatedTecnicos = PaginatedResponse<Tecnico>;
