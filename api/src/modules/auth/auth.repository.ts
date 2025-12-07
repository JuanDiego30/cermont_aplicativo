import { User, RefreshToken, PasswordResetToken, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';

// Type for refresh token with user relation
type RefreshTokenWithUser = RefreshToken & { user: User };

export class AuthRepository {
  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  /**
   * Crear nuevo usuario
   */
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

  /**
   * Actualizar último login del usuario
   */
  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  /**
   * Actualizar contraseña del usuario
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  /**
   * Crear refresh token
   */
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

  /**
   * Buscar refresh token con usuario
   */
  async findRefreshToken(token: string): Promise<RefreshTokenWithUser | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  /**
   * Revocar refresh token por ID
   */
  async revokeRefreshToken(id: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { id },
      data: { isRevoked: true, lastUsedAt: new Date() },
    });
  }

  /**
   * Revocar refresh token por valor del token
   */
  async revokeRefreshTokenByValue(token: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  /**
   * Revocar todos los tokens de una familia
   */
  async revokeTokenFamily(family: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { family },
      data: { isRevoked: true },
    });
  }

  /**
   * Revocar todos los tokens de un usuario
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  /**
   * Limpiar tokens expirados
   */
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

  /**
   * Crear registro de auditoría
   */
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

  /**
   * Crear token de reset de contraseña
   */
  async createPasswordResetToken(data: {
    token: string;
    userId: string;
    email: string;
    expiresAt: Date;
  }): Promise<PasswordResetToken> {
    return prisma.passwordResetToken.create({ data });
  }

  /**
   * Buscar token de reset de contraseña
   */
  async findPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    return prisma.passwordResetToken.findUnique({
      where: { token },
    });
  }

  /**
   * Transacción para resetear contraseña
   */
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

// Export singleton instance
export const authRepository = new AuthRepository();
