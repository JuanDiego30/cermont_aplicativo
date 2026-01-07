/**
 * @dto UpdateUserDto
 *
 * DTO para actualización parcial de usuarios con ClassValidator.
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsUrl,
  ValidateIf,
} from "class-validator";
import { Transform } from "class-transformer";

/**
 * @deprecated Zod Schema mantenido para compatibilidad.
 */
import { z } from "zod";
export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).transform((val) => val.trim()).optional(),
  phone: z.string().regex(/^\+?[\d\s-]{7,20}$/).optional().nullable().or(z.literal("")),
  avatar: z.string().url().optional().nullable().or(z.literal("")),
});
export type UpdateUserInput = z.infer<typeof UpdateUserSchema>;

/**
 * DTO para actualizar usuarios con validación ClassValidator.
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: "Juan Pérez Actualizado",
    description: "Nombre completo",
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, { message: "Nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "Nombre no puede exceder 100 caracteres" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  name?: string;

  @ApiPropertyOptional({
    example: "+57 3009876543",
    description: "Teléfono de contacto",
  })
  @IsOptional()
  @ValidateIf((o) => o.phone !== null && o.phone !== "")
  @Matches(/^\+?[\d\s-]{7,20}$/, { message: "Formato de teléfono inválido" })
  phone?: string | null;

  @ApiPropertyOptional({
    example: "https://example.com/new-avatar.jpg",
    description: "URL del avatar",
  })
  @IsOptional()
  @ValidateIf((o) => o.avatar !== null && o.avatar !== "")
  @IsUrl({}, { message: "URL de avatar inválida" })
  avatar?: string | null;
}
