/**
 * Auth Controller
 * Handles authentication-related HTTP requests
 * 
 * Refactored to use AuthFacade for cleaner dependency management
 */

import type { Request, Response } from 'express';
import { asyncHandler } from '../../../shared/middlewares/index.js';
import { AppError } from '../../../shared/errors/index.js';
import { AuthFacade } from '../facades/index.js';

// ============================================================================
// Types
// ============================================================================

interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: { userId: string; email?: string; role: string; jti?: string };
}

// ============================================================================
// Controller
// ============================================================================

export class AuthController {
  constructor(private readonly authFacade: AuthFacade) {}

  // ============================================================================
  // Authentication
  // ============================================================================

  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email y contraseña son requeridos', 400);
    }

    const result = await this.authFacade.login(
      email,
      password,
      req.ip,
      req.get('user-agent')
    );
    res.json({ success: true, data: result });
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!refreshToken) {
      throw new AppError('Refresh token requerido', 400);
    }

    const result = await this.authFacade.refresh(refreshToken, userId);
    res.json({ success: true, data: result });
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!token || !userId) {
      throw new AppError('Token no disponible o usuario no identificado', 400);
    }

    await this.authFacade.logout(token, userId, req.ip, req.get('user-agent'));
    res.json({ success: true, message: 'Sesión cerrada exitosamente' });
  });

  getProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      throw new AppError('No autenticado', 401);
    }

    const user = await this.authFacade.getUserById(userId);
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        active: user.active,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  });

  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      throw new AppError('Faltan datos requeridos', 400);
    }

    const result = await this.authFacade.register({
      email,
      password,
      name,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({ success: true, data: result });
  });

  logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      throw new AppError('No autenticado', 401);
    }

    await this.authFacade.revokeAllUserSessions(userId);
    res.json({ success: true, message: 'Todas las sesiones cerradas' });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const result = await this.authFacade.forgotPassword({
      email,
      frontendUrl: process.env.FRONTEND_URL,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: result.success,
      message: result.message,
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      throw new AppError('Token y nueva contraseña son requeridos', 400);
    }

    const result = await this.authFacade.resetPassword({
      token,
      newPassword,
      revokeAllSessions: true,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.json({
      success: result.success,
      message: result.message,
    });
  });

  verifyResetToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      throw new AppError('Token requerido', 400);
    }

    const result = await this.authFacade.verifyResetToken(token);
    res.json(result);
  });

  // Aliases for compatibility
  refreshToken = this.refresh;
  logoutSession = this.logout;
}
