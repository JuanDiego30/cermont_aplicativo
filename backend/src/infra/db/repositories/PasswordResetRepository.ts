import { prisma } from '../prisma.js';
import type { PasswordResetToken } from '../../../domain/entities/PasswordResetToken.js';
import type { IPasswordResetRepository } from '../../../domain/repositories/IPasswordResetRepository.js';

export class PasswordResetRepository implements IPasswordResetRepository {
  
  // --- Mapper Privado ---
  private toDomain(prismaToken: {
    id: string;
    token: string;
    userId: string;
    email: string;
    expiresAt: Date;
    usedAt: Date | null;
    createdAt: Date;
  }): PasswordResetToken {
    return {
      id: prismaToken.id,
      token: prismaToken.token,
      userId: prismaToken.userId,
      email: prismaToken.email,
      expiresAt: prismaToken.expiresAt,
      usedAt: prismaToken.usedAt,
      createdAt: prismaToken.createdAt,
    };
  }

  // --- Implementación de Interfaz ---

  async create(data: Omit<PasswordResetToken, 'id' | 'createdAt' | 'usedAt'>): Promise<PasswordResetToken> {
    const created = await prisma.passwordResetToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        email: data.email,
        expiresAt: data.expiresAt,
      }
    });
    return this.toDomain(created);
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const found = await prisma.passwordResetToken.findUnique({ where: { token } });
    return found ? this.toDomain(found) : null;
  }

  async findActiveByEmail(email: string): Promise<PasswordResetToken | null> {
    const found = await prisma.passwordResetToken.findFirst({
      where: {
        email: email.toLowerCase(),
        usedAt: null,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
    return found ? this.toDomain(found) : null;
  }

  async markAsUsed(id: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() }
    });
  }

  async invalidateAllByUser(userId: string): Promise<number> {
    // En lugar de eliminar, marcamos como usados todos los tokens activos
    const result = await prisma.passwordResetToken.updateMany({
      where: {
        userId,
        usedAt: null
      },
      data: { usedAt: new Date() }
    });
    return result.count;
  }

  async cleanupExpired(): Promise<number> {
    // Eliminar tokens expirados hace más de 7 días
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const result = await prisma.passwordResetToken.deleteMany({
      where: {
        expiresAt: { lt: cutoffDate }
      }
    });
    return result.count;
  }
}

// Singleton export
export const passwordResetRepository = new PasswordResetRepository();
