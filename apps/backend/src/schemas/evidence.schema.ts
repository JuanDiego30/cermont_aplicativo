/**
 * @file evidence.schema.ts
 * @description Esquemas de validación para evidencias usando Zod
 */

import { z } from 'zod';

/**
 * Esquema para subida de evidencia
 */
export const uploadEvidenceSchema = z.object({
  body: z.object({
    filename: z.string().min(1, 'Filename is required'),
    description: z.string().optional(),
    orderId: z.string().optional(),
    evidenceType: z.enum(['document', 'image', 'video', 'audio']).default('document')
  })
});

/**
 * Esquema para parámetros de evidencia
 */
export const evidenceParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Evidence ID is required')
  })
});

/**
 * Tipos inferidos de los esquemas
 */
export type UploadEvidenceInput = z.infer<typeof uploadEvidenceSchema>;
export type EvidenceParamsInput = z.infer<typeof evidenceParamsSchema>;