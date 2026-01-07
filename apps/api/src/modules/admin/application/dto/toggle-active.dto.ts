/**
 * @dto ToggleActiveDto
 *
 * DTO para activar/desactivar usuario con ClassValidator.
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

/**
 * @deprecated Zod Schema mantenido para compatibilidad.
 */
import { z } from "zod";
export const ToggleActiveSchema = z.object({
  active: z.boolean(),
  reason: z.string().max(500).optional(),
});
export type ToggleActiveInput = z.infer<typeof ToggleActiveSchema>;

/**
 * DTO para toggle de estado activo con validación ClassValidator.
 */
export class ToggleActiveDto {
  @ApiProperty({
    example: false,
    description: "Estado activo del usuario",
  })
  @IsNotEmpty({ message: "El campo active es requerido" })
  @IsBoolean({ message: "El campo active debe ser booleano" })
  active!: boolean;

  @ApiPropertyOptional({
    example: "Usuario solicitó baja",
    description: "Razón del cambio de estado (opcional)",
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: "La razón no puede exceder 500 caracteres" })
  reason?: string;
}
