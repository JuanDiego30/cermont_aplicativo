/**
 * @module Evidencias - Clean Architecture DTOs
 */
import { z } from 'zod';

export const UploadEvidenciaSchema = z.object({
  ordenId: z.string().uuid().optional(),
  descripcion: z.string().optional(),
  tipo: z.enum(['foto', 'video', 'documento', 'firma']).default('foto'),
  latitud: z.number().optional(),
  longitud: z.number().optional(),
});

export type UploadEvidenciaDto = z.infer<typeof UploadEvidenciaSchema>;

export interface EvidenciaData {
  id: string;
  ordenId: string;
  tipo: string;
  url: string;
  descripcion?: string | null;
  latitud?: number | null;
  longitud?: number | null;
  creadoPorId?: string | null;
  createdAt: Date;
}

export interface CreateEvidenciaData {
  ordenId: string;
  tipo: string;
  url: string;
  descripcion?: string;
}

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

// Repository Interface
export const EVIDENCIA_REPOSITORY = Symbol('EVIDENCIA_REPOSITORY');

export interface IEvidenciaRepository {
  findByOrdenId(ordenId: string): Promise<EvidenciaData[]>;
  findById(id: string): Promise<EvidenciaData | null>;
  create(data: CreateEvidenciaData): Promise<EvidenciaData>;
  delete(id: string): Promise<void>;
  count(ordenId: string): Promise<number>;
}
