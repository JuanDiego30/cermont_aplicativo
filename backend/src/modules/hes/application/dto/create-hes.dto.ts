/**
 * DTO: CreateHESDto
 *
 * DTO para crear una nueva HES
 */

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  IsArray,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ClienteInfoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  identificacion!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  telefono!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty()
  @IsObject()
  @IsNotEmpty()
  direccion!: {
    calle: string;
    numero?: string;
    barrio?: string;
    ciudad: string;
    departamento?: string;
    pais?: string;
    codigoPostal?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  coordenadasGPS?: {
    latitud: number;
    longitud: number;
  };
}

class CondicionesEntradaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  estadoGeneral!: string;

  @ApiProperty()
  @IsBoolean()
  equipoFuncional!: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  daniosVisibles?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fotosEntrada?: string[];
}

class DiagnosticoPreliminarDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  descripcion!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  causaProbable?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accionesRecomendadas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  requiereRepuestos?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  repuestosNecesarios?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  tiempoEstimado?: number;
}

class RequerimientosSeguridadDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  eppRequerido?: Array<{ tipo: string; descripcion?: string }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permisosNecesarios?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  riesgosIdentificados?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medidasControl?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  checklistItems?: Record<string, boolean>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreateHESDto {
  @ApiProperty({ description: 'ID de la orden de trabajo' })
  @IsString()
  @IsNotEmpty()
  ordenId!: string;

  @ApiProperty({
    description: 'Tipo de servicio',
    enum: [
      'MANTENIMIENTO_PREVENTIVO',
      'MANTENIMIENTO_CORRECTIVO',
      'REPARACION',
      'INSTALACION',
      'INSPECCION',
      'DIAGNOSTICO',
      'GARANTIA',
    ],
  })
  @IsString()
  @IsNotEmpty()
  tipoServicio!: string;

  @ApiProperty({
    description: 'Prioridad',
    enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'],
  })
  @IsString()
  @IsNotEmpty()
  prioridad!: string;

  @ApiProperty({ type: ClienteInfoDto })
  @ValidateNested()
  @Type(() => ClienteInfoDto)
  clienteInfo!: ClienteInfoDto;

  @ApiPropertyOptional({ type: CondicionesEntradaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CondicionesEntradaDto)
  condicionesEntrada?: CondicionesEntradaDto;

  @ApiPropertyOptional({ type: DiagnosticoPreliminarDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => DiagnosticoPreliminarDto)
  diagnosticoPreliminar?: DiagnosticoPreliminarDto;

  @ApiPropertyOptional({ type: RequerimientosSeguridadDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => RequerimientosSeguridadDto)
  requerimientosSeguridad?: RequerimientosSeguridadDto;
}
