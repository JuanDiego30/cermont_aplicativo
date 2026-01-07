/**
 * @module Reportes - Clean Architecture
 */
import { z } from "zod";
import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// DTOs - ClassValidator para ValidationPipe global
export class ReporteQueryDto {
  @ApiProperty({ description: "Fecha inicio (YYYY-MM-DD)", example: "2025-01-01" })
  @IsString()
  fechaInicio!: string;

  @ApiProperty({ description: "Fecha fin (YYYY-MM-DD)", example: "2025-12-31" })
  @IsString()
  fechaFin!: string;

  @ApiPropertyOptional({ description: "Filtrar por estado de orden" })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: "Filtrar por técnico (UUID)" })
  @IsOptional()
  @IsUUID("4", { message: "tecnicoId debe ser un UUID válido" })
  tecnicoId?: string;

  @ApiPropertyOptional({
    description: "Formato de salida",
    enum: ["json", "pdf", "excel"],
    default: "json",
  })
  @IsOptional()
  @IsIn(["json", "pdf", "excel"], { message: "Formato debe ser json, pdf o excel" })
  formato?: "json" | "pdf" | "excel" = "json";
}

/** @deprecated Use la clase ReporteQueryDto con ClassValidator */
export const ReporteQuerySchema = z.object({
  fechaInicio: z.string(),
  fechaFin: z.string(),
  estado: z.string().optional(),
  tecnicoId: z.string().uuid().optional(),
  formato: z.enum(["json", "pdf", "excel"]).default("json"),
});

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
