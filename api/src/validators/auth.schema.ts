import { z } from 'zod';

// =====================
// Auth Validators
// =====================

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const registerSchema = z.object({
    email: z.string().email('Email inválido'),
    nombre: z.string().min(2, 'Mínimo 2 caracteres'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    role: z.enum(['ADMIN', 'SUPERVISOR', 'TECNICO', 'USER']).optional(),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido'),
});

// =====================
// Types
// =====================
export type LoginDto = z.infer<typeof loginSchema>;
export type RegisterDto = z.infer<typeof registerSchema>;
export type RefreshTokenDto = z.infer<typeof refreshTokenSchema>;
