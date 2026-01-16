/**
 * @module Reportes - Clean Architecture
 * DTOs con class-validator
 */
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum FormatoReporte {
  JSON = "json",
  PDF = "pdf",
  EXCEL = "excel",
}

export class ReporteQueryDto {
  @ApiProperty({ example: "2024-01-01" })
  @IsDateString()
  fechaInicio!: string;

  @ApiProperty({ example: "2024-12-31" })
  @IsDateString()
  fechaFin!: string;

  @ApiPropertyOptional({ example: "completado" })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsOptional()
  @IsUUID()
  tecnicoId?: string;

  @ApiPropertyOptional({ enum: FormatoReporte, default: FormatoReporte.JSON })
  @IsOptional()
  @IsEnum(FormatoReporte)
  formato?: FormatoReporte = FormatoReporte.JSON;
}

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
