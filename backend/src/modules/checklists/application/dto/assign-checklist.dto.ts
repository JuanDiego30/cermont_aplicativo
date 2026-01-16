/**
 * @dto AssignChecklistDto
 *
 * DTOs para asignar checklists
 */

import { IsString, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignChecklistToOrdenDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la orden',
  })
  @IsString()
  @IsUUID()
  ordenId!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del checklist template',
  })
  @IsString()
  @IsUUID()
  checklistId!: string;
}

export class AssignChecklistToEjecucionDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID de la ejecución',
  })
  @IsString()
  @IsUUID()
  ejecucionId!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del checklist template',
  })
  @IsString()
  @IsUUID()
  checklistId!: string;
}
