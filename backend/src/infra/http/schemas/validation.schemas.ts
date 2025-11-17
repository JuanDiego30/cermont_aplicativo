import { z } from 'zod';

/**
 * ========================================
 * CUSTOM VALIDATORS
 * ========================================
 */

/**
 * Validador para UUID (SQLite con Prisma)
 */
const uuidSchema = z.string().uuid('ID inválido');

/**
 * Validador de email mejorado
 */
const emailSchema = z
  .string()
  .email('Email inválido')
  .toLowerCase()
  .trim()
  .min(5, 'Email debe tener al menos 5 caracteres')
  .max(255, 'Email demasiado largo');

/**
 * Validador de password robusto
 */
const passwordSchema = z
  .string()
  .min(1, 'Contraseña requerida');

/**
 * Enum de roles
 */
const userRoleSchema = z.enum(['ROOT', 'ADMIN', 'COORDINADOR', 'OPERARIO'], {
  errorMap: () => ({ message: 'Role inválido' }),
});

/**
 * Enum de estados de orden
 */
const orderStateSchema = z.enum(
  ['PENDIENTE', 'ASIGNADA', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'ARCHIVADA'],
  {
    errorMap: () => ({ message: 'Estado de orden inválido' }),
  }
);

/**
 * ========================================
 * AUTH SCHEMAS
 * ========================================
 */

export const loginSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: z.string().min(1, 'Contraseña requerida'),
  }),
});

export type LoginInput = z.infer<typeof loginSchema>['body'];

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token requerido'),
  }),
});

export type RefreshInput = z.infer<typeof refreshSchema>['body'];

/**
 * ========================================
 * USER SCHEMAS
 * ========================================
 */

export const createUserSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    name: z
      .string()
      .min(3, 'Nombre debe tener al menos 3 caracteres')
      .max(100, 'Nombre demasiado largo')
      .trim(),
    role: userRoleSchema,
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>['body'];

export const updateUserSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    name: z.string().min(3).max(100).trim().optional(),
    role: userRoleSchema.optional(),
    password: passwordSchema.optional(),
    mfaEnabled: z.boolean().optional(),
  }),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>['body'];

export const changePasswordSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    newPassword: passwordSchema,
  }),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];

/**
 * ========================================
 * ORDER SCHEMAS
 * ========================================
 */

export const createOrderSchema = z.object({
  body: z.object({
    clientName: z
      .string()
      .min(3, 'Nombre del cliente debe tener al menos 3 caracteres')
      .max(200, 'Nombre del cliente demasiado largo')
      .trim(),
    clientEmail: z
      .string()
      .email('Email inválido')
      .optional()
      .or(z.literal('')),
    clientPhone: z.string().max(50).optional(),
    description: z
      .string()
      .min(10, 'Descripción debe tener al menos 10 caracteres')
      .max(2000, 'Descripción demasiado larga')
      .trim(),
    location: z
      .string()
      .min(1, 'Ubicación requerida')
      .max(500, 'Ubicación demasiado larga')
      .trim(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    estimatedHours: z.number().int().positive('Horas estimadas deben ser positivas').optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>['body'];

export const updateOrderSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    clientName: z.string().min(3).max(200).trim().optional(),
    description: z.string().min(10).max(2000).trim().optional(),
    location: z.string().min(1).max(500).trim().optional(),
  }),
});

export type UpdateOrderInput = z.infer<typeof updateOrderSchema>['body'];

export const transitionOrderSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    newState: orderStateSchema,
  }),
});

export type TransitionOrderInput = z.infer<typeof transitionOrderSchema>['body'];

export const assignOrderSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    responsableId: uuidSchema,
  }),
});

export type AssignOrderInput = z.infer<typeof assignOrderSchema>['body'];

export const archiveOrderSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
});

/**
 * ========================================
 * WORK PLAN SCHEMAS
 * ========================================
 */

const materialSchema = z.object({
  name: z.string().min(1, 'Nombre de material requerido').trim(),
  quantity: z.number().int().positive('Cantidad debe ser positiva'),
  unitCost: z.number().nonnegative('Costo unitario debe ser positivo o cero'),
});

const toolSchema = z.object({
  name: z.string().min(1, 'Nombre de herramienta requerido').trim(),
  quantity: z.number().int().positive('Cantidad debe ser positiva'),
});

const equipmentSchema = z.object({
  name: z.string().min(1, 'Nombre de equipo requerido').trim(),
  certification: z.string().trim().optional(),
});

const ppeSchema = z.object({
  name: z.string().min(1, 'Nombre de EPP requerido').trim(),
  quantity: z.number().int().positive('Cantidad debe ser positiva'),
});

const astSchema = z.object({
  activity: z.string().min(1, 'Actividad requerida').trim(),
  risks: z.array(z.string().min(1, 'Riesgo no puede estar vacío')),
  controls: z.array(z.string().min(1, 'Control no puede estar vacío')),
});

export const createWorkPlanSchema = z.object({
  body: z.object({
    orderId: uuidSchema,
    materials: z.array(materialSchema).optional(),
    tools: z.array(toolSchema).optional(),
    equipment: z.array(equipmentSchema).optional(),
    ppe: z.array(ppeSchema).optional(),
    asts: z.array(astSchema).optional(),
    estimatedBudget: z.number().positive('Presupuesto debe ser positivo'),
  }),
});

export type CreateWorkPlanInput = z.infer<typeof createWorkPlanSchema>['body'];

export const updateWorkPlanSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    materials: z.array(materialSchema).optional(),
    tools: z.array(toolSchema).optional(),
    equipment: z.array(equipmentSchema).optional(),
    ppe: z.array(ppeSchema).optional(),
    asts: z.array(astSchema).optional(),
    estimatedBudget: z.number().positive().optional(),
  }),
});

export type UpdateWorkPlanInput = z.infer<typeof updateWorkPlanSchema>['body'];

export const approveWorkPlanSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    comments: z.string().max(1000, 'Comentarios demasiado largos').trim().optional(),
  }),
});

export type ApproveWorkPlanInput = z.infer<typeof approveWorkPlanSchema>['body'];

export const rejectWorkPlanSchema = z.object({
  params: z.object({
    id: uuidSchema,
  }),
  body: z.object({
    reason: z.string().min(10, 'Razón debe tener al menos 10 caracteres').max(1000).trim(),
  }),
});

export type RejectWorkPlanInput = z.infer<typeof rejectWorkPlanSchema>['body'];

/**
 * ========================================
 * EVIDENCE SCHEMAS
 * ========================================
 */

export const createEvidenceSchema = z.object({
  body: z.object({
    orderId: uuidSchema,
    type: z.enum(['PHOTO', 'VIDEO', 'DOCUMENT'], {
      errorMap: () => ({ message: 'Tipo de evidencia inválido' }),
    }),
    description: z
      .string()
      .min(10, 'Descripción debe tener al menos 10 caracteres')
      .max(1000, 'Descripción demasiado larga')
      .trim(),
    fileUrl: z.string().url('URL de archivo inválida'),
  }),
});

export type CreateEvidenceInput = z.infer<typeof createEvidenceSchema>['body'];

/**
 * ========================================
 * QUERY PARAMS SCHEMAS
 * ========================================
 */

export const paginationSchema = z.object({
  query: z.object({
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
  }),
});

export const orderFiltersSchema = z.object({
  query: z.object({
    state: orderStateSchema.optional(),
    responsableId: uuidSchema.optional(),
    archived: z
      .string()
      .optional()
      .transform((val) => val === 'true'),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

export const userFiltersSchema = z.object({
  query: z.object({
    role: userRoleSchema.optional(),
    active: z
      .string()
      .optional()
      .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
    search: z.string().trim().optional(),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),
});

/**
 * ========================================
 * MIDDLEWARE HELPER
 * ========================================
 */

export function validateRequest(schema: z.AnyZodObject) {
  return async (req: any, res: any, next: any) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Validation Error',
          status: 400,
          detail: 'Error de validación de entrada',
          errors: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      next(error);
    }
  };
}
