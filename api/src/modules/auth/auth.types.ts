/**
 * Definición de tipos y esquemas de validación Zod para autenticación en Cermont.
 * Proporciona DTOs tipados para login/register/reset password, interfaces para
 * respuestas de API y payloads JWT, enums de roles de usuario, y esquemas Zod
 * para validación de entrada en tiempo de compilación y runtime. Centraliza todas
 * las definiciones de tipos compartidas entre controller/service/tests para DRY.
 */

import { z } from 'zod';

// Esquemas de validación
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'supervisor', 'tecnico', 'administrativo']).default('tecnico'),
  phone: z.string().optional(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().optional(),
});

// Tipos derivados de esquemas
export type LoginDTO = z.infer<typeof loginSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;
export type RefreshDTO = z.infer<typeof refreshSchema>;

// Interfaces de respuesta
export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar: string | null;
  phone: string | null;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export type UserRole = 'admin' | 'supervisor' | 'tecnico' | 'administrativo';

