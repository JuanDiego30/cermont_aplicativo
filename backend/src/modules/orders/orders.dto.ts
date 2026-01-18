import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

/**
 * Simple DTOs for Orders module
 * Uses class-validator for input validation
 */

export class CreateOrderDto {
  @ApiProperty({ description: 'Nombre del cliente' })
  @IsString()
  cliente: string;

  @ApiProperty({ description: 'Descripción del trabajo' })
  @IsString()
  descripcion: string;

  @ApiPropertyOptional({ description: 'Ubicación del trabajo' })
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiPropertyOptional({ enum: ['baja', 'media', 'alta', 'urgente'] })
  @IsOptional()
  @IsEnum(['baja', 'media', 'alta', 'urgente'])
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';

  @ApiPropertyOptional({ description: 'ID del técnico asignado' })
  @IsOptional()
  @IsString()
  asignadoId?: string;
}

export class UpdateOrderDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  cliente?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ubicacion?: string;

  @ApiPropertyOptional({ enum: ['baja', 'media', 'alta', 'urgente'] })
  @IsOptional()
  @IsEnum(['baja', 'media', 'alta', 'urgente'])
  prioridad?: 'baja' | 'media' | 'alta' | 'urgente';

  @ApiPropertyOptional({ enum: ['pendiente', 'planeacion', 'ejecucion', 'completada', 'cancelada'] })
  @IsOptional()
  @IsEnum(['pendiente', 'planeacion', 'ejecucion', 'completada', 'cancelada'])
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  asignadoId?: string;
}

export class OrderFilterDto {
  @ApiPropertyOptional({ enum: ['pendiente', 'planeacion', 'ejecucion', 'completada', 'cancelada'] })
  @IsOptional()
  @IsEnum(['pendiente', 'planeacion', 'ejecucion', 'completada', 'cancelada'])
  status?: string;

  @ApiPropertyOptional({ enum: ['baja', 'media', 'alta', 'urgente'] })
  @IsOptional()
  @IsEnum(['baja', 'media', 'alta', 'urgente'])
  prioridad?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  asignadoId?: string;
}

export class ChangeStatusDto {
  @ApiProperty({ enum: ['pendiente', 'planeacion', 'ejecucion', 'completada', 'cancelada'] })
  @IsEnum(['pendiente', 'planeacion', 'ejecucion', 'completada', 'cancelada'])
  status: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observaciones?: string;
}
