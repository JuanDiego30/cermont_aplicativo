/**
 * @file Application Layer DTOs
 * @description Request/Response DTOs with class-validator
 */

import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  MaxLength,
  IsArray,
  IsBoolean,
  IsInt,
  IsPositive,
  Max,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TipoEvidencia } from "../../domain/value-objects/file-type.vo";

// ============================================================
// Enums
// ============================================================

export enum TipoEvidenciaEnum {
  FOTO = "FOTO",
  VIDEO = "VIDEO",
  DOCUMENTO = "DOCUMENTO",
  AUDIO = "AUDIO",
}

export enum StatusEvidenciaEnum {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  READY = "READY",
  FAILED = "FAILED",
}

// ============================================================
// Upload DTOs
// ============================================================

export class UploadEvidenciaDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID("4", { message: "ordenId debe ser UUID válido" })
  ordenId!: string;

  @ApiPropertyOptional({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsOptional()
  @IsUUID("4", { message: "ejecucionId debe ser UUID válido" })
  ejecucionId?: string;

  @ApiPropertyOptional({ enum: TipoEvidenciaEnum })
  @IsOptional()
  @IsEnum(TipoEvidenciaEnum)
  tipo?: TipoEvidenciaEnum;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "Máximo 500 caracteres" })
  descripcion?: string;

  @ApiPropertyOptional({ description: "Tags separados por coma", maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: "Máximo 1000 caracteres" })
  tags?: string;
}

// ============================================================
// Update DTOs
// ============================================================

export class UpdateEvidenciaDto {
  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  descripcion?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

// ============================================================
// Query DTOs
// ============================================================

export class ListEvidenciasQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ordenId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  ejecucionId?: string;

  @ApiPropertyOptional({ enum: TipoEvidenciaEnum })
  @IsOptional()
  @IsEnum(TipoEvidenciaEnum)
  tipo?: TipoEvidenciaEnum;

  @ApiPropertyOptional({ enum: StatusEvidenciaEnum })
  @IsOptional()
  @IsEnum(StatusEvidenciaEnum)
  status?: StatusEvidenciaEnum;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  includeDeleted?: boolean;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({ default: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit?: number = 50;
}

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
