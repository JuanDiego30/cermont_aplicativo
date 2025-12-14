/**
 * @module HES (Inspección de Equipos) - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const CreateHESSchema = z.object({
  equipoId: z.string().uuid(),
  ordenId: z.string().uuid().optional(),
  tipo: z.enum(['pre_uso', 'periodica', 'extraordinaria']),
  resultados: z.record(z.string(), z.unknown()),
  observaciones: z.string().optional(),
  aprobado: z.boolean(),
});

export type CreateHESDto = z.infer<typeof CreateHESSchema>;

export const HESQuerySchema = z.object({
  equipoId: z.string().uuid().optional(),
  ordenId: z.string().uuid().optional(),
  aprobado: z.coerce.boolean().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
});

export type HESQueryDto = z.infer<typeof HESQuerySchema>;

export interface HESResponse {
  id: string;
  equipoId: string;
  ordenId?: string;
  tipo: string;
  resultados: Record<string, unknown>;
  observaciones?: string;
  aprobado: boolean;
  inspectorId: string;
  createdAt: string;
}

// Repository Interface
export const HES_REPOSITORY = Symbol('HES_REPOSITORY');

export interface IHESRepository {
  findAll(filters: HESQueryDto): Promise<any[]>;
  findById(id: string): Promise<any>;
  findByEquipo(equipoId: string): Promise<any[]>;
  create(data: CreateHESDto, inspectorId: string): Promise<any>;
}
