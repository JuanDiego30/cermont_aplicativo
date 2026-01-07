/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CREATE MANTENIMIENTO DTO
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
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
  PrioridadMantenimiento,
} from "@prisma/client";

export class CreateMantenimientoDto {
  @ApiProperty({
    description: "Título del mantenimiento",
    example: "Revisión preventiva mensual",
  })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiPropertyOptional({
    description: "Descripción detallada del mantenimiento",
    example: "Verificación de componentes y lubricación",
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({
    description: "Tipo de mantenimiento",
    enum: ["preventivo", "correctivo", "predictivo"],
    example: "preventivo",
  })
  @IsEnum(TipoMantenimiento)
  tipo!: TipoMantenimiento;

  @ApiPropertyOptional({
    description: "Prioridad del mantenimiento",
    enum: ["baja", "media", "alta", "critica"],
    example: "media",
  })
  @IsOptional()
  @IsEnum(PrioridadMantenimiento)
  prioridad?: PrioridadMantenimiento;

  @ApiProperty({
    description: "Fecha programada para el mantenimiento (ISO 8601)",
    example: "2025-01-15T10:00:00Z",
  })
  @IsDateString()
  fechaProgramada!: string;

  @ApiPropertyOptional({
    description: "Duración estimada en horas",
    example: 2.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duracionEstimada?: number;

  @ApiProperty({
    description: "ID del activo (equipo, orden, etc.)",
    example: "uuid-activo-123",
  })
  @IsString()
  @IsNotEmpty()
  activoId!: string;

  @ApiPropertyOptional({
    description: "Tipo de activo",
    example: "equipo",
  })
  @IsOptional()
  @IsString()
  activoTipo?: string;

  @ApiPropertyOptional({
    description: "ID del técnico asignado",
    example: "uuid-tecnico-123",
  })
  @IsOptional()
  @IsUUID()
  tecnicoId?: string;

  @ApiPropertyOptional({
    description: "Lista de tareas a realizar",
    example: ["Revisar presión", "Verificar conexiones"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tareas?: string[];

  @ApiPropertyOptional({
    description: "Lista de materiales requeridos",
    example: ["Aceite lubricante", "Filtro"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  materiales?: string[];
}
