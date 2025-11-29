/**
 * Use Case: Refresh Access Token
 * Resuelve: Renovación de tokens con detección de reuso
 * 
 * @file backend/src/app/auth/use-cases/RefreshToken.ts
 */

import type { IRefreshTokenRepository } from '../../../domain/repositories/IRefreshTokenRepository.js';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { TokenService } from '../../../domain/services/TokenService.js';
import { AuditService } from '../../../domain/services/AuditService.js';
import { AuditAction } from '../../../domain/entities/AuditLog.js';
import { logger } from '../../../shared/utils/logger.js';
import jwt from 'jsonwebtoken';
import type { RefreshToken } from '../../../domain/entities/RefreshToken.js';
import type { User } from '../../../domain/entities/User.js';

const TOKEN_CONFIG = {
  REFRESH_EXPIRATION_DAYS: 7,
  MILLISECONDS_PER_DAY: 24 * 60 * 60 * 1000,
} as const;

const ERROR_MESSAGES = {
  TOKEN_NOT_FOUND: 'Token de actualización no encontrado',
  TOKEN_REVOKED: 'Token de actualización revocado',
  TOKEN_EXPIRED: 'Token de actualización expirado',
  USER_NOT_FOUND: 'Usuario no encontrado',
  USER_INACTIVE: 'Usuario inactivo',
  INVALID_SIGNATURE: 'Firma de token inválida',
  MISSING_JWT_SECRET: 'JWT_SECRET no configurado',
} as const;

const LOG_CONTEXT = {
  USE_CASE: '[RefreshTokenUseCase]',
} as const;

interface RefreshTokenInput {
  refreshToken: string;
  ip?: string;
  userAgent?: string;
}

interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

interface DecodedRefreshToken {
  userId: string;
  email: string;
  role?: string;
  exp?: number;
}

export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly userRepository: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly auditService: AuditService
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const { refreshToken, ip, userAgent } = input;

    const decoded = this.verifyTokenSignature(refreshToken);
    const storedToken = await this.validateStoredToken(refreshToken);
    const user = await this.validateUser(storedToken.userId);

    await this.revokeCurrentToken(refreshToken);

    const tokens = await this.generateNewTokens(user, storedToken.familyId, ip, userAgent);

    await this.saveNewRefreshToken(tokens.refreshToken, user.id, storedToken.familyId);
    await this.logSuccessfulRefresh(user.id, ip, userAgent);

    logger.info(`${LOG_CONTEXT.USE_CASE} Token renovado exitosamente`, {
      userId: user.id,
      family: storedToken.familyId,
    });

    return tokens;
  }

  private verifyTokenSignature(token: string): DecodedRefreshToken {
    const jwtSecret = this.getJwtSecret();

    try {
      return jwt.verify(token, jwtSecret) as DecodedRefreshToken;
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Firma de token inválida`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw new Error(ERROR_MESSAGES.INVALID_SIGNATURE);
    }
  }

  private getJwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error(`${LOG_CONTEXT.USE_CASE} JWT_SECRET no configurado`);
      throw new Error(ERROR_MESSAGES.MISSING_JWT_SECRET);
    }

    return secret;
  }

  private async validateStoredToken(token: string): Promise<RefreshToken> {
    // Hash del token para búsqueda segura
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Token no encontrado en BD`);
      throw new Error(ERROR_MESSAGES.TOKEN_NOT_FOUND);
    }

    await this.checkTokenRevocation(storedToken);
    this.checkTokenExpiration(storedToken);

    return storedToken;
  }

  private async checkTokenRevocation(storedToken: RefreshToken): Promise<void> {
    if (!storedToken.isRevoked) {
      return;
    }

    logger.error(`${LOG_CONTEXT.USE_CASE} Intento de reuso detectado`, {
      family: storedToken.familyId,
      userId: storedToken.userId,
    });

    await this.handleTokenReuse(storedToken);
    throw new Error(ERROR_MESSAGES.TOKEN_REVOKED);
  }

  private async handleTokenReuse(storedToken: RefreshToken): Promise<void> {
    await this.revokeTokenFamily(storedToken.familyId, storedToken.userId);
    await this.logSecurityIncident(storedToken);
  }

  private async revokeTokenFamily(family: string, userId: string): Promise<void> {
    try {
      await this.refreshTokenRepository.revokeFamily(family);
      logger.warn(`${LOG_CONTEXT.USE_CASE} Familia de tokens revocada`, { family, userId });
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error revocando familia de tokens`, {
        family,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  private async logSecurityIncident(storedToken: RefreshToken): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'RefreshToken',
        entityId: storedToken.familyId,
        action: AuditAction.SECURITY_INCIDENT,
        userId: storedToken.userId,
        ip: 'unknown',
        userAgent: 'unknown',
        reason: `Intento de reuso de refresh token revocado - Familia ${storedToken.familyId} comprometida`,
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error registrando incidente de seguridad`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }

  private checkTokenExpiration(storedToken: RefreshToken): void {
    if (storedToken.expiresAt >= new Date()) {
      return;
    }

    logger.warn(`${LOG_CONTEXT.USE_CASE} Token expirado`, {
      userId: storedToken.userId,
      expiresAt: storedToken.expiresAt,
    });

    throw new Error(ERROR_MESSAGES.TOKEN_EXPIRED);
  }

  private async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Usuario no encontrado`, { userId });
      throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
    }

    if (!user.active) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Usuario inactivo`, { userId });
      throw new Error(ERROR_MESSAGES.USER_INACTIVE);
    }

    return user;
  }

  private async revokeCurrentToken(token: string): Promise<void> {
    try {
      // Primero buscar el token por su hash para obtener el ID
      const crypto = require('crypto');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);
      if (storedToken) {
        await this.refreshTokenRepository.revoke(storedToken.id, 'Token rotated');
      }
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error revocando token actual`, {
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private async generateNewTokens(
    user: User,
    family: string,
    ip?: string,
    userAgent?: string
  ): Promise<RefreshTokenOutput> {
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(tokenPayload),
      this.tokenService.generateRefreshToken(
        tokenPayload,
        ip || 'unknown',
        userAgent || 'unknown'
      ),
    ]);

    return { accessToken, refreshToken };
  }

  private async saveNewRefreshToken(
    token: string,
    userId: string,
    family: string
  ): Promise<void> {
    const expiresAt = this.calculateRefreshTokenExpiration();
    const crypto = require('crypto');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    try {
      await this.refreshTokenRepository.create({
        tokenHash,
        userId,
        familyId: family,
        generationNumber: 1,
        expiresAt,
        isRevoked: false,
      });
    } catch (error) {
      logger.error(`${LOG_CONTEXT.USE_CASE} Error guardando nuevo refresh token`, {
        userId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
      throw error;
    }
  }

  private calculateRefreshTokenExpiration(): Date {
    return new Date(
      Date.now() + TOKEN_CONFIG.REFRESH_EXPIRATION_DAYS * TOKEN_CONFIG.MILLISECONDS_PER_DAY
    );
  }

  private async logSuccessfulRefresh(
    userId: string,
    ip?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await this.auditService.log({
        entityType: 'User',
        entityId: userId,
        action: AuditAction.TOKEN_REFRESH,
        userId,
        ip: ip || 'unknown',
        userAgent: userAgent || 'unknown',
        reason: 'Refresh token renovado exitosamente',
      });
    } catch (error) {
      logger.warn(`${LOG_CONTEXT.USE_CASE} Error registrando auditoría (no crítico)`, {
        userId,
        error: error instanceof Error ? error.message : 'Unknown',
      });
    }
  }
}

