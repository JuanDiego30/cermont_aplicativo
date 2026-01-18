/**
 * @dto UpdateUserDto
 *
 * DTO para actualización parcial de usuarios.
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import { IsOptional, IsString, IsUrl, Matches, MaxLength, MinLength } from 'class-validator';

/**
 * DTO class para Swagger documentation
 */
export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Juan Pérez Actualizado',
    description: 'Nombre completo',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({
    example: '+57 3009876543',
    description: 'Teléfono de contacto',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value === '' ? undefined : value))
  @Matches(/^\+?[\d\s-]{7,20}$/, {
    message: 'Formato de teléfono inválido',
  })
  phone?: string | null;

  @ApiPropertyOptional({
    example: 'https://example.com/new-avatar.jpg',
    description: 'URL del avatar',
  })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => (value === '' ? undefined : value))
  @IsUrl()
  avatar?: string | null;
}

// Alias para compatibilidad con código existente
export type UpdateUserInput = UpdateUserDto;
