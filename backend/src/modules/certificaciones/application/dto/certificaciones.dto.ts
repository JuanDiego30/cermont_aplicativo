import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import {
  TipoCertificacionEquipo,
  TipoCertificacionTecnico,
} from '../../domain/value-objects/tipo-certificacion.vo';

abstract class CreateCertificacionBaseDto {
  @ApiProperty({ description: 'Entidad certificadora', example: 'SENA' })
  @IsString()
  @IsNotEmpty()
  entidadCertificadora!: string;

  @ApiProperty({
    description: 'Número de certificado',
    example: 'CERT-2024-001',
  })
  @IsString()
  @IsNotEmpty()
  numeroCertificado!: string;

  @ApiProperty({ description: 'Fecha de emisión', example: '2024-01-15' })
  @IsDateString()
  fechaEmision!: string;

  @ApiProperty({ description: 'Fecha de vencimiento', example: '2025-01-15' })
  @IsDateString()
  fechaVencimiento!: string;

  @ApiPropertyOptional({ description: 'URL del archivo del certificado' })
  @IsOptional()
  @IsUrl()
  archivoUrl?: string;

  @ApiPropertyOptional({ description: 'Observaciones adicionales' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

/**
 * DTO para crear certificación de técnico
 */
export class CreateCertificacionTecnicoDto extends CreateCertificacionBaseDto {
  @ApiProperty({ description: 'ID del técnico' })
  @IsString()
  @IsNotEmpty()
  tecnicoId!: string;

  @ApiProperty({
    enum: TipoCertificacionTecnico,
    description: 'Tipo de certificación',
  })
  @IsEnum(TipoCertificacionTecnico)
  tipo!: TipoCertificacionTecnico;
}

/**
 * DTO para crear certificación de equipo
 */
export class CreateCertificacionEquipoDto extends CreateCertificacionBaseDto {
  @ApiProperty({ description: 'ID del kit/equipo' })
  @IsString()
  @IsNotEmpty()
  equipoId!: string;

  @ApiProperty({
    enum: TipoCertificacionEquipo,
    description: 'Tipo de certificación',
  })
  @IsEnum(TipoCertificacionEquipo)
  tipo!: TipoCertificacionEquipo;
}

/**
 * DTO de respuesta de certificación
 */
export class CertificacionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tipo!: string;

  @ApiProperty()
  tipoDisplay!: string;

  @ApiProperty()
  entidadCertificadora!: string;

  @ApiProperty()
  numeroCertificado!: string;

  @ApiProperty()
  fechaEmision!: string;

  @ApiProperty()
  fechaVencimiento!: string;

  @ApiProperty({ description: 'Estado de vigencia' })
  estadoVigencia!: string;

  @ApiProperty({ description: 'Días restantes para vencimiento' })
  diasRestantes!: number;

  @ApiProperty({ description: 'Mensaje descriptivo de vigencia' })
  mensajeVigencia!: string;

  @ApiPropertyOptional({
    description: 'Nivel de alerta',
    enum: ['INFO', 'WARNING', 'CRITICAL'],
  })
  alertLevel?: string | null;

  @ApiPropertyOptional()
  archivoUrl?: string;

  @ApiPropertyOptional()
  observaciones?: string;
}

/**
 * DTO para validar certificaciones
 */
export class ValidarCertificacionesDto {
  @ApiProperty({ description: 'IDs de técnicos a validar', type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  tecnicosIds!: string[];

  @ApiPropertyOptional({
    description: 'IDs de equipos a validar',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equiposIds?: string[];

  @ApiPropertyOptional({
    description: 'Tipos de certificación requeridos',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tiposRequeridos?: string[];
}

export class CertificacionesQueryDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Días para vencimiento (default: 30)',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === undefined || value === null || value === '' ? undefined : Number(value)
  )
  @IsInt()
  @Min(1)
  dias?: number;
}

/**
 * DTO de resultado de validación
 */
export class ValidacionResultDto {
  @ApiProperty()
  allValid!: boolean;

  @ApiProperty({ type: [CertificacionResponseDto] })
  valid!: CertificacionResponseDto[];

  @ApiProperty({ description: 'Certificaciones inválidas o faltantes' })
  invalid!: Array<{
    id: string;
    nombre: string;
    tipo: string;
    razon: string;
  }>;

  @ApiProperty({ description: 'Alertas de vencimiento próximo' })
  alerts!: Array<{
    id: string;
    tipo: string;
    diasRestantes: number;
    nivel: string;
  }>;
}
