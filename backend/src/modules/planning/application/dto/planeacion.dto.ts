/**
 * @module Planeacion - Clean Architecture
 * @description DTOs con class-validator
 */
import {
  IsString,
  IsOptional,
  IsUUID,
  IsObject,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ==================== DTOs ====================

export class CreatePlaneacionDto {
  @ApiPropertyOptional({ example: { inicio: "2025-01-15", fin: "2025-01-20" } })
  @IsOptional()
  @IsObject()
  cronograma?: Record<string, unknown>;

  @ApiPropertyOptional({ example: { tecnicos: 2, horas: 16 } })
  @IsOptional()
  @IsObject()
  manoDeObra?: Record<string, unknown>;

  @ApiPropertyOptional({ example: "Planificación inicial del proyecto" })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsOptional()
  @IsUUID()
  kitId?: string;
}

export class AprobarPlaneacionDto {
  @ApiPropertyOptional({ example: "Aprobado sin observaciones" })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class RechazarPlaneacionDto {
  @ApiProperty({ example: "Falta información del cronograma detallado", minLength: 10 })
  @IsString()
  @MinLength(10, { message: "El motivo debe tener al menos 10 caracteres" })
  motivo!: string;
}

// Response Types
export interface PlaneacionResponse {
  id: string;
  ordenId: string;
  estado: string;
  cronograma: Record<string, unknown>;
  manoDeObra: Record<string, unknown>;
  observaciones?: string;
  aprobadoPorId?: string;
  fechaAprobacion?: string;
  createdAt: string;
  updatedAt: string;
}
