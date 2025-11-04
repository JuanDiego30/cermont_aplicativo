/**
 * @file workplan.validator.ts
 * @description Esquemas de validación para planeación de trabajo
 */

import { z } from 'zod';

const itemSchema = z.object({
  name: z.string().min(2),
  quantity: z.number().int().positive(),
  unit: z.string().optional()
});

export const createWorkPlanSchema = z.object({
  body: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
    scope: z.string().min(20, 'Scope must be at least 20 characters'),
    workforce: z.object({
      technicians: z.number().int().nonnegative(),
      helpers: z.number().int().nonnegative(),
      supervisors: z.number().int().nonnegative()
    }),
    materials: z.array(itemSchema).min(1, 'At least one material required'),
    tools: z.array(itemSchema).min(1, 'At least one tool required'),
    equipment: z.array(itemSchema).optional(),
    ppe: z.array(itemSchema).min(1, 'PPE items are required'),
    certifications: z.array(
      z.object({
        name: z.string(),
        expiryDate: z.string().datetime(),
        fileUrl: z.string().url().optional()
      })
    ),
    ast: z.object({
      hazards: z.array(z.string()).min(1, 'At least one hazard must be identified'),
      controls: z.array(z.string()).min(1, 'At least one control measure required'),
      approvedBy: z.string().optional()
    })
  })
});

export const updateWorkPlanSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/)
  }),
  body: z
    .object({
      scope: z.string().min(20).optional(),
      workforce: z
        .object({
          technicians: z.number().int().nonnegative(),
          helpers: z.number().int().nonnegative(),
          supervisors: z.number().int().nonnegative()
        })
        .optional(),
      materials: z.array(itemSchema).optional(),
      tools: z.array(itemSchema).optional(),
      equipment: z.array(itemSchema).optional(),
      ppe: z.array(itemSchema).optional(),
      certifications: z
        .array(
          z.object({
            name: z.string(),
            expiryDate: z.string().datetime(),
            fileUrl: z.string().url().optional()
          })
        )
        .optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be updated'
    })
});
