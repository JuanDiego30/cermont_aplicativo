/**
 * @decorator Public
 *
 * Marca rutas como públicas para que JwtAuthGuard no exija autenticación.
 *
 * Uso: @Public() sobre controller o handler.
 */
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
