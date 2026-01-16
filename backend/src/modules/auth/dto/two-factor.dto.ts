/**
 * DTOs para Two-Factor Authentication con class-validator
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

// ===========================
// DTO: Habilitar/Deshabilitar 2FA
// ===========================
export class Enable2FADto {
  @ApiProperty({ example: true })
  @IsBoolean()
  enable!: boolean;
}

// ===========================
// DTO: Solicitar Código 2FA
// ===========================
export class Request2FACodeDto {
  @ApiProperty({ example: 'usuario@cermont.com' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value
  )
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;
}

// ===========================
// DTO: Verificar Código 2FA
// ===========================
export class Verify2FACodeDto {
  @ApiProperty({ example: 'usuario@cermont.com' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value
  )
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({ example: '123456', description: 'Código de 6 dígitos' })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  @Matches(/^\d+$/, { message: 'El código debe contener solo números' })
  code!: string;
}

// ===========================
// DTO: Login con 2FA
// ===========================
export class LoginWith2FADto {
  @ApiProperty({ example: 'usuario@cermont.com' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value
  )
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({ example: 'Password123' })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @ApiProperty({ example: '123456', description: 'Código de 6 dígitos' })
  @IsString()
  @Length(6, 6, { message: 'El código debe tener 6 dígitos' })
  @Matches(/^\d+$/, { message: 'El código debe contener solo números' })
  code!: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
