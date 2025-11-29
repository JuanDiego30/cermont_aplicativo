/**
 * Esquemas de Validación con Zod
 *
 * @file backend/src/infra/http/schemas/validation.schemas.ts
 */

import { z } from 'zod';

// ========================================
// 1. VALIDACIONES BASE REUTILIZABLES
// ========================================

const uuidSchema = z.string().uuid('ID inválido');

const emailSchema = z
  .string()
  .email('Email inválido')
  .toLowerCase()
  .trim()
  .min(5, 'Email debe tener al menos 5 caracteres')
  .max(255, 'Email demasiado largo');

const passwordSchema = z
  .string()
  .min(1, 'Contraseña requerida');

const paginationParams = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .refine((val) => val > 0, 'Page debe ser mayor a 0'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .refine((val) => val > 0 && val <= 100, 'Limit debe estar entre 1 y 100'),
});

const userRoleSchema = z.enum(['ROOT', 'ADMIN', 'COORDINADOR', 'OPERARIO', 'CLIENTE'], {
  errorMap: () => ({ message: 'Role inválido' }),
});

const orderStateSchema = z.enum(
  ['PENDIENTE', 'ASIGNADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'ARCHIVADA'],
  { errorMap: () => ({ message: 'Estado de orden inválido' }) }
);

// ========================================
// 2. AUTH SCHEMAS
// ========================================

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Contraseña requerida'),
  }),
});

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido'),
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(3).max(100).trim(),
  }),
});

// ========================================
// 3. USER SCHEMAS
// ========================================

export const createUserSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z.string().min(3).max(100).trim(),
    role: userRoleSchema,
  }),
});

export const updateUserSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    name: z.string().min(3).max(100).trim().optional(),
    role: userRoleSchema.optional(),
    password: passwordSchema.optional(),
    mfaEnabled: z.boolean().optional(),
  }),
});

export const changePasswordSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    newPassword: passwordSchema,
  }),
});

export const userFiltersSchema = z.object({
  query: paginationParams.extend({
    role: userRoleSchema.optional(),
    active: z.string().optional().transform((val) => 
      val === 'true' ? true : val === 'false' ? false : undefined
    ),
    search: z.string().trim().optional(),
  }),
});

// ========================================
// 4. ORDER SCHEMAS
// ========================================

export const createOrderSchema = z.object({
  body: z.object({
    clientName: z.string().min(3).max(200).trim(),
    clientEmail: z.string().email().optional().or(z.literal('')),
    clientPhone: z.string().max(50).optional(),
    description: z.string().min(10).max(2000).trim(),
    location: z.string().min(1).max(500).trim(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    estimatedHours: z.number().int().positive().optional(),
  }),
});

export const updateOrderSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    clientName: z.string().min(3).max(200).trim().optional(),
    description: z.string().min(10).max(2000).trim().optional(),
    location: z.string().min(1).max(500).trim().optional(),
  }),
});

export const transitionOrderSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    newState: orderStateSchema,
  }),
});

export const assignOrderSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    responsableId: uuidSchema,
  }),
});

export const archiveOrderSchema = z.object({
  params: z.object({ id: uuidSchema }),
});

export const orderFiltersSchema = z.object({
  query: paginationParams.extend({
    state: orderStateSchema.optional(),
    responsableId: uuidSchema.optional(),
    archived: z.string().optional().transform((val) => val === 'true'),
  }),
});

// ========================================
// 5. WORK PLAN SCHEMAS
// ========================================

// Sub-schemas internos
const materialSchema = z.object({
  name: z.string().min(1).trim(),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
});

const toolSchema = z.object({
  name: z.string().min(1).trim(),
  quantity: z.number().int().positive(),
});

const equipmentSchema = z.object({
  name: z.string().min(1).trim(),
  certification: z.string().trim().optional(),
});

const ppeSchema = z.object({
  name: z.string().min(1).trim(),
  quantity: z.number().int().positive(),
});

const astSchema = z.object({
  activity: z.string().min(1).trim(),
  risks: z.array(z.string().min(1)),
  controls: z.array(z.string().min(1)),
});

export const createWorkPlanSchema = z.object({
  body: z.object({
    orderId: uuidSchema,
    materials: z.array(materialSchema).optional(),
    tools: z.array(toolSchema).optional(),
    equipment: z.array(equipmentSchema).optional(),
    ppe: z.array(ppeSchema).optional(),
    asts: z.array(astSchema).optional(),
    estimatedBudget: z.number().positive(),
  }),
});

export const updateWorkPlanSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    materials: z.array(materialSchema).optional(),
    tools: z.array(toolSchema).optional(),
    equipment: z.array(equipmentSchema).optional(),
    ppe: z.array(ppeSchema).optional(),
    asts: z.array(astSchema).optional(),
    estimatedBudget: z.number().positive().optional(),
  }),
});

export const approveWorkPlanSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    comments: z.string().max(1000).trim().optional(),
  }),
});

export const rejectWorkPlanSchema = z.object({
  params: z.object({ id: uuidSchema }),
  body: z.object({
    reason: z.string().min(10).max(1000).trim(),
  }),
});

// ========================================
// 6. EVIDENCE SCHEMAS
// ========================================

export const createEvidenceSchema = z.object({
  body: z.object({
    orderId: uuidSchema,
    type: z.enum(['PHOTO', 'VIDEO', 'DOCUMENT'], {
      errorMap: () => ({ message: 'Tipo de evidencia inválido' }),
    }),
    description: z.string().min(10).max(1000).trim(),
    fileUrl: z.string().url(),
  }),
});

// ========================================
// 7. TYPE EXPORTS
// ========================================

export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshInput = z.infer<typeof refreshSchema>['body'];
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type CreateUserInput = z.infer<typeof createUserSchema>['body'];
export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>['body'];
export type TransitionOrderInput = z.infer<typeof transitionOrderSchema>['body'];
export type AssignOrderInput = z.infer<typeof assignOrderSchema>['body'];
export type CreateWorkPlanInput = z.infer<typeof createWorkPlanSchema>['body'];
export type UpdateWorkPlanInput = z.infer<typeof updateWorkPlanSchema>['body'];
export type ApproveWorkPlanInput = z.infer<typeof approveWorkPlanSchema>['body'];
export type RejectWorkPlanInput = z.infer<typeof rejectWorkPlanSchema>['body'];
export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>['body'];
