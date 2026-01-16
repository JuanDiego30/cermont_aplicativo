/**
 * @dto PreferenciasAlertaDto
 *
 * DTOs para preferencias de alertas
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { CanalNotificacionEnum } from '../domain/value-objects/canal-notificacion.vo';
import { TipoAlertaEnum } from '../domain/value-objects/tipo-alerta.vo';

export class ActualizarPreferenciasDto {
  @ApiProperty({
    enum: TipoAlertaEnum,
    example: TipoAlertaEnum.acta_sin_firmar,
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
    example: { inicio: '09:00', fin: '18:00' },
    description: 'Horarios permitidos para recibir notificaciones (formato HH:MM)',
  })
  @IsOptional()
  horariosPermitidos?: {
    inicio: string;
    fin: string;
  };
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
