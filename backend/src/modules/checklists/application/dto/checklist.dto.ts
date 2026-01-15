/**
 * @module Checklists - Clean Architecture DTOs
 * @description DTOs con class-validator
 */
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsArray,
  IsInt,
  Min,
  MinLength,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ============== Enums ==============

export enum TipoChecklist {
  SEGURIDAD = "seguridad",
  CALIDAD = "calidad",
  HERRAMIENTAS = "herramientas",
  EPP = "epp",
  GENERAL = "general",
}

// ============== DTOs ==============

export class ChecklistItemInputDto {
  @ApiProperty({ description: "Descripción del item" })
  @IsString()
  descripcion!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  requerido?: boolean = true;

  @ApiProperty({ description: "Orden del item", minimum: 0 })
  @IsInt()
  @Min(0)
  orden!: number;
}

export class CreateChecklistDto {
  @ApiProperty({ description: "Nombre del checklist", minLength: 3 })
  @IsString()
  @MinLength(3)
  nombre!: string;

  @ApiPropertyOptional({ description: "Descripción" })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ enum: TipoChecklist })
  @IsEnum(TipoChecklist)
  tipo!: TipoChecklist;

  @ApiProperty({ description: "Items del checklist", type: [ChecklistItemInputDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemInputDto)
  items!: ChecklistItemInputDto[];
}

export class ChecklistItemResponseItemDto {
  @ApiProperty()
  @IsUUID("4")
  itemId!: string;

  @ApiProperty()
  @IsBoolean()
  completado!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class ChecklistItemResponseDto {
  @ApiProperty()
  @IsUUID("4")
  checklistId!: string;

  @ApiProperty({ type: [ChecklistItemResponseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemResponseItemDto)
  items!: ChecklistItemResponseItemDto[];
}

export class ToggleItemDto {
  @ApiProperty()
  @IsBoolean()
  completado!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export interface ChecklistItemData {
  id: string;
  descripcion: string;
  requerido: boolean;
  orden: number;
  completado?: boolean;
  observaciones?: string;
}

export interface ChecklistResponse {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  items: ChecklistItemData[];
  createdAt: string;
  updatedAt: string;
}

// Interfaz para datos internos del repositorio
export interface ChecklistData {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  activo?: boolean;
  items: ChecklistItemData[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Repository interface
export const CHECKLIST_REPOSITORY = Symbol("CHECKLIST_REPOSITORY");

export interface ItemResponseData {
  itemId: string;
  completado: boolean;
  observaciones?: string;
}

export interface IChecklistRepository {
  findAll(): Promise<ChecklistData[]>;
  findById(id: string): Promise<ChecklistData | null>;
  findByTipo(tipo: string): Promise<ChecklistData[]>;
  create(data: CreateChecklistDto): Promise<ChecklistData>;
  delete(id: string): Promise<void>;
  findByEjecucion(ejecucionId: string): Promise<unknown[]>;
  findChecklistById(id: string): Promise<unknown>;
  createForEjecucion(ejecucionId: string, templateId: string): Promise<unknown>;
  createEmpty(ejecucionId: string, nombre: string): Promise<unknown>;
  toggleItem(
    checklistId: string,
    itemId: string,
    data: ToggleItemDto,
  ): Promise<ItemResponseData>;
  addItems(checklistId: string, items: unknown[]): Promise<void>;
  updateItem(itemId: string, data: unknown): Promise<unknown>;
  completarChecklist(id: string, userId: string): Promise<unknown>;
  getStatistics(ejecucionId: string): Promise<unknown>;
  deleteChecklist(id: string): Promise<void>;
}
