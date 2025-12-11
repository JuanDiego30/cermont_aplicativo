import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'user@cermont.com' })
    @IsEmail({}, { message: 'Email invalido' })
    email!: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    @MinLength(6, { message: 'La contrasena debe tener al menos 6 caracteres' })
    password!: string;

    @ApiProperty({ example: 'Juan Perez' })
    @IsString()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    name!: string;

    @ApiPropertyOptional({ enum: ['admin', 'supervisor', 'tecnico', 'administrativo'] })
    @IsOptional()
    @IsString()
    role?: string;

    @ApiPropertyOptional({ example: '+57 300 123 4567' })
    @IsOptional()
    @IsString()
    phone?: string;
}
