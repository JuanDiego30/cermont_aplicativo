/**
 * @module Evidencias - Clean Architecture DTOs
 */
import { z } from 'zod';
import { TipoEvidencia } from '../../domain/entities/evidencia.entity';

export const UploadEvidenciaSchema = z.object({
  ordenId: z.string().uuid(),
  ejecucionId: z.string().optional(), // Puede ser UUID o string vacío según lógica legacy
  tipo: z.enum(['FOTO', 'VIDEO', 'DOCUMENTO', 'AUDIO']).optional(),
  descripcion: z.string().optional(),
  tags: z.string().optional(),
});

export type UploadEvidenciaDto = z.infer<typeof UploadEvidenciaSchema>;

export interface EvidenciaResponse {
  id: string;
  ejecucionId: string;
  ordenId: string;
  tipo: TipoEvidencia;
  nombreArchivo: string;
  url: string; // ruta relativa o URL firmada
  descripcion?: string;
  tags: string[];
  subidoPor: string;
  createdAt: string;
  sincronizado: boolean;
}

export interface ListEvidenciasResult {
  data: EvidenciaResponse[];
}
