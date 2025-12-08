// ============================================
// PLANEACIÓN TYPES - Cermont FSM
// ============================================

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum EstadoPlaneacion {
    BORRADOR = 'borrador',
    EN_REVISION = 'en_revision',
    APROBADA = 'aprobada',
    EN_EJECUCION = 'en_ejecucion',
    COMPLETADA = 'completada',
    CANCELADA = 'cancelada',
}

export enum TipoItemPlaneacion {
    MATERIAL = 'MATERIAL',
    HERRAMIENTA = 'HERRAMIENTA',
    EQUIPO = 'EQUIPO',
    SEGURIDAD = 'SEGURIDAD',
}

// ============================================
// SCHEMAS - Validación con Zod
// ============================================

// Schema para herramienta
const herramientaSchema = z.object({
    nombre: z.string().min(1, 'Nombre requerido'),
    cantidad: z.number().int().positive('Cantidad debe ser positiva'),
    codigo: z.string().optional(),
});

// Schema para equipo
const equipoSchema = z.object({
    nombre: z.string().min(1, 'Nombre requerido'),
    cantidad: z.number().int().positive('Cantidad debe ser positiva'),
    certificacion: z.string().optional(),
});

// Schema para actividad del cronograma
const actividadSchema = z.object({
    nombre: z.string().min(1, 'Nombre de actividad requerido'),
    descripcion: z.string().optional(),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
    responsableId: z.string().uuid('ID de responsable inválido'),
    horasEstimadas: z.number().positive('Horas debe ser positivo'),
    orden: z.number().int().nonnegative(),
});

// Schema para asignación de mano de obra
const asignacionSchema = z.object({
    usuarioId: z.string().uuid('ID de usuario inválido'),
    rol: z.enum(['tecnico', 'supervisor', 'ayudante']),
    fechaInicio: z.coerce.date(),
    fechaFin: z.coerce.date(),
    horasEstimadas: z.number().positive(),
});

// Schema para item de planeación (materiales, herramientas, equipos, seguridad)
const itemPlaneacionSchema = z.object({
    tipo: z.nativeEnum(TipoItemPlaneacion),
    descripcion: z.string().min(1, 'Descripción requerida'),
    cantidad: z.number().int().positive('Cantidad debe ser positiva').default(1),
    unidad: z.string().default('UND'),
    observaciones: z.string().optional(),
});

// ============================================
// SCHEMAS PRINCIPALES
// ============================================

export const createPlaneacionSchema = z.object({
    ordenId: z.string().uuid('ID de orden inválido'),
    kitId: z.string().uuid('ID de kit inválido').optional(),
    
    // Campos del formulario OPE-001
    empresa: z.string().optional(),
    ubicacion: z.string().optional(),
    fechaEstimadaInicio: z.coerce.date().optional(),
    fechaEstimadaFin: z.coerce.date().optional(),
    descripcionTrabajo: z.string().optional(),
    
    cronograma: z.array(actividadSchema).optional().default([]),
    manoDeObra: z.array(asignacionSchema).optional().default([]),
    herramientasAdicionales: z.array(herramientaSchema).optional(),
    documentosApoyo: z.array(z.string()).optional(),
    observaciones: z.string().max(2000).optional(),
    
    // Items específicos del formulario
    items: z.array(itemPlaneacionSchema).optional(),
});

export const updatePlaneacionSchema = z.object({
    kitId: z.string().uuid().optional().nullable(),
    
    // Campos del formulario
    empresa: z.string().optional(),
    ubicacion: z.string().optional(),
    fechaEstimadaInicio: z.coerce.date().optional(),
    fechaEstimadaFin: z.coerce.date().optional(),
    descripcionTrabajo: z.string().optional(),
    
    cronograma: z.array(actividadSchema).optional(),
    manoDeObra: z.array(asignacionSchema).optional(),
    herramientasAdicionales: z.array(herramientaSchema).optional(),
    documentosApoyo: z.array(z.string()).optional(),
    observaciones: z.string().max(2000).optional(),
    
    // Items específicos
    items: z.array(itemPlaneacionSchema).optional(),
});

export const aprobarPlaneacionSchema = z.object({
    observaciones: z.string().max(500).optional(),
});

export const planeacionFiltersSchema = z.object({
    estado: z.nativeEnum(EstadoPlaneacion).optional(),
    kitId: z.string().uuid().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================
// TYPES
// ============================================

export type Herramienta = z.infer<typeof herramientaSchema>;
export type Equipo = z.infer<typeof equipoSchema>;
export type Actividad = z.infer<typeof actividadSchema>;
export type AsignacionManoObra = z.infer<typeof asignacionSchema>;

export type CreatePlaneacionDTO = z.infer<typeof createPlaneacionSchema>;
export type UpdatePlaneacionDTO = z.infer<typeof updatePlaneacionSchema>;
export type AprobarPlaneacionDTO = z.infer<typeof aprobarPlaneacionSchema>;
export type PlaneacionFilters = z.infer<typeof planeacionFiltersSchema>;
export type ItemPlaneacionInput = z.infer<typeof itemPlaneacionSchema>;

export interface ItemPlaneacion {
    id: string;
    planeacionId: string;
    tipo: TipoItemPlaneacion;
    descripcion: string;
    cantidad: number;
    unidad: string;
    observaciones?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Planeacion {
    id: string;
    ordenId: string;
    kitId?: string | null;
    estado: EstadoPlaneacion;
    
    // Campos del formulario OPE-001
    empresa?: string;
    ubicacion?: string;
    fechaEstimadaInicio?: Date;
    fechaEstimadaFin?: Date;
    descripcionTrabajo?: string;
    
    cronograma: Actividad[];
    manoDeObra: AsignacionManoObra[];
    herramientasAdicionales?: Herramienta[];
    documentosApoyo: string[];
    observaciones?: string;
    aprobadoPorId?: string;
    fechaAprobacion?: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface PlaneacionConRelaciones extends Planeacion {
    orden: {
        id: string;
        numero: string;
        descripcion: string;
        cliente: string;
        estado: string;
    };
    kit?: {
        id: string;
        nombre: string;
        descripcion: string;
    } | null;
    aprobadoPor?: {
        id: string;
        name: string;
        email: string;
    };
    items?: ItemPlaneacion[];
}
