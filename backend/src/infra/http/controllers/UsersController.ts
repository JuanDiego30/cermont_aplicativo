import type { Request, Response } from 'express';
import { CreateUserUseCase } from '../../../app/users/use-cases/CreateUser.js';
import { UpdateUserUseCase } from '../../../app/users/use-cases/UpdateUser.js';
import { ListUsersUseCase } from '../../../app/users/use-cases/ListUsers.js';
import { userRepository } from '../../db/repositories/UserRepository.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { PasswordHasher } from '../../adapters/security/passwordHasher.js';
import { UserRole } from '../../../domain/entities/User.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';

export class UsersController {
  private createUserUseCase: CreateUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private listUsersUseCase: ListUsersUseCase;
  private auditService: AuditService;

  constructor() {
    // Inyección de dependencias
    this.auditService = new AuditService(auditLogRepository);
    const passwordHasher = new PasswordHasher();
    this.createUserUseCase = new CreateUserUseCase(userRepository, this.auditService);
    this.updateUserUseCase = new UpdateUserUseCase(userRepository, this.auditService, passwordHasher);
    this.listUsersUseCase = new ListUsersUseCase(userRepository);
  }

  create = async (req: Request, res: Response): Promise<void> => {
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

      if (!email || !password || !name || !role) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Campos requeridos: email, password, name, role',
        });
        return;
      }

      // Validar enum
      if (!Object.values(UserRole).includes(role as UserRole)) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Role inválido',
        });
        return;
      }

      const user = await this.createUserUseCase.execute({
        email,
        password,
        name,
        role,
        createdBy: adminId,
      });

      await this.auditService.log({
        action: AuditAction.CREATE_USER,
        entityType: 'User',
        entityId: user.id,
        userId: adminId,
        after: { email, name, role },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent'),
      });

      res.status(201).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const user = await userRepository.findById(id);

      if (!user) {
        res.status(404).json({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Usuario no encontrado',
        });
        return;
      }

      // Excluir password y security de la respuesta
      const { password: _, security: __, ...safeUser } = user;
      res.json({ success: true, data: safeUser });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ type: 'internal_error', status: 500, detail: msg });
    }
  };

  list = async (req: Request, res: Response): Promise<void> => {
    try {
      const { role, active, search, page, limit } = req.query;

      const result = await this.listUsersUseCase.execute({
        role: role as UserRole,
        active: active === 'true' ? true : active === 'false' ? false : undefined,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        success: true,
        data: result.data.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          active: u.active,
          lastLogin: u.lastLogin,
          createdAt: u.createdAt,
        })),
        pagination: result.pagination,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail: msg,
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, role, mfaEnabled } = req.body;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await this.updateUserUseCase.execute(id, {
        name,
        role,
        mfaEnabled,
        updatedBy: adminId,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      });

      await this.auditService.log({
        action: AuditAction.UPDATE_USER,
        entityType: 'User',
        entityId: id,
        userId: adminId,
        after: { name, role, mfaEnabled },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent'),
      });

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
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
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await this.updateUserUseCase.execute(id, {
        password: newPassword,
        updatedBy: adminId,
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
      });

      res.json({ success: true, message: 'Contraseña actualizada' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ type: 'bad_request', status: 400, detail: msg });
    }
  };

  activate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await userRepository.update(id, { active: true });
      res.json({ success: true, message: 'Usuario activado' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ type: 'internal_error', status: 500, detail: msg });
    }
  };

  deactivate = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await userRepository.update(id, { active: false });
      res.json({ success: true, message: 'Usuario desactivado' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ type: 'internal_error', status: 500, detail: msg });
    }
  };

  lock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      // Lock por 24 horas por defecto
      await userRepository.update(id, { lockedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) });
      res.json({ success: true, message: 'Cuenta bloqueada' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ type: 'internal_error', status: 500, detail: msg });
    }
  };

  unlock = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await userRepository.update(id, { lockedUntil: null, loginAttempts: 0 });
      res.json({ success: true, message: 'Cuenta desbloqueada' });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ type: 'internal_error', status: 500, detail: msg });
    }
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await userRepository.delete(id);

      await this.auditService.log({
        action: AuditAction.DELETE_USER,
        entityType: 'User',
        entityId: id,
        userId: adminId,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(204).send();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        type: 'internal_error',
        status: 500,
        detail: msg,
      });
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user?.userId;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      await userRepository.delete(id);

      await this.auditService.log({
        action: AuditAction.DELETE_USER,
        entityType: 'User',
        entityId: id,
        userId: adminId,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });

      res.status(204).send();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        type: 'internal_error',
        status: 500,
        detail: msg,
      });
    }
  };
}

export const usersController = new UsersController();
