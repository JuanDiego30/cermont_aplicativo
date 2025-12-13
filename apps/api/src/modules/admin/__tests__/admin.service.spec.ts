/**
 * @test AdminService
 * 
 * Unit tests para el servicio de administración.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { AdminService } from '../admin.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { UserRoleEnum, PermissionResource, PermissionAction } from '../interfaces/permissions.interface';

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
    compare: jest.fn().mockResolvedValue(true),
}));

describe('AdminService', () => {
    let service: AdminService;

    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            count: jest.fn(),
            groupBy: jest.fn(),
        },
        auditLog: {
            create: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdminService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<AdminService>(AdminService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        const createUserDto = {
            email: 'nuevo@cermont.com',
            name: 'Nuevo Usuario',
            password: 'SecurePass123!',
            role: UserRoleEnum.TECNICO,
        };

        it('debería crear usuario correctamente', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            mockPrismaService.user.create.mockResolvedValue({
                id: 'new-user-id',
                email: createUserDto.email,
                name: createUserDto.name,
                role: createUserDto.role,
                active: true,
                createdAt: new Date(),
            });
            mockPrismaService.auditLog.create.mockResolvedValue({});

            const result = await service.createUser(createUserDto, 'admin-id');

            expect(result).toBeDefined();
            expect(result.email).toBe(createUserDto.email);
            expect(result.role).toBe(createUserDto.role);
            expect(mockPrismaService.user.create).toHaveBeenCalled();
            expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
        });

        it('debería rechazar email duplicado', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                id: 'existing-user',
                email: createUserDto.email,
            });

            await expect(
                service.createUser(createUserDto, 'admin-id'),
            ).rejects.toThrow(ConflictException);
        });

        it('debería rechazar rol inválido', async () => {
            const dtoConRolInvalido = {
                ...createUserDto,
                role: 'rol_invalido' as UserRoleEnum,
            };

            await expect(
                service.createUser(dtoConRolInvalido, 'admin-id'),
            ).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateUserRole', () => {
        const mockUser = {
            id: 'user-123',
            email: 'tecnico@cermont.com',
            name: 'Técnico',
            role: 'tecnico',
            active: true,
        };

        it('debería actualizar rol correctamente', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue({
                ...mockUser,
                role: UserRoleEnum.SUPERVISOR,
            });
            mockPrismaService.auditLog.create.mockResolvedValue({});

            const result = await service.updateUserRole(
                'user-123',
                { role: UserRoleEnum.SUPERVISOR },
                'admin-id',
            );

            expect(result.role).toBe(UserRoleEnum.SUPERVISOR);
            expect(mockPrismaService.auditLog.create).toHaveBeenCalled();
        });

        it('debería rechazar si usuario no existe', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);

            await expect(
                service.updateUserRole('no-existe', { role: UserRoleEnum.SUPERVISOR }, 'admin-id'),
            ).rejects.toThrow(NotFoundException);
        });

        it('debería rechazar si admin intenta quitarse rol admin', async () => {
            const adminUser = { ...mockUser, id: 'admin-id', role: 'admin' };
            mockPrismaService.user.findUnique.mockResolvedValue(adminUser);

            await expect(
                service.updateUserRole(
                    'admin-id', // Mismo ID que adminUserId
                    { role: UserRoleEnum.TECNICO },
                    'admin-id',
                ),
            ).rejects.toThrow('No puedes quitarte el rol de administrador');
        });
    });

    describe('toggleUserActive', () => {
        const mockUser = {
            id: 'user-123',
            email: 'tecnico@cermont.com',
            active: true,
        };

        it('debería desactivar usuario', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            mockPrismaService.user.update.mockResolvedValue({ ...mockUser, active: false });
            mockPrismaService.auditLog.create.mockResolvedValue({});

            const result = await service.toggleUserActive('user-123', false, 'admin-id');

            expect(result.success).toBe(true);
            expect(result.message).toContain('desactivado');
        });

        it('debería activar usuario', async () => {
            const inactiveUser = { ...mockUser, active: false };
            mockPrismaService.user.findUnique.mockResolvedValue(inactiveUser);
            mockPrismaService.user.update.mockResolvedValue({ ...mockUser, active: true });
            mockPrismaService.auditLog.create.mockResolvedValue({});

            const result = await service.toggleUserActive('user-123', true, 'admin-id');

            expect(result.success).toBe(true);
            expect(result.message).toContain('activado');
        });

        it('debería rechazar si admin intenta desactivarse a sí mismo', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                id: 'admin-id',
            });

            await expect(
                service.toggleUserActive('admin-id', false, 'admin-id'),
            ).rejects.toThrow('No puedes desactivar tu propia cuenta');
        });
    });

    describe('checkPermission', () => {
        it('admin debería tener todos los permisos', () => {
            expect(
                service.checkPermission(
                    UserRoleEnum.ADMIN,
                    PermissionResource.USERS,
                    PermissionAction.CREATE,
                ),
            ).toBe(true);

            expect(
                service.checkPermission(
                    UserRoleEnum.ADMIN,
                    PermissionResource.ARCHIVE,
                    PermissionAction.MANAGE,
                ),
            ).toBe(true);
        });

        it('técnico NO debería tener permisos de admin', () => {
            expect(
                service.checkPermission(
                    UserRoleEnum.TECNICO,
                    PermissionResource.USERS,
                    PermissionAction.CREATE,
                ),
            ).toBe(false);

            expect(
                service.checkPermission(
                    UserRoleEnum.TECNICO,
                    PermissionResource.ARCHIVE,
                    PermissionAction.MANAGE,
                ),
            ).toBe(false);
        });

        it('técnico debería poder ejecutar ejecución', () => {
            expect(
                service.checkPermission(
                    UserRoleEnum.TECNICO,
                    PermissionResource.EJECUCION,
                    PermissionAction.EXECUTE,
                ),
            ).toBe(true);
        });

        it('supervisor debería poder aprobar planeaciones', () => {
            expect(
                service.checkPermission(
                    UserRoleEnum.SUPERVISOR,
                    PermissionResource.PLANEACION,
                    PermissionAction.APPROVE,
                ),
            ).toBe(true);
        });
    });

    describe('getUserStats', () => {
        it('debería retornar estadísticas de usuarios', async () => {
            mockPrismaService.user.count
                .mockResolvedValueOnce(25) // total
                .mockResolvedValueOnce(22); // activos

            mockPrismaService.user.groupBy.mockResolvedValue([
                { role: 'admin', _count: { id: 2 } },
                { role: 'supervisor', _count: { id: 5 } },
                { role: 'tecnico', _count: { id: 15 } },
                { role: 'administrativo', _count: { id: 3 } },
            ]);

            const result = await service.getUserStats();

            expect(result.total).toBe(25);
            expect(result.activos).toBe(22);
            expect(result.porRol.admin).toBe(2);
            expect(result.porRol.tecnico).toBe(15);
        });
    });
});
