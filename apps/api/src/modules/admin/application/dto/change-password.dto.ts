/**
 * @dto ChangePasswordDto
 *
 * DTO para cambio de contraseña por admin con ClassValidator.
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength, Matches, IsNotEmpty } from "class-validator";

/**
 * @deprecated Zod Schema mantenido para compatibilidad.
 */
import { z } from "zod";
export const ChangePasswordSchema = z.object({
  newPassword: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

/**
 * DTO para cambio de contraseña con validación ClassValidator.
 */
export class ChangePasswordDto {
  @ApiProperty({
    example: "NewSecurePass456!",
    description: "Nueva contraseña (min 8 chars, mayúsculas, minúsculas y números)",
    minLength: 8,
  })
  @IsNotEmpty({ message: "La contraseña es requerida" })
  @IsString()
  @MinLength(8, { message: "Contraseña debe tener al menos 8 caracteres" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Contraseña debe contener mayúsculas, minúsculas y números",
  })
  newPassword!: string;
}
