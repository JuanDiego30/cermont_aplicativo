/**
 * @module Costos - Clean Architecture
 */
import { z } from "zod";
import {
  IsString,
  IsOptional,
  IsUUID,
  IsIn,
  IsNumber,
  IsPositive,
  MinLength,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// Enum de tipos de costo
const TIPOS_COSTO = ["mano_obra", "materiales", "transporte", "equipos", "otros"] as const;
type TipoCosto = (typeof TIPOS_COSTO)[number];

// DTOs - ClassValidator para ValidationPipe global
export class RegistrarCostoDto {
  @ApiProperty({ description: "ID de la orden (UUID)" })
  @IsUUID("4", { message: "ordenId debe ser un UUID válido" })
  ordenId!: string;

  @ApiProperty({
    description: "Tipo de costo",
    enum: TIPOS_COSTO,
  })
  @IsIn(TIPOS_COSTO, { message: "Tipo de costo inválido" })
  tipo!: TipoCosto;

  @ApiProperty({ description: "Descripción del costo", minLength: 3 })
  @IsString()
  @MinLength(3, { message: "La descripción debe tener al menos 3 caracteres" })
  descripcion!: string;

  @ApiProperty({ description: "Cantidad", minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: "La cantidad debe ser un número positivo" })
  cantidad!: number;

  @ApiProperty({ description: "Precio unitario", minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive({ message: "El precio unitario debe ser un número positivo" })
  precioUnitario!: number;

  @ApiPropertyOptional({ description: "Proveedor (opcional)" })
  @IsOptional()
  @IsString()
  proveedor?: string;
}

export class CostoQueryDto {
  @ApiPropertyOptional({ description: "Filtrar por orden (UUID)" })
  @IsOptional()
  @IsUUID("4", { message: "ordenId debe ser un UUID válido" })
  ordenId?: string;

  @ApiPropertyOptional({ description: "Filtrar por tipo de costo" })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ description: "Fecha desde (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: "Fecha hasta (YYYY-MM-DD)" })
  @IsOptional()
  @IsString()
  fechaHasta?: string;
}

/** @deprecated Use la clase RegistrarCostoDto con ClassValidator */
export const RegistrarCostoSchema = z.object({
  ordenId: z.string().uuid(),
  tipo: z.enum(["mano_obra", "materiales", "transporte", "equipos", "otros"]),
  descripcion: z.string().min(3),
  cantidad: z.number().positive(),
  precioUnitario: z.number().positive(),
  proveedor: z.string().optional(),
});

/** @deprecated Use la clase CostoQueryDto con ClassValidator */
export const CostoQuerySchema = z.object({
  ordenId: z.string().uuid().optional(),
  tipo: z.string().optional(),
  fechaDesde: z.string().optional(),
  fechaHasta: z.string().optional(),
});

export interface CostoResponse {
  id: string;
  ordenId: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  proveedor?: string;
  createdAt: string;
}

export interface CostoAnalysis {
  ordenId: string;
  costoPresupuestado: number;
  costoReal: number;
  varianza: number;
  varianzaPorcentual: number;
  desglosePorTipo: Record<string, number>;
}

// Repository Interface
export const COSTO_REPOSITORY = Symbol("COSTO_REPOSITORY");

export interface CostoData {
  id: string;
  ordenId: string;
  tipo: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  proveedor?: string;
  createdAt: Date;
}

export interface ICostoRepository {
  findByOrden(ordenId: string): Promise<CostoData[]>;
  findAll(filters: CostoQueryDto): Promise<CostoData[]>;
  create(data: RegistrarCostoDto): Promise<CostoData>;
  delete(id: string): Promise<void>;
  getAnalisis(ordenId: string): Promise<CostoAnalysis>;
}
