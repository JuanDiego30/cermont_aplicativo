/**
 * @dto AlertaResponseDto
 * 
 * DTO de respuesta para alertas
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAlertaEnum } from '../../domain/value-objects/tipo-alerta.vo';
import { PrioridadAlertaEnum } from '../../domain/value-objects/prioridad-alerta.vo';
import { CanalNotificacionEnum } from '../../domain/value-objects/canal-notificacion.vo';
import { EstadoAlertaEnum } from '../../domain/value-objects/estado-alerta.vo';

export class AlertaResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ enum: TipoAlertaEnum })
  tipo!: TipoAlertaEnum;

  @ApiProperty({ enum: PrioridadAlertaEnum })
  prioridad!: PrioridadAlertaEnum;

  @ApiProperty({ example: 'Acta pendiente de firma' })
  titulo!: string;

  @ApiProperty({ example: 'El acta de la orden ORD-123 lleva más de 7 días sin firmar' })
  mensaje!: string;

  @ApiProperty({ enum: EstadoAlertaEnum })
  estado!: EstadoAlertaEnum;

  @ApiProperty({ enum: CanalNotificacionEnum, isArray: true })
  canales!: CanalNotificacionEnum[];

  @ApiPropertyOptional()
  enviadaEn?: Date;

  @ApiPropertyOptional()
  leidaEn?: Date;

  @ApiProperty({ example: 0 })
  intentosEnvio!: number;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PaginatedAlertasResponseDto {
  @ApiProperty({ type: [AlertaResponseDto] })
  items!: AlertaResponseDto[];

  @ApiProperty({ example: 100 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 20 })
  limit!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

