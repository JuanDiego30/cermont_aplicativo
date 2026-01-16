import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Prioridad } from './create-order.dto';
import { Orderstado } from './update-order.dto';

export class QueryOrdersDto {
  @ApiPropertyOptional({
    description: 'Número de página',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    example: 10,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: Orderstado,
  })
  @IsOptional()
  @IsEnum(Orderstado)
  estado?: Orderstado;

  @ApiPropertyOptional({
    description: 'Filtrar por prioridad',
    enum: Prioridad,
  })
  @IsOptional()
  @IsEnum(Prioridad)
  prioridad?: Prioridad;

  @ApiPropertyOptional({
    description: 'Buscar por número, descripción o cliente',
    example: 'ORD-2024',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por cliente (nombre)',
    example: 'Ecopetrol',
  })
  @IsOptional()
  @IsString()
  cliente?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por técnico asignado',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  asignadoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por creador',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  creadorId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha desde',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha hasta',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Solo órdenes vencidas',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  soloVencidas?: boolean;

  @ApiPropertyOptional({
    description: 'Solo órdenes sin asignar',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  soloSinAsignar?: boolean;

  @ApiPropertyOptional({
    description: 'Orderar por campo',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección de Orderamiento',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
