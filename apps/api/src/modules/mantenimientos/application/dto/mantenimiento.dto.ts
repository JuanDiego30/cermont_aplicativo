/**
 * @module Mantenimientos - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const CreateMantenimientoSchema = z.object({
  equipoId: z.string().uuid(),
  tipo: z.enum(['preventivo', 'correctivo', 'predictivo', 'programado']),
  descripcion: z.string().min(10),
  fechaProgramada: z.string(),
  prioridad: z.enum(['baja', 'media', 'alta', 'critica']).default('media'),
  duracionEstimada: z.number().positive().optional(),
  materialesRequeridos: z.array(z.string()).optional(),
  tecnicoAsignadoId: z.string().uuid().optional(),
});

export type CreateMantenimientoDto = z.infer<typeof CreateMantenimientoSchema>;

export const EjecutarMantenimientoSchema = z.object({
  observaciones: z.string().optional(),
  materialesUtilizados: z.array(z.string()).optional(),
  horasReales: z.number().positive(),
  costoMateriales: z.number().min(0).optional(),
  costoManoObra: z.number().min(0).optional(),
});

export type EjecutarMantenimientoDto = z.infer<typeof EjecutarMantenimientoSchema>;

export const MantenimientoQuerySchema = z.object({
  equipoId: z.string().uuid().optional(),
  tipo: z.enum(['preventivo', 'correctivo', 'predictivo', 'programado']).optional(),
  estado: z.enum(['programado', 'en_ejecucion', 'completado', 'cancelado']).optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
});

export type MantenimientoQueryDto = z.infer<typeof MantenimientoQuerySchema>;

export interface MantenimientoResponse {
  id: string;
  equipoId: string;
  tipo: string;
  descripcion: string;
  fechaProgramada: string;
  estado: string;
  prioridad: string;
  duracionEstimada?: number;
  horasReales?: number;
  tecnicoAsignadoId?: string;
  createdAt: string;
}

// Repository Interface
export const MANTENIMIENTO_REPOSITORY = Symbol('MANTENIMIENTO_REPOSITORY');

export interface IMantenimientoRepository {
  findAll(filters: MantenimientoQueryDto): Promise<any[]>;
  findById(id: string): Promise<any>;
  findProximos(dias: number): Promise<any[]>;
  create(data: CreateMantenimientoDto): Promise<any>;
  ejecutar(id: string, data: EjecutarMantenimientoDto, ejecutorId: string): Promise<any>;
  cancelar(id: string, motivo: string): Promise<any>;
}
