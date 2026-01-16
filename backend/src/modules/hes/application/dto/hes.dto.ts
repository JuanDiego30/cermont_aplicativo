/**
 * @module HES (Inspección de Equipos) - Clean Architecture
 * @description DTOs con class-validator
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsBoolean, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

// ============== Enums ==============

export enum TipoInspeccionHES {
  PRE_USO = 'pre_uso',
  PERIODICA = 'periodica',
  EXTRAORDINARIA = 'extraordinaria',
}

// ============== DTOs ==============

export class CreateHESDto {
  @ApiProperty({ description: 'UUID del equipo' })
  @IsUUID('4')
  equipoId!: string;

  @ApiPropertyOptional({ description: 'UUID de la orden relacionada' })
  @IsOptional()
  @IsUUID('4')
  ordenId?: string;

  @ApiProperty({ enum: TipoInspeccionHES })
  @IsEnum(TipoInspeccionHES)
  tipo!: TipoInspeccionHES;

  @ApiProperty({ description: 'Resultados de la inspección' })
  @IsObject()
  resultados!: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Observaciones' })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({ description: '¿Aprobado?' })
  @IsBoolean()
  aprobado!: boolean;
}

export class HESQueryDto {
  @ApiPropertyOptional({ description: 'UUID del equipo' })
  @IsOptional()
  @IsUUID('4')
  equipoId?: string;

  @ApiPropertyOptional({ description: 'UUID de la orden' })
  @IsOptional()
  @IsUUID('4')
  ordenId?: string;

  @ApiPropertyOptional({ description: 'Filtrar por aprobación' })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => value === 'true' || value === true)
  @IsBoolean()
  aprobado?: boolean;

  @ApiPropertyOptional({ description: 'Fecha desde (ISO)' })
  @IsOptional()
  @IsString()
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta (ISO)' })
  @IsOptional()
  @IsString()
  fechaHasta?: string;
}

export interface HESResponse {
  id: string;
  equipoId: string;
  ordenId?: string;
  tipo: string;
  resultados: Record<string, unknown>;
  observaciones?: string;
  aprobado: boolean;
  inspectorId: string;
  createdAt: string;
}

// Repository Interface
export const HES_REPOSITORY = Symbol('HES_REPOSITORY');

export interface IHESRepository {
  findAll(filters: HESQueryDto): Promise<unknown[]>;
  findById(id: string): Promise<unknown>;
  findByEquipo(equipoId: string): Promise<unknown[]>;
  create(data: CreateHESDto, inspectorId: string): Promise<unknown>;
  // Métodos para equipos HES
  findAllEquipos(): Promise<unknown[]>;
  findEquipoById(id: string): Promise<unknown>;
  updateEquipoUltimaInspeccion(equipoId: string, fecha: Date): Promise<unknown>;
}
