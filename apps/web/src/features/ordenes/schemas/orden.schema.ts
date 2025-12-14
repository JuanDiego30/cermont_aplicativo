/**
 * @file orden.schema.ts
 * @description Esquemas Zod para validación de órdenes
 */

import { z } from 'zod';

// ============================================
// ENUMS
// ============================================

export const EstadoOrdenEnum = z.enum([
  'planeacion',
  'ejecucion',
  'completada',
  'pausada',
  'cancelada',
]);

export const PrioridadOrdenEnum = z.enum([
  'urgente',
  'alta',
  'media',
  'baja',
]);

export const TipoOrdenEnum = z.enum([
  'Mantenimiento preventivo',
  'Mantenimiento correctivo',
  'Inspección técnica',
  'Instalación de equipos',
  'Reparación correctiva',
  'Auditoría de seguridad',
]);

// ============================================
// CREATE SCHEMA
// ============================================

export const CreateOrdenSchema = z.object({
  clienteId: z
    .string()
    .min(1, 'El cliente es requerido')
    .uuid('ID de cliente inválido'),
  
  ubicacion: z
    .string()
    .min(1, 'La ubicación es requerida')
    .min(3, 'La ubicación debe tener al menos 3 caracteres')
    .max(200, 'La ubicación no puede exceder 200 caracteres'),
  
  tecnicoId: z
    .string()
    .uuid('ID de técnico inválido')
    .optional()
    .nullable(),
  
  tipo: TipoOrdenEnum,
  
  prioridad: PrioridadOrdenEnum.default('media'),
  
  descripcion: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  
  fechaProgramada: z
    .string()
    .min(1, 'La fecha programada es requerida')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
});

export type CreateOrdenFormData = z.infer<typeof CreateOrdenSchema>;

// ============================================
// UPDATE SCHEMA
// ============================================

export const UpdateOrdenSchema = CreateOrdenSchema.partial().extend({
  estado: EstadoOrdenEnum.optional(),
});

export type UpdateOrdenFormData = z.infer<typeof UpdateOrdenSchema>;

// ============================================
// FILTER SCHEMA
// ============================================

export const OrdenFilterSchema = z.object({
  search: z.string().optional(),
  estado: EstadoOrdenEnum.or(z.literal('todos')).optional(),
  prioridad: PrioridadOrdenEnum.or(z.literal('todos')).optional(),
  tecnicoId: z.string().uuid().optional(),
  clienteId: z.string().uuid().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

// ============================================
// CHANGE STATUS SCHEMA
// ============================================

export const ChangeEstadoSchema = z.object({
  estado: EstadoOrdenEnum,
  motivo: z.string().max(500).optional(),
});

export type ChangeEstadoFormData = z.infer<typeof ChangeEstadoSchema>;
