import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsDateString,
  IsEnum,
  Min,
  Max,
  IsBoolean,
} from "class-validator";
import { Type } from "class-transformer";

/**
 * Tipo de exportación
 */
export enum TipoExportacion {
  CSV = "CSV",
  ZIP = "ZIP",
}

/**
 * Estado de archivo
 */
export enum EstadoArchivo {
  ACTIVO = "ACTIVO",
  ARCHIVADO = "ARCHIVADO",
  EXPORTADO = "EXPORTADO",
}

/**
 * DTO para archivar manualmente
 */
export class ArchivarManualDto {
  @ApiProperty({ description: "IDs de órdenes a archivar", type: [String] })
  @IsString({ each: true })
  ordenesIds!: string[];

  @ApiPropertyOptional({ description: "Motivo del archivado manual" })
  @IsOptional()
  @IsString()
  motivo?: string;
}

/**
 * DTO para exportar histórico
 */
export class ExportarHistoricoDto {
  @ApiProperty({ description: "Mes (1-12)" })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(12)
  mes!: number;

  @ApiProperty({ description: "Año" })
  @Type(() => Number)
  @IsNumber()
  @Min(2020)
  @Max(2099)
  anio!: number;

  @ApiProperty({ enum: TipoExportacion, description: "Formato de exportación" })
  @IsEnum(TipoExportacion)
  formato!: TipoExportacion;

  @ApiPropertyOptional({ description: "Incluir evidencias en ZIP" })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  incluirEvidencias?: boolean;
}

/**
 * DTO para consultar histórico
 */
export class ConsultarHistoricoDto {
  @ApiPropertyOptional({ description: "Número de orden" })
  @IsOptional()
  @IsString()
  numeroOrden?: string;

  @ApiPropertyOptional({ description: "ID del cliente" })
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiPropertyOptional({ description: "Fecha desde" })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: "Fecha hasta" })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;

  @ApiPropertyOptional({ description: "Página" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pagina?: number;

  @ApiPropertyOptional({ description: "Límite por página" })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limite?: number;
}

/**
 * DTO de respuesta de orden archivada
 */
export class OrdenArchivadaResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  numero!: string;

  @ApiProperty()
  descripcion!: string;

  @ApiProperty()
  cliente!: string;

  @ApiProperty()
  estado!: string;

  @ApiProperty()
  fechaCreacion!: string;

  @ApiProperty()
  fechaCierre!: string;

  @ApiProperty()
  fechaArchivado!: string;

  @ApiProperty()
  montoTotal!: number;

  @ApiProperty()
  tieneEvidencias!: boolean;

  @ApiProperty()
  tienePDF!: boolean;
}

export class ConsultarHistoricoResponseDto {
  @ApiProperty({ type: [OrdenArchivadaResponseDto] })
  ordenes!: OrdenArchivadaResponseDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  pagina!: number;

  @ApiProperty()
  totalPaginas!: number;
}

/**
 * DTO de resultado de archivado
 */
export class ResultadoArchivadoDto {
  @ApiProperty()
  exito!: boolean;

  @ApiProperty()
  ordenesArchivadas!: number;

  @ApiProperty()
  ordenesOmitidas!: number;

  @ApiProperty({ type: [String] })
  errores!: string[];

  @ApiProperty()
  fechaEjecucion!: string;

  @ApiProperty()
  proximoArchivado!: string;
}

/**
 * DTO de resultado de exportación
 */
export class ResultadoExportacionDto {
  @ApiProperty()
  exito!: boolean;

  @ApiProperty()
  archivoUrl!: string;

  @ApiProperty()
  nombreArchivo!: string;

  @ApiProperty()
  tamano!: number;

  @ApiProperty()
  formato!: string;

  @ApiProperty()
  ordenesIncluidas!: number;

  @ApiProperty()
  fechaGeneracion!: string;
}

/**
 * DTO de estadísticas de archivo
 */
export class EstadisticasArchivoDto {
  @ApiProperty()
  totalOrdenesActivas!: number;

  @ApiProperty()
  totalOrdenesArchivadas!: number;

  @ApiProperty()
  totalExportaciones!: number;

  @ApiProperty()
  espacioUtilizadoMB!: number;

  @ApiProperty()
  ultimoArchivado?: string;

  @ApiProperty()
  proximoArchivado!: string;

  @ApiProperty({ type: [Object] })
  archivosPorMes!: Array<{
    mes: string;
    cantidad: number;
    tamanoMB: number;
  }>;
}
