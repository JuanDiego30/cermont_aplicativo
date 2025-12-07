import { z } from 'zod';

export const createOrderSchema = z.object({
    descripcion: z.string().min(10, 'Descripción debe tener al menos 10 caracteres'),
    cliente: z.string().min(1, 'Cliente requerido'),
    prioridad: z.enum(['baja', 'media', 'alta', 'urgente']).default('media'),
    fechaFinEstimada: z.string().optional(),
    asignadoId: z.string().uuid().optional(),
});

export const updateOrderSchema = z.object({
    descripcion: z.string().optional(),
    cliente: z.string().optional(),
    estado: z.enum(['planeacion', 'ejecucion', 'pausada', 'completada', 'cancelada']).optional(),
    prioridad: z.enum(['baja', 'media', 'alta', 'urgente']).optional(),
    fechaFinEstimada: z.string().optional(),
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
    asignadoId: z.string().uuid().optional().nullable(),
});

export const orderFiltersSchema = z.object({
    estado: z.string().optional(),
    prioridad: z.string().optional(),
    cliente: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(10),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateOrderDTO = z.infer<typeof updateOrderSchema>;
export type OrderFiltersDTO = z.infer<typeof orderFiltersSchema>;

export type OrderStatus = 'planeacion' | 'ejecucion' | 'pausada' | 'completada' | 'cancelada';
export type OrderPriority = 'baja' | 'media' | 'alta' | 'urgente';
