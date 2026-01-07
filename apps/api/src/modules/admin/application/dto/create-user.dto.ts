/**
 * @dto CreateUserDto
 *
 * DTO con validación ClassValidator para creación de usuarios.
 * Usa el ValidationPipe global configurado en main.ts.
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsString,
  IsIn,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsUrl,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  USER_ROLES,
  type UserRoleType,
} from "../../domain/value-objects/user-role.vo";

/**
 * @deprecated Zod Schema mantenido temporalmente para compatibilidad.
 * Usar ClassValidator decorators en CreateUserDto directamente.
 */
import { z } from "zod";
export const CreateUserSchema = z.object({
  email: z.string().email().max(255).transform((val) => val.toLowerCase().trim()),
  name: z.string().min(2).max(100).transform((val) => val.trim()),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  role: z.enum(USER_ROLES),
  phone: z.string().regex(/^\+?[\d\s-]{7,20}$/).optional().or(z.literal("")),
  avatar: z.string().url().optional().or(z.literal("")),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

/**
 * DTO para crear usuarios con validación ClassValidator.
 * El ValidationPipe global se encarga de la validación.
 */
export class CreateUserDto {
  @ApiProperty({
    example: "tecnico@cermont.com",
    description: "Email del usuario",
  })
  @IsEmail({}, { message: "Email inválido" })
  @MaxLength(255, { message: "Email no puede exceder 255 caracteres" })
  @Transform(({ value }) => (typeof value === "string" ? value.toLowerCase().trim() : value))
  email!: string;

  @ApiProperty({
    example: "Juan Pérez",
    description: "Nombre completo",
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2, { message: "Nombre debe tener al menos 2 caracteres" })
  @MaxLength(100, { message: "Nombre no puede exceder 100 caracteres" })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  name!: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "Contraseña (min 8 chars, mayúsculas, minúsculas y números)",
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: "Contraseña debe tener al menos 8 caracteres" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Contraseña debe contener mayúsculas, minúsculas y números",
  })
  password!: string;

  @ApiProperty({
    enum: USER_ROLES,
    example: "tecnico",
    description: "Rol asignado",
  })
  @IsIn(USER_ROLES, { message: `Rol inválido. Roles válidos: ${USER_ROLES.join(", ")}` })
  role!: UserRoleType;

  @ApiPropertyOptional({
    example: "+57 3001234567",
    description: "Teléfono de contacto",
  })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[\d\s-]{7,20}$/, { message: "Formato de teléfono inválido" })
  phone?: string;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "URL del avatar",
  })
  @IsOptional()
  @IsUrl({}, { message: "URL de avatar inválida" })
  avatar?: string;
}
