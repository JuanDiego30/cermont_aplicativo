/**
 * @decorator CurrentUser
 *
 * Extrae el usuario autenticado (payload JWT) desde request.user.
 *
 * Uso: controllerMethod(@CurrentUser() user) o @CurrentUser('role').
 */
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
    userId: string;
    email: string;
    role: string;

    /** JWT ID (para invalidación) */
    jti?: string;

    /** Issued at (timestamp) */
    iat?: number;
    /** Expiration (timestamp) */
    exp?: number;
}

export const CurrentUser = createParamDecorator(
    (
        data: keyof JwtPayload | undefined,
        ctx: ExecutionContext,
    ): JwtPayload | JwtPayload[keyof JwtPayload] | undefined => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as JwtPayload;

        // Seguridad: si no hay usuario autenticado, no retornamos nada
        if (!user) {
            return undefined;
        }

        if (data) {
            return data in user ? user[data] : undefined;
        }

        return user;
    },
);