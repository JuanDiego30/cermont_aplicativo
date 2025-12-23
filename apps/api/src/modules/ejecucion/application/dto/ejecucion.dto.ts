/**
 * @module Ejecucion - Clean Architecture
 * @description DTOs con Zod
 */
import { z } from 'zod';

export const IniciarEjecucionSchema = z.object({
  tecnicoId: z.string().uuid(),
  observaciones: z.string().optional(),
  horasEstimadas: z.number().optional(),
  ubicacionGPS: z.any().optional(),
});

export type IniciarEjecucionDto = z.infer<typeof IniciarEjecucionSchema>;

export const UpdateAvanceSchema = z.object({
  avance: z.number().min(0).max(100),
  observaciones: z.string().optional(),
  horasActuales: z.number().optional(),
});

export type UpdateAvanceDto = z.infer<typeof UpdateAvanceSchema>;

export const CompletarEjecucionSchema = z.object({
  completadoPorId: z.string().uuid().optional(),
  observacionesFinales: z.string().optional(),
  firmaDigital: z.string().optional(),
  horasReales: z.number().optional(),
  horasActuales: z.number(),
  observaciones: z.string().optional(),
});

export type CompletarEjecucionDto = z.infer<typeof CompletarEjecucionSchema>;

export interface EjecucionResponse {
  id: string;
  ordenId: string;
  tecnicoId: string;
  estado: string;
  avance: number;
  horasReales: number;
  fechaInicio: string;
  fechaFin?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Repository Interface
export const EJECUCION_REPOSITORY = Symbol('EJECUCION_REPOSITORY');

export interface IEjecucionRepository {
  findByOrdenId(ordenId: string): Promise<any>;
  iniciar(ordenId: string, data: IniciarEjecucionDto): Promise<any>;
  updateAvance(id: string, data: UpdateAvanceDto): Promise<any>;
  completar(id: string, data: CompletarEjecucionDto): Promise<any>;
}
