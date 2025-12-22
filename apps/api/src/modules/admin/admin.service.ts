/**
 * @service AdminService
 * 
 * Gestión de usuarios, roles y permisos (RBAC).
 * Uso: Admin crea usuarios, asigna roles, gestiona permisos.
 * 
 * Principios:
 * - SOLID: Inyección de dependencias, responsabilidad única
 * - Type-safe: Interfaces estrictas
 * - Auditoría: Todos los cambios se registran
 */
import {
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { hash } from 'bcryptjs';
import {
    UserRoleEnum,
    hasPermission,
    getPermissionsForRole,
    PermissionResource,
    PermissionAction,
} from './interfaces/permissions.interface';
import {
    CreateUserDto,
    UpdateUserDto,
    UpdateUserRoleDto,
    UserResponseDto,
    ListUsersQueryDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);
    private readonly SALT_ROUNDS = 12; // OWASP recomienda mínimo 12

    constructor(private readonly prisma: PrismaService) {}

    // ============================================
    // CRUD USUARIOS
    // ============================================

    /**
     * Crea nuevo usuario con rol asignado.
     */
    async createUser(dto: CreateUserDto, adminUserId: string): Promise<UserResponseDto> {
        try {
            // Validar rol
            if (!Object.values(UserRoleEnum).includes(dto.role)) {
                throw new BadRequestException(`Rol inválido: ${dto.role}`);
            }

            // Verificar email único
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email },
            });

            if (existingUser) {
                throw new ConflictException(`Email ${dto.email} ya está registrado`);
            }

            // Hashear contraseña
            const hashedPassword = await hash(dto.password, this.SALT_ROUNDS);

            // Crear usuario
            const newUser = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    name: dto.name,
                    password: hashedPassword,
                    role: dto.role,
                    phone: dto.phone,
                    avatar: dto.avatar,
                    active: true,
                },
            });

            // Auditoría
            await this.logAudit('USER_CREATED', adminUserId, 'User', newUser.id, {
                email: dto.email,
                role: dto.role,
            });

            this.logger.log(`✅ Usuario creado: ${dto.email} con rol ${dto.role}`);

            return this.mapToUserResponse(newUser);
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof ConflictException) {
                throw error;
            }
            this.logger.error(`❌ Error creando usuario`, error);
            throw new BadRequestException('Error creando usuario');
        }
    }

    /**
     * Obtiene todos los usuarios con filtros opcionales.
     */
    async getAllUsers(query: ListUsersQueryDto): Promise<{ data: UserResponseDto[]; total: number }> {
        const where: Record<string, unknown> = {};

        if (query.role) {
            where.role = query.role;
        }

        if (query.active !== undefined) {
            where.active = query.active;
        }

        if (query.search) {
            where.OR = [
                { name: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users.map((u) => this.mapToUserResponse(u)),
            total,
        };
    }

    /**
     * Obtiene un usuario por ID.
     */
    async getUserById(userId: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Usuario ${userId} no encontrado`);
        }

        return this.mapToUserResponse(user);
    }

    /**
     * Actualiza información de usuario (no el rol).
     */
    async updateUser(userId: string, dto: UpdateUserDto, adminUserId: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Usuario ${userId} no encontrado`);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                name: dto.name ?? user.name,
                phone: dto.phone ?? user.phone,
                avatar: dto.avatar ?? user.avatar,
            },
        });

        await this.logAudit('USER_UPDATED', adminUserId, 'User', userId, { ...dto });

        this.logger.log(`✅ Usuario actualizado: ${user.email}`);

        return this.mapToUserResponse(updatedUser);
    }

    /**
     * Actualiza rol de usuario.
     */
    async updateUserRole(
        userId: string,
        dto: UpdateUserRoleDto,
        adminUserId: string,
    ): Promise<UserResponseDto> {
        // Validar rol
        if (!Object.values(UserRoleEnum).includes(dto.role)) {
            throw new BadRequestException(`Rol inválido: ${dto.role}`);
        }

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Usuario ${userId} no encontrado`);
        }

        // No permitir que un admin se quite a sí mismo el rol admin
        if (userId === adminUserId && user.role === 'admin' && dto.role !== 'admin') {
            throw new BadRequestException('No puedes quitarte el rol de administrador');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { role: dto.role },
        });

        await this.logAudit('ROLE_UPDATED', adminUserId, 'User', userId, {
            rolAnterior: user.role,
            nuevoRol: dto.role,
        });

        this.logger.log(`✅ Rol actualizado para ${user.email}: ${user.role} -> ${dto.role}`);

        return this.mapToUserResponse(updatedUser);
    }

    /**
     * Activa/Desactiva usuario (soft delete).
     */
    async toggleUserActive(
        userId: string,
        active: boolean,
        adminUserId: string,
    ): Promise<{ success: boolean; message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Usuario ${userId} no encontrado`);
        }

        // No permitir desactivarse a sí mismo
        if (userId === adminUserId && !active) {
            throw new BadRequestException('No puedes desactivar tu propia cuenta');
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { active },
        });

        const action = active ? 'USER_ACTIVATED' : 'USER_DEACTIVATED';
        await this.logAudit(action, adminUserId, 'User', userId);

        const estado = active ? 'activado' : 'desactivado';
        this.logger.log(`✅ Usuario ${estado}: ${user.email}`);

        return {
            success: true,
            message: `Usuario ${user.email} ${estado}`,
        };
    }

    /**
     * Cambia contraseña de usuario (admin).
     */
    async adminChangePassword(
        userId: string,
        newPassword: string,
        adminUserId: string,
    ): Promise<{ success: boolean; message: string }> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException(`Usuario ${userId} no encontrado`);
        }

        const hashedPassword = await hash(newPassword, this.SALT_ROUNDS);

        await this.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        await this.logAudit('PASSWORD_RESET_BY_ADMIN', adminUserId, 'User', userId);

        this.logger.log(`✅ Contraseña actualizada para: ${user.email}`);

        return {
            success: true,
            message: `Contraseña actualizada para ${user.email}`,
        };
    }

    // ============================================
    // PERMISOS
    // ============================================

    /**
     * Obtiene permisos de un usuario basado en su rol.
     */
    getUserPermissions(role: UserRoleEnum) {
        return getPermissionsForRole(role);
    }

    /**
     * Verifica si usuario tiene permiso específico.
     */
    checkPermission(
        userRole: UserRoleEnum,
        resource: PermissionResource,
        action: PermissionAction,
    ): boolean {
        return hasPermission(userRole, resource, action);
    }

    /**
     * Valida permiso y lanza excepción si no tiene acceso.
     */
    validatePermission(
        userRole: UserRoleEnum,
        resource: PermissionResource,
        action: PermissionAction,
    ): void {
        if (!this.checkPermission(userRole, resource, action)) {
            throw new BadRequestException(
                `Usuario con rol ${userRole} no tiene permiso para ${action} en ${resource}`,
            );
        }
    }

    // ============================================
    // ESTADÍSTICAS
    // ============================================

    /**
     * Obtiene estadísticas de usuarios.
     */
    async getUserStats(): Promise<{
        total: number;
        activos: number;
        porRol: Record<string, number>;
    }> {
        const [total, activos, porRol] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { active: true } }),
            this.prisma.user.groupBy({
                by: ['role'],
                _count: { id: true },
            }),
        ]);

        return {
            total,
            activos,
            porRol: porRol.reduce(
                (acc, item) => {
                    acc[item.role] = item._count.id;
                    return acc;
                },
                {} as Record<string, number>,
            ),
        };
    }

    // ============================================
    // HELPERS
    // ============================================

    private mapToUserResponse(user: {
        id: string;
        email: string;
        name: string;
        role: string;
        phone: string | null;
        avatar: string | null;
        active: boolean;
        lastLogin: Date | null;
        createdAt: Date;
    }): UserResponseDto {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role as UserRoleEnum,
            phone: user.phone ?? undefined,
            avatar: user.avatar ?? undefined,
            active: user.active,
            lastLogin: user.lastLogin?.toISOString(),
            createdAt: user.createdAt.toISOString(),
        };
    }

    private async logAudit(
        action: string,
        userId: string,
        entityType: string,
        entityId: string,
        changes?: Record<string, unknown>,
    ): Promise<void> {
        try {
            await this.prisma.auditLog.create({
                data: {
                    action,
                    userId,
                    entityType,
                    entityId,
                    changes: changes ? JSON.parse(JSON.stringify(changes)) : undefined,
                },
            });
        } catch (error) {
            this.logger.warn(`No se pudo registrar auditoría: ${action}`, error);
        }
    }
}
