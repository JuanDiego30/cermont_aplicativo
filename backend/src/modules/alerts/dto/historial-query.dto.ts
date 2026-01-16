/**
 * @dto HistorialQueryDto
 *
 * DTO para consultar historial de alertas
 */

import { Pagination20QueryDto } from '@/shared/dto/pagination-20-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { EstadoAlertaEnum } from '../domain/value-objects/estado-alerta.vo';
import { PrioridadAlertaEnum } from '../domain/value-objects/prioridad-alerta.vo';
import { TipoAlertaEnum } from '../domain/value-objects/tipo-alerta.vo';

export class HistorialQueryDto extends Pagination20QueryDto {
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
