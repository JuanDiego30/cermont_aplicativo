/**
 * DTOs for Kits Module
 * @description DTOs con class-validator para validación en runtime
 */
import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// Class-Validator DTOs
// ============================================================================

export class KitItemDto {
  @ApiProperty({ description: 'Nombre del item' })
  @IsString()
  @MinLength(1)
  nombre!: string;

  @ApiProperty({ description: 'Cantidad requerida', minimum: 1 })
  @IsNumber()
  @Min(1)
  cantidad!: number;

  @ApiPropertyOptional({ description: 'Tipo de item', default: 'HERRAMIENTA' })
  @IsOptional()
  @IsString()
  itemType?: string;

  @ApiPropertyOptional({ description: 'Costo unitario', default: 0 })
  @IsOptional()
  @IsNumber()
  costoUnitario?: number;

  @ApiPropertyOptional({ description: 'Unidad de medida', default: 'unidad' })
  @IsOptional()
  @IsString()
  unidad?: string;

  @ApiPropertyOptional({ description: 'Es item opcional', default: false })
  @IsOptional()
  @IsBoolean()
  esOpcional?: boolean;

  @ApiPropertyOptional({
    description: 'Requiere certificación',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  requiereCertificacion?: boolean;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  @IsOptional()
  @IsString()
  notas?: string;
}

export class CreateKitDto {
  @ApiProperty({ description: 'Nombre del kit' })
  @IsString()
  @MinLength(3)
  nombre!: string;

  @ApiPropertyOptional({ description: 'Descripción del kit' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ description: 'Categoría del kit' })
  @IsString()
  categoria!: string;

  @ApiPropertyOptional({ description: 'Tipo de kit', default: 'BASICO' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({
    description: 'Duración estimada en horas',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  duracionEstimadaHoras?: number;

  @ApiPropertyOptional({ description: 'Es plantilla base', default: false })
  @IsOptional()
  @IsBoolean()
  esPlantilla?: boolean;

  @ApiPropertyOptional({ description: 'Items del kit', type: [KitItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => KitItemDto)
  items?: KitItemDto[];

  // Legacy fields for backward compatibility
  @IsOptional()
  herramientas?: unknown[];

  @IsOptional()
  equipos?: unknown[];

  @IsOptional()
  documentos?: string[];

  @IsOptional()
  checklistItems?: string[];

  @IsOptional()
  costoEstimado?: number;
}

export class UpdateKitDto {
  @ApiPropertyOptional({ description: 'Nombre del kit' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  nombre?: string;

  @ApiPropertyOptional({ description: 'Descripción del kit' })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ description: 'Duración estimada en horas' })
  @IsOptional()
  @IsNumber()
  duracionEstimadaHoras?: number;
}

export class AddItemToKitDto extends KitItemDto {}

export class UpdateItemCantidadDto {
  @ApiProperty({ description: 'Nueva cantidad', minimum: 1 })
  @IsNumber()
  @Min(1)
  cantidad!: number;
}

// ============================================================================
// Response DTOs
// ============================================================================

export class KitItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nombre!: string;

  @ApiProperty()
  cantidad!: number;

  @ApiProperty()
  costoUnitario!: number;

  @ApiProperty()
  costoTotal!: number;

  @ApiProperty()
  itemType!: string;

  @ApiProperty()
  unidad!: string;

  @ApiProperty()
  esOpcional!: boolean;

  @ApiProperty()
  requiereCertificacion!: boolean;

  @ApiPropertyOptional()
  notas?: string;
}

export class KitResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  codigo!: string;

  @ApiProperty()
  nombre!: string;

  @ApiPropertyOptional()
  descripcion?: string;

  @ApiProperty()
  categoria!: string;

  @ApiProperty()
  tipo!: string;

  @ApiProperty()
  estado!: string;

  @ApiProperty({ type: [KitItemResponseDto] })
  items!: KitItemResponseDto[];

  @ApiProperty()
  costoTotal!: number;

  @ApiProperty()
  cantidadItems!: number;

  @ApiProperty()
  duracionEstimadaHoras!: number;

  @ApiProperty()
  esPlantilla!: boolean;

  @ApiProperty()
  creadoPor!: string;

  @ApiProperty()
  creadoEn!: string;

  @ApiPropertyOptional()
  actualizadoEn?: string;
}

export class KitListResponseDto {
  @ApiProperty({ type: [KitResponseDto] })
  data!: KitResponseDto[];

  @ApiProperty()
  total!: number;
}

// ============================================================================
// Query DTOs
// ============================================================================

export class ListKitsQueryDto {
  @ApiPropertyOptional({ description: 'Filtrar por categoría' })
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional({ description: 'Filtrar por estado' })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({ description: 'Filtrar por tipo' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: 'Solo plantillas', default: false })
  @IsOptional()
  @IsBoolean()
  soloPlantillas?: boolean;
}
