/**
 * @guard JwtAuthGuard
 *
 * Protege rutas verificando JWT; permite bypass automático con @Public().
 *
 * Uso: @UseGuards(JwtAuthGuard) en controllers o handlers.
 */
import { Injectable, ExecutionContext, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Observable } from 'rxjs';
import type { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    private readonly logger = new Logger(JwtAuthGuard.name);

    constructor(private readonly reflector: Reflector) {
        super();
    }

    /**
     * Verifica si la ruta es pública antes de validar el token
     */
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        // Verificar si reflector está disponible y tiene el método
        if (this.reflector && typeof this.reflector.getAllAndOverride === 'function') {
            const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
                context.getHandler(),
                context.getClass(),
            ]);

            if (isPublic) {
                return true;
            }
        }

        return super.canActivate(context);
    }

    /**
     * Manejo de errores personalizado.
     *
     * Mantiene la firma genérica de `AuthGuard` para cumplir con la interfaz,
     * pero aplica la validación de usuario y lanza Unauthorized en caso de error.
     */
    handleRequest<TUser = JwtPayload>(
        err: unknown,
        user: unknown,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _info: unknown,
        _context: ExecutionContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _status?: unknown,
    ): TUser {
        if (err || !user) {
            this.logger.warn(`Auth failed: ${err || 'No user found'}`);
            throw err || new UnauthorizedException('Token inválido o expirado');
        }

        return user as TUser;
    }
}
