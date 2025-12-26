import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsEnum,
} from 'class-validator';
import { PdfPageSize, PdfOrientation } from './generate-pdf.dto';

export class GenerateReporteMantenimientoDto {
    @ApiProperty({
        description: 'ID del mantenimiento',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    mantenimientoId!: string;

    @ApiPropertyOptional({
        description: 'Incluir detalles del activo',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirActivo?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir detalles del técnico',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirTecnico?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir tareas realizadas',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirTareas?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir problemas encontrados',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirProblemas?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir repuestos utilizados',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirRepuestos?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir recomendaciones',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirRecomendaciones?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir evidencias fotográficas',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirEvidencias?: boolean = true;

    @ApiPropertyOptional({
        description: 'Tamaño de página',
        enum: PdfPageSize,
        example: PdfPageSize.A4,
    })
    @IsOptional()
    @IsEnum(PdfPageSize)
    pageSize?: PdfPageSize = PdfPageSize.A4;

    @ApiPropertyOptional({
        description: 'Orientación',
        enum: PdfOrientation,
        example: PdfOrientation.PORTRAIT,
    })
    @IsOptional()
    @IsEnum(PdfOrientation)
    orientation?: PdfOrientation = PdfOrientation.PORTRAIT;
}
