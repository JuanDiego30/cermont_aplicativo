/**
 * @dto Auth DTOs
 * @description DTOs con validación Zod para autenticación
 * @layer Application
 */
import { z } from 'zod';

// ==========================================
// Login DTO
// ==========================================
export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email es requerido')
    .email('Email inválido')
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'), // Reducido de 8 a 6 para compatibilidad
  // ✅ Campo opcional para "Recordarme" - permite tokens de mayor duración
  rememberMe: z
    .boolean()
    .optional()
    .default(false),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// ==========================================
// Register DTO
// ==========================================
export const RegisterSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .transform((e) => e.toLowerCase().trim()),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  role: z
    .enum(['admin', 'supervisor', 'tecnico', 'administrativo'])
    .optional()
    .default('tecnico'),
  phone: z
    .string()
    .optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

// ==========================================
// Refresh Token DTO
// ==========================================
export const RefreshTokenSchema = z.object({
  refreshToken: z
    .string()
    .uuid('Token de refresco inválido')
    .optional(),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

// ==========================================
// Auth Response DTO
// ==========================================
export interface AuthUserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  phone?: string;
}

export interface LoginResponse {
  message: string;
  token: string;
  refreshToken?: string;
  user: AuthUserResponse;
}

export interface TokenResponse {
  token: string;
  refreshToken?: string;
}

export interface LogoutResponse {
  message: string;
}

export interface MeResponse {
  user: AuthUserResponse;
}

// ==========================================
// Request Context
// ==========================================
export interface AuthContext {
  ip?: string;
  userAgent?: string;
}
