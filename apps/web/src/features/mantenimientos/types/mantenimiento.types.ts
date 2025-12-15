/**
 * ARCHIVO: mantenimiento.types.ts
 * FUNCION: Definiciones de tipos TypeScript para el módulo de Mantenimientos
 * IMPLEMENTACION: Define tipos, interfaces y DTOs para mantenimientos
 * DEPENDENCIAS: Ninguna (tipos puros)
 * EXPORTS: TipoMantenimiento, EstadoMantenimiento, Mantenimiento, CreateMantenimientoInput, MantenimientoFilters
 */
export type TipoMantenimiento = 'preventivo' | 'correctivo' | 'predictivo';
export type EstadoMantenimiento = 'programado' | 'en_proceso' | 'completado' | 'cancelado';

export interface Mantenimiento {
    id: string;
    ordenId: string;
    equipos: string[]; // IDs de equipos
    tipo: TipoMantenimiento;
    estado: EstadoMantenimiento;
    fechaProgramada: string;
    fechaRealizacion?: string;
    tecnicoId?: string;
    observaciones?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMantenimientoInput {
    ordenId: string;
    equipos: string[];
    tipo: TipoMantenimiento;
    fechaProgramada: string;
    observaciones?: string;
}

export interface MantenimientoFilters {
    ordenId?: string;
    tipo?: TipoMantenimiento;
    estado?: EstadoMantenimiento;
    fechaDesde?: string;
    fechaHasta?: string;
    tecnicoId?: string;
}
