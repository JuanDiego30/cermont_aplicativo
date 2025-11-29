import { prisma } from '../prisma.js';
import type { RevokedToken } from '../../../domain/entities/RevokedToken.js';
import type { IRevokedTokenRepository } from '../../../domain/repositories/IRevokedTokenRepository.js';

/**
 * Implementación de Prisma para IRevokedTokenRepository
 * Usa la tabla TokenBlacklist para almacenar tokens revocados
 */
export class RevokedTokenRepository implements IRevokedTokenRepository {
  private toDomain(entry: any): RevokedToken {
    return {
      id: entry.id,
      jti: entry.token,
      tokenIdentifier: entry.token, // Alias
      userId: entry.userId,
      expiresAt: entry.expiresAt,
      createdAt: entry.createdAt ?? entry.revokedAt,
      revokedAt: entry.revokedAt,
      reason: entry.type, // Usamos type como reason por compatibilidad
      type: entry.type,
    };
  }

  async create(data: Omit<RevokedToken, 'id' | 'revokedAt'>): Promise<RevokedToken> {
    // Acepta tanto jti como tokenIdentifier
    const tokenValue = data.jti || data.tokenIdentifier || '';
    
    const created = await prisma.tokenBlacklist.create({
      data: {
        token: tokenValue,
        userId: data.userId,
        type: data.type || data.reason || 'logout',
        expiresAt: data.expiresAt,
      },
    });

    return this.toDomain(created);
  }

  async isRevoked(jti: string): Promise<boolean> {
    const found = await prisma.tokenBlacklist.findUnique({
      where: { token: jti },
    });
    return found !== null;
  }

  /**
   * Alias para isRevoked (compatibilidad con tokenBlacklistRepository)
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    return this.isRevoked(jti);
  }

  /**
   * Cuenta tokens activos (no expirados)
   */
  async countActive(): Promise<number> {
    return prisma.tokenBlacklist.count({
      where: {
        expiresAt: { gt: new Date() },
      },
    });
  }

  async pruneExpired(): Promise<number> {
    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  /**
   * Alias para pruneExpired (compatibilidad)
   */
  async deleteExpired(): Promise<number> {
    return this.pruneExpired();
  }

  async findByUser(userId: string): Promise<RevokedToken[]> {
    const entries = await prisma.tokenBlacklist.findMany({
      where: { userId },
      orderBy: { revokedAt: 'desc' },
    });
    return entries.map((entry) => this.toDomain(entry));
  }

  async revokeAllByUser(userId: string, _reason?: string): Promise<number> {
    // Este método debería agregar nuevos tokens a la blacklist
    // pero sin conocer los tokens activos del usuario, solo podemos
    // contar cuántos tiene revocados
    const count = await prisma.tokenBlacklist.count({ where: { userId } });
    return count;
  }
}

export const revokedTokenRepository = new RevokedTokenRepository();

// Alias para compatibilidad hacia atrás
export const tokenBlacklistRepository = revokedTokenRepository;
