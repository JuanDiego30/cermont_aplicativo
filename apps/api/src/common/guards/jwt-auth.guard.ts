/**
 * ARCHIVO: jwt-auth.guard.ts
 * FUNCION: Guard de autenticación JWT con soporte para rutas públicas
 * IMPLEMENTACION: Extiende AuthGuard('jwt'), verifica decorator @Public() via Reflector
 * DEPENDENCIAS: @nestjs/passport, @nestjs/core (Reflector), public.decorator
 * EXPORTS: JwtAuthGuard (guard inyectable)
 */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    /**
     * Verifica si la ruta es pública antes de validar el token
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        return super.canActivate(context);
    }

    /**
     * Manejo de errores personalizado
     */
    /**
     * @refactor PRIORIDAD_BAJA
     *
     * Problema: `handleRequest` usa `any` por defecto para el tipo de usuario.
     *
     * Solución sugerida: Tipar con JwtPayload (o el tipo real de request.user) para mejorar type-safety.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleRequest<TUser = any>(err: unknown, user: TUser | undefined, _info: unknown): TUser {
        if (err || !user) {
            throw (err as Error) || new UnauthorizedException('Token inválido o expirado');
        }

        return user;
    }
}
