/**
 * @module Ejecucion - Clean Architecture
 * @description DTOs con class-validator
 */
import { IsString, IsOptional, IsUUID, IsNumber, Min, Max, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IniciarEjecucionDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID()
  tecnicoId!: string;

  @ApiPropertyOptional({ example: 'Iniciando trabajo de mantenimiento' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  horasEstimadas?: number;

  @ApiPropertyOptional({ example: { lat: 7.1234, lon: -73.1234 } })
  @IsOptional()
  @IsObject()
  ubicacionGPS?: { lat: number; lon: number };
}

export class UpdateAvanceDto {
  @ApiProperty({ example: 50, minimum: 0, maximum: 100 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  avance!: number;

  @ApiPropertyOptional({ example: 'Avance del 50% completado' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  horasActuales?: number;
}

export class CompletarEjecucionDto {
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID()
  completadoPorId?: string;

  @ApiPropertyOptional({ example: 'Trabajo finalizado sin incidentes' })
  @IsOptional()
  @IsString()
  observacionesFinales?: string;

  @ApiPropertyOptional({ example: 'base64signature...' })
  @IsOptional()
  @IsString()
  firmaDigital?: string;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  horasReales?: number;

  @ApiProperty({ example: 8 })
  @IsNumber()
  @Type(() => Number)
  horasActuales!: number;

  @ApiPropertyOptional({ example: 'Observaciones finales' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export interface EjecucionResponse {
  id: string;
  ordenId: string;
  tecnicoId: string;
  estado: string;
  avance: number;
  horasReales: number;
  fechaInicio: string;
  fechaFin?: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

// Repository Interface
export const EJECUCION_REPOSITORY = Symbol('EJECUCION_REPOSITORY');

export interface IEjecucionRepository {
  findByOrdenId(ordenId: string): Promise<any>;
  iniciar(ordenId: string, data: IniciarEjecucionDto): Promise<any>;
  updateAvance(id: string, data: UpdateAvanceDto): Promise<any>;
  completar(id: string, data: CompletarEjecucionDto): Promise<any>;
}
