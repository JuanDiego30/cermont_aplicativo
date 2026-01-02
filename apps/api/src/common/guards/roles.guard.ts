/**
 * @guard RolesGuard
 *
 * Autoriza acceso validando roles declarados con @Roles() sobre rutas.
 *
 * Uso: @UseGuards(JwtAuthGuard, RolesGuard) + @Roles('admin').
 */
import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    private readonly logger = new Logger(RolesGuard.name);

    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.getRequiredRoles(context);

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const user = this.extractUser(context);
        const hasPermission = this.userHasRequiredRole(user, requiredRoles);

        if (!hasPermission) {
            const userId = user?.userId ?? 'unknown';
            const role = user?.role ?? 'unknown';

            this.logger.warn(
                `Acceso denegado: userId=${userId} role=${role} requires=${requiredRoles.join(', ')}`,
            );

            throw new ForbiddenException('Acceso denegado');
        }

        return true;
    }

    /**
     * Extrae roles requeridos del metadata
     */
    private getRequiredRoles(context: ExecutionContext): string[] | undefined {
        return this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
    }

    /**
     * Extrae usuario del request
     */
    private extractUser(context: ExecutionContext): JwtPayload {
        const request = context.switchToHttp().getRequest();
        return request.user as JwtPayload;
    }

    /**
     * Verifica si el usuario tiene alguno de los roles requeridos
     */
    private userHasRequiredRole(user: JwtPayload, requiredRoles: string[]): boolean {
        if (!user || !user.role) {
            return false;
        }

        return requiredRoles.some((role) => user.role.toLowerCase() === role.toLowerCase());
    }
}
