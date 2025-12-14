/**
 * @module Archivado - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const ArchivarOrdenSchema = z.object({
  ordenId: z.string().uuid(),
  motivo: z.string().optional(),
});

export type ArchivarOrdenDto = z.infer<typeof ArchivarOrdenSchema>;

export const DesarchivarOrdenSchema = z.object({
  ordenId: z.string().uuid(),
});

export type DesarchivarOrdenDto = z.infer<typeof DesarchivarOrdenSchema>;

export const ArchivadoQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
});

export type ArchivadoQueryDto = z.infer<typeof ArchivadoQuerySchema>;

export interface OrdenArchivadaResponse {
  id: string;
  ordenId: string;
  numero: string;
  titulo: string;
  fechaArchivado: string;
  archivadoPor: string;
  motivo?: string;
}

// Repository Interface
export const ARCHIVADO_REPOSITORY = Symbol('ARCHIVADO_REPOSITORY');

export interface IArchivadoRepository {
  findAll(filters: ArchivadoQueryDto): Promise<{ data: any[]; total: number }>;
  archivar(ordenId: string, userId: string, motivo?: string): Promise<any>;
  desarchivar(ordenId: string): Promise<void>;
  isArchivada(ordenId: string): Promise<boolean>;
  archivarAutomatico(diasAntiguedad: number): Promise<number>;
}
