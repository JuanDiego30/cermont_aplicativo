import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum EstadoEjecucion {
    NO_INICIADA = 'NO_INICIADA',
    EN_PROGRESO = 'EN_PROGRESO',
    PAUSADA = 'PAUSADA',
    COMPLETADA = 'COMPLETADA',
    CANCELADA = 'CANCELADA',
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const createEjecucionSchema = z.object({
    ordenId: z.string().uuid('ID de orden inválido'),
    planeacionId: z.string().uuid('ID de planeación inválido'),
    fechaInicio: z.coerce.date(),
    ubicacionGPS: z.object({
        latitud: z.number(),
        longitud: z.number(),
    }).optional(),
    observacionesInicio: z.string().optional(),
});

export const updateEjecucionSchema = z.object({
    estado: z.nativeEnum(EstadoEjecucion).optional(),
    avancePercentaje: z.number().min(0).max(100).optional(),
    horasActuales: z.number().positive().optional(),
    observaciones: z.string().optional(),
    ubicacionGPS: z.object({
        latitud: z.number(),
        longitud: z.number(),
    }).optional(),
});

export const actualizarTareaSchema = z.object({
    tareaId: z.string().uuid('ID de tarea inválido'),
    completada: z.boolean(),
    horasReales: z.number().positive(),
    observaciones: z.string().optional(),
});

export const listEjecucionSchema = z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(100).optional().default(10),
    estado: z.nativeEnum(EstadoEjecucion).optional(),
});

// ============================================
// TYPES
// ============================================

export type CreateEjecucionDTO = z.infer<typeof createEjecucionSchema>;
export type UpdateEjecucionDTO = z.infer<typeof updateEjecucionSchema>;
export type ActualizarTareaDTO = z.infer<typeof actualizarTareaSchema>;
export type ListEjecucionQuery = z.infer<typeof listEjecucionSchema>;

export interface Ejecucion {
    id: string;
    ordenId: string;
    planeacionId: string;
    estado: EstadoEjecucion;
    avancePercentaje: number;
    horasActuales: number;
    horasEstimadas: number;
    fechaInicio: Date;
    fechaTermino?: Date;
    ubicacionGPS?: {
        latitud: number;
        longitud: number;
    };
    observacionesInicio?: string;
    observaciones?: string;
    tareas: TareaEjecucion[];
    checklists: ChecklistItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TareaEjecucion {
    id: string;
    ejecucionId: string;
    descripcion: string;
    completada: boolean;
    horasEstimadas: number;
    horasReales?: number;
    observaciones?: string;
    completadaEn?: Date;
}

export interface ChecklistItem {
    id: string;
    ejecucionId: string;
    item: string;
    completada: boolean;
    completadoPor?: string;
    completadoEn?: Date;
}
