import { z } from 'zod';

// =====================
// Order Validators
// =====================

const ordenItemSchema = z.object({
    descripcion: z.string().min(1, 'Descripción requerida'),
    cantidad: z.number().positive('Cantidad debe ser positiva'),
    precio: z.number().positive('Precio debe ser positivo'),
});

export const createOrdenSchema = z.object({
    numero: z.string().min(1, 'Número requerido'),
    cliente: z.string().min(1, 'Cliente requerido'),
    descripcion: z.string().optional(),
    fechaRecepcion: z.string().optional(),
    fechaEntrega: z.string().optional(),
    items: z.array(ordenItemSchema).min(1, 'Debe tener al menos un item').optional(),
});

export const updateOrdenSchema = createOrdenSchema.partial();

export const listOrdenesSchema = z.object({
    page: z.coerce.number().positive().optional().default(1),
    limit: z.coerce.number().positive().max(100).optional().default(10),
    estado: z.enum(['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA']).optional(),
    cliente: z.string().optional(),
    search: z.string().optional(),
});

// =====================
// Types
// =====================
export type CreateOrdenDto = z.infer<typeof createOrdenSchema>;
export type UpdateOrdenDto = z.infer<typeof updateOrdenSchema>;
export type ListOrdenesQuery = z.infer<typeof listOrdenesSchema>;
