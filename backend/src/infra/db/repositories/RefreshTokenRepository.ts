import { prisma } from '../prisma.js';
import type { RefreshToken } from '../../../domain/entities/RefreshToken.js';
import type { IRefreshTokenRepository, RefreshTokenStats } from '../../../domain/repositories/IRefreshTokenRepository.js';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  
  // --- Mapper Privado ---
  private toDomain(prismaToken: any): RefreshToken {
    return {
      id: prismaToken.id,
      tokenHash: prismaToken.token,
      userId: prismaToken.userId,
      familyId: prismaToken.family,
      isRevoked: prismaToken.isRevoked,
      ipAddress: prismaToken.ipAddress ?? undefined,
      userAgent: prismaToken.userAgent ?? undefined,
      expiresAt: prismaToken.expiresAt,
      createdAt: prismaToken.createdAt,
      updatedAt: prismaToken.updatedAt,
      lastUsedAt: prismaToken.lastUsedAt ?? undefined,
    };
  }

  // --- Implementación de Interfaz ---

  async create(data: Omit<RefreshToken, 'id' | 'createdAt' | 'updatedAt'>): Promise<RefreshToken> {
    const tokenValue = data.tokenHash ?? data.token;
    if (!tokenValue) {
      throw new Error('Token hash o token es requerido');
    }
    
    const created = await prisma.refreshToken.create({ 
      data: {
        token: tokenValue,
        userId: data.userId,
        family: data.familyId,
        isRevoked: data.isRevoked ?? false,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        expiresAt: data.expiresAt,
      }
    });
    return this.toDomain(created);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const found = await prisma.refreshToken.findUnique({ where: { token: tokenHash } });
    return found ? this.toDomain(found) : null;
  }

  async findByFamily(familyId: string): Promise<RefreshToken[]> {
    const rows = await prisma.refreshToken.findMany({ 
      where: { family: familyId }, 
      orderBy: { createdAt: 'asc' } 
    });
    return rows.map(r => this.toDomain(r));
  }

  async revoke(id: string, _reason?: string): Promise<void> {
    await prisma.refreshToken.update({ 
      where: { id }, 
      data: { 
        isRevoked: true
      } 
    });
  }

  async revokeFamily(familyId: string, _reason?: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({ 
      where: { family: familyId, isRevoked: false }, 
      data: { 
        isRevoked: true
      } 
    });
    return result.count;
  }

  async revokeAllByUser(userId: string, _reason?: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: {
        isRevoked: true
      },
    });
    return result.count;
  }

  async findActiveByUser(userId: string): Promise<RefreshToken[]> {
    const rows = await prisma.refreshToken.findMany({ 
      where: { 
        userId, 
        isRevoked: false, 
        expiresAt: { gt: new Date() } 
      } 
    });
    return rows.map(r => this.toDomain(r));
  }

  async pruneExpired(): Promise<number> {
    const now = new Date();
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
    return result.count;
  }

  async getStats(): Promise<RefreshTokenStats> {
    const now = new Date();
    const [total, active, revoked, expired] = await Promise.all([
      prisma.refreshToken.count(),
      prisma.refreshToken.count({ where: { isRevoked: false, expiresAt: { gt: now } } }),
      prisma.refreshToken.count({ where: { isRevoked: true } }),
      prisma.refreshToken.count({ where: { expiresAt: { lt: now } } }),
    ]);

    return { total, active, revoked, expired };
  }

  /**
   * Cuenta tokens activos de un usuario
   */
  async countActive(userId?: string): Promise<number> {
    const where: any = {
      isRevoked: false,
      expiresAt: { gt: new Date() },
    };
    if (userId) where.userId = userId;
    return prisma.refreshToken.count({ where });
  }

  // --- Legacy Methods / Compatibilidad ---

  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.findByTokenHash(token);
  }

  async save(token: string, userId: string, family: string, expiresAt: Date): Promise<RefreshToken> {
    return this.create({
      tokenHash: token,
      userId,
      familyId: family,
      expiresAt,
      isRevoked: false
    });
  }

  async revokeToken(token: string): Promise<void> {
    const found = await prisma.refreshToken.findUnique({ where: { token } });
    if (found) {
      await this.revoke(found.id, 'Manual Revocation');
    }
  }

  async deleteExpired(): Promise<number> {
    return this.pruneExpired();
  }

  async revokeAllUserTokens(userId: string): Promise<number> {
    return this.revokeAllByUser(userId);
  }
  
  async revokeTokenFamily(familyId: string): Promise<number> {
    return this.revokeFamily(familyId);
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
