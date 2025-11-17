import prisma from '../prisma';
import type { RefreshToken } from '@/domain/entities/RefreshToken';
import type { IRefreshTokenRepository } from '@/domain/repositories/IRefreshTokenRepository';

export class RefreshTokenRepository implements IRefreshTokenRepository {
  private toDomain(prismaToken: any): RefreshToken {
    return {
      id: prismaToken.id,
      token: prismaToken.token,
      userId: prismaToken.userId,
      family: prismaToken.family,
      isRevoked: prismaToken.isRevoked,
      ipAddress: prismaToken.ipAddress ?? undefined,
      userAgent: prismaToken.userAgent ?? undefined,
      expiresAt: prismaToken.expiresAt,
      createdAt: prismaToken.createdAt,
      updatedAt: prismaToken.updatedAt,
      lastUsedAt: prismaToken.lastUsedAt ?? undefined,
    };
  }
  async create(data: Omit<RefreshToken, 'id' | 'createdAt'>): Promise<RefreshToken> {
    const r = await prisma.refreshToken.create({ data });
    return this.toDomain(r);
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const r = await prisma.refreshToken.findUnique({ where: { token } });
    return r ? this.toDomain(r) : null;
  }

  async findByUserId(userId: string): Promise<RefreshToken[]> {
    const rows = await prisma.refreshToken.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
    return rows.map((r) => this.toDomain(r));
  }

  async revoke(token: string): Promise<void> {
    await prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } });
  }

  async revokeToken(token: string): Promise<boolean> {
    try {
      await prisma.refreshToken.update({ where: { token }, data: { isRevoked: true } });
      return true;
    } catch {
      return false;
    }
  }

  async revokeAllByUserId(userId: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({
      where: { userId },
      data: {
        isRevoked: true,
      },
    });

    return result.count;
  }

  // Alias para compatibilidad
  async revokeAllUserTokens(userId: string): Promise<number> {
    return await this.revokeAllByUserId(userId);
  }

  async revokeTokenFamily(family: string): Promise<number> {
    const result = await prisma.refreshToken.updateMany({ where: { family }, data: { isRevoked: true } });
    return result.count;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();

    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    });

    return result.count;
  }

  async isValid(token: string): Promise<boolean> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
    });

    if (!refreshToken) return false;
    if (refreshToken.isRevoked) return false;
    if (refreshToken.expiresAt < new Date()) return false;

    return true;
  }

  async save(token: string, userId: string, family: string, expiresAt: Date): Promise<RefreshToken> {
    const r = await prisma.refreshToken.create({ data: { token, userId, family, expiresAt, isRevoked: false } });
    return this.toDomain(r);
  }

  async countActive(userId: string): Promise<number> {
    return await prisma.refreshToken.count({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }

  async findActiveByUser(userId: string): Promise<RefreshToken[]> {
    const rows = await prisma.refreshToken.findMany({ where: { userId, isRevoked: false, expiresAt: { gt: new Date() } } });
    return rows.map((r) => this.toDomain(r));
  }

  async countActiveByUser(userId: string): Promise<number> {
    return await this.countActive(userId);
  }

  async getStats(): Promise<any> {
    const now = new Date();
    const [total, active, revoked, expired] = await Promise.all([
      prisma.refreshToken.count(),
      prisma.refreshToken.count({ where: { isRevoked: false, expiresAt: { gt: now } } }),
      prisma.refreshToken.count({ where: { isRevoked: true } }),
      prisma.refreshToken.count({ where: { expiresAt: { lt: now } } }),
    ]);

    return { total, active, revoked, expired };
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
