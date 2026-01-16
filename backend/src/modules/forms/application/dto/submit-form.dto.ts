/**
 * DTO: SubmitFormDto
 *
 * DTO para enviar un formulario completado
 */

import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SubmitFormDto {
  @ApiProperty({ description: 'ID del template de formulario' })
  @IsString()
  @IsNotEmpty()
  templateId!: string;

  @ApiPropertyOptional({
    description: 'Tipo de contexto (orden, checklist, etc.)',
  })
  @IsOptional()
  @IsString()
  contextType?: string;

  @ApiPropertyOptional({
    description: 'ID del contexto (ordenId, checklistId, etc.)',
  })
  @IsOptional()
  @IsString()
  contextId?: string;

  @ApiProperty({
    description: 'Respuestas del formulario (fieldId -> value)',
    example: {
      nombre_cliente: 'Empresa ABC',
      fecha_inspeccion: '2024-12-23',
      estado: 'Aprobado',
    },
  })
  @IsObject()
  @IsNotEmpty()
  answers!: Record<string, unknown>;

  @IsOptional()
  @IsString()
  ordenId?: string;

  @IsOptional()
  data?: unknown;

  @IsOptional()
  @IsString()
  estado?: string;
}
