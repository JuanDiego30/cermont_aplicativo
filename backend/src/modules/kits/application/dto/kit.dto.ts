/**
 * @module Kits - Clean Architecture
 * @description DTOs e interfaces para el módulo de Kits
 */
import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  MinLength,
  Min,
  IsInt,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

/**
 * DTO para items dentro de un Kit
 */
export class KitItemCreateDto {
  @ApiProperty({ description: "Nombre del item", example: "Taladro" })
  @IsString()
  @MinLength(1)
  nombre!: string;

  @ApiProperty({ description: "Cantidad requerida", minimum: 1, example: 2 })
  @IsNumber()
  @IsInt()
  @Min(1)
  cantidad!: number;

  @ApiPropertyOptional({
    description: "Unidad de medida",
    example: "unidad",
  })
  @IsOptional()
  @IsString()
  unidad?: string;
}

/**
 * DTO para crear un Kit
 */
export class CreateKitDto {
  @ApiProperty({
    description: "Nombre del kit",
    minLength: 3,
    example: "Kit de Instalación Básico",
  })
  @IsString()
  @MinLength(3)
  nombre!: string;

  @ApiPropertyOptional({ description: "Descripción del kit" })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: "Herramientas incluidas" })
  @IsOptional()
  herramientas?: unknown;

  @ApiPropertyOptional({ description: "Equipos incluidos" })
  @IsOptional()
  equipos?: unknown;

  @ApiPropertyOptional({ description: "IDs de documentos asociados" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentos?: string[];

  @ApiPropertyOptional({ description: "Items del checklist" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  checklistItems?: string[];

  @ApiPropertyOptional({ description: "Duración estimada en horas" })
  @IsOptional()
  @IsNumber()
  duracionEstimadaHoras?: number;

  @ApiPropertyOptional({ description: "Costo estimado del kit" })
  @IsOptional()
  @IsNumber()
  costoEstimado?: number;

  @ApiPropertyOptional({
    description: "Items del kit",
    type: [KitItemCreateDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KitItemCreateDto)
  items?: KitItemCreateDto[];

  @ApiPropertyOptional({ description: "Categoría del kit" })
  @IsOptional()
  @IsString()
  categoria?: string;
}

export interface KitItemData {
  id: string;
  nombre: string;
  cantidad: number;
  unidad?: string;
}

export interface KitResponse {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  items?: KitItemData[];
  herramientas?: unknown;
  equipos?: unknown;
  createdAt: string;
}

// Repository Interface
export const KIT_REPOSITORY = Symbol("KIT_REPOSITORY");

export interface KitData {
  id: string;
  nombre: string;
  descripcion?: string;
  categoria?: string;
  items?: KitItemData[];
  herramientas?: unknown;
  equipos?: unknown;
  documentos?: string[];
  checklistItems?: string[];
  duracionEstimadaHoras?: number;
  costoEstimado?: number;
  activo?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IKitRepository {
  findAll(): Promise<KitData[]>;
  findById(id: string): Promise<KitData | null>;
  findByCategoria(categoria: string): Promise<KitData[]>;
  create(data: CreateKitDto): Promise<KitData>;
  update(id: string, data: Partial<CreateKitDto>): Promise<KitData>;
  delete(id: string): Promise<void>;
  changeEstado(id: string, activo: boolean): Promise<KitData>;
  // Métodos para aplicar kits a ejecuciones
  applyKitToExecution(kitId: string, ejecucionId: string): Promise<unknown>;
  syncPredefinedKits(): Promise<unknown[]>;
}
