/**
 * @dto PreferenciasAlertaDto
 * 
 * DTOs para preferencias de alertas
 */

import { IsEnum, IsArray, IsBoolean, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TipoAlertaEnum } from '../../domain/value-objects/tipo-alerta.vo';
import { CanalNotificacionEnum } from '../../domain/value-objects/canal-notificacion.vo';

export class HorariosPermitidosDto {
  @ApiProperty({
    example: '09:00',
    description: 'Hora de inicio (formato HH:MM)',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de horario inválido. Use HH:MM (24h)',
  })
  inicio!: string;

  @ApiProperty({
    example: '18:00',
    description: 'Hora de fin (formato HH:MM)',
  })
  @IsString()
  @Matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Formato de horario inválido. Use HH:MM (24h)',
  })
  fin!: string;
}

export class ActualizarPreferenciasDto {
  @ApiProperty({
    enum: TipoAlertaEnum,
    example: TipoAlertaEnum.ORDEN_CREADA,
    description: 'Tipo de alerta para la cual se configuran las preferencias',
  })
  @IsEnum(TipoAlertaEnum)
  tipoAlerta!: TipoAlertaEnum;

  @ApiProperty({
    enum: CanalNotificacionEnum,
    isArray: true,
    example: [CanalNotificacionEnum.EMAIL, CanalNotificacionEnum.IN_APP],
    description: 'Canales preferidos para este tipo de alerta',
  })
  @IsArray()
  @IsEnum(CanalNotificacionEnum, { each: true })
  canalesPreferidos!: CanalNotificacionEnum[];

  @ApiPropertyOptional({
    example: false,
    description: 'Activar modo "no molestar" para este tipo de alerta',
  })
  @IsBoolean()
  @IsOptional()
  noMolestar?: boolean;

  @ApiPropertyOptional({
    type: HorariosPermitidosDto,
    example: { inicio: '09:00', fin: '18:00' },
    description: 'Horarios permitidos para recibir notificaciones (formato HH:MM)',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => HorariosPermitidosDto)
  horariosPermitidos?: HorariosPermitidosDto;
}

export class PreferenciaResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  usuarioId!: string;

  @ApiProperty({ enum: TipoAlertaEnum })
  tipoAlerta!: TipoAlertaEnum;

  @ApiProperty({ enum: CanalNotificacionEnum, isArray: true })
  canalesPreferidos!: CanalNotificacionEnum[];

  @ApiProperty()
  noMolestar!: boolean;

  @ApiPropertyOptional()
  horariosPermitidos?: { inicio: string; fin: string };

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

