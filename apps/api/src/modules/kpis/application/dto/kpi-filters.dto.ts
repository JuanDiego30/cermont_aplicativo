import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsEnum, IsUUID } from 'class-validator';

export enum KpiPeriodo {
    HOY = 'HOY',
    SEMANA = 'SEMANA',
    MES = 'MES',
    TRIMESTRE = 'TRIMESTRE',
    ANO = 'ANO',
    CUSTOM = 'CUSTOM',
}

export class KpiFiltersDto {
    @ApiPropertyOptional({
        description: 'Período predefinido',
        enum: KpiPeriodo,
        example: KpiPeriodo.MES,
    })
    @IsOptional()
    @IsEnum(KpiPeriodo)
    periodo?: KpiPeriodo;

    @ApiPropertyOptional({
        description: 'Fecha inicial (ISO 8601)',
        example: '2024-01-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsDateString()
    fechaInicio?: string;

    @ApiPropertyOptional({
        description: 'Fecha final (ISO 8601)',
        example: '2024-12-31T23:59:59.999Z',
    })
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por cliente específico',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsOptional()
    @IsUUID()
    clienteId?: string;

    @ApiPropertyOptional({
        description: 'Filtrar por técnico específico',
        example: '123e4567-e89b-12d3-a456-426614174001',
    })
    @IsOptional()
    @IsUUID()
    tecnicoId?: string;
}
