/**
 * @guard JwtAuthGuard
 *
 * Protege rutas verificando JWT; permite bypass automático con @Public().
 *
 * Uso: @UseGuards(JwtAuthGuard) en controllers o handlers.
 */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';
import type { JwtPayload } from '../decorators/current-user.decorator';

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
     * Manejo de errores personalizado.
     *
     * Mantiene la firma genérica de `AuthGuard` para cumplir con la interfaz,
     * pero aplica la validación de usuario y lanza Unauthorized en caso de error.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleRequest<TUser = any>(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        err: any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        _info: any,
        _context: ExecutionContext,
        _status?: any,
    ): TUser {
        if (err || !user) {
            throw err || new UnauthorizedException('Token inválido o expirado');
        }

        return user as TUser;
    }
}
