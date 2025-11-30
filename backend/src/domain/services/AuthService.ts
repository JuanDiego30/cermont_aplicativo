/**
 * AuthService - Servicio de Autenticación
 * 
 * Este servicio coordina la lógica de autenticación usando los repositorios
 * y servicios de dominio correspondientes.
 */

import { AuditService } from './AuditService.js';
import { AuditAction } from '../entities/AuditLog.js';
import type { IUserRepository } from '../repositories/IUserRepository.js';
import type { IRevokedTokenRepository } from '../repositories/IRevokedTokenRepository.js';
import { AppError } from '../../shared/errors/AppError.js';
import { UserRole } from '../entities/User.js';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
}

export interface JWTService {
  sign(payload: any, options?: any): Promise<string>;
  verify(token: string): Promise<any>;
  decode(token: string): any;
}

export interface RefreshTokenServiceInterface {
  createToken(userId: string): Promise<{ token: string; hash: string }>;
  validateAndRotate(token: string): Promise<{ accessToken: string; refreshToken: string } | null>;
  revokeUserTokens(userId: string): Promise<void>;
}

export interface PasswordHasherInterface {
  verify(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  ip?: string;
  userAgent?: string;
}

/**
 * AuthService - Facade para operaciones de autenticación
 */
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly revokedTokenRepository: IRevokedTokenRepository,
    private readonly jwtService: JWTService,
    private readonly refreshTokenService: RefreshTokenServiceInterface,
    private readonly auditService: AuditService,
    private readonly passwordHasher?: PasswordHasherInterface
  ) { }

  /**
   * Inicia sesión con email y contraseña
   */
  async login(email: string, password: string, ip?: string, userAgent?: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    if (this.passwordHasher && user.password) {
      const isValid = await this.passwordHasher.verify(password, user.password);
      if (!isValid) {
        throw new AppError('Credenciales inválidas', 401);
      }
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      throw new AppError('Usuario desactivado', 403);
    }

    const accessToken = await this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { token: refreshToken } = await this.refreshTokenService.createToken(user.id);

    await this.auditService.log({
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      userId: user.id,
      ip,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
      },
    };
  }

  /**
   * Registra un nuevo usuario
   */
  async register(data: RegisterDTO): Promise<AuthResult> {
    const { email, password, name, ip, userAgent } = data;

    // Validar existencia
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('El email ya está registrado', 409);
    }

    const now = new Date();
    const user = await this.userRepository.create({
      email,
      password, // El repositorio hasheará la contraseña
      name,
      role: UserRole.CLIENTE,
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
    return this.login(email, password, ip, userAgent);
  }

  /**
   * Renueva tokens usando refresh token
   */
  async refresh(refreshToken: string, _userId?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const result = await this.refreshTokenService.validateAndRotate(refreshToken);
    if (!result) {
      throw new AppError('Refresh token inválido o expirado', 401);
    }
    return result;
  }

  /**
   * Cierra sesión revocando el token
   */
  async logout(token: string, userId: string, ip?: string, userAgent?: string): Promise<void> {
    const decoded = this.jwtService.decode(token);
    const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 3600000);

    await this.revokedTokenRepository.create({
      jti: decoded?.jti || token.substring(0, 36),
      userId,
      expiresAt,
      reason: 'logout',
    });

    await this.refreshTokenService.revokeUserTokens(userId);

    await this.auditService.log({
      action: AuditAction.LOGOUT,
      entityType: 'User',
      entityId: userId,
      userId,
      ip,
      userAgent,
    });
  }
}

