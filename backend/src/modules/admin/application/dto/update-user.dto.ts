/**
 * @dto UpdateUserDto
 *
 * DTO para actualización parcial de usuarios.
 */

import { z } from "zod";
import { ApiPropertyOptional } from "@nestjs/swagger";

/**
 * Schema Zod para validación
 */
export const UpdateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .transform((val) => val.trim())
    .optional(),

  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,20}$/, "Formato de teléfono inválido")
    .optional()
    .nullable()
    .or(z.literal("")),

  avatar: z
    .string()
    .url("URL de avatar inválida")
    .optional()
    .nullable()
    .or(z.literal("")),
});

export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * DTO class para Swagger documentation
 */
export class UpdateUserDto implements UpdateUserInput {
  @ApiPropertyOptional({
    example: "Juan Pérez Actualizado",
    description: "Nombre completo",
    minLength: 2,
    maxLength: 100,
  })
  name?: string;

  @ApiPropertyOptional({
    example: "+57 3009876543",
    description: "Teléfono de contacto",
  })
  phone?: string | null;

  @ApiPropertyOptional({
    example: "https://example.com/new-avatar.jpg",
    description: "URL del avatar",
  })
  avatar?: string | null;
}
