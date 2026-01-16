/**
 * @dto ToggleActiveDto
 *
 * DTO para activar/desactivar usuario.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO class para Swagger documentation
 */
export class ToggleActiveDto {
  @ApiProperty({
    example: false,
    description: 'Estado activo del usuario',
  })
  @Type(() => Boolean)
  @IsBoolean()
  active!: boolean;

  @ApiPropertyOptional({
    example: 'Usuario solicitó baja',
    description: 'Razón del cambio de estado (opcional)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
