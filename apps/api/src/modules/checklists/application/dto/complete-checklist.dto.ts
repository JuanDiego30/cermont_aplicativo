/**
 * @dto CompleteChecklistDto
 */

import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteChecklistDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del checklist',
  })
  @IsString()
  @IsUUID()
  checklistId!: string;
}

