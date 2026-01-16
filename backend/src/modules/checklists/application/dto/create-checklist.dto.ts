/**
 * @dto CreateChecklistDto
 *
 * DTO para crear una nueva plantilla de checklist
 */

import {
  IsString,
  IsOptional,
  IsArray,
  MinLength,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChecklistItemInputDto {
  @ApiProperty({
    example: 'Verificar conexiones eléctricas',
    description: 'Etiqueta del item',
    minLength: 1,
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  label!: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si el item es requerido',
    default: false,
  })
  @IsOptional()
  isRequired?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Orden del item en la lista',
    default: 0,
  })
  @IsOptional()
  orden?: number;
}

export class CreateChecklistDto {
  @ApiProperty({
    example: 'Checklist de Mantenimiento Preventivo',
    description: 'Nombre del checklist',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({
    example: 'Checklist para mantenimiento preventivo de equipos',
    description: 'Descripción del checklist',
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'mantenimiento',
    description: 'Tipo de checklist',
  })
  @IsString()
  tipo!: string;

  @ApiPropertyOptional({
    example: 'preventivo',
    description: 'Categoría del checklist',
  })
  @IsString()
  @IsOptional()
  categoria?: string;

  @ApiProperty({
    type: [ChecklistItemInputDto],
    description: 'Items del checklist',
    minItems: 1,
    maxItems: 100,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ChecklistItemInputDto)
  items!: ChecklistItemInputDto[];
}
