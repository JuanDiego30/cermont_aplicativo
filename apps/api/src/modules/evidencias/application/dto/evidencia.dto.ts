/**
 * @module Evidencias - Clean Architecture DTOs
 */
import { z } from 'zod';

export const UploadEvidenciaSchema = z.object({
  descripcion: z.string().optional(),
  tipo: z.enum(['foto', 'video', 'documento', 'firma']).default('foto'),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
});

export type UploadEvidenciaDto = z.infer<typeof UploadEvidenciaSchema>;

export interface EvidenciaResponse {
  id: string;
  ordenId: string;
  tipo: string;
  url: string;
  descripcion?: string;
  latitud?: number;
  longitud?: number;
  creadoPorId: string;
  createdAt: string;
}

export interface ListEvidenciasResponse {
  data: EvidenciaResponse[];
  total: number;
}
