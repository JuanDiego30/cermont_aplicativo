/**
 * @module Cierre-Administrativo - Clean Architecture
 * DTOs con class-validator
 */
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsArray,
  ArrayMinSize,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export enum TipoDocumentoCierre {
  ACTA = "acta",
  SES = "ses",
  FACTURA = "factura",
  OTROS = "otros",
}

export class CierreDocumentoDto {
  @ApiProperty({ enum: TipoDocumentoCierre, example: TipoDocumentoCierre.ACTA })
  @IsEnum(TipoDocumentoCierre)
  tipo!: TipoDocumentoCierre;

  @ApiPropertyOptional({ example: "DOC-001" })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiProperty({ example: "2025-01-14" })
  @IsDateString()
  fechaDocumento!: string;

  @ApiPropertyOptional({ example: "Documento verificado" })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreateCierreDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  ordenId!: string;

  @ApiProperty({ type: [CierreDocumentoDto], minItems: 1 })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CierreDocumentoDto)
  documentos!: CierreDocumentoDto[];

  @ApiPropertyOptional({ example: "Cierre sin observaciones" })
  @IsOptional()
  @IsString()
  observacionesGenerales?: string;
}

export interface CierreDocumentoResponse {
  id: string;
  tipo: string;
  numero?: string;
  fechaDocumento: string;
  url?: string;
  estado: string;
}

export interface CierreResponse {
  id: string;
  ordenId: string;
  estado: string;
  documentos: CierreDocumentoResponse[];
  observaciones?: string;
  fechaCierre?: string;
  creadoPorId: string;
  createdAt: string;
}

// Repository Interface
export const CIERRE_REPOSITORY = Symbol("CIERRE_REPOSITORY");

export interface ICierreRepository {
  findByOrden(ordenId: string): Promise<any>;
  create(data: CreateCierreDto, userId: string): Promise<any>;
  uploadDocumento(
    cierreId: string,
    documentoId: string,
    url: string,
  ): Promise<void>;
  aprobar(cierreId: string, userId: string): Promise<any>;
  rechazar(cierreId: string, motivo: string): Promise<any>;
}
