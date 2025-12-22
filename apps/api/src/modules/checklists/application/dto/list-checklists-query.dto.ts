/**
 * @dto ListChecklistsQueryDto
 * 
 * DTO para consultar checklists con filtros y paginación
 */

import { IsInt, Min, Max, IsEnum, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ChecklistStatusEnum } from '../../domain/value-objects/checklist-status.vo';

export class ListChecklistsQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'mantenimiento' })
  @IsString()
  @IsOptional()
  tipo?: string;

  @ApiPropertyOptional({ example: 'preventivo' })
  @IsString()
  @IsOptional()
  categoria?: string;

  @ApiPropertyOptional({ enum: ChecklistStatusEnum })
  @IsEnum(ChecklistStatusEnum)
  @IsOptional()
  status?: ChecklistStatusEnum;

  @ApiPropertyOptional({ example: true, default: true })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({ example: 'mantenimiento' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsOptional()
  ordenId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsOptional()
  ejecucionId?: string;
}

