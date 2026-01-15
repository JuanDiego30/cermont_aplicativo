/**
 * DTOs para Password Reset con class-validator
 */
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  Matches,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";

// Regex para password: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

// ===========================
// DTO: Solicitar Reset de Contraseña
// ===========================
export class ForgotPasswordDto {
  @ApiProperty({ example: "usuario@cermont.com" })
  @Transform(({ value }) =>
    typeof value === "string" ? value.toLowerCase().trim() : value,
  )
  @IsEmail({}, { message: "Email inválido" })
  email!: string;
}

// ===========================
// DTO: Resetear Contraseña
// ===========================
export class ResetPasswordDto {
  @ApiProperty({ example: "abc123token" })
  @IsString()
  @IsNotEmpty({ message: "Token requerido" })
  token!: string;

  @ApiProperty({
    example: "NewPassword123",
    description: "Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número",
  })
  @IsString()
  @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
  @Matches(PASSWORD_REGEX, {
    message:
      "La contraseña debe contener al menos una mayúscula, una minúscula y un número",
  })
  newPassword!: string;
}

// ===========================
// DTO: Validar Token
// ===========================
export class ValidateResetTokenDto {
  @ApiProperty({ example: "abc123token" })
  @IsString()
  @IsNotEmpty({ message: "Token requerido" })
  token!: string;
}
