/**
 * @dto Admin DTOs
 * 
 * DTOs para gestión de usuarios, roles y permisos.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
import { UserRoleEnum } from '../interfaces/permissions.interface';

// ============================================
// CREATE USER
// ============================================

export class CreateUserDto {
    @ApiProperty({ example: 'tecnico@cermont.com', description: 'Email del usuario' })
    @IsEmail({}, { message: 'Email inválido' })
    email!: string;

    @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo' })
    @IsString()
    @MinLength(3, { message: 'Nombre debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'Nombre no puede exceder 100 caracteres' })
    name!: string;

    @ApiProperty({ example: 'SecurePass123!', description: 'Contraseña' })
    @IsString()
    @MinLength(8, { message: 'Contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Contraseña debe contener mayúsculas, minúsculas y números',
    })
    password!: string;

    @ApiProperty({ enum: UserRoleEnum, example: 'tecnico', description: 'Rol asignado' })
    @IsEnum(UserRoleEnum, { message: 'Rol inválido' })
    role!: UserRoleEnum;

    @ApiPropertyOptional({ example: '+57 3001234567', description: 'Teléfono' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: 'URL avatar' })
    @IsOptional()
    @IsString()
    avatar?: string;
}

// ============================================
// UPDATE USER
// ============================================

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'Juan Pérez Actualizado' })
    @IsOptional()
    @IsString()
    @MinLength(3)
    @MaxLength(100)
    name?: string;

    @ApiPropertyOptional({ example: '+57 3009876543' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'https://example.com/new-avatar.jpg' })
    @IsOptional()
    @IsString()
    avatar?: string;
}

// ============================================
// UPDATE ROLE
// ============================================

export class UpdateUserRoleDto {
    @ApiProperty({ enum: UserRoleEnum, example: 'supervisor', description: 'Nuevo rol' })
    @IsEnum(UserRoleEnum, { message: 'Rol inválido' })
    role!: UserRoleEnum;
}

// ============================================
// CHANGE PASSWORD (ADMIN)
// ============================================

export class AdminChangePasswordDto {
    @ApiProperty({ example: 'NewSecurePass456!', description: 'Nueva contraseña' })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Contraseña debe contener mayúsculas, minúsculas y números',
    })
    newPassword!: string;
}

// ============================================
// TOGGLE ACTIVE
// ============================================

export class ToggleUserActiveDto {
    @ApiProperty({ example: false, description: 'Estado activo' })
    @IsBoolean()
    active!: boolean;
}

// ============================================
// RESPONSE DTOs
// ============================================

export class UserResponseDto {
    @ApiProperty({ example: 'uuid-user-123' })
    id!: string;

    @ApiProperty({ example: 'tecnico@cermont.com' })
    email!: string;

    @ApiProperty({ example: 'Juan Pérez' })
    name!: string;

    @ApiProperty({ enum: UserRoleEnum, example: 'tecnico' })
    role!: UserRoleEnum;

    @ApiPropertyOptional({ example: '+57 3001234567' })
    phone?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
    avatar?: string;

    @ApiProperty({ example: true })
    active!: boolean;

    @ApiPropertyOptional({ example: '2024-12-13T10:00:00Z' })
    lastLogin?: string;

    @ApiProperty({ example: '2024-12-01T08:00:00Z' })
    createdAt!: string;
}

export class AdminActionResponseDto {
    @ApiProperty({ example: true })
    success!: boolean;

    @ApiProperty({ example: 'Usuario creado exitosamente' })
    message!: string;

    @ApiPropertyOptional()
    data?: UserResponseDto;
}

// ============================================
// LIST USERS
// ============================================

export class ListUsersQueryDto {
    @ApiPropertyOptional({ enum: UserRoleEnum, description: 'Filtrar por rol' })
    @IsOptional()
    @IsEnum(UserRoleEnum)
    role?: UserRoleEnum;

    @ApiPropertyOptional({ example: true, description: 'Filtrar por estado activo' })
    @IsOptional()
    @IsBoolean()
    active?: boolean;

    @ApiPropertyOptional({ example: 'juan', description: 'Buscar por nombre o email' })
    @IsOptional()
    @IsString()
    search?: string;
}

export class ListUsersResponseDto {
    @ApiProperty({ type: [UserResponseDto] })
    data!: UserResponseDto[];

    @ApiProperty({ example: 25 })
    total!: number;
}
