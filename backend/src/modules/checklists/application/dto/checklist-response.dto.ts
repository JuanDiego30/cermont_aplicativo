/**
 * @dto ChecklistResponseDto
 *
 * DTO de respuesta para checklists
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChecklistStatusEnum } from '../../domain/value-objects/checklist-status.vo';

export class ChecklistItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  isRequired!: boolean;

  @ApiProperty()
  isChecked!: boolean;

  @ApiPropertyOptional()
  checkedAt?: Date;

  @ApiPropertyOptional()
  observaciones?: string;

  @ApiProperty()
  orden!: number;
}

export class ChecklistResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: ChecklistStatusEnum })
  status!: ChecklistStatusEnum;

  @ApiPropertyOptional()
  tipo?: string;

  @ApiPropertyOptional()
  categoria?: string;

  @ApiProperty({ type: [ChecklistItemResponseDto] })
  items!: ChecklistItemResponseDto[];

  @ApiPropertyOptional()
  ordenId?: string;

  @ApiPropertyOptional()
  ejecucionId?: string;

  @ApiPropertyOptional()
  templateId?: string;

  @ApiProperty()
  completada!: boolean;

  @ApiProperty()
  completionRatio!: number;

  @ApiProperty()
  completionPercentage!: number;

  @ApiProperty()
  isTemplate!: boolean;

  @ApiProperty()
  isAssigned!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedChecklistsResponseDto {
  @ApiProperty({ type: [ChecklistResponseDto] })
  items!: ChecklistResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
