/**
 * @dto PreferenciasAlertaDto
 *
 * DTOs para preferencias de alertas
 */

import {
  IsEnum,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TipoAlertaEnum } from "../../domain/value-objects/tipo-alerta.vo";
import { CanalNotificacionEnum } from "../../domain/value-objects/canal-notificacion.vo";

export class ActualizarPreferenciasDto {
  @ApiProperty({
    enum: TipoAlertaEnum,
    example: TipoAlertaEnum.ORDEN_CREADA,
    description: "Tipo de alerta para la cual se configuran las preferencias",
  })
  @IsEnum(TipoAlertaEnum)
  tipoAlerta!: TipoAlertaEnum;

  @ApiProperty({
    enum: CanalNotificacionEnum,
    isArray: true,
    example: [CanalNotificacionEnum.EMAIL, CanalNotificacionEnum.IN_APP],
    description: "Canales preferidos para este tipo de alerta",
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
    example: { inicio: "09:00", fin: "18:00" },
    description:
      "Horarios permitidos para recibir notificaciones (formato HH:MM)",
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
