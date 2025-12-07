import { z } from 'zod';

export const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    role: z.enum(['admin', 'supervisor', 'tecnico', 'administrativo']).default('tecnico'),
    phone: z.string().optional(),
});

export const updateUserSchema = z.object({
    name: z.string().optional(),
    role: z.enum(['admin', 'supervisor', 'tecnico', 'administrativo']).optional(),
    phone: z.string().optional(),
    active: z.boolean().optional(),
    avatar: z.string().optional(),
});

export const userFiltersSchema = z.object({
    role: z.string().optional(),
    active: z.string().optional(),
    search: z.string().optional(),
    page: z.coerce.number().optional().default(1),
    limit: z.coerce.number().optional().default(10),
});

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserFiltersDTO = z.infer<typeof userFiltersSchema>;
