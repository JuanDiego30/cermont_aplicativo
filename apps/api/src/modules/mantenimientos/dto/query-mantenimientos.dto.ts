/**
 * ═══════════════════════════════════════════════════════════════════════════
 * QUERY MANTENIMIENTOS DTO
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max,
  IsIn,
  IsUUID,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  TipoMantenimiento,
  EstadoMantenimiento,
  PrioridadMantenimiento,
} from "@prisma/client";

export class QueryMantenimientosDto {
  @ApiPropertyOptional({
    description: "Filtrar por ID de activo",
  })
  @IsOptional()
  @IsString()
  activoId?: string;

  @ApiPropertyOptional({
    description: "Filtrar por tipo de mantenimiento",
    enum: ["preventivo", "correctivo", "predictivo"],
  })
  @IsOptional()
  @IsEnum(TipoMantenimiento)
  tipo?: TipoMantenimiento;

  @ApiPropertyOptional({
    description: "Filtrar por estado",
    enum: ["programado", "en_progreso", "completado", "cancelado", "pendiente"],
  })
  @IsOptional()
  @IsEnum(EstadoMantenimiento)
  estado?: EstadoMantenimiento;

  @ApiPropertyOptional({
    description: "Filtrar por prioridad",
    enum: ["baja", "media", "alta", "critica"],
  })
  @IsOptional()
  @IsEnum(PrioridadMantenimiento)
  prioridad?: PrioridadMantenimiento;

  @ApiPropertyOptional({
    description: "Filtrar por técnico asignado",
  })
  @IsOptional()
  @IsUUID()
  tecnicoId?: string;

  @ApiPropertyOptional({
    description: "Fecha desde (ISO 8601)",
    example: "2025-01-01T00:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: "Fecha hasta (ISO 8601)",
    example: "2025-12-31T23:59:59Z",
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: "Número de página",
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Elementos por página",
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: "Campo para ordenar",
    default: "fechaProgramada",
  })
  @IsOptional()
  @IsString()
  orderBy?: string = "fechaProgramada";

  @ApiPropertyOptional({
    description: "Dirección de ordenamiento",
    enum: ["asc", "desc"],
    default: "asc",
  })
  @IsOptional()
  @IsIn(["asc", "desc"])
  orderDir?: "asc" | "desc" = "asc";
}
