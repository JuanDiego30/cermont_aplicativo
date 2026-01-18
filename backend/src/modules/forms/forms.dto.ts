import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateFormTemplateDto {
  @ApiProperty()
  @IsString()
  nombre: string;

  @ApiProperty({ enum: ['checklist', 'inspeccion', 'mantenimiento', 'reporte', 'certificacion', 'hes', 'otro'] })
  @IsEnum(['checklist', 'inspeccion', 'mantenimiento', 'reporte', 'certificacion', 'hes', 'otro'])
  tipo: string;

  @ApiProperty()
  @IsString()
  categoria: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiProperty({ description: 'JSON Schema for the form' })
  @IsObject()
  schema: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'UI Schema for rendering' })
  @IsOptional()
  @IsObject()
  uiSchema?: Record<string, unknown>;
}

export class CreateFormInstanceDto {
  @ApiProperty()
  @IsString()
  templateId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ordenId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ejecucionId?: string;

  @ApiProperty({ description: 'Form data as JSON' })
  @IsObject()
  data: Record<string, unknown>;
}

export class UpdateFormInstanceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  data?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: ['borrador', 'en_revision', 'completado', 'rechazado'] })
  @IsOptional()
  @IsEnum(['borrador', 'en_revision', 'completado', 'rechazado'])
  estado?: string;
}
