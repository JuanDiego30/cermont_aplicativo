/**
 * @file order.validator.ts
 * @description Esquemas de validación Zod para órdenes de trabajo
 */

import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    clientName: z.string().min(3, 'Client name must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
    location: z.object({
      address: z.string().min(5, 'Address is required'),
      city: z.string().min(2),
      coordinates: z
        .object({
          lat: z.number().min(-90).max(90),
          lng: z.number().min(-180).max(180)
        })
        .optional()
    }),
    priority: z.enum(['low', 'medium', 'high', 'urgent']),
    estimatedDuration: z.number().positive('Duration must be positive'),
    assignedTo: z.string().optional(),
    poNumber: z.string().optional()
  })
});

export const updateOrderSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID format')
  }),
  body: z
    .object({
      clientName: z.string().min(3).max(200).optional(),
      description: z.string().min(10).max(2000).optional(),
      location: z
        .object({
          address: z.string().min(5),
          city: z.string().min(2),
          coordinates: z
            .object({
              lat: z.number().min(-90).max(90),
              lng: z.number().min(-180).max(180)
            })
            .optional()
        })
        .optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      estimatedDuration: z.number().positive().optional(),
      assignedTo: z.string().optional()
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update'
    })
});

export const transitionStateSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID')
  }),
  body: z.object({
    newState: z.enum([
      'solicitud',
      'visita',
      'po',
      'planeacion',
      'ejecucion',
      'informe',
      'acta',
      'ses',
      'factura',
      'pago'
    ]),
    notes: z.string().max(500).optional()
  })
});

export const getOrdersSchema = z.object({
  query: z.object({
    state: z
      .enum([
        'solicitud',
        'visita',
        'po',
        'planeacion',
        'ejecucion',
        'informe',
        'acta',
        'ses',
        'factura',
        'pago'
      ])
      .optional(),
    assignedTo: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    fromDate: z.string().datetime().optional(),
    toDate: z.string().datetime().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20)
  })
});
