/**
 * @module Ejecucion - Clean Architecture
 * @description DTOs con ClassValidator
 */
import { z } from "zod";
import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsObject,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// DTOs - ClassValidator para ValidationPipe global
export class IniciarEjecucionDto {
  @ApiProperty({ description: "ID del técnico (UUID)" })
  @IsUUID("4", { message: "tecnicoId debe ser un UUID válido" })
  tecnicoId!: string;

  @ApiPropertyOptional({ description: "Observaciones iniciales" })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ description: "Horas estimadas" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  horasEstimadas?: number;

  @ApiPropertyOptional({ description: "Ubicación GPS" })
  @IsOptional()
  @IsObject()
  ubicacionGPS?: unknown;
}

export class UpdateAvanceDto {
  @ApiProperty({ description: "Porcentaje de avance (0-100)", minimum: 0, maximum: 100 })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: "El avance debe ser mayor o igual a 0" })
  @Max(100, { message: "El avance debe ser menor o igual a 100" })
  avance!: number;

  @ApiPropertyOptional({ description: "Observaciones del avance" })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ description: "Horas actuales trabajadas" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  horasActuales?: number;
}

export class CompletarEjecucionDto {
  @ApiProperty({ description: "Horas actuales trabajadas" })
  @Type(() => Number)
  @IsNumber()
  horasActuales!: number;

  @ApiPropertyOptional({ description: "ID de quien completó (UUID)" })
  @IsOptional()
  @IsUUID("4", { message: "completadoPorId debe ser un UUID válido" })
  completadoPorId?: string;

  @ApiPropertyOptional({ description: "Observaciones finales" })
  @IsOptional()
  @IsString()
  observacionesFinales?: string;

  @ApiPropertyOptional({ description: "Firma digital (base64)" })
  @IsOptional()
  @IsString()
  firmaDigital?: string;

  @ApiPropertyOptional({ description: "Horas reales totales" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  horasReales?: number;

  @ApiPropertyOptional({ description: "Observaciones adicionales" })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

/** @deprecated Use la clase IniciarEjecucionDto con ClassValidator */
export const IniciarEjecucionSchema = z.object({
  tecnicoId: z.string().uuid(),
  observaciones: z.string().optional(),
  horasEstimadas: z.number().optional(),
  ubicacionGPS: z.any().optional(),
});

/** @deprecated Use la clase UpdateAvanceDto con ClassValidator */
export const UpdateAvanceSchema = z.object({
  avance: z.number().min(0).max(100),
  observaciones: z.string().optional(),
  horasActuales: z.number().optional(),
});

/** @deprecated Use la clase CompletarEjecucionDto con ClassValidator */
export const CompletarEjecucionSchema = z.object({
  completadoPorId: z.string().uuid().optional(),
  observacionesFinales: z.string().optional(),
  firmaDigital: z.string().optional(),
  horasReales: z.number().optional(),
  horasActuales: z.number(),
  observaciones: z.string().optional(),
});

export interface EjecucionResponse {
  id: string;
  ordenId: string;
  tecnicoId: string;
  estado: string;
  avance: number;
  horasReales: number;
  fechaInicio: string;
  fechaFin?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Repository Interface
export const EJECUCION_REPOSITORY = Symbol("EJECUCION_REPOSITORY");

export interface IEjecucionRepository {
  findByOrdenId(ordenId: string): Promise<any>;
  iniciar(ordenId: string, data: IniciarEjecucionDto): Promise<any>;
  updateAvance(id: string, data: UpdateAvanceDto): Promise<any>;
  completar(id: string, data: CompletarEjecucionDto): Promise<any>;
}
