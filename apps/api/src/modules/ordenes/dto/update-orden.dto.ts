import { PartialType } from '@nestjs/swagger';
import { CreateOrdenDto } from './create-orden.dto';
import { IsOptional, IsDateString, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrdenDto extends PartialType(CreateOrdenDto) {
    @ApiPropertyOptional({
        description: 'Fecha real de inicio de ejecución',
        example: '2025-12-30T09:15:00Z'
    })
    @IsDateString({}, { message: 'Fecha real de inicio inválida' })
    @IsOptional()
    fechaRealInicio?: string;

    @ApiPropertyOptional({
        description: 'Fecha real de finalización',
        example: '2025-12-31T16:30:00Z'
    })
    @IsDateString({}, { message: 'Fecha real de fin inválida' })
    @IsOptional()
    fechaRealFin?: string;

    @ApiPropertyOptional({
        description: 'Costo real del trabajo en COP',
        example: 1650000
    })
    @IsNumber()
    @Min(0)
    @IsOptional()
    costoReal?: number;
}
