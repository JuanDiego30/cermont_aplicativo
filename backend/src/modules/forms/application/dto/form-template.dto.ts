/**
 * @dto CreateFormTemplateDto
 *
 * DTO para crear un nuevo template de formulario dinámico
 */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoFormularioDto {
  CHECKLIST = 'CHECKLIST',
  INSPECCION = 'INSPECCION',
  MANTENIMIENTO = 'MANTENIMIENTO',
  REPORTE = 'REPORTE',
  CERTIFICACION = 'CERTIFICACION',
  HES = 'HES',
  OTRO = 'OTRO',
}

export class CreateFormTemplateDto {
  @ApiProperty({ example: 'Inspección Líneas de Vida Vertical' })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({ enum: TipoFormularioDto, example: 'INSPECCION' })
  @IsEnum(TipoFormularioDto)
  tipo!: TipoFormularioDto;

  @ApiProperty({ example: 'Líneas de Vida' })
  @IsString()
  @IsNotEmpty()
  categoria!: string;

  @ApiPropertyOptional({ example: '1.0' })
  @IsOptional()
  @IsString()
  version?: string;

  @ApiProperty({
    description: 'JSON Schema del formulario con secciones y campos',
    example: {
      sections: [
        {
          id: 'datos-generales',
          title: 'Datos Generales',
          fields: [
            {
              id: 'numero_linea',
              label: 'Número Línea',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },
  })
  @IsObject()
  schema!: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'UI Schema opcional para estilos/layout',
  })
  @IsOptional()
  @IsObject()
  uiSchema?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 'Formulario para inspección de líneas de vida verticales',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional({ example: ['HES', 'inspección', 'líneas-vida'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class UpdateFormTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ enum: TipoFormularioDto })
  @IsOptional()
  @IsEnum(TipoFormularioDto)
  tipo?: TipoFormularioDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  categoria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  schema?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  uiSchema?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
