/**
 * @module Costos - Clean Architecture
 */
import { z } from "zod";

// DTOs
export const RegistrarCostoSchema = z.object({
  ordenId: z.string().uuid(),
  tipo: z.enum(["mano_obra", "materiales", "transporte", "equipos", "otros"]),
  descripcion: z.string().min(3),
  cantidad: z.number().positive(),
  precioUnitario: z.number().positive(),
  proveedor: z.string().optional(),
});

export type RegistrarCostoDto = z.infer<typeof RegistrarCostoSchema>;

export const CostoQuerySchema = z.object({
  ordenId: z.string().uuid().optional(),
  tipo: z.string().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
});

export type CostoQueryDto = z.infer<typeof CostoQuerySchema>;

export interface CostoResponse {
  id: string;
  ordenId: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  proveedor?: string;
  createdAt: string;
}

export interface CostoAnalysis {
  ordenId: string;
  costoPresupuestado: number;
  costoReal: number;
  varianza: number;
  varianzaPorcentual: number;
  desglosePorTipo: Record<string, number>;
}

// Repository Interface
export const COSTO_REPOSITORY = Symbol("COSTO_REPOSITORY");

export interface CostoData {
  id: string;
  ordenId: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  proveedor?: string;
  createdAt: Date;
}

export interface ICostoRepository {
  findByOrden(ordenId: string): Promise<CostoData[]>;
  findAll(filters: CostoQueryDto): Promise<CostoData[]>;
  create(data: RegistrarCostoDto): Promise<CostoData>;
  delete(id: string): Promise<void>;
  getAnalisis(ordenId: string): Promise<CostoAnalysis>;
}
