/**
 * @dto Orden DTOs
 * @description DTOs con validación Zod para órdenes
 * @layer Application
 */
import { z } from 'zod';

// ==========================================
// Create Orden DTO
// ==========================================
export const CreateOrdenSchema = z.object({
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres'),
  cliente: z
    .string()
    .min(2, 'El cliente debe tener al menos 2 caracteres')
    .max(200, 'El cliente no puede exceder 200 caracteres'),
  prioridad: z
    .enum(['baja', 'media', 'alta', 'urgente'])
    .optional()
    .default('media'),
  fechaFinEstimada: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  presupuestoEstimado: z.number().positive().optional(),
  asignadoId: z.string().uuid().optional(),
});

export type CreateOrdenDto = z.infer<typeof CreateOrdenSchema>;

// ==========================================
// Update Orden DTO
// ==========================================
export const UpdateOrdenSchema = z.object({
  descripcion: z
    .string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  cliente: z
    .string()
    .min(2, 'El cliente debe tener al menos 2 caracteres')
    .max(200, 'El cliente no puede exceder 200 caracteres')
    .optional(),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']).optional(),
  fechaFinEstimada: z
    .string()
    .datetime()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  presupuestoEstimado: z.number().positive().optional(),
  asignadoId: z.string().uuid().optional().nullable(),
});

export type UpdateOrdenDto = z.infer<typeof UpdateOrdenSchema>;

// ==========================================
// Change Estado DTO
// ==========================================
export const ChangeEstadoSchema = z.object({
  estado: z.enum(['planeacion', 'ejecucion', 'pausada', 'completada', 'cancelada']),
});

export type ChangeEstadoDto = z.infer<typeof ChangeEstadoSchema>;

// ==========================================
// Transition State DTO (para OrderStateService)
// ==========================================
export const TransitionStateSchema = z.object({
  toState: z.enum([
    'SOLICITUD_RECIBIDA',
    'VISITA_PROGRAMADA',
    'PROPUESTA_ELABORADA',
    'PROPUESTA_APROBADA',
    'PLANEACION_INICIADA',
    'PLANEACION_APROBADA',
    'EJECUCION_INICIADA',
    'EJECUCION_COMPLETADA',
    'INFORME_GENERADO',
    'ACTA_ELABORADA',
    'ACTA_FIRMADA',
    'SES_APROBADA',
    'FACTURA_APROBADA',
    'PAGO_RECIBIDO',
  ]),
  notas: z.string().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type TransitionStateDto = z.infer<typeof TransitionStateSchema>;

// ==========================================
// Query Orden DTO
// ==========================================
export const OrdenQuerySchema = z.object({
  estado: z.enum(['planeacion', 'ejecucion', 'pausada', 'completada', 'cancelada']).optional(),
  cliente: z.string().optional(),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']).optional(),
  asignadoId: z.string().uuid().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type OrdenQueryDto = z.infer<typeof OrdenQuerySchema>;

// ==========================================
// Response DTOs
// ==========================================
export interface OrdenResponse {
  id: string;
  numero: string;
  descripcion: string;
  cliente: string;
  estado: string;
  prioridad: string;
  fechaInicio?: string;
  fechaFin?: string;
  fechaFinEstimada?: string;
  presupuestoEstimado?: number;
  creador?: { id: string; name: string };
  asignado?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface OrdenListResponse {
  data: OrdenResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrdenDetailResponse extends OrdenResponse {
  items?: any[];
  evidencias?: any[];
  costos?: any[];
  planeacion?: any;
  ejecucion?: any;
}
