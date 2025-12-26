import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsEnum,
} from 'class-validator';
import { PdfPageSize, PdfOrientation } from './generate-pdf.dto';

export class GenerateReporteOrdenDto {
    @ApiProperty({
        description: 'ID de la orden de trabajo',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    @IsNotEmpty()
    ordenId!: string;

    @ApiPropertyOptional({
        description: 'Incluir detalles del cliente',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirCliente?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir detalles del técnico',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirTecnico?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir líneas de vida asociadas',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirLineasVida?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir equipos/kits asociados',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    incluirEquipos?: boolean = true;

    @ApiPropertyOptional({
        description: 'Incluir evidencias fotográficas',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    incluirEvidencias?: boolean = false;

    @ApiPropertyOptional({
        description: 'Incluir historial de estados',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    incluirHistorial?: boolean = false;

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
