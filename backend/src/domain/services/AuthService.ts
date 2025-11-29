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
  ) {}

  /**
   * Inicia sesión con email y contraseña
   */
  async login(email: string, password: string, ip?: string, userAgent?: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    // Verificar contraseña
    if (this.passwordHasher && user.password) {
      const isValid = await this.passwordHasher.verify(password, user.password);
      if (!isValid) {
        throw new Error('Credenciales inválidas');
      }
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      throw new Error('Usuario desactivado');
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
   * Renueva tokens usando refresh token
   */
  async refresh(refreshToken: string, _userId?: string): Promise<{ accessToken: string; refreshToken: string }> {
    const result = await this.refreshTokenService.validateAndRotate(refreshToken);
    if (!result) {
      throw new Error('Refresh token inválido o expirado');
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

