/**
 * @file Application Layer DTOs
 * @description Request/Response DTOs with ClassValidator
 */

import { z } from "zod";
import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  MaxLength,
  IsArray,
  IsInt,
  IsPositive,
  Max,
  IsBoolean,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TipoEvidencia } from "../../domain/value-objects/file-type.vo";

// Tipos de evidencia
const TIPOS_EVIDENCIA = ["FOTO", "VIDEO", "DOCUMENTO", "AUDIO"] as const;
const ESTADOS_EVIDENCIA = ["PENDING", "PROCESSING", "READY", "FAILED"] as const;

// ============================================================
// Upload DTOs - ClassValidator
// ============================================================

export class UploadEvidenciaDto {
  @ApiProperty({ description: "ID de la orden (UUID)" })
  @IsUUID("4", { message: "ordenId debe ser UUID válido" })
  ordenId!: string;

  @ApiPropertyOptional({ description: "ID de la ejecución (UUID)" })
  @IsOptional()
  @IsUUID("4", { message: "ejecucionId debe ser UUID válido" })
  ejecucionId?: string;

  @ApiPropertyOptional({
    description: "Tipo de evidencia",
    enum: TIPOS_EVIDENCIA,
  })
  @IsOptional()
  @IsIn(TIPOS_EVIDENCIA, { message: "Tipo de evidencia inválido" })
  tipo?: (typeof TIPOS_EVIDENCIA)[number];

  @ApiPropertyOptional({ description: "Descripción (máx 500 caracteres)" })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Máximo 500 caracteres" })
  descripcion?: string;

  @ApiPropertyOptional({
    description: "Tags separados por coma (máx 1000 caracteres)",
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "Máximo 1000 caracteres" })
  tags?: string;
}

/** @deprecated Use la clase UploadEvidenciaDto con ClassValidator */
export const UploadEvidenciaSchema = z.object({
  ordenId: z.string().uuid("ordenId debe ser UUID válido"),
  ejecucionId: z.string().uuid("ejecucionId debe ser UUID válido").optional(),
  tipo: z.enum(["FOTO", "VIDEO", "DOCUMENTO", "AUDIO"]).optional(),
  descripcion: z.string().max(500, "Máximo 500 caracteres").optional(),
  tags: z.string().max(1000, "Máximo 1000 caracteres").optional(),
});

// ============================================================
// Update DTOs
// ============================================================

export class UpdateEvidenciaDto {
  @ApiPropertyOptional({ description: "Descripción (máx 500 caracteres)" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ description: "Tags" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/** @deprecated Use la clase UpdateEvidenciaDto con ClassValidator */
export const UpdateEvidenciaSchema = z.object({
  descripcion: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

// ============================================================
// Query DTOs
// ============================================================

export class ListEvidenciasQueryDto {
  @ApiPropertyOptional({ description: "Filtrar por orden (UUID)" })
  @IsOptional()
  @IsUUID("4")
  ordenId?: string;

  @ApiPropertyOptional({ description: "Filtrar por ejecución (UUID)" })
  @IsOptional()
  @IsUUID("4")
  ejecucionId?: string;

  @ApiPropertyOptional({
    description: "Filtrar por tipo",
    enum: TIPOS_EVIDENCIA,
  })
  @IsOptional()
  @IsIn(TIPOS_EVIDENCIA)
  tipo?: (typeof TIPOS_EVIDENCIA)[number];

  @ApiPropertyOptional({
    description: "Filtrar por estado",
    enum: ESTADOS_EVIDENCIA,
  })
  @IsOptional()
  @IsIn(ESTADOS_EVIDENCIA)
  status?: (typeof ESTADOS_EVIDENCIA)[number];

  @ApiPropertyOptional({ description: "Incluir eliminados" })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({ description: "Página", default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ description: "Límite por página", default: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit?: number = 50;
}

/** @deprecated Use la clase ListEvidenciasQueryDto con ClassValidator */
export const ListEvidenciasQuerySchema = z.object({
  ordenId: z.string().uuid().optional(),
  ejecucionId: z.string().uuid().optional(),
  tipo: z.enum(["FOTO", "VIDEO", "DOCUMENTO", "AUDIO"]).optional(),
  status: z.enum(["PENDING", "PROCESSING", "READY", "FAILED"]).optional(),
  includeDeleted: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

// ============================================================
// Response DTOs
// ============================================================

export interface EvidenciaMetadataResponse {
  sha256?: string;
  width?: number;
  height?: number;
  duration?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  thumbnails?: {
    s150?: string;
    s300?: string;
  };
}

export interface EvidenciaResponse {
  id: string;
  ejecucionId: string;
  ordenId: string;
  tipo: TipoEvidencia;
  mimeType: string;
  nombreArchivo: string;
  tamano: number;
  tamanoPretty: string;
  url: string;
  thumbnailUrl?: string;
  status: string;
  descripcion: string;
  tags: string[];
  metadata?: EvidenciaMetadataResponse;
  subidoPor: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface ListEvidenciasResponse {
  data: EvidenciaResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface UploadEvidenciaResponse {
  success: boolean;
  evidencia: EvidenciaResponse;
  message: string;
}

export interface DeleteEvidenciaResponse {
  success: boolean;
  message: string;
}
