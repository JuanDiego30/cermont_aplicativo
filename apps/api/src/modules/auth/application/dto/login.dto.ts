import { IsEmail, IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    @IsNotEmpty({ message: 'El correo electrónico es requerido' })
    email!: string;

    @IsString({ message: 'La contraseña debe ser texto' })
    @IsNotEmpty({ message: 'La contraseña es requerida' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    @MaxLength(100, { message: 'La contraseña no puede exceder 100 caracteres' })
    password!: string;

    @IsOptional()
    @IsBoolean()
    rememberMe?: boolean;
}
