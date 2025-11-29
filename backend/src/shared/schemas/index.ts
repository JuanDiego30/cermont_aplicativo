import { z } from 'zod';

// Auth Schemas
export const loginSchema = z.object({
    email: z.string().email().toLowerCase().trim(),
    password: z.string().min(6),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string(),
});

// Order Schemas
export const createOrderSchema = z.object({
    title: z.string().min(3).max(100),
    description: z.string().min(10),
    clientId: z.string().uuid(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    dueDate: z.string().datetime().optional(),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
