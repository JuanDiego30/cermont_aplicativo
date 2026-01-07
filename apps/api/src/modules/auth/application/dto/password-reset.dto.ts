import { z } from "zod";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

// ===========================
// DTO: Solicitar Reset de Contraseña
// ===========================
/** @deprecated Use la clase ForgotPasswordDto con ClassValidator */
export const ForgotPasswordDtoSchema = z.object({
  email: z.string().email("Email inválido"),
});

export class ForgotPasswordDto {
  @ApiProperty({ example: "usuario@ejemplo.com", description: "Email del usuario" })
  @IsEmail({}, { message: "Email inválido" })
  @IsNotEmpty({ message: "Email requerido" })
  email!: string;
}

// ===========================
// DTO: Resetear Contraseña
// ===========================
/** @deprecated Use la clase ResetPasswordDto con ClassValidator */
export const ResetPasswordDtoSchema = z.object({
  token: z.string().min(1, "Token requerido"),
  newPassword: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
    ),
});

export class ResetPasswordDto {
  @ApiProperty({ description: "Token de reset recibido por email" })
  @IsString()
  @IsNotEmpty({ message: "Token requerido" })
  token!: string;

  @ApiProperty({
    description: "Nueva contraseña (min 8 chars, 1 mayúscula, 1 minúscula, 1 número)",
  })
  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message:
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
  })
  newPassword!: string;
}

// ===========================
// DTO: Validar Token
// ===========================
/** @deprecated Use la clase ValidateResetTokenDto con ClassValidator */
export const ValidateResetTokenDtoSchema = z.object({
  token: z.string().min(1, "Token requerido"),
});

export class ValidateResetTokenDto {
  @ApiProperty({ description: "Token de reset para validar" })
  @IsString()
  @IsNotEmpty({ message: "Token requerido" })
  token!: string;
}
