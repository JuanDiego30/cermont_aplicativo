/**
 * ═══════════════════════════════════════════════════════════════════════════
 * UPDATE MANTENIMIENTO DTO
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  Min,
  IsUUID,
} from "class-validator";
import {
  TipoMantenimiento,
  EstadoMantenimiento,
  PrioridadMantenimiento,
} from "@prisma/client";

export class UpdateMantenimientoDto {
  @ApiPropertyOptional({
    description: "Título del mantenimiento",
    example: "Revisión preventiva mensual - Actualizada",
  })
  @IsOptional()
  @IsString()
  titulo?: string;

  @ApiPropertyOptional({
    description: "Descripción detallada del mantenimiento",
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({
    description: "Tipo de mantenimiento",
    enum: ["preventivo", "correctivo", "predictivo"],
  })
  @IsOptional()
  @IsEnum(TipoMantenimiento)
  tipo?: TipoMantenimiento;

  @ApiPropertyOptional({
    description: "Estado del mantenimiento",
    enum: ["programado", "en_progreso", "completado", "cancelado", "pendiente"],
  })
  @IsOptional()
  @IsEnum(EstadoMantenimiento)
  estado?: EstadoMantenimiento;

  @ApiPropertyOptional({
    description: "Prioridad del mantenimiento",
    enum: ["baja", "media", "alta", "critica"],
  })
  @IsOptional()
  @IsEnum(PrioridadMantenimiento)
  prioridad?: PrioridadMantenimiento;

  @ApiPropertyOptional({
    description: "Fecha programada para el mantenimiento (ISO 8601)",
  })
  @IsOptional()
  @IsDateString()
  fechaProgramada?: string;

  @ApiPropertyOptional({
    description: "Duración estimada en horas",
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duracionEstimada?: number;

  @ApiPropertyOptional({
    description: "ID del técnico asignado",
  })
  @IsOptional()
  @IsUUID()
  tecnicoId?: string;

  @ApiPropertyOptional({
    description: "Lista de tareas a realizar",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tareas?: string[];

  @ApiPropertyOptional({
    description: "Lista de materiales requeridos",
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materiales?: string[];

  @ApiPropertyOptional({
    description: "Observaciones adicionales",
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
