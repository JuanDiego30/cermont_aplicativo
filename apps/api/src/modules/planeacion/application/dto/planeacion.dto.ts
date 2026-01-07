/**
 * @module Planeacion - Clean Architecture
 * @description DTOs, Repository Interface, Use Cases, Repository Implementation, Controller y Module
 */
import { z } from "zod";
import {
  IsString,
  IsOptional,
  IsUUID,
  IsObject,
  MinLength,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

// ==================== DTOs - ClassValidator ====================
export class CreatePlaneacionDto {
  @ApiPropertyOptional({ description: "Cronograma de actividades" })
  @IsOptional()
  @IsObject()
  cronograma?: Record<string, unknown> = {};

  @ApiPropertyOptional({ description: "Mano de obra asignada" })
  @IsOptional()
  @IsObject()
  manoDeObra?: Record<string, unknown> = {};

  @ApiPropertyOptional({ description: "Observaciones" })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ description: "Kit de materiales (UUID)" })
  @IsOptional()
  @IsUUID("4", { message: "kitId debe ser un UUID válido" })
  kitId?: string;
}

export class AprobarPlaneacionDto {
  @ApiPropertyOptional({ description: "Observaciones de aprobación" })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class RechazarPlaneacionDto {
  @ApiPropertyOptional({
    description: "Motivo del rechazo (mínimo 10 caracteres)",
  })
  @IsString()
  @MinLength(10, { message: "El motivo debe tener al menos 10 caracteres" })
  motivo!: string;
}

/** @deprecated Use la clase CreatePlaneacionDto con ClassValidator */
export const CreatePlaneacionSchema = z.object({
  cronograma: z.record(z.string(), z.unknown()).optional().default({}),
  manoDeObra: z.record(z.string(), z.unknown()).optional().default({}),
  observaciones: z.string().optional(),
  kitId: z.string().uuid().optional(),
});

/** @deprecated Use la clase AprobarPlaneacionDto con ClassValidator */
export const AprobarPlaneacionSchema = z.object({
  observaciones: z.string().optional(),
});

/** @deprecated Use la clase RechazarPlaneacionDto con ClassValidator */
export const RechazarPlaneacionSchema = z.object({
  motivo: z.string().min(10, "El motivo debe tener al menos 10 caracteres"),
});

// Import estado enum
import { PlaneacionEstado } from "../../domain/enums";

// Response Types
export interface PlaneacionResponse {
  id: string;
  ordenId: string;
  estado: PlaneacionEstado;
  cronograma: Record<string, unknown>;
  manoDeObra: Record<string, unknown>;
  observaciones?: string;
  aprobadoPorId?: string;
  fechaAprobacion?: string;
  createdAt: string;
  updatedAt: string;
}

// Re-export for convenience
export { PlaneacionEstado };
