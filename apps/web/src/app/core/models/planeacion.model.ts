/**
 * Planeacion Model - TypeScript interfaces for order planning
 * @see apps/api/src/modules/planeacion/
 * @see apps/api/prisma/schema.prisma enum EstadoPlaneacion
 */

export enum PlaneacionEstado {
    BORRADOR = 'borrador',
    EN_REVISION = 'en_revision',
    APROBADA = 'aprobada',
    EN_EJECUCION = 'en_ejecucion',
    COMPLETADA = 'completada',
    CANCELADA = 'cancelada',
}

export interface ActividadPlaneacion {
    id?: string;
    descripcion: string;
    duracionEstimada: number;
    orden: number;
    completada?: boolean;
}

export interface RecursoPlaneacion {
    id?: string;
    nombre: string;
    cantidad: number;
    tipo: 'HERRAMIENTA' | 'EQUIPO' | 'MATERIAL' | 'PERSONAL';
    costo?: number;
}

export interface Planeacion {
    id: string;
    ordenId: string;
    estado: PlaneacionEstado;
    fechaInicio?: string;
    fechaFin?: string;
    actividades: ActividadPlaneacion[];
    recursosNecesarios: RecursoPlaneacion[];
    observaciones?: string;
    aprobadoPor?: string;
    aprobadoEn?: string;
    rechazadoPor?: string;
    rechazadoEn?: string;
    motivoRechazo?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlaneacionDto {
    fechaInicio?: string;
    fechaFin?: string;
    actividades?: ActividadPlaneacion[];
    recursosNecesarios?: RecursoPlaneacion[];
    observaciones?: string;
}

export interface RechazarPlaneacionDto {
    motivo: string;
}

export interface PlaneacionResponse {
    message: string;
    data: Planeacion;
}
