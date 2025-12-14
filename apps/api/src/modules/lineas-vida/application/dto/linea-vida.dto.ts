/**
 * @module Líneas de Vida - Clean Architecture
 */
import { z } from 'zod';

// DTOs
export const CreateLineaVidaSchema = z.object({
  ubicacion: z.string().min(3),
  tipo: z.enum(['horizontal', 'vertical', 'retractil', 'temporal', 'permanente']),
  longitud: z.number().positive(),
  capacidadUsuarios: z.number().int().min(1),
  fechaInstalacion: z.string(),
  fechaProximaInspeccion: z.string(),
  observaciones: z.string().optional(),
});

export type CreateLineaVidaDto = z.infer<typeof CreateLineaVidaSchema>;

export const InspeccionLineaVidaSchema = z.object({
  lineaVidaId: z.string().uuid(),
  tipo: z.enum(['visual', 'funcional', 'certificacion']),
  resultados: z.record(z.unknown()),
  aprobado: z.boolean(),
  observaciones: z.string().optional(),
  proximaInspeccion: z.string().optional(),
});

export type InspeccionLineaVidaDto = z.infer<typeof InspeccionLineaVidaSchema>;

export interface LineaVidaResponse {
  id: string;
  ubicacion: string;
  tipo: string;
  longitud: number;
  capacidadUsuarios: number;
  fechaInstalacion: string;
  fechaProximaInspeccion: string;
  estado: string;
  observaciones?: string;
}

export interface InspeccionResponse {
  id: string;
  lineaVidaId: string;
  tipo: string;
  resultados: Record<string, unknown>;
  aprobado: boolean;
  inspectorId: string;
  createdAt: string;
}

// Repository Interface
export const LINEA_VIDA_REPOSITORY = Symbol('LINEA_VIDA_REPOSITORY');

export interface ILineaVidaRepository {
  findAll(): Promise<any[]>;
  findById(id: string): Promise<any>;
  create(data: CreateLineaVidaDto, inspectorId: string): Promise<any>;
  findInspecciones(lineaVidaId: string): Promise<any[]>;
  createInspeccion(data: InspeccionLineaVidaDto, inspectorId: string): Promise<any>;
  updateFechaMantenimiento(id: string, fecha: string): Promise<any>;
  updateProximaInspeccion(id: string, fechaProxima: string): Promise<any>;
}
