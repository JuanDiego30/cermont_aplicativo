import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsBoolean,
    IsObject,
} from 'class-validator';

export enum PdfPageSize {
    A4 = 'A4',
    LETTER = 'LETTER',
    LEGAL = 'LEGAL',
    A3 = 'A3',
}

export enum PdfOrientation {
    PORTRAIT = 'portrait',
    LANDSCAPE = 'landscape',
}

export class GeneratePdfDto {
    @ApiProperty({
        description: 'Contenido HTML del PDF',
        example: '<html><body><h1>Reporte</h1></body></html>',
    })
    @IsString()
    @IsNotEmpty()
    html!: string;

    @ApiPropertyOptional({
        description: 'Nombre del archivo (sin extensión)',
        example: 'reporte-orden-001',
    })
    @IsOptional()
    @IsString()
    filename?: string;

    @ApiPropertyOptional({
        description: 'Tamaño de página',
        enum: PdfPageSize,
        example: PdfPageSize.A4,
    })
    @IsOptional()
    @IsEnum(PdfPageSize)
    pageSize?: PdfPageSize = PdfPageSize.A4;

    @ApiPropertyOptional({
        description: 'Orientación de página',
        enum: PdfOrientation,
        example: PdfOrientation.PORTRAIT,
    })
    @IsOptional()
    @IsEnum(PdfOrientation)
    orientation?: PdfOrientation = PdfOrientation.PORTRAIT;

    @ApiPropertyOptional({
        description: 'Mostrar encabezado',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    displayHeaderFooter?: boolean = false;

    @ApiPropertyOptional({
        description: 'Template HTML para encabezado',
        example: '<div style="font-size:10px">Cermont - Página <span class="pageNumber"></span></div>',
    })
    @IsOptional()
    @IsString()
    headerTemplate?: string;

    @ApiPropertyOptional({
        description: 'Template HTML para pie de página',
        example: '<div style="font-size:10px;text-align:center">© 2024 Cermont</div>',
    })
    @IsOptional()
    @IsString()
    footerTemplate?: string;

    @ApiPropertyOptional({
        description: 'Márgenes del documento',
        example: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
    })
    @IsOptional()
    @IsObject()
    margin?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
    };

    @ApiPropertyOptional({
        description: 'Guardar en storage (S3/local)',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    saveToStorage?: boolean = false;

    @ApiPropertyOptional({
        description: 'Habilitar caché del PDF',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    enableCache?: boolean = true;
}
