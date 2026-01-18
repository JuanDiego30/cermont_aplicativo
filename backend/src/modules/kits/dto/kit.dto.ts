/**
 * ═══════════════════════════════════════════════════════════════════════════
 * KITS DTOs - CERMONT APLICATIVO
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  ArrayMinSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class HerramientaDto {
  @ApiProperty({ example: 'Calibrador pie de rey' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  cantidad!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  certificacion!: boolean;
}

export class EquipoDto {
  @ApiProperty({ example: 'Arnés de seguridad' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  cantidad!: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  certificacion!: boolean;
}

export class CreateKitDto {
  @ApiProperty({ example: 'Kit Inspección Líneas de Vida' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    example: 'Herramientas y equipos para inspección de líneas de vida verticales',
  })
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiProperty({ type: [HerramientaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HerramientaDto)
  herramientas!: HerramientaDto[];

  @ApiProperty({ type: [EquipoDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EquipoDto)
  equipos!: EquipoDto[];

  @ApiProperty({
    type: [String],
    example: ['Formato Inspección Líneas de Vida Vertical'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  documentos!: string[];

  @ApiProperty({
    type: [String],
    example: ['Verificar estado general del cable'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  checklistItems!: string[];

  @ApiProperty({ example: 4, minimum: 1 })
  @IsNumber()
  @Min(1)
  duracionEstimadaHoras!: number;

  @ApiPropertyOptional({ example: 150000, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costoEstimado?: number;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateKitDto extends PartialType(CreateKitDto) {}

export class ApplyKitDto {
  @ApiProperty({ example: 'uuid' })
  @IsString()
  @IsNotEmpty()
  ejecucionId!: string;

  @ApiPropertyOptional({ example: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}
