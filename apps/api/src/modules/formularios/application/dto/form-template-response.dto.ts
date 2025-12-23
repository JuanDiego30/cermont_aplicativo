/**
 * DTO: FormTemplateResponseDto
 * 
 * DTO de respuesta para template de formulario
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FormFieldResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  label!: string;

  @ApiPropertyOptional()
  placeholder?: string;

  @ApiPropertyOptional()
  helpText?: string;

  @ApiProperty()
  isRequired!: boolean;

  @ApiProperty()
  order!: number;

  @ApiPropertyOptional()
  options?: string[];
}

export class FormTemplateResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty()
  version!: string;

  @ApiProperty()
  status!: string;

  @ApiProperty()
  contextType!: string;

  @ApiProperty({ type: [FormFieldResponseDto] })
  fields!: FormFieldResponseDto[];

  @ApiProperty()
  schema!: Record<string, any>;

  @ApiProperty()
  createdAt!: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;

  @ApiPropertyOptional()
  publishedAt?: Date;

  @ApiProperty()
  createdBy!: string;
}

