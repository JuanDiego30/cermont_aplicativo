// ============================================
// FORMULARIOS TYPES - Cermont FSM
// Tipos para formularios dinámicos
// ============================================

import { z } from 'zod';

// ============================================
// TIPOS DE CAMPOS
// ============================================

export enum TipoCampo {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  DATE = 'date',
  TIME = 'time',
  DATETIME = 'datetime',
  FILE = 'file',
  IMAGE = 'image',
  SIGNATURE = 'signature',
  LOCATION = 'location',
  EMAIL = 'email',
  PHONE = 'phone',
  RATING = 'rating',
  SECTION = 'section',
}

// ============================================
// ZOD SCHEMAS
// ============================================

export const campoFormularioSchema = z.object({
  id: z.string(),
  tipo: z.nativeEnum(TipoCampo),
  etiqueta: z.string(),
  nombre: z.string(), // Campo para usar en respuestas
  placeholder: z.string().optional(),
  descripcion: z.string().optional(),
  requerido: z.boolean().default(false),
  opciones: z.array(z.object({
    valor: z.string(),
    etiqueta: z.string(),
  })).optional(),
  validaciones: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    mensaje: z.string().optional(),
  }).optional(),
  condicion: z.object({
    campoId: z.string(),
    operador: z.enum(['equals', 'notEquals', 'contains', 'greaterThan', 'lessThan']),
    valor: z.any(),
  }).optional(),
  orden: z.number(),
});

export const schemaFormularioSchema = z.object({
  campos: z.array(campoFormularioSchema),
  version: z.number().default(1),
  configuracion: z.object({
    permitirBorradores: z.boolean().default(true),
    notificarAlCompletar: z.boolean().default(false),
    emailsNotificacion: z.array(z.string().email()).optional(),
  }).optional(),
});

export const crearTemplateSchema = z.object({
  nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  descripcion: z.string().optional(),
  schema: schemaFormularioSchema,
});

export const actualizarTemplateSchema = z.object({
  nombre: z.string().min(3).max(100).optional(),
  descripcion: z.string().optional(),
  schema: schemaFormularioSchema.optional(),
  activo: z.boolean().optional(),
});

export const guardarRespuestaSchema = z.object({
  templateId: z.string().uuid('ID de template inválido'),
  ordenId: z.string().uuid('ID de orden inválido').optional(),
  respuestas: z.record(z.string(), z.any()), // Objeto clave-valor con respuestas
});

// ============================================
// INTERFACES
// ============================================

export interface CampoFormulario {
  id: string;
  tipo: TipoCampo;
  etiqueta: string;
  nombre: string;
  placeholder?: string;
  descripcion?: string;
  requerido: boolean;
  opciones?: { valor: string; etiqueta: string }[];
  validaciones?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    mensaje?: string;
  };
  condicion?: {
    campoId: string;
    operador: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
    valor: any;
  };
  orden: number;
}

export interface SchemaFormulario {
  campos: CampoFormulario[];
  version: number;
  configuracion?: {
    permitirBorradores: boolean;
    notificarAlCompletar: boolean;
    emailsNotificacion?: string[];
  };
}

export interface FormularioTemplate {
  id: string;
  nombre: string;
  descripcion?: string;
  schema: SchemaFormulario;
  version: number;
  activo: boolean;
  creadoPorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormularioRespuesta {
  id: string;
  templateId: string;
  template?: FormularioTemplate;
  ordenId?: string;
  respuestas: Record<string, any>;
  completadoPorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CrearTemplateInput = z.infer<typeof crearTemplateSchema>;
export type ActualizarTemplateInput = z.infer<typeof actualizarTemplateSchema>;
export type GuardarRespuestaInput = z.infer<typeof guardarRespuestaSchema>;
