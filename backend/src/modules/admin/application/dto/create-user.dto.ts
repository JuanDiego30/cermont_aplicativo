/**
 * @dto CreateUserDto
 *
 * DTO con validación Zod para creación de usuarios.
 */

import { z } from "zod";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  USER_ROLES,
  type UserRoleType,
} from "../../domain/value-objects/user-role.vo";

/**
 * Schema Zod para validación
 */
export const CreateUserSchema = z.object({
  email: z
    .string()
    .email("Email inválido")
    .max(255, "Email no puede exceder 255 caracteres")
    .transform((val) => val.toLowerCase().trim()),

  name: z
    .string()
    .min(2, "Nombre debe tener al menos 2 caracteres")
    .max(100, "Nombre no puede exceder 100 caracteres")
    .transform((val) => val.trim()),

  password: z
    .string()
    .min(8, "Contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Contraseña debe contener mayúsculas, minúsculas y números",
    ),

  role: z.enum(USER_ROLES, {
    message: `Rol inválido. Roles válidos: ${USER_ROLES.join(", ")}`,
  }),

  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,20}$/, "Formato de teléfono inválido")
    .optional()
    .or(z.literal("")),

  avatar: z.string().url("URL de avatar inválida").optional().or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * DTO class para Swagger documentation
 */
export class CreateUserDto implements CreateUserInput {
  @ApiProperty({
    example: "tecnico@cermont.com",
    description: "Email del usuario",
  })
  email!: string;

  @ApiProperty({
    example: "Juan Pérez",
    description: "Nombre completo",
    minLength: 2,
    maxLength: 100,
  })
  name!: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "Contraseña (min 8 chars, mayúsculas, minúsculas y números)",
    minLength: 8,
  })
  password!: string;

  @ApiProperty({
    enum: USER_ROLES,
    example: "tecnico",
    description: "Rol asignado",
  })
  role!: UserRoleType;

  @ApiPropertyOptional({
    example: "+57 3001234567",
    description: "Teléfono de contacto",
  })
  phone?: string;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "URL del avatar",
  })
  avatar?: string;
}
