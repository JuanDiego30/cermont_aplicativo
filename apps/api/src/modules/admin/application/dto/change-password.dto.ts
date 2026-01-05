/**
 * @dto ChangePasswordDto
 *
 * DTO para cambio de contraseña por admin.
 */

import { z } from "zod";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Schema Zod para validación
 */
export const ChangePasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Contraseña debe contener mayúsculas, minúsculas y números",
    ),
});

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

/**
 * DTO class para Swagger documentation
 */
export class ChangePasswordDto implements ChangePasswordInput {
  @ApiProperty({
    example: "NewSecurePass456!",
    description:
      "Nueva contraseña (min 8 chars, mayúsculas, minúsculas y números)",
    minLength: 8,
  })
  newPassword!: string;
}
