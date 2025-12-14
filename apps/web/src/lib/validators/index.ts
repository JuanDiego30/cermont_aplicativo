/**
 * ARCHIVO: validators/index.ts
 * FUNCION: Schemas de validación Zod para formularios y entidades del sistema
 * IMPLEMENTACION: Zod schemas con mensajes en español, validaciones de campos
 *                 requeridos, formatos email/UUID y restricciones de longitud
 * DEPENDENCIAS: zod
 * EXPORTS: Schemas (login, register, order, workPlan, user) y tipos inferidos
 */
import { z } from 'zod';
// Auth validators
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    nombre: z.string().min(2, 'Mínimo 2 caracteres'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
});

// Order validators
export const createOrderSchema = z.object({
    numero: z.string().min(1, 'Número requerido'),
    cliente: z.string().min(1, 'Cliente requerido'),
    descripcion: z.string().optional(),
    items: z.array(z.object({
        descripcion: z.string().min(1, 'Descripción requerida'),
        cantidad: z.number().positive('Cantidad debe ser positiva'),
        precio: z.number().positive('Precio debe ser positivo'),
    })).min(1, 'Debe tener al menos un item'),
});

export const updateOrderSchema = createOrderSchema.partial();

// Work Plan validators
export const createWorkPlanSchema = z.object({
    titulo: z.string().min(1, 'Título requerido'),
    descripcion: z.string().optional(),
    ordenId: z.string().uuid('ID de orden inválido'),
    fechaInicio: z.string().optional(),
    fechaFin: z.string().optional(),
});

// User validators
export const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    nombre: z.string().min(2, 'Mínimo 2 caracteres'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    role: z.enum(['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']).optional(),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type CreateOrderData = z.infer<typeof createOrderSchema>;
export type UpdateOrderData = z.infer<typeof updateOrderSchema>;
export type CreateWorkPlanData = z.infer<typeof createWorkPlanSchema>;
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
