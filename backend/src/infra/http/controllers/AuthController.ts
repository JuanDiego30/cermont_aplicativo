import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { userRepository } from '../../db/repositories/UserRepository';
import { jwtService } from '../../../shared/security/jwtService';
import { RefreshTokenService } from '../../../shared/security/RefreshTokenService';
import { tokenBlacklistRepository } from '../../db/repositories/TokenBlacklistRepository';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository';
import { AuditService } from '../../../domain/services/AuditService';
import { TokenType } from '../../../domain/entities/TokenBlacklist';
import { AuditAction } from '../../../domain/entities/AuditLog';

/**
 * Controller para autenticación y gestión de sesiones
 */
export class AuthController {
  /**
   * Login de usuario
   * POST /api/auth/login
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      console.log('🔐 AuthController.login start');
      const { email, password } = req.body as { email?: string; password?: string };

      if (!email || !password) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Email y contraseña son requeridos',
        });
        return;
      }

      const user = await userRepository.findByEmailWithPassword(email);
      console.log('🔐 userRepository.findByEmailWithPassword completed');

      if (!user || !user.password) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Credenciales inválidas',
        });
        return;
      }

      if (user.lockedUntil && user.lockedUntil > new Date()) {
        res.status(423).json({
          type: 'https://httpstatuses.com/423',
          title: 'Locked',
          status: 423,
          detail: 'Cuenta bloqueada temporalmente. Intente más tarde.',
        });
        return;
      }

      const isValid = await userRepository.comparePassword(password, user.password);
      console.log('🔐 userRepository.comparePassword result', isValid);

      if (!isValid) {
        await userRepository.recordFailedLogin(user.id);

        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Credenciales inválidas',
        });
        return;
      }

      await userRepository.resetLoginAttempts(user.id);

      const accessToken = await jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role.toString(),
      });

      const refreshToken = await RefreshTokenService.generate(user.id);

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.LOGIN,
        entityType: 'User',
        entityId: user.id,
        userId: user.id,
        before: { authenticated: false },
        after: { authenticated: true, email: user.email },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User login',
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Login exitoso para:', email);
      }

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
          },
        },
      });
    } catch (error: unknown) {
      console.error('❌ Error en login:', error);
      const detail = error instanceof Error ? error.message : 'Error interno del servidor';
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail,
      });
    }
  }

  /**
   * Refrescar access token
   * POST /api/auth/refresh
   */
  static async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body as { refreshToken?: string };
      const userId = (req as any).user?.userId as string | undefined;

      if (!refreshToken) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Refresh token requerido',
        });
        return;
      }

      const isValid = await RefreshTokenService.validate(refreshToken, userId ?? '');

      if (!isValid) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'Refresh token inválido',
        });
        return;
      }

      const newRefreshToken = await RefreshTokenService.rotate(refreshToken, userId ?? '');

      const user = await userRepository.findById(userId ?? '');

      if (!user) {
        res.status(404).json({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Usuario no encontrado',
        });
        return;
      }

      const accessToken = await jwtService.generateAccessToken({
        userId: user.id,
        email: user.email,
        role: user.role.toString(),
      });

      res.json({
        success: true,
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : 'Refresh token inválido';
      res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail,
      });
    }
  }

  /**
   * Logout de sesión actual
   * POST /api/auth/logout
   */
  static async logout(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const userId = (req as any).user?.userId as string | undefined;

      if (!token || !userId) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Token no disponible',
        });
        return;
      }

      const decoded = jwt.decode(token) as { exp?: number } | null;
      if (!decoded?.exp) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Token inválido',
        });
        return;
      }

      const expiresAt = new Date(decoded.exp * 1000);

      await tokenBlacklistRepository.addToken(
        token,
        userId,
        TokenType.ACCESS,
        expiresAt
      );

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.LOGOUT,
        entityType: 'User',
        entityId: userId,
        userId,
        before: { sessionActive: true },
        after: { sessionActive: false },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User logout',
      });

      res.json({
        success: true,
        message: 'Sesión cerrada exitosamente',
      });
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : 'Error interno del servidor';
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail,
      });
    }
  }

  /**
   * Logout de todas las sesiones
   * POST /api/auth/logout-all
   */
  static async logoutAll(req: Request, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const userId = (req as any).user?.userId as string | undefined;

      if (!userId) {
        res.status(400).json({
          type: 'https://httpstatuses.com/400',
          title: 'Bad Request',
          status: 400,
          detail: 'Usuario no autenticado',
        });
        return;
      }

      await RefreshTokenService.revokeAllUserTokens(userId);

      if (token) {
        const decoded = jwt.decode(token) as { exp?: number } | null;
        if (decoded?.exp) {
          const expiresAt = new Date(decoded.exp * 1000);

          await tokenBlacklistRepository.addToken(
            token,
            userId,
            TokenType.ACCESS,
            expiresAt
          );
        }
      }

      const auditService = new AuditService(auditLogRepository);
      await auditService.log({
        action: AuditAction.LOGOUT,
        entityType: 'User',
        entityId: userId,
        userId,
        before: { allSessionsActive: true },
        after: { allSessionsActive: false },
        ip: req.ip || 'unknown',
        userAgent: req.get('user-agent') || 'unknown',
        reason: 'User logout all sessions',
      });

      res.json({
        success: true,
        message: 'Todas las sesiones cerradas exitosamente',
      });
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : 'Error interno del servidor';
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail,
      });
    }
  }

  /**
   * Obtener perfil del usuario autenticado
   * GET /api/auth/profile
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId as string | undefined;

      if (!userId) {
        res.status(401).json({
          type: 'https://httpstatuses.com/401',
          title: 'Unauthorized',
          status: 401,
          detail: 'No autenticado',
        });
        return;
      }

      const user = await userRepository.findById(userId);

      if (!user) {
        res.status(404).json({
          type: 'https://httpstatuses.com/404',
          title: 'Not Found',
          status: 404,
          detail: 'Usuario no encontrado',
        });
        return;
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          active: user.active,
          mfaEnabled: user.mfaEnabled,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          avatar: user.avatar,
        },
      });
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : 'Error interno del servidor';
      res.status(500).json({
        type: 'https://httpstatuses.com/500',
        title: 'Internal Server Error',
        status: 500,
        detail,
      });
    }
  }

  /**
   * Alias para compatibilidad
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    return AuthController.refresh(req, res);
  }

  /**
   * Alias para compatibilidad
   */
  static async logoutSession(req: Request, res: Response): Promise<void> {
    return AuthController.logout(req, res);
  }
}

