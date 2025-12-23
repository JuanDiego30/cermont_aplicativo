/**
 * @file Application Layer DTOs
 * @description Request/Response DTOs with Zod validation
 */

import { z } from 'zod';
import { TipoEvidencia } from '../../domain/value-objects/file-type.vo';

// ============================================================
// Upload DTOs
// ============================================================

export const UploadEvidenciaSchema = z.object({
  ordenId: z.string().uuid('ordenId debe ser UUID válido'),
  ejecucionId: z.string().uuid('ejecucionId debe ser UUID válido').optional(),
  tipo: z.enum(['FOTO', 'VIDEO', 'DOCUMENTO', 'AUDIO']).optional(),
  descripcion: z.string().max(500, 'Máximo 500 caracteres').optional(),
  tags: z.string().optional(), // Comma-separated
});

export type UploadEvidenciaDto = z.infer<typeof UploadEvidenciaSchema>;

// ============================================================
// Update DTOs
// ============================================================

export const UpdateEvidenciaSchema = z.object({
  descripcion: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateEvidenciaDto = z.infer<typeof UpdateEvidenciaSchema>;

// ============================================================
// Query DTOs
// ============================================================

export const ListEvidenciasQuerySchema = z.object({
  ordenId: z.string().uuid().optional(),
  ejecucionId: z.string().uuid().optional(),
  tipo: z.enum(['FOTO', 'VIDEO', 'DOCUMENTO', 'AUDIO']).optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'READY', 'FAILED']).optional(),
  includeDeleted: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type ListEvidenciasQueryDto = z.infer<typeof ListEvidenciasQuerySchema>;

// ============================================================
// Response DTOs
// ============================================================

export interface EvidenciaMetadataResponse {
  width?: number;
  height?: number;
  duration?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
}

export interface EvidenciaResponse {
  id: string;
  ejecucionId: string;
  ordenId: string;
  tipo: TipoEvidencia;
  mimeType: string;
  nombreArchivo: string;
  tamano: number;
  tamanoPretty: string;
  url: string;
  thumbnailUrl?: string;
  status: string;
  descripcion: string;
  tags: string[];
  metadata?: EvidenciaMetadataResponse;
  subidoPor: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ListEvidenciasResponse {
  data: EvidenciaResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UploadEvidenciaResponse {
  success: boolean;
  evidencia: EvidenciaResponse;
  message: string;
}

export interface DeleteEvidenciaResponse {
  success: boolean;
  message: string;
}
