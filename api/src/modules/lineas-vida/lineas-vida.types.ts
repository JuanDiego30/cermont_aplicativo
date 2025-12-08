// ============================================
// INSPECCIÓN LÍNEAS DE VIDA TYPES - Cermont FSM
// Formato OPE-006 - Inspección de líneas de vida verticales
// ============================================

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export enum EstadoInspeccion {
    CONFORME = 'CONFORME',
    NO_CONFORME = 'NO_CONFORME',
    PENDIENTE = 'PENDIENTE',
}

export enum EstadoCondicion {
    C = 'C',   // Conforme
    NC = 'NC', // No Conforme
}

// Componentes estándar según formato OPE-006
export const COMPONENTES_LINEA_VIDA = [
    'PLACA_ANCLAJE_SUPERIOR',
    'PLACA_ANCLAJE_INFERIOR', 
    'CABLE_PRINCIPAL',
    'TENSOR_INFERIOR',
    'CARRETILLA_ARRESTADOR',
    'ABSORBEDOR_ENERGIA',
    'PASACABLES_INTERMEDIOS',
] as const;

// Condiciones a evaluar por componente
export const CONDICIONES_COMPONENTE = [
    { tipo: 'GRIETAS', descripcion: 'Grietas o fisuras visibles' },
    { tipo: 'CORROSION', descripcion: 'Signos de corrosión u oxidación' },
    { tipo: 'DESGASTE', descripcion: 'Desgaste excesivo' },
    { tipo: 'DEFORMACION', descripcion: 'Deformación o pandeo' },
    { tipo: 'SOLDADURAS', descripcion: 'Estado de soldaduras' },
    { tipo: 'ANCLAJE', descripcion: 'Firmeza del anclaje' },
    { tipo: 'ROTULADO', descripcion: 'Rotulado/marcado legible' },
    { tipo: 'CABLES', descripcion: 'Estado de cables (hilos rotos, nudos)' },
    { tipo: 'CONECTORES', descripcion: 'Estado de conectores y mosquetones' },
    { tipo: 'MECANISMO', descripcion: 'Funcionamiento del mecanismo' },
] as const;

// ============================================
// SCHEMAS - Validación con Zod
// ============================================

// Schema para condición individual
const condicionSchema = z.object({
    tipoAfeccion: z.string().min(1, 'Tipo de afección requerido'),
    descripcion: z.string().min(1, 'Descripción requerida'),
    estado: z.enum(['C', 'NC']),
});

// Schema para componente
const componenteSchema = z.object({
    nombre: z.string().min(1, 'Nombre de componente requerido'),
    condiciones: z.array(condicionSchema).min(1, 'Al menos una condición requerida'),
    hallazgos: z.string().optional(),
    estado: z.enum(['C', 'NC']),
    accionCorrectiva: z.string().optional(),
});

// Schema para crear inspección
export const createInspeccionLineaVidaSchema = z.object({
    numeroLinea: z.string().min(1, 'Número de línea requerido'),
    fabricante: z.string().min(1, 'Fabricante requerido'),
    diametroCable: z.string().default('8mm'),
    tipoCable: z.string().default('Acero Inoxidable'),
    ubicacion: z.string().min(1, 'Ubicación requerida'),
    especificaciones: z.any().optional(),
    
    fechaInstalacion: z.coerce.date().optional(),
    fechaUltimoMantenimiento: z.coerce.date().optional(),
    
    componentes: z.array(componenteSchema).min(1, 'Al menos un componente debe evaluarse'),
    
    accionesCorrectivas: z.string().optional(),
    observaciones: z.string().optional(),
    fotosEvidencia: z.array(z.string()).optional(),
});

// Schema para actualizar inspección
export const updateInspeccionLineaVidaSchema = z.object({
    fabricante: z.string().optional(),
    diametroCable: z.string().optional(),
    tipoCable: z.string().optional(),
    ubicacion: z.string().optional(),
    especificaciones: z.any().optional(),
    
    fechaInstalacion: z.coerce.date().optional(),
    fechaUltimoMantenimiento: z.coerce.date().optional(),
    
    componentes: z.array(componenteSchema).optional(),
    
    estado: z.nativeEnum(EstadoInspeccion).optional(),
    accionesCorrectivas: z.string().optional(),
    observaciones: z.string().optional(),
    fotosEvidencia: z.array(z.string()).optional(),
});

// Schema para filtros
export const inspeccionLineaVidaFiltersSchema = z.object({
    estado: z.nativeEnum(EstadoInspeccion).optional(),
    ubicacion: z.string().optional(),
    inspectorId: z.string().uuid().optional(),
    fechaDesde: z.coerce.date().optional(),
    fechaHasta: z.coerce.date().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================
// TYPES
// ============================================

export type CondicionInput = z.infer<typeof condicionSchema>;
export type ComponenteInput = z.infer<typeof componenteSchema>;
export type CreateInspeccionLineaVidaDTO = z.infer<typeof createInspeccionLineaVidaSchema>;
export type UpdateInspeccionLineaVidaDTO = z.infer<typeof updateInspeccionLineaVidaSchema>;
export type InspeccionLineaVidaFilters = z.infer<typeof inspeccionLineaVidaFiltersSchema>;

export interface CondicionComponente {
    id: string;
    componenteId: string;
    tipoAfeccion: string;
    descripcion: string;
    estado: 'C' | 'NC';
    createdAt: Date;
    updatedAt: Date;
}

export interface ComponenteLineaVida {
    id: string;
    inspeccionId: string;
    nombre: string;
    condiciones: CondicionComponente[];
    hallazgos?: string;
    estado: 'C' | 'NC';
    accionCorrectiva?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface InspeccionLineaVida {
    id: string;
    numeroLinea: string;
    fabricante: string;
    diametroCable: string;
    tipoCable: string;
    ubicacion: string;
    especificaciones?: any;
    
    fechaInspeccion: Date;
    fechaInstalacion?: Date;
    fechaUltimoMantenimiento?: Date;
    
    inspectorId: string;
    estado: EstadoInspeccion;
    accionesCorrectivas?: string;
    observaciones?: string;
    fotosEvidencia: string[];
    
    componentes: ComponenteLineaVida[];
    
    createdAt: Date;
    updatedAt: Date;
}

export interface InspeccionLineaVidaConRelaciones extends InspeccionLineaVida {
    inspector: {
        id: string;
        name: string;
        email: string;
    };
}

// ============================================
// TEMPLATE DE INSPECCIÓN
// ============================================

// Template predefinido para crear una nueva inspección con todos los componentes
export const TEMPLATE_INSPECCION = COMPONENTES_LINEA_VIDA.map(nombre => ({
    nombre,
    estado: 'C' as const,
    hallazgos: '',
    accionCorrectiva: '',
    condiciones: CONDICIONES_COMPONENTE.map(cond => ({
        tipoAfeccion: cond.tipo,
        descripcion: cond.descripcion,
        estado: 'C' as const,
    })),
}));
