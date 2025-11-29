import type { Request, Response } from 'express';
import { AuthService } from '../../../domain/services/AuthService.js';
import { asyncHandler } from '../../../shared/utils/asyncHandler.js';
import { userRepository } from '../../db/repositories/UserRepository.js';
import { revokedTokenRepository } from '../../db/repositories/RevokedTokenRepository.js';
import { refreshTokenRepository } from '../../db/repositories/RefreshTokenRepository.js';
import { auditLogRepository } from '../../db/repositories/AuditLogRepository.js';
import { passwordResetRepository } from '../../db/repositories/PasswordResetRepository.js';
import { jwtService } from '../../adapters/security/jwtService.js';
import { RefreshTokenService } from '../../adapters/security/RefreshTokenService.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { passwordHasher } from '../../adapters/security/passwordHasher.js';
import { emailService } from '../../services/EmailService.js';
import { ForgotPasswordUseCase } from '../../../app/auth/use-cases/ForgotPassword.js';
import { ResetPasswordUseCase } from '../../../app/auth/use-cases/ResetPassword.js';
import { UserRole } from '../../../domain/entities/User.js';

// --- Composition Root (Instanciación de Servicios) ---
const refreshTokenService = new RefreshTokenService(refreshTokenRepository);
const auditService = new AuditService(auditLogRepository);

const authService = new AuthService(
  userRepository,
  revokedTokenRepository,
  jwtService,
  refreshTokenService,
  auditService,
  passwordHasher
);

// Tipado para request autenticado
interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: { userId: string; email?: string; role: string; jti?: string };
}

export class AuthController {
  
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
      res.status(400).json({ 
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Email y contraseña son requeridos' 
      });
      return;
    }

    try {
      const result = await authService.login(
        email,
        password,
        req.ip,
        req.get('user-agent')
      );
      res.json({ success: true, data: result });
    } catch (error: any) {
      const isAuthError = error.message === 'Credenciales inválidas' || error.message === 'Usuario no encontrado';
      const status = isAuthError ? 401 : 400;
      
      res.status(status).json({
        type: `https://httpstatuses.com/${status}`,
        title: status === 401 ? 'Unauthorized' : 'Bad Request',
        status,
        detail: error.message
      });
    }
  });

  static refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    // userId puede venir del token decodificado o ser undefined si es rotación anónima (depende de la estrategia)
    // Aquí asumimos que el cliente lo envía o lo extraemos del token expired si es posible
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId; 

    if (!refreshToken) {
      res.status(400).json({ message: 'Refresh token requerido' });
      return;
    }

    try {
      const result = await authService.refresh(refreshToken, userId);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(401).json({
        type: 'https://httpstatuses.com/401',
        title: 'Unauthorized',
        status: 401,
        detail: error.message
      });
    }
  });

  static logout = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!token || !userId) {
      res.status(400).json({ message: 'Token no disponible o usuario no identificado' });
      return;
    }

    try {
      await authService.logout(token, userId, req.ip, req.get('user-agent'));
      res.json({ success: true, message: 'Sesión cerrada exitosamente' });
    } catch (error: any) {
      res.status(500).json({ message: 'Error al cerrar sesión', detail: error.message });
    }
  });

  static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;

    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
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
        // No devolver datos sensibles de seguridad
      },
    });
  });

  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({ message: 'Faltan datos requeridos' });
      return;
    }

    // Validar existencia
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      res.status(409).json({ message: 'El email ya está registrado' });
      return;
    }

    // Crear usuario (Rol CLIENTE por defecto para registro público)
    // Nota: Idealmente esto debería ir en un UseCase 'RegisterUser' para encapsular la lógica de negocio
    const now = new Date();
    const user = await userRepository.create({
      email,
      password, // El repositorio hasheará la contraseña (según implementación actual del repo)
      name,
      role: UserRole.CLIENTE, // Usar Enum del dominio
      active: true,
      avatar: undefined,
      mfaEnabled: false,
      lastPasswordChange: now,
      passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 días
      loginAttempts: 0,
      security: {
        mfaEnabled: false,
        passwordHistory: [],
        lastPasswordChange: now,
        passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      }
    });

    // Auto login
    const result = await authService.login(
      email,
      password,
      req.ip,
      req.get('user-agent')
    );

    res.status(201).json({ success: true, data: result });
  });

  // Alias for compatibility
  static refreshToken = AuthController.refresh;
  static logoutSession = AuthController.logout;
  
  static logoutAll = asyncHandler(async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    
    if (!userId) {
      res.status(401).json({ message: 'No autenticado' });
      return;
    }

    // Lógica para revocar todas las sesiones
    await refreshTokenService.revokeAllUserTokens(userId);
    
    res.json({ success: true, message: 'Todas las sesiones cerradas' });
  });

  /**
   * POST /auth/forgot-password
   * Solicita un enlace de recuperación de contraseña
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    const forgotPasswordUseCase = new ForgotPasswordUseCase(
      userRepository,
      passwordResetRepository,
      auditLogRepository,
      emailService
    );

    const result = await forgotPasswordUseCase.execute({
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

  /**
   * POST /auth/reset-password
   * Restablece la contraseña usando un token de recuperación
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({
        type: 'https://httpstatuses.com/400',
        title: 'Bad Request',
        status: 400,
        detail: 'Token y nueva contraseña son requeridos',
      });
      return;
    }

    const resetPasswordUseCase = new ResetPasswordUseCase(
      userRepository,
      passwordResetRepository,
      refreshTokenRepository,
      auditLogRepository
    );

    try {
      const result = await resetPasswordUseCase.execute({
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
    } catch (error: any) {
      const isInvalidToken = error.message.includes('inválido') || error.message.includes('expirado');
      const status = isInvalidToken ? 400 : 422;

      res.status(status).json({
        type: `https://httpstatuses.com/${status}`,
        title: status === 400 ? 'Bad Request' : 'Unprocessable Entity',
        status,
        detail: error.message,
      });
    }
  });

  /**
   * GET /auth/verify-reset-token
   * Verifica si un token de recuperación es válido (para la UI)
   */
  static verifyResetToken = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      res.status(400).json({
        valid: false,
        message: 'Token requerido',
      });
      return;
    }

    const resetToken = await passwordResetRepository.findByToken(token);

    if (!resetToken) {
      res.json({ valid: false, message: 'Token inválido' });
      return;
    }

    if (resetToken.usedAt) {
      res.json({ valid: false, message: 'Este enlace ya fue utilizado' });
      return;
    }

    if (new Date() > resetToken.expiresAt) {
      res.json({ valid: false, message: 'Este enlace ha expirado' });
      return;
    }

    res.json({ valid: true });
  });
}

