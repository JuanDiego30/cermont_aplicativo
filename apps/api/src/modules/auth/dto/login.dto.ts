/**
 * @dto LoginDto
 *
 * DTO de login con validaciones para autenticación por email/password.
 *
 * Uso: Body de POST /auth/login (ValidationPipe global).
 */
import { IsEmail, IsString, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "admin@cermont.com" })
  @IsEmail({}, { message: "Email invalido" })
  email!: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(6, { message: "La contrasena debe tener al menos 6 caracteres" })
  password!: string;
}
