import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        description: 'Correo electrónico del usuario',
        example: 'usuario@cermont.com',
    })
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @IsNotEmpty({ message: 'El correo electrónico es requerido' })
    email!: string;

    @ApiProperty({
        description: 'Contraseña del usuario',
        example: 'MiPasswordSegura123',
        minLength: 6,
        maxLength: 100,
    })
    @IsString({ message: 'La contraseña debe ser texto' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
    password!: string;

    @ApiProperty({
        description: 'Nombre completo del usuario',
        example: 'Juan Pérez',
        minLength: 3,
    })
    @IsString({ message: 'El nombre debe ser texto' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    name!: string;

    @ApiPropertyOptional({
        description: 'Teléfono de contacto',
        example: '+57 300 123 4567',
    })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({
        description: 'Rol solicitado (si aplica). Puede ser ignorado por el servidor según permisos.',
        example: 'tecnico',
    })
    @IsOptional()
    @IsString()
    role?: string;
}
