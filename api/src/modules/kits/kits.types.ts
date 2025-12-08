// ============================================
// KITS TÍPICOS TYPES - Cermont FSM
// ============================================

import { z } from 'zod';

// Schema para herramienta
export const herramientaSchema = z.object({
    nombre: z.string().min(1, 'Nombre de herramienta requerido'),
    cantidad: z.number().int().positive('Cantidad debe ser positiva'),
    codigo: z.string().optional(),
    descripcion: z.string().optional(),
});

// Schema para equipo
export const equipoSchema = z.object({
    nombre: z.string().min(1, 'Nombre de equipo requerido'),
    cantidad: z.number().int().positive('Cantidad debe ser positiva'),
    certificacion: z.string().optional(),
    especificaciones: z.string().optional(),
});

// Schema para crear kit
export const createKitSchema = z.object({
    nombre: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
    descripcion: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
    herramientas: z.array(herramientaSchema).min(1, 'Se requiere al menos una herramienta'),
    equipos: z.array(equipoSchema).default([]),
    documentos: z.array(z.string()).default([]),
    checklistItems: z.array(z.string()).min(1, 'Se requiere al menos un item de checklist'),
    duracionEstimadaHoras: z.number().int().positive('Duración debe ser positiva'),
    costoEstimado: z.number().nonnegative('Costo no puede ser negativo'),
});

// Schema para actualizar kit
export const updateKitSchema = createKitSchema.partial().extend({
    activo: z.boolean().optional(),
});

// Schema para filtros de búsqueda
export const kitFiltersSchema = z.object({
    search: z.string().optional(),
    activo: z.preprocess(
        (val) => val === 'true' ? true : val === 'false' ? false : undefined,
        z.boolean().optional()
    ),
    page: z.preprocess(
        (val) => parseInt(val as string, 10) || 1,
        z.number().int().positive().default(1)
    ),
    limit: z.preprocess(
        (val) => parseInt(val as string, 10) || 20,
        z.number().int().positive().max(100).default(20)
    ),
});

// TypeScript types
export type Herramienta = z.infer<typeof herramientaSchema>;
export type Equipo = z.infer<typeof equipoSchema>;
export type CreateKitInput = z.infer<typeof createKitSchema>;
export type UpdateKitInput = z.infer<typeof updateKitSchema>;
export type KitFilters = z.infer<typeof kitFiltersSchema>;
