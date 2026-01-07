/**
 * Costo Models
 * Models for costos module matching backend DTOs
 */

export type CostoTipo = 'mano_obra' | 'materiales' | 'transporte' | 'equipos' | 'otros';

/**
 * DTO para registrar un costo
 */
export interface RegistrarCostoDto {
  ordenId: string;
  tipo: CostoTipo;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  proveedor?: string;
}

/**
 * Query parameters para listar costos
 */
export interface CostoQueryDto {
  ordenId?: string;
  tipo?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

/**
 * Response de un costo
 */
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

/**
 * Análisis de costos por orden
 */
export interface CostoAnalysis {
  ordenId: string;
  costoPresupuestado: number;
  costoReal: number;
  varianza: number;
  varianzaPorcentual: number;
  desglosePorTipo: Record<string, number>;
}
