/**
 * @dto HistorialQueryDto
 * 
 * DTO para consultar historial de alertas
 */

import { IsInt, Min, Max, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoAlertaEnum } from '../../domain/value-objects/tipo-alerta.vo';
import { EstadoAlertaEnum } from '../../domain/value-objects/estado-alerta.vo';
import { PrioridadAlertaEnum } from '../../domain/value-objects/prioridad-alerta.vo';

export class HistorialQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, minimum: 1, maximum: 100, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @ApiPropertyOptional({ enum: TipoAlertaEnum })
  @IsEnum(TipoAlertaEnum)
  @IsOptional()
  tipo?: TipoAlertaEnum;

  @ApiPropertyOptional({ enum: EstadoAlertaEnum })
  @IsEnum(EstadoAlertaEnum)
  @IsOptional()
  estado?: EstadoAlertaEnum;

  @ApiPropertyOptional({ enum: PrioridadAlertaEnum })
  @IsEnum(PrioridadAlertaEnum)
  @IsOptional()
  prioridad?: PrioridadAlertaEnum;

  @ApiPropertyOptional({ example: false, default: false })
  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  soloNoLeidas?: boolean = false;
}

