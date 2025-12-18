
export type PrioridadMantenimiento = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type TipoMantenimiento = 'PREVENTIVO' | 'CORRECTIVO' | 'PREDICTIVO';
export type EstadoMantenimiento = 'PROGRAMADO' | 'EN_PROGRESO' | 'COMPLETADO' | 'CANCELADO';

export interface Mantenimiento {
    id: string;
    equipoId: string;
    tipo: TipoMantenimiento;
    estado: EstadoMantenimiento;
    prioridad: PrioridadMantenimiento;
    titulo: string;
    descripcion?: string | null;
    fechaProgramada: string; // Date string
    fechaInicio?: string | null;
    fechaFin?: string | null;
    tecnicoAsignadoId?: string | null;
    estimacionHoras?: number | null;
    horasReales?: number | null;
    costoTotal?: number | null;
    creadoPorId?: string | null;
    createdAt: string;
    updatedAt: string;
    // Relaciones opcionales para UI
    equipo?: { id: string; nombre: string; codigo: string };
    tecnicoAsignado?: { id: string; name: string; email: string };
}

export interface CreateMantenimientoInput {
    equipoId: string;
    tipo: TipoMantenimiento;
    titulo: string;
    descripcion?: string;
    fechaProgramada: string;
    prioridad?: PrioridadMantenimiento;
    tecnicoAsignadoId?: string;
}

export interface MantenimientoFilters {
    equipoId?: string;
    tipo?: TipoMantenimiento;
    estado?: EstadoMantenimiento;
    tecnicoId?: string;
    fechaDesde?: string;
    fechaHasta?: string;
}
