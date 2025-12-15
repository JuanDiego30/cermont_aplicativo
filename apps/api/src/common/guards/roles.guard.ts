/**
 * ARCHIVO: roles.guard.ts
 * FUNCION: Guard de autorización basado en roles (RBAC)
 * IMPLEMENTACION: Lee metadata @Roles() via Reflector, compara con user.role del JWT
 * DEPENDENCIAS: @nestjs/common, @nestjs/core (Reflector), roles.decorator, JwtPayload
 * EXPORTS: RolesGuard (guard inyectable)
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
            const email = user?.email ?? 'unknown';
            const role = user?.role ?? 'unknown';

            this.logger.warn(
                `Acceso denegado: Usuario ${email} (rol: ${role}) intentó acceder a ruta que requiere: ${requiredRoles.join(', ')}`,
            );

            throw new ForbiddenException(`Requiere uno de estos roles: ${requiredRoles.join(', ')}`);
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
