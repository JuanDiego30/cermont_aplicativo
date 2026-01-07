/**
 * @module Cierre-Administrativo - Clean Architecture
 */
import { z } from "zod";
import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// Tipos de documento
const TIPOS_DOCUMENTO = ["acta", "ses", "factura", "otros"] as const;
type TipoDocumento = (typeof TIPOS_DOCUMENTO)[number];

// DTOs - ClassValidator
export class CierreDocumentoDto {
  @ApiProperty({
    description: "Tipo de documento",
    enum: TIPOS_DOCUMENTO,
  })
  @IsIn(TIPOS_DOCUMENTO, { message: "Tipo de documento inválido" })
  tipo!: TipoDocumento;

  @ApiPropertyOptional({ description: "Número de documento" })
  @IsOptional()
  @IsString()
  numero?: string;

  @ApiProperty({ description: "Fecha del documento (YYYY-MM-DD)" })
  @IsString()
  fechaDocumento!: string;

  @ApiPropertyOptional({ description: "Observaciones" })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class CreateCierreDto {
  @ApiProperty({ description: "ID de la orden (UUID)" })
  @IsUUID("4", { message: "ordenId debe ser un UUID válido" })
  ordenId!: string;

  @ApiProperty({
    description: "Documentos del cierre",
    type: [CierreDocumentoDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1, { message: "Debe incluir al menos un documento" })
  @Type(() => CierreDocumentoDto)
  documentos!: CierreDocumentoDto[];

  @ApiPropertyOptional({ description: "Observaciones generales" })
  @IsOptional()
  @IsString()
  observacionesGenerales?: string;
}

/** @deprecated Use la clase CierreDocumentoDto con ClassValidator */
export const CierreDocumentoSchema = z.object({
  tipo: z.enum(["acta", "ses", "factura", "otros"]),
  numero: z.string().optional(),
  fechaDocumento: z.string(),
  observaciones: z.string().optional(),
});

/** @deprecated Use la clase CreateCierreDto con ClassValidator */
export const CreateCierreSchema = z.object({
  ordenId: z.string().uuid(),
  documentos: z.array(CierreDocumentoSchema).min(1),
  observacionesGenerales: z.string().optional(),
});

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
