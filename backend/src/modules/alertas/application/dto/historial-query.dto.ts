/**
 * @dto HistorialQueryDto
 *
 * DTO para consultar historial de alertas
 */

import {
  IsInt,
  Min,
  Max,
  IsEnum,
  IsOptional,
  IsBoolean,
} from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { TipoAlertaEnum } from "../../domain/value-objects/tipo-alerta.vo";
import { EstadoAlertaEnum } from "../../domain/value-objects/estado-alerta.vo";
import { PrioridadAlertaEnum } from "../../domain/value-objects/prioridad-alerta.vo";
import { Pagination20QueryDto } from "../../../../common/dto/pagination-20-query.dto";

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
