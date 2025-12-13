/**
 * @dto Usuario DTOs
 * @description DTOs con validación Zod para usuarios
 * @layer Application
 */
import { z } from 'zod';

// ==========================================
// Create Usuario DTO
// ==========================================
export const CreateUsuarioSchema = z.object({
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
    .default('tecnico'),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
});

export type CreateUsuarioDto = z.infer<typeof CreateUsuarioSchema>;

// ==========================================
// Update Usuario DTO
// ==========================================
export const UpdateUsuarioSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .transform((e) => e.toLowerCase().trim())
    .optional(),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .optional(),
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  role: z
    .enum(['admin', 'supervisor', 'tecnico', 'administrativo'])
    .optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
  active: z.boolean().optional(),
});

export type UpdateUsuarioDto = z.infer<typeof UpdateUsuarioSchema>;

// ==========================================
// Query Usuario DTO
// ==========================================
export const UsuarioQuerySchema = z.object({
  role: z.enum(['admin', 'supervisor', 'tecnico', 'administrativo']).optional(),
  active: z.preprocess(
    (val) => val === 'true' ? true : val === 'false' ? false : val,
    z.boolean().optional(),
  ),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type UsuarioQueryDto = z.infer<typeof UsuarioQuerySchema>;

// ==========================================
// Response DTOs
// ==========================================
export interface UsuarioResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface UsuarioListResponse {
  data: UsuarioResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
