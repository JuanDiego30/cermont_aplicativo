/**
 * @file api.types.ts
 * @description Shared TypeScript types for API entities
 * Eliminates ~180 lines of duplicate type definitions
 */

// ============================================
// Base Types
// ============================================

export interface BaseEntity {
    id: string;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export type EstadoOrden = 'planeacion' | 'ejecucion' | 'pausada' | 'completada' | 'cancelada';
export type Prioridad = 'baja' | 'media' | 'alta' | 'urgente' | 'critica';
export type DisponibilidadTecnico = 'disponible' | 'ocupado' | 'vacaciones' | 'baja';
export type Role = 'admin' | 'supervisor' | 'tecnico' | 'cliente';

// ============================================
// Entity Types
// ============================================

export interface User extends BaseEntity {
    email: string;
    name: string;
    phone?: string;
    role: Role;
    active: boolean;
}

export interface Orden extends BaseEntity {
    numero: string;
    descripcion: string;
    cliente: string;
    estado: EstadoOrden;
    prioridad: Prioridad;
    fechaInicio?: Date | string;
    fechaFin?: Date | string;
    fechaFinEstimada?: Date | string;
    presupuestoEstimado?: number;
    creadorId?: string;
    asignadoId?: string;
    creador?: { id: string; name: string };
    asignado?: { id: string; name: string };
}

export interface Tecnico extends BaseEntity {
    userId: string;
    nombre: string;
    email: string;
    telefono?: string;
    disponibilidad: DisponibilidadTecnico;
    especialidades: string[];
    ordenesActivas: number;
    ordenesCompletadas: number;
    calificacionPromedio?: number;
    active: boolean;
}

export interface Mantenimiento extends BaseEntity {
    ordenId: string;
    tipo: string;
    descripcion: string;
    estado: 'pendiente' | 'en_progreso' | 'completado';
    fechaProgramada?: Date | string;
    fechaEjecucion?: Date | string;
    tecnicoId?: string;
    orden?: Orden;
    tecnico?: Tecnico;
}

export interface Kit extends BaseEntity {
    codigo: string;
    nombre: string;
    descripcion?: string;
    estado: 'disponible' | 'en_uso' | 'mantenimiento' | 'baja';
    fechaVencimiento?: Date | string;
    ultimaInspeccion?: Date | string;
}

export interface Evidencia extends BaseEntity {
    ordenId: string;
    tipo: 'foto' | 'video' | 'documento';
    url: string;
    descripcion?: string;
    metadata?: Record<string, any>;
}

export interface Formulario extends BaseEntity {
    tipo: string;
    nombre: string;
    descripcion?: string;
    campos: FormularioCampo[];
    activo: boolean;
}

export interface FormularioCampo {
    nombre: string;
    label: string;
    tipo: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'signature';
    required?: boolean;
    options?: string[];
    placeholder?: string;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    data: T;
    message?: string;
}

export interface ApiListResponse<T> {
    data: T[];
    total: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
}

export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}

// ============================================
// DTO Types (for creating/updating)
// ============================================

export type CreateDTO<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateDTO<T extends BaseEntity> = Partial<CreateDTO<T>>;

export type CreateOrdenDTO = CreateDTO<Orden>;
export type UpdateOrdenDTO = UpdateDTO<Orden>;

export type CreateTecnicoDTO = CreateDTO<Tecnico>;
export type UpdateTecnicoDTO = UpdateDTO<Tecnico>;

export type CreateMantenimientoDTO = CreateDTO<Mantenimiento>;
export type UpdateMantenimientoDTO = UpdateDTO<Mantenimiento>;
