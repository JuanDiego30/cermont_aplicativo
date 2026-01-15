/**
 * @dto CreateUserDto
 *
 * DTO con validación class-validator para creación de usuarios.
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsUrl,
} from "class-validator";
import { Transform } from "class-transformer";
import {
  USER_ROLES,
  type UserRoleType,
} from "../../domain/value-objects/user-role.vo";

/**
 * DTO class para Swagger documentation
 */
export class CreateUserDto {
  @ApiProperty({
    example: "tecnico@cermont.com",
    description: "Email del usuario",
  })
  @Transform(({ value }) =>
    typeof value === "string" ? value.toLowerCase().trim() : value,
  )
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: "Juan Pérez",
    description: "Nombre completo",
    minLength: 2,
    maxLength: 100,
  })
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({
    example: "SecurePass123!",
    description: "Contraseña (min 8 chars, mayúsculas, minúsculas y números)",
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Contraseña debe contener mayúsculas, minúsculas y números",
  })
  password!: string;

  @ApiProperty({
    enum: USER_ROLES,
    example: "tecnico",
    description: "Rol asignado",
  })
  @IsEnum(USER_ROLES)
  role!: UserRoleType;

  @ApiPropertyOptional({
    example: "+57 3001234567",
    description: "Teléfono de contacto",
  })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @Matches(/^\+?[\d\s-]{7,20}$/, {
    message: "Formato de teléfono inválido",
  })
  phone?: string;

  @ApiPropertyOptional({
    example: "https://example.com/avatar.jpg",
    description: "URL del avatar",
  })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? undefined : value))
  @IsUrl()
  avatar?: string;
}

// Alias para compatibilidad con código existente
export type CreateUserInput = CreateUserDto;
