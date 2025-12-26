import { ApiProperty } from '@nestjs/swagger';

export class PdfResponseDto {
    @ApiProperty({
        description: 'Buffer del PDF en base64',
        example: 'JVBERi0xLjQKJeLjz9MK...',
    })
    buffer!: string;

    @ApiProperty({
        description: 'Nombre del archivo',
        example: 'reporte-orden-001.pdf',
    })
    filename!: string;

    @ApiProperty({
        description: 'Tipo MIME',
        example: 'application/pdf',
    })
    mimeType!: string;

    @ApiProperty({
        description: 'Tamaño en bytes',
        example: 245678,
    })
    size!: number;

    @ApiProperty({
        description: 'URL si fue guardado en storage',
        example: 'https://storage.cermont.com/pdfs/reporte-orden-001.pdf',
    })
    url?: string;

    @ApiProperty({
        description: 'Fecha de generación',
        example: '2024-12-24T18:00:00.000Z',
    })
    generatedAt!: Date;
}
