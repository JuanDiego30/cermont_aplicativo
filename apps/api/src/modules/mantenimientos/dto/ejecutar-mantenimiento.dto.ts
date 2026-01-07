/**
 * ═══════════════════════════════════════════════════════════════════════════
 * EJECUTAR MANTENIMIENTO DTO
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  Min,
  Max,
  IsBoolean,
  IsDateString,
} from "class-validator";

export class EjecutarMantenimientoDto {
  @ApiPropertyOptional({
    description: "Fecha de inicio de ejecución (ISO 8601)",
    example: "2025-01-15T10:00:00Z",
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: "Fecha de fin de ejecución (ISO 8601)",
    example: "2025-01-15T12:30:00Z",
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @ApiProperty({
    description: "Descripción del trabajo realizado",
    example: "Se realizó la revisión completa del equipo...",
  })
  @IsString()
  trabajoRealizado!: string;

  @ApiPropertyOptional({
    description: "Lista de tareas completadas",
    example: ["Revisión de presión", "Cambio de filtro"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tareasCompletadas?: string[];

  @ApiPropertyOptional({
    description: "Lista de problemas encontrados",
    example: ["Fuga menor en válvula"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  problemasEncontrados?: string[];

  @ApiPropertyOptional({
    description: "Lista de repuestos utilizados",
    example: ["Filtro XYZ-123", "Aceite 5W30"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  repuestosUtilizados?: string[];

  @ApiPropertyOptional({
    description: "Observaciones adicionales",
  })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({
    description: "Costo total del mantenimiento",
    example: 250.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costoTotal?: number;

  @ApiPropertyOptional({
    description: "Calificación final del mantenimiento (0-10)",
    example: 8.5,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  calificacionFinal?: number;

  @ApiPropertyOptional({
    description: "Indica si requiere seguimiento",
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiereSeguimiento?: boolean;

  @ApiPropertyOptional({
    description: "Recomendaciones para futuros mantenimientos",
  })
  @IsOptional()
  @IsString()
  recomendaciones?: string;

  @ApiPropertyOptional({
    description: "IDs de evidencias adjuntas",
    example: ["uuid-evidencia-1", "uuid-evidencia-2"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenciaIds?: string[];
}
