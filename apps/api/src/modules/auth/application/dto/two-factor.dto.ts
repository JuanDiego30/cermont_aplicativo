import { z } from "zod";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsOptional,
  Length,
  Matches,
  MinLength,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

// ===========================
// DTO: Habilitar/Deshabilitar 2FA
// ===========================
/** @deprecated Use la clase Enable2FADto con ClassValidator */
export const Enable2FADtoSchema = z.object({
  enable: z.boolean(),
});

export class Enable2FADto {
  @ApiProperty({ description: "true para habilitar 2FA, false para deshabilitar" })
  @IsBoolean()
  @IsNotEmpty()
  enable!: boolean;
}

// ===========================
// DTO: Solicitar Código 2FA
// ===========================
/** @deprecated Use la clase Request2FACodeDto con ClassValidator */
export const Request2FACodeDtoSchema = z.object({
  email: z.string().email("Email inválido"),
});

export class Request2FACodeDto {
  @ApiProperty({ example: "usuario@ejemplo.com", description: "Email del usuario" })
  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty({ message: "Email requerido" })
  email!: string;
}

// ===========================
// DTO: Verificar Código 2FA
// ===========================
/** @deprecated Use la clase Verify2FACodeDto con ClassValidator */
export const Verify2FACodeDtoSchema = z.object({
  email: z.string().email("Email inválido"),
  code: z
    .string()
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d+$/, "El código debe contener solo números"),
});

export class Verify2FACodeDto {
  @ApiProperty({ example: "usuario@ejemplo.com", description: "Email del usuario" })
  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "123456", description: "Código 2FA de 6 dígitos" })
  @IsString()
  @Length(6, 6, { message: "El código debe tener 6 dígitos" })
  @Matches(/^\d+$/, { message: "El código debe contener solo números" })
  code!: string;
}

// ===========================
// DTO: Login con 2FA
// ===========================
/** @deprecated Use la clase LoginWith2FADto con ClassValidator */
export const LoginWith2FADtoSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  code: z
    .string()
    .length(6, "El código debe tener 6 dígitos")
    .regex(/^\d+$/, "El código debe contener solo números"),
  rememberMe: z.boolean().optional(),
});

export class LoginWith2FADto {
  @ApiProperty({ example: "usuario@ejemplo.com", description: "Email del usuario" })
  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ description: "Contraseña del usuario (min 6 caracteres)" })
  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password!: string;

  @ApiProperty({ example: "123456", description: "Código 2FA de 6 dígitos" })
  @IsString()
  @Length(6, 6, { message: "El código debe tener 6 dígitos" })
  @Matches(/^\d+$/, { message: "El código debe contener solo números" })
  code!: string;

  @ApiPropertyOptional({ description: "Recordar sesión" })
  @IsBoolean()
  @IsOptional()
  rememberMe?: boolean;
}
