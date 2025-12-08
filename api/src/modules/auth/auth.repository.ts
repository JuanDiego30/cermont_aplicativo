/**
 * Capa de acceso a datos (Data Access Layer) para autenticación en Cermont. Abstrae
 * todas las operaciones con base de datos (Prisma) relacionadas con usuarios, refresh tokens,
 * password reset tokens y audit logs. Proporciona métodos CRUD, rotación de tokens con
 * family pattern para detección de reuso, revocación en cascada, limpieza automática de
 * tokens expirados, y transacciones atómicas para reseteo seguro de contraseña con
 * revocación de todas las sesiones anteriores.
 */

import { User, RefreshToken, PasswordResetToken, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';

type RefreshTokenWithUser = RefreshToken & { user: User };

export class AuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role?: 'admin' | 'supervisor' | 'tecnico' | 'administrativo';
    phone?: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'tecnico',
        phone: data.phone,
      },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: string;
    family: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  }

  async findRefreshToken(token: string): Promise<RefreshTokenWithUser | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(id: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true, lastUsedAt: new Date() },
    });
  }

  async revokeRefreshTokenByValue(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeTokenFamily(family: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { family },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async cleanExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { isRevoked: true },
        ],
      },
    });
    return result.count;
  }

  async createAuditLog(data: {
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    ip?: string;
    userAgent?: string;
    changes?: Prisma.InputJsonValue;
  }): Promise<void> {
    await prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        ip: data.ip,
        userAgent: data.userAgent,
        changes: data.changes,
      }
    });
  }

  async createPasswordResetToken(data: {
    token: string;
    userId: string;
    email: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({ data });
  }

  async findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: { token },
    });
  }

  async resetPasswordTransaction(resetTokenId: string, userId: string, hashedPassword: string): Promise<void> {
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetTokenId },
        data: { usedAt: new Date() },
      }),
      prisma.refreshToken.updateMany({
        where: { userId },
        data: { isRevoked: true },
      }),
    ]);
  }
}

export const authRepository = new AuthRepository();

