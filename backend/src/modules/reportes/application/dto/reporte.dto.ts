/**
 * @module Reportes - Clean Architecture
 */
import { z } from "zod";

// DTOs
export const ReporteQuerySchema = z.object({
  fechaInicio: z.string(),
  fechaFin: z.string(),
  estado: z.string().optional(),
  tecnicoId: z.string().uuid().optional(),
  formato: z.enum(["json", "pdf", "excel"]).default("json"),
});

export type ReporteQueryDto = z.infer<typeof ReporteQuerySchema>;

export interface OrdenReporteData {
  id: string;
  numero: string;
  titulo: string;
  estado: string;
  prioridad: string;
  fechaCreacion: string;
  fechaCompletado?: string;
  tecnico?: string;
  horasTrabajadas: number;
}

export interface ReporteSummary {
  totalOrdenes: number;
  completadas: number;
  enProgreso: number;
  canceladas: number;
  horasTotales: number;
  promedioHorasPorOrden: number;
}

export interface ReporteResponse {
  summary: ReporteSummary;
  ordenes: OrdenReporteData[];
  generadoEn: string;
}

// Repository Interface
export const REPORTE_REPOSITORY = Symbol("REPORTE_REPOSITORY");

export interface IReporteRepository {
  getOrdenesReporte(filters: ReporteQueryDto): Promise<any[]>;
  getOrdenDetalle(ordenId: string): Promise<any>;
}
