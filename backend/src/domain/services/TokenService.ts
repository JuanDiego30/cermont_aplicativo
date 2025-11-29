import type { IRevokedTokenRepository } from '../repositories/ITokenBlacklistRepository.js';
import type { IRefreshTokenRepository } from '../repositories/IRefreshTokenRepository.js';
import type { RefreshToken } from '../entities/RefreshToken.js';
import crypto from 'crypto';

const REFRESH_TOKEN_TTL = process.env.JWT_REFRESH_TTL || '7d';

/** Parsea una duración como '7d' a milisegundos */
function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days
  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000,
  };
  return value * (multipliers[unit] || 1);
}

/** Genera un ID único */
function generateUniqueId(): string {
  return crypto.randomUUID();
}

export interface CleanupResult {
  revokedTokensCleaned: number;
  refreshTokensCleaned: number;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface IJwtServiceSimple {
  generateAccessToken(payload: JwtPayload): Promise<string>;
  generateRefreshToken(payload: JwtPayload): Promise<string>;
  decode(token: string): { exp?: number; userId?: string } | null;
}

/**
 * Servicio: Gestión de Tokens
 * Responsable del ciclo de vida de los tokens (emisión, almacenamiento, revocación, rotación).
 * No maneja autenticación de usuario (eso es AuthService), solo la criptografía y persistencia de tokens.
 */
export class TokenService {
  constructor(
    private readonly revokedTokenRepository: IRevokedTokenRepository,
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    private readonly jwtService: IJwtServiceSimple
  ) {}

  // --- Access Tokens ---

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.generateAccessToken(payload);
  }

  async revokeAccessToken(token: string, userId: string, expiresAt: Date): Promise<void> {
    await this.revokedTokenRepository.create({
      tokenIdentifier: token,
      userId,
      expiresAt,
    });
  }

  async isAccessTokenRevoked(tokenIdentifier: string): Promise<boolean> {
    return this.revokedTokenRepository.isRevoked(tokenIdentifier);
  }

  // --- Refresh Tokens ---

  async generateRefreshToken(
    payload: JwtPayload,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    const token = await this.jwtService.generateRefreshToken(payload);
    const familyId = generateUniqueId();
    const ttlMs = parseDuration(REFRESH_TOKEN_TTL);
    const expiresAt = new Date(Date.now() + ttlMs);

    // Hash del token antes de guardar (Seguridad)
    const tokenHash = this.hashToken(token);

    await this.refreshTokenRepository.create({
      tokenHash,
      userId: payload.userId,
      familyId,
      generationNumber: 1,
      isRevoked: false,
      expiresAt,
      ipAddress,
      userAgent,
    });

    return token;
  }

  async validateRefreshToken(token: string): Promise<{ isValid: boolean; entity?: RefreshToken }> {
    const tokenHash = this.hashToken(token);
    const storedToken = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) return { isValid: false };
    if (storedToken.isRevoked) return { isValid: false, entity: storedToken }; // Revocado explícitamente
    if (new Date() > storedToken.expiresAt) return { isValid: false, entity: storedToken }; // Expirado

    return { isValid: true, entity: storedToken };
  }

  async rotateRefreshToken(oldTokenEntity: RefreshToken, ipAddress?: string, userAgent?: string): Promise<string> {
    // Invalidar token anterior (Rotación)
    await this.refreshTokenRepository.revoke(oldTokenEntity.id, 'Rotated');

    // Generar nuevo token en la misma familia
    const payload: JwtPayload = { userId: oldTokenEntity.userId, email: '', role: '' }; // Simplificado
    const newToken = await this.jwtService.generateRefreshToken(payload);
    const ttlMs = parseDuration(REFRESH_TOKEN_TTL);
    
    await this.refreshTokenRepository.create({
      tokenHash: this.hashToken(newToken),
      userId: oldTokenEntity.userId,
      familyId: oldTokenEntity.familyId,
      generationNumber: (oldTokenEntity.generationNumber || 0) + 1,
      isRevoked: false,
      expiresAt: new Date(Date.now() + ttlMs),
      ipAddress,
      userAgent,
    });

    return newToken;
  }

  // --- Gestión de Seguridad ---

  async revokeRefreshTokenFamily(familyId: string, reason = 'Security Event'): Promise<void> {
    await this.refreshTokenRepository.revokeFamily(familyId, reason);
  }

  async revokeAllUserSessions(userId: string, reason = 'User Logout'): Promise<void> {
    await this.refreshTokenRepository.revokeAllByUser(userId, reason);
  }

  async pruneExpiredTokens(): Promise<CleanupResult> {
    const [revokedTokensCleaned, refreshTokensCleaned] = await Promise.all([
      this.revokedTokenRepository.pruneExpired(),
      this.refreshTokenRepository.pruneExpired(),
    ]);
    return { revokedTokensCleaned, refreshTokensCleaned };
  }

  private hashToken(token: string): string {
    // Delegar a utilidad de hash (ej: SHA256 rápido)
    // return crypto.createHash('sha256').update(token).digest('hex');
    return token; // Placeholder para el ejemplo, DEBE ser implementado
  }
}


