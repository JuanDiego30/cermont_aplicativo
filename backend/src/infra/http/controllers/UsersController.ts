import { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../app/users/use-cases/CreateUser.js';
import { UpdateUser } from '../../../app/users/use-cases/UpdateUser.js';
import { ListUsers } from '../../../app/users/use-cases/ListUsers.js';
import { UserRepository } from '../../db/repositories/UserRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { UserRole } from '../../../shared/constants/roles.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';

/**
 * Controller para gestión de usuarios
 */
export class UsersController {
  // ✅ Instanciar use cases en constructor (no en cada request)
  private createUserUseCase: CreateUserUseCase;
  private updateUserUseCase: UpdateUser;
  private listUsersUseCase: ListUsers;
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.createUserUseCase = new CreateUserUseCase(this.userRepository, auditLogRepository);
    this.updateUserUseCase = new UpdateUser(this.userRepository);
    this.listUsersUseCase = new ListUsers(this.userRepository);
  }

  /**
   * Crear nuevo usuario
   * POST /api/users
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name, role } = req.body;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      // ✅ Validar campos requeridos
      if (!email || !password || !name || !role) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Campos requeridos: email, password, name, role',
        });
        return;
      }

      // ✅ Validar role
      if (!Object.values(UserRole).includes(role)) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Role inválido',
        });
        return;
      }

      // ✅ Crear usuario usando use case
      const user = await this.createUserUseCase.execute({
        email,
        password,
        name,
        role,
        createdBy: adminId,
      });

      // ✅ Registrar auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.CREATE_USER,
        entityType: 'User',
        entityId: user.id,
        userId: adminId,
        after: { email, name, role },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent'),
      });

      // ✅ Respuesta sin password (usa id)
      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
          active: user.active,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: error.message,
      });
    }
  }

  /**
   * Obtener usuario por ID
   * GET /api/users/:id
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await this.userRepository.findById(id);

      if (!user) {
        res.status(404).json({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Usuario no encontrado',
        });
        return;
      }

      // ✅ Respuesta sin password
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
          active: user.active,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Listar usuarios con filtros y paginación
   * GET /api/users
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      const { role, active, search, page, limit } = req.query;

      // ✅ Validar role si se proporciona
      if (role && !Object.values(UserRole).includes(role as UserRole)) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Role inválido',
        });
        return;
      }

      const result = await this.listUsersUseCase.execute({
        role: role as any,
        active: active === 'true' ? true : active === 'false' ? false : undefined,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      // ✅ Mapear sin password (usa id)
      res.json({
        success: true,
        data: result.data.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          mfaEnabled: u.mfaEnabled,
          active: u.active,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt,
        })),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }

  /**
   * Actualizar usuario
   * PUT /api/users/:id
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, role, mfaEnabled } = req.body;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      // ✅ Validar role si se proporciona
      if (role && !Object.values(UserRole).includes(role)) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Role inválido',
        });
        return;
      }

      // ✅ Actualizar usuario usando use case (sin password)
      const user = await this.updateUserUseCase.execute(id, {
        name,
        role,
        mfaEnabled,
      });

      // ✅ Registrar auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.UPDATE_USER,
        entityType: 'User',
        entityId: id,
        userId: adminId,
        after: { name, role, mfaEnabled },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent'),
      });

      // ✅ Respuesta sin password (usa id)
      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          mfaEnabled: user.mfaEnabled,
          active: user.active,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: error.message,
      });
    }
  }

  /**
   * Cambiar contraseña de usuario
   * POST /api/users/:id/change-password
   */
  async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      if (!newPassword) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'newPassword es requerido',
        });
        return;
      }

      // ✅ Cambiar contraseña usando update (hashea automáticamente)
      await this.userRepository.update(id, { password: newPassword });

      // ✅ Registrar auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.CHANGE_USER_PASSWORD,
        entityType: 'User',
        entityId: id,
        userId: (req as any).user?.userId,
        before: { passwordChanged: false },
        after: { passwordChanged: true },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User password changed',
      });

      res.json({
        success: true,
        message: 'Contraseña actualizada exitosamente',
      });
    } catch (error: any) {
      res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: error.message,
      });
    }
  }

  /**
   * Activar usuario
   * POST /api/users/:id/activate
   */
  async activate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      // ✅ Activar usuario
      const user = await this.userRepository.update(id, { active: true });

      // ✅ Registrar auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.ACTIVATE_USER,
        entityType: 'User',
        entityId: id,
        userId: (req as any).user?.userId,
        before: { active: false },
        after: { active: true },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User activated',
      });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          active: user.active,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: error.message,
      });
    }
  }

  /**
   * Desactivar usuario
   * POST /api/users/:id/deactivate
   */
  async deactivate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      // ✅ Desactivar usuario (soft delete)
      const user = await this.userRepository.update(id, { active: false });

      // ✅ Registrar auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.DEACTIVATE_USER,
        entityType: 'User',
        entityId: id,
        userId: (req as any).user?.userId,
        before: { active: true },
        after: { active: false },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User deactivated',
      });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          active: user.active,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: error.message,
      });
    }
  }

  /**
   * Bloquear cuenta de usuario
   * POST /api/users/:id/lock
   */
  async lock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      // ✅ Bloquear cuenta usando update
      const lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas
      await this.userRepository.update(id, { active: false, lockedUntil: lockUntil });

      // ✅ Registrar auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.LOCK_USER_ACCOUNT,
        entityType: 'User',
        entityId: id,
        userId: (req as any).user?.userId,
        before: { locked: false },
        after: { locked: true },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User account locked',
      });

      res.json({
        success: true,
        message: 'Cuenta bloqueada exitosamente',
      });
    } catch (error: any) {
      res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: error.message,
      });
    }
  }

  /**
   * Desbloquear cuenta de usuario
   * POST /api/users/:id/unlock
   */
  async unlock(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      // ✅ Desbloquear cuenta usando update
      await this.userRepository.update(id, { active: true });

      // ✅ Registrar auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.UNLOCK_USER_ACCOUNT,
        entityType: 'User',
        entityId: id,
        userId: (req as any).user?.userId,
        before: { locked: true },
        after: { locked: false },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User account unlocked',
      });

      res.json({
        success: true,
        message: 'Cuenta desbloqueada exitosamente',
      });
    } catch (error: any) {
      res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: error.message,
      });
    }
  }

  /**
   * Eliminar usuario (hard delete)
   * DELETE /api/users/:id
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      // ✅ Verificar que existe antes de eliminar
      const existing = await this.userRepository.findById(id);
      if (!existing) {
        res.status(404).json({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Usuario no encontrado',
        });
        return;
      }

      // ✅ Eliminar usuario
      await this.userRepository.delete(id);

      // ✅ Registrar auditoría
      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.DELETE_USER,
        entityType: 'User',
        entityId: id,
        userId: (req as any).user?.userId,
        before: { deleted: false },
        after: { deleted: true },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User deleted',
      });

      // ✅ Respuesta 204 (No Content)
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: error.message,
      });
    }
  }
}

export const usersController = new UsersController();
