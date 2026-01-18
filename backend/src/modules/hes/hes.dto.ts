import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateHESDto {
  @ApiProperty()
  @IsString()
  ordenId: string;

  @ApiProperty({ enum: ['MANTENIMIENTO_PREVENTIVO', 'MANTENIMIENTO_CORRECTIVO', 'REPARACION', 'INSTALACION', 'INSPECCION', 'DIAGNOSTICO', 'GARANTIA'] })
  @IsEnum(['MANTENIMIENTO_PREVENTIVO', 'MANTENIMIENTO_CORRECTIVO', 'REPARACION', 'INSTALACION', 'INSPECCION', 'DIAGNOSTICO', 'GARANTIA'])
  tipoServicio: string;

  @ApiProperty({ enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'] })
  @IsEnum(['BAJA', 'MEDIA', 'ALTA', 'URGENTE'])
  prioridad: string;

  @ApiPropertyOptional({ enum: ['BAJO', 'MEDIO', 'ALTO', 'CRITICO'] })
  @IsOptional()
  @IsEnum(['BAJO', 'MEDIO', 'ALTO', 'CRITICO'])
  nivelRiesgo?: string;

  @ApiProperty({ description: 'Client info as JSON' })
  @IsObject()
  clienteInfo: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  condicionesEntrada?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  diagnosticoPreliminar?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  requerimientosSeguridad?: Record<string, unknown>;
}

export class UpdateHESDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  tipoServicio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  prioridad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nivelRiesgo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  clienteInfo?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  condicionesEntrada?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  diagnosticoPreliminar?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  requerimientosSeguridad?: Record<string, unknown>;
}
