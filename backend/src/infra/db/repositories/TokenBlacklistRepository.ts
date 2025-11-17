import prisma from '../prisma.js';
import type { TokenBlacklist } from '../../../domain/entities/TokenBlacklist.js';
import { TokenType } from '../../../domain/entities/TokenBlacklist.js';
import type { ITokenBlacklistRepository, TokenBlacklistStats } from '../../../domain/repositories/ITokenBlacklistRepository.js';

export class TokenBlacklistRepository implements ITokenBlacklistRepository {
  private toDomain(entry: any): TokenBlacklist {
    return {
      id: entry.id,
      token: entry.token,
      userId: entry.userId,
      type: entry.type as TokenType,
      expiresAt: entry.expiresAt,
      revokedAt: entry.revokedAt,
      revokedBy: entry.revokedBy ?? undefined,
      reason: entry.reason ?? undefined,
      createdAt: entry.createdAt,
      ipAddress: entry.ipAddress ?? undefined,
      userAgent: entry.userAgent ?? undefined,
    };
  }

  async create(data: Omit<TokenBlacklist, 'id' | 'createdAt'>): Promise<TokenBlacklist> {
    const created = await prisma.tokenBlacklist.create({
      data: {
        token: data.token,
        userId: data.userId,
        type: data.type,
        expiresAt: data.expiresAt,
        revokedAt: data.revokedAt,
      },
    });

    return this.toDomain(created);
  }

  async findByToken(token: string): Promise<TokenBlacklist | null> {
    const found = await prisma.tokenBlacklist.findUnique({
      where: { token },
    });

    return found ? this.toDomain(found) : null;
  }

  async addToken(token: string, userId: string, type: TokenType, expiresAt: Date): Promise<TokenBlacklist> {
    return this.create({
      token,
      userId,
      type,
      expiresAt,
      revokedAt: new Date(),
    });
  }

  async isBlacklisted(token: string): Promise<boolean> {
    return (await this.findByToken(token)) !== null;
  }

  async findByUser(userId: string): Promise<TokenBlacklist[]> {
    const entries = await prisma.tokenBlacklist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((entry) => this.toDomain(entry));
  }

  async findByType(type: TokenType): Promise<TokenBlacklist[]> {
    const entries = await prisma.tokenBlacklist.findMany({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });

    return entries.map((entry) => this.toDomain(entry));
  }

  async countByUser(userId: string): Promise<number> {
    return prisma.tokenBlacklist.count({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  async deleteByUser(userId: string): Promise<number> {
    const result = await prisma.tokenBlacklist.deleteMany({
      where: { userId },
    });

    return result.count;
  }

  async getStats(): Promise<TokenBlacklistStats> {
    const now = new Date();

    const [total, expired, accessCount, refreshCount] = await Promise.all([
      prisma.tokenBlacklist.count(),
      prisma.tokenBlacklist.count({
        where: { expiresAt: { lt: now } },
      }),
      prisma.tokenBlacklist.count({
        where: { type: TokenType.ACCESS },
      }),
      prisma.tokenBlacklist.count({
        where: { type: TokenType.REFRESH },
      }),
    ]);

    return {
      total,
      expired,
      byType: {
        [TokenType.ACCESS]: accessCount,
        [TokenType.REFRESH]: refreshCount,
      },
    };
  }

  // M�todos adicionales requeridos
  async add(data: Omit<TokenBlacklist, 'id' | 'createdAt'>): Promise<TokenBlacklist> {
    return this.create(data);
  }

  async removeExpired(): Promise<number> {
    return this.deleteExpired();
  }

  async revokeAllByUserId(userId: string): Promise<number> {
    return this.deleteByUser(userId);
  }

  async countActive(): Promise<number> {
    const now = new Date();
    return prisma.tokenBlacklist.count({
      where: {
        expiresAt: { gte: now },
      },
    });
  }
}

export const tokenBlacklistRepository = new TokenBlacklistRepository();
