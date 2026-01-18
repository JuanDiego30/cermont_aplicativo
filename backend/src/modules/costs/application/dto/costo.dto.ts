/**
 * @module Costos - Clean Architecture
 * DTOs con class-validator
 */
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNumber,
  IsPositive,
  MinLength,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum TipoCosto {
  MANO_OBRA = 'mano_obra',
  MATERIALES = 'materiales',
  TRANSPORTE = 'transporte',
  EQUIPOS = 'equipos',
  OTROS = 'otros',
}

export class RegistrarCostoDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  ordenId!: string;

  @ApiProperty({ enum: TipoCosto, example: TipoCosto.MANO_OBRA })
  @IsEnum(TipoCosto)
  tipo!: TipoCosto;

  @ApiProperty({ example: 'Instalación de equipos', minLength: 3 })
  @IsString()
  @MinLength(3)
  descripcion!: string;

  @ApiProperty({ example: 5, minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  cantidad!: number;

  @ApiProperty({ example: 150000, minimum: 0.01 })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  precioUnitario!: number;

  @ApiPropertyOptional({ example: 'Proveedor XYZ' })
  @IsOptional()
  @IsString()
  proveedor?: string;
}

export class CostoQueryDto {
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  ordenId?: string;

  @ApiPropertyOptional({ example: 'mano_obra' })
  @IsOptional()
  @IsString()
  tipo?: string;

  @ApiPropertyOptional({ example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  fechaDesde?: string;

  @ApiPropertyOptional({ example: '2025-12-31' })
  @IsOptional()
  @IsDateString()
  fechaHasta?: string;
}

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
export const COSTO_REPOSITORY = Symbol('COSTO_REPOSITORY');

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
