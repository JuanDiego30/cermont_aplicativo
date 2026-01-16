/**
 * @module PDF Generation - Clean Architecture
 * @description DTOs con class-validator
 */
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============== Enums ==============

export enum TemplateType {
  ORDEN_TRABAJO = 'orden_trabajo',
  REPORTE_EJECUCION = 'reporte_ejecucion',
  ACTA_ENTREGA = 'acta_entrega',
  INSPECCION_HES = 'inspeccion_hes',
  INSPECCION_LINEA_VIDA = 'inspeccion_linea_vida',
  CHECKLIST = 'checklist',
  REPORTE_MENSUAL = 'reporte_mensual',
}

export enum TipoReporte {
  ORDENES = 'ordenes',
  MANTENIMIENTOS = 'mantenimientos',
  INSPECCIONES = 'inspecciones',
  COSTOS = 'costos',
}

export enum PDFFormat {
  A4 = 'A4',
  LETTER = 'letter',
}

export enum PDFOrientation {
  PORTRAIT = 'portrait',
  LANDSCAPE = 'landscape',
}

// ============== DTOs ==============

export class GeneratePDFOptionsDto {
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  includeSignatures?: boolean = true;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  includeEvidencias?: boolean = false;

  @ApiPropertyOptional({ enum: PDFFormat, default: 'A4' })
  @IsOptional()
  @IsEnum(PDFFormat)
  format?: PDFFormat = PDFFormat.A4;

  @ApiPropertyOptional({ enum: PDFOrientation, default: 'portrait' })
  @IsOptional()
  @IsEnum(PDFOrientation)
  orientation?: PDFOrientation = PDFOrientation.PORTRAIT;
}

export class GeneratePDFDto {
  @ApiProperty({ enum: TemplateType })
  @IsEnum(TemplateType)
  templateType!: TemplateType;

  @ApiProperty({ description: 'UUID de la entidad' })
  @IsUUID('4')
  entityId!: string;

  @ApiPropertyOptional({ type: GeneratePDFOptionsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => GeneratePDFOptionsDto)
  options?: GeneratePDFOptionsDto;
}

export class GenerateReportePDFDto {
  @ApiProperty({ enum: TipoReporte })
  @IsEnum(TipoReporte)
  tipoReporte!: TipoReporte;

  @ApiProperty({ description: 'Fecha inicio (ISO)' })
  @IsString()
  fechaInicio!: string;

  @ApiProperty({ description: 'Fecha fin (ISO)' })
  @IsString()
  fechaFin!: string;

  @ApiPropertyOptional({ description: 'Filtros adicionales' })
  @IsOptional()
  @IsObject()
  filtros?: Record<string, unknown>;
}

export interface PDFResult {
  filename: string;
  path: string;
  size: number;
  mimeType: string;
  generatedAt: string;
}

// Service Interface
export const PDF_SERVICE = Symbol('PDF_SERVICE');

export interface IPDFService {
  generateFromTemplate(template: string, data: Record<string, unknown>): Promise<Buffer>;
  generateFromHtml(html: string): Promise<Buffer>;
}

// Repository Interface
export const PDF_REPOSITORY = Symbol('PDF_REPOSITORY');

export interface IPDFRepository {
  getOrdenData(ordenId: string): Promise<Record<string, unknown>>;
  getHESData(hesId: string): Promise<Record<string, unknown>>;
  getLineaVidaData(lineaVidaId: string): Promise<Record<string, unknown>>;
  getChecklistData(checklistId: string): Promise<Record<string, unknown>>;
  getReporteData(
    tipo: string,
    fechaInicio: string,
    fechaFin: string,
    filtros?: Record<string, unknown>
  ): Promise<Record<string, unknown>>;
  savePDFRecord(
    filename: string,
    path: string,
    entityType: string,
    entityId: string,
    userId: string
  ): Promise<unknown>;
}
