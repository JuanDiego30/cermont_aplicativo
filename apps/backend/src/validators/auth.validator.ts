/**
 * @file auth.validator.ts
 * @description Esquemas de validación Zod para autenticación
 */

import { z } from 'zod';

// Esquema de validación de contraseña robusta
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: z.string().min(1, 'Password is required')
  })
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format').toLowerCase(),
    password: passwordSchema,
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    role: z.enum([
      'gerente',
      'ing_residente',
      'coordinador_admin',
      'coordinador_hes',
      'supervisor',
      'tecnico_electricista',
      'auxiliar',
      'pasante',
      'oficial_construccion'
    ])
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
}).refine((data) => data.body.newPassword === data.body.confirmPassword, {
  message: 'Passwords do not match',
  path: ['body', 'confirmPassword']
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required')
  })
});

export const enable2FASchema = z.object({
  body: z.object({
    code: z.string().length(6, '2FA code must be 6 digits').regex(/^\d+$/, 'Code must be numeric')
  })
});
