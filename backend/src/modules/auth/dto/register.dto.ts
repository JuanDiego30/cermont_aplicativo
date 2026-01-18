/**
 * @dto RegisterDto (legacy - usar application/dto/register.dto.ts)
 * Mantenido por compatibilidad
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// Regex para password: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export enum UserRoleEnum {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
}

export class RegisterDtoLegacy {
  @ApiProperty({ example: 'usuario@cermont.com' })
  @Transform(({ value }: TransformFnParams) =>
    typeof value === 'string' ? value.toLowerCase().trim() : value
  )
  @IsEmail({}, { message: 'Email inválido' })
  email!: string;

  @ApiProperty({
    example: 'Password123',
    description: 'Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener mínimo 8 caracteres' })
  @Matches(PASSWORD_REGEX, {
    message: 'La contraseña debe contener al menos 1 mayúscula, 1 minúscula y 1 número',
  })
  password!: string;

  @ApiProperty({ example: 'Juan Pérez', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener mínimo 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name!: string;

  @ApiPropertyOptional({ enum: UserRoleEnum })
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Número de teléfono inválido' })
  phone?: string;
}

// Alias for backward compatibility
export { RegisterDtoLegacy as RegisterDtoSwagger };
export type RegisterDto = RegisterDtoLegacy;
