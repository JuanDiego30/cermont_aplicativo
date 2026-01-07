/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PROGRAMAR MANTENIMIENTO DTO
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsOptional, IsDateString, IsUUID } from "class-validator";

export class ProgramarMantenimientoDto {
  @ApiProperty({
    description: "Nueva fecha programada (ISO 8601)",
    example: "2025-02-01T10:00:00Z",
  })
  @IsDateString()
  fechaProgramada!: string;

  @ApiPropertyOptional({
    description: "ID del técnico a asignar",
    example: "uuid-tecnico-123",
  })
  @IsOptional()
  @IsUUID()
  tecnicoId?: string;

  @ApiPropertyOptional({
    description: "Observaciones sobre la reprogramación",
    example: "Se reprograma por falta de materiales",
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
