// ============================================
// USER DTOs - Validación para gestión de usuarios
// ============================================

import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum UserRoleDto {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  TECNICO = 'tecnico',
  ADMINISTRATIVO = 'administrativo',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@cermont.com',
  })
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    minLength: 8,
    example: 'Secure123!',
  })
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial',
    },
  )
  password!: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Carlos Rodríguez',
  })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  name!: string;

  @ApiPropertyOptional({
    description: 'Rol del usuario',
    enum: UserRoleDto,
    default: UserRoleDto.TECNICO,
  })
  @IsOptional()
  @IsEnum(UserRoleDto, {
    message: 'El rol debe ser: admin, supervisor, tecnico o administrativo',
  })
  role?: UserRoleDto;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
    example: '+57 310 123 4567',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Nombre completo del usuario',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Teléfono del usuario',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({
    description: 'Estado activo del usuario',
  })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({
    description: 'URL del avatar',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  avatar?: string;
}

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Contraseña actual',
  })
  @IsString()
  @MinLength(8)
  currentPassword!: string;

  @ApiProperty({
    description: 'Nueva contraseña',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'La contraseña debe contener mayúscula, minúscula, número y carácter especial',
    },
  )
  newPassword!: string;

  @ApiProperty({
    description: 'Confirmación de nueva contraseña',
  })
  @IsString()
  confirmPassword!: string;
}

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'Nuevo rol del usuario',
    enum: UserRoleDto,
  })
  @IsEnum(UserRoleDto, {
    message: 'El rol debe ser: admin, supervisor, tecnico o administrativo',
  })
  role!: UserRoleDto;
}
