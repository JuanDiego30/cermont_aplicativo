import { IsOptional, IsEnum, IsString, IsDateString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoOrden, PrioridadOrden } from './create-orden.dto';

export class QueryOrdenDto {
    @ApiPropertyOptional({
        enum: EstadoOrden,
        description: 'Filtrar por estado'
    })
    @IsEnum(EstadoOrden)
    @IsOptional()
    estado?: EstadoOrden;

    @ApiPropertyOptional({
        enum: PrioridadOrden,
        description: 'Filtrar por prioridad'
    })
    @IsEnum(PrioridadOrden)
    @IsOptional()
    prioridad?: PrioridadOrden;

    @ApiPropertyOptional({
        description: 'ID del cliente',
        example: 'clm7h8i9j0'
    })
    @IsString()
    @IsOptional()
    clienteId?: string;

    @ApiPropertyOptional({
        description: 'ID del técnico',
        example: 'tec1a2b3c4'
    })
    @IsString()
    @IsOptional()
    tecnicoId?: string;

    @ApiPropertyOptional({
        description: 'Fecha desde (filtro)',
        example: '2025-12-01T00:00:00Z'
    })
    @IsDateString()
    @IsOptional()
    fechaDesde?: string;

    @ApiPropertyOptional({
        description: 'Fecha hasta (filtro)',
        example: '2025-12-31T23:59:59Z'
    })
    @IsDateString()
    @IsOptional()
    fechaHasta?: string;

    @ApiPropertyOptional({
        description: 'Término de búsqueda',
        example: 'bomba'
    })
    @IsString()
    @IsOptional()
    buscar?: string;

    @ApiPropertyOptional({
        description: 'Número de página',
        default: 1,
        minimum: 1
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
        maximum: 100
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({
        description: 'Campo para ordenar',
        example: 'createdAt'
    })
    @IsString()
    @IsOptional()
    sortBy?: string = 'createdAt';

    @ApiPropertyOptional({
        description: 'Dirección de ordenamiento',
        enum: ['asc', 'desc'],
        default: 'desc'
    })
    @IsOptional()
    sortOrder?: 'asc' | 'desc' = 'desc';
}
