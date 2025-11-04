import { z } from 'zod';

// Input schema for form validation (strings as entered by user)
export const createWorkPlanInputSchema = z.object({
  orderId: z.string().min(1, 'El ID de orden es requerido'),
  titulo: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z.string().max(1000, 'La descripción no puede exceder 1000 caracteres').optional(),
  alcance: z.string().min(10, 'El alcance debe tener al menos 10 caracteres').max(3000, 'El alcance no puede exceder 3000 caracteres'),
  unidadNegocio: z.enum(['IT', 'MNT', 'SC', 'GEN', 'Otros']),
  startDate: z.string().min(1, 'La fecha de inicio es requerida'),
  endDate: z.string().min(1, 'La fecha de fin es requerida'),
  assignedUsers: z.string().min(1, 'Debe asignar al menos un usuario'),
  tools: z.string().min(1, 'Debe especificar al menos una herramienta'),
  estado: z.enum(['borrador', 'en_revision', 'aprobado', 'en_ejecucion', 'completado', 'cancelado']),
});

// Schema for backend data (arrays and proper dates)
export const createWorkPlanSchema = z.object({
  orderId: z.string().min(1),
  titulo: z.string().min(5).max(200),
  descripcion: z.string().max(1000).optional(),
  alcance: z.string().min(10).max(3000),
  unidadNegocio: z.enum(['IT', 'MNT', 'SC', 'GEN', 'Otros']),
  startDate: z.string(), // ISO string
  endDate: z.string(), // ISO string
  assignedUsers: z.array(z.string()).min(1),
  tools: z.array(z.string()).min(1),
  estado: z.enum(['borrador', 'en_revision', 'aprobado', 'en_ejecucion', 'completado', 'cancelado']).default('borrador'),
});

// Subesquema para recursos de personal (opcional)
const recursosSchema = z.object({
  tecnicosTelecomunicacion: z.number().min(0).optional(),
  instrumentistas: z.number().min(0).optional(),
  obreros: z.number().min(0).optional(),
}).optional();

// Subesquema para cronograma (array de actividades)
const cronogramaItemSchema = z.object({
  actividad: z.string().min(1, 'La actividad es requerida'),
  fechaInicio: z.string().min(1, 'La fecha de inicio es requerida'),
  fechaFin: z.string().min(1, 'La fecha de fin es requerida'),
  responsable: z.string().optional(),
});

export const cronogramaSchema = z.array(cronogramaItemSchema).optional();

// Esquema completo para planes de trabajo (extiende creación con campos adicionales)
export const workPlanSchema = createWorkPlanSchema
  .extend({
    recursos: recursosSchema,
    cronograma: cronogramaSchema,
  })
  .refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, {
    message: 'La fecha de inicio no puede ser posterior a la de fin',
    path: ['endDate'],
  });

export type CreateWorkPlanInputData = z.infer<typeof createWorkPlanInputSchema>;
export type CreateWorkPlanFormData = z.infer<typeof createWorkPlanSchema>;
export type WorkPlanFormData = z.infer<typeof workPlanSchema>;
