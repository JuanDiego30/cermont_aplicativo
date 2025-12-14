/**
 * @file tecnico.schema.ts
 * @description Schemas Zod para validación de técnicos
 */

import { z } from 'zod';

// Schema base para técnico
const TecnicoBaseSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .trim(),

  cargo: z.enum(
    ['Técnico Senior', 'Técnico de Campo', 'Supervisor HES', 'Aprendiz', 'Coordinador'] as const,
    {
      message: 'Selecciona un cargo válido',
    }
  ),

  especialidad: z
    .string()
    .min(3, 'La especialidad debe tener al menos 3 caracteres')
    .max(100, 'La especialidad no puede exceder 100 caracteres')
    .trim(),

  telefono: z
    .string()
    .min(10, 'El teléfono debe tener al menos 10 caracteres')
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .regex(/^\+?[\d\s-]+$/, 'Formato de teléfono inválido'),

  email: z
    .string()
    .email('Email inválido')
    .toLowerCase()
    .trim(),

  ubicacion: z
    .string()
    .min(2, 'La ubicación debe tener al menos 2 caracteres')
    .max(100, 'La ubicación no puede exceder 100 caracteres')
    .trim(),

  documento: z
    .string()
    .min(5, 'El documento debe tener al menos 5 caracteres')
    .max(20, 'El documento no puede exceder 20 caracteres')
    .optional(),
});

// Schema para crear técnico
export const CreateTecnicoSchema = TecnicoBaseSchema.extend({
  certificaciones: z.array(z.string()).optional(),
});

export type CreateTecnicoInput = z.infer<typeof CreateTecnicoSchema>;

// Schema para actualizar técnico (todos opcionales)
export const UpdateTecnicoSchema = TecnicoBaseSchema.partial().extend({
  estado: z.enum(['activo', 'inactivo', 'vacaciones']).optional(),
  disponible: z.boolean().optional(),
  certificaciones: z.array(z.string()).optional(),
});

export type UpdateTecnicoInput = z.infer<typeof UpdateTecnicoSchema>;

// Schema para filtros
export const FilterTecnicoSchema = z.object({
  search: z.string().optional(),
  disponible: z.enum(['todos', 'disponible', 'ocupado']).default('todos'),
  estado: z.enum(['activo', 'inactivo', 'vacaciones']).optional(),
  ubicacion: z.string().optional(),
  especialidad: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(12),
});

export type FilterTecnicoParams = z.infer<typeof FilterTecnicoSchema>;

// Schema para cambio de disponibilidad
export const ToggleDisponibilidadSchema = z.object({
  disponible: z.boolean(),
});

export type ToggleDisponibilidadInput = z.infer<typeof ToggleDisponibilidadSchema>;
