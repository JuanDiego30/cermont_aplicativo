import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { EstadoOrder, PrioridadOrder } from './create-order.dto';

export class QueryOrderDto {
  @ApiPropertyOptional({
    enum: EstadoOrder,
    description: 'Filtrar por estado',
  })
  @IsEnum(EstadoOrder)
  @IsOptional()
  estado?: EstadoOrder;

  @ApiPropertyOptional({
    enum: PrioridadOrder,
    description: 'Filtrar por prioridad',
  })
  @IsEnum(PrioridadOrder)
  @IsOptional()
  prioridad?: PrioridadOrder;

  @ApiPropertyOptional({
    description: 'ID del cliente',
    example: 'clm7h8i9j0',
  })
  @IsString()
  @IsOptional()
  clienteId?: string;

  @ApiPropertyOptional({
    description: 'ID del técnico',
    example: 'tec1a2b3c4',
  })
  @IsString()
  @IsOptional()
  tecnicoId?: string;

  @ApiPropertyOptional({
    description: 'Fecha desde (filtro)',
    example: '2025-12-01T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Fecha hasta (filtro)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsDateString()
  @IsOptional()
  fechaHasta?: string;

  @ApiPropertyOptional({
    description: 'Término de búsqueda',
    example: 'bomba',
  })
  @IsString()
  @IsOptional()
  buscar?: string;

  @ApiPropertyOptional({
    description: 'Número de página',
    default: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Cantidad de resultados por página',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Campo para Orderar',
    example: 'createdAt',
  })
  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Dirección de Orderamiento',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
