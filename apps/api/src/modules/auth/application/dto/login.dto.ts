import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
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

    @ApiPropertyOptional({
        description: 'Mantener sesión activa (recordarme)',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;
}
