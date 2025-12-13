/**
 * @dto Archivado DTOs
 * 
 * DTOs para gestión de archivos históricos y respaldos.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsNumber,
    IsEnum,
    IsOptional,
    IsString,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

// ============================================
// ENUMS
// ============================================

export enum TipoArchivo {
    ORDENES_CSV = 'ORDENES_CSV',
    EVIDENCIAS_ZIP = 'EVIDENCIAS_ZIP',
    INFORMES_PDF = 'INFORMES_PDF',
    BACKUP_COMPLETO = 'BACKUP_COMPLETO',
}

// ============================================
// REQUEST DTOs
// ============================================

export class ArchivarMesDto {
    @ApiProperty({ example: 12, description: 'Mes (1-12)' })
    @IsNumber()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    mes!: number;

    @ApiProperty({ example: 2024, description: 'Año' })
    @IsNumber()
    @Min(2020)
    @Max(2100)
    @Type(() => Number)
    anio!: number;
}

export class ListarArchivosQueryDto {
    @ApiPropertyOptional({ example: 2024, description: 'Filtrar por año' })
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    anio?: number;

    @ApiPropertyOptional({ enum: TipoArchivo, description: 'Filtrar por tipo' })
    @IsOptional()
    @IsEnum(TipoArchivo)
    tipo?: TipoArchivo;
}

export class GenerarZipDto {
    @ApiProperty({ example: 12, description: 'Mes (1-12)' })
    @IsNumber()
    @Min(1)
    @Max(12)
    @Type(() => Number)
    mes!: number;

    @ApiProperty({ example: 2024, description: 'Año' })
    @IsNumber()
    @Min(2020)
    @Max(2100)
    @Type(() => Number)
    anio!: number;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class ArchivoHistoricoDto {
    @ApiProperty({ example: 'uuid-archivo' })
    id!: string;

    @ApiProperty({ enum: TipoArchivo, example: 'ORDENES_CSV' })
    tipo!: TipoArchivo;

    @ApiProperty({ example: 12 })
    mes!: number;

    @ApiProperty({ example: 2024 })
    anio!: number;

    @ApiProperty({ example: 'ordenes_2024_12.csv' })
    nombreArchivo!: string;

    @ApiProperty({ example: 1048576 })
    tamanioBytes!: number;

    @ApiProperty({ example: '1.00' })
    tamanioMB!: string;

    @ApiProperty({ example: 45 })
    cantidadOrdenes!: number;

    @ApiProperty({ example: 230 })
    cantidadEvidencias!: number;

    @ApiPropertyOptional({ example: 'Órdenes completadas de 12/2024' })
    descripcion?: string;

    @ApiProperty({ example: '2024-12-31T23:00:00Z' })
    fechaArchivado!: string;
}

export class ListarArchivosResponseDto {
    @ApiProperty({ type: [ArchivoHistoricoDto] })
    data!: ArchivoHistoricoDto[];
}

export class ArchivarResultadoDto {
    @ApiProperty({ example: 'Archivado completado' })
    message!: string;

    @ApiProperty({ example: 15 })
    archivadas!: number;

    @ApiPropertyOptional()
    archivo?: {
        id: string;
        nombreArchivo: string;
        cantidadOrdenes: number;
        tamanioBytes: number;
    };
}

export class EstadisticasArchivadoDto {
    @ApiProperty({ example: 12 })
    totalArchivos!: number;

    @ApiProperty({ example: 450 })
    totalOrdenes!: number;

    @ApiProperty({ example: 2300 })
    totalEvidencias!: number;

    @ApiProperty({
        example: { bytes: 1073741824, mb: '1024.00', gb: '1.00' },
    })
    espacioUsado!: {
        bytes: number;
        mb: string;
        gb: string;
    };

    @ApiProperty({
        example: { '2024': { ordenes: 300, evidencias: 1500, archivos: 8 } },
    })
    porAnio!: Record<string, { ordenes: number; evidencias: number; archivos: number }>;
}

export class DescargaArchivoDto {
    @ApiProperty({ example: '/archivos/ordenes_2024_12.csv' })
    filePath!: string;

    @ApiProperty({ example: 'ordenes_2024_12.csv' })
    fileName!: string;

    @ApiProperty({ example: 'text/csv' })
    mimeType!: string;
}
