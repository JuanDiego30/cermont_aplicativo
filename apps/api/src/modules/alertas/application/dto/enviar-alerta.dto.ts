/**
 * @dto EnviarAlertaDto
 * 
 * DTO para enviar una alerta a un usuario
 */

import { IsString, IsEnum, MinLength, MaxLength, IsArray, IsOptional, IsUUID, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoAlertaEnum } from '../../domain/value-objects/tipo-alerta.vo';
import { PrioridadAlertaEnum } from '../../domain/value-objects/prioridad-alerta.vo';
import { CanalNotificacionEnum } from '../../domain/value-objects/canal-notificacion.vo';

export class EnviarAlertaDto {
  @ApiProperty({
    enum: TipoAlertaEnum,
    example: TipoAlertaEnum.ORDEN_CREADA,
    description: 'Tipo de alerta',
  })
  @IsEnum(TipoAlertaEnum)
  tipo!: TipoAlertaEnum;

  @ApiProperty({
    enum: PrioridadAlertaEnum,
    example: PrioridadAlertaEnum.WARNING,
    description: 'Prioridad de la alerta',
  })
  @IsEnum(PrioridadAlertaEnum)
  prioridad!: PrioridadAlertaEnum;

  @ApiProperty({
    example: 'Acta pendiente de firma',
    description: 'Título de la alerta',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  titulo!: string;

  @ApiProperty({
    example: 'El acta de la orden ORD-123 lleva más de 7 días sin firmar',
    description: 'Mensaje de la alerta',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  mensaje!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID del usuario destinatario',
  })
  @IsString()
  @IsUUID()
  destinatarioId!: string;

  @ApiPropertyOptional({
    enum: CanalNotificacionEnum,
    isArray: true,
    example: [CanalNotificacionEnum.EMAIL, CanalNotificacionEnum.IN_APP],
    description: 'Canales de notificación (si no se especifica, usa preferencias del usuario)',
  })
  @IsArray()
  @IsEnum(CanalNotificacionEnum, { each: true })
  @IsOptional()
  canales?: CanalNotificacionEnum[];

  @ApiPropertyOptional({
    example: { ordenId: '123', numero: 'ORD-123' },
    description: 'Metadata adicional de la alerta',
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

