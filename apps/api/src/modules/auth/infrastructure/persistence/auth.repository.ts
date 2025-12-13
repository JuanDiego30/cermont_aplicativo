/**
 * @repository AuthRepository
 * @description Implementación del repositorio de autenticación con Prisma
 * @layer Infrastructure
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IAuthRepository } from '../../domain/repositories';
import { AuthSessionEntity } from '../../domain/entities';

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(session: AuthSessionEntity): Promise<AuthSessionEntity> {
    const created = await this.prisma.refreshToken.create({
      data: {
        token: session.refreshToken,
        userId: session.userId,
        family: session.family,
        expiresAt: session.expiresAt,
        isRevoked: false,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      },
    });

    return AuthSessionEntity.fromPersistence({
      id: created.id,
      userId: created.userId,
      refreshToken: created.token,
      family: created.family,
      expiresAt: created.expiresAt,
      isRevoked: created.isRevoked,
      ipAddress: created.ipAddress ?? undefined,
      userAgent: created.userAgent ?? undefined,
      createdAt: created.createdAt,
    });
  }

  async findSessionByToken(token: string): Promise<AuthSessionEntity | null> {
    const session = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!session) return null;

    return AuthSessionEntity.fromPersistence({
      id: session.id,
      userId: session.userId,
      refreshToken: session.token,
      family: session.family,
      expiresAt: session.expiresAt,
      isRevoked: session.isRevoked,
      ipAddress: session.ipAddress ?? undefined,
      userAgent: session.userAgent ?? undefined,
      createdAt: session.createdAt,
    });
  }

  async revokeSession(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  }

  async revokeSessionFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { family },
      data: { isRevoked: true },
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  async findUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        active: true,
        avatar: true,
        phone: true,
        lastLogin: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      avatar: user.avatar ?? undefined,
      phone: user.phone ?? undefined,
      lastLogin: user.lastLogin ?? undefined,
    };
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        active: true,
        avatar: true,
        phone: true,
      },
    });

    if (!user) return null;

    return {
      ...user,
      avatar: user.avatar ?? undefined,
      phone: user.phone ?? undefined,
    };
  }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
  }) {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role as any,
        phone: data.phone,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        phone: true,
      },
    });

    return {
      ...user,
      avatar: user.avatar ?? undefined,
      phone: user.phone ?? undefined,
    };
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  async createAuditLog(data: {
    entityType: string;
    entityId: string;
    action: string;
    userId: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        userId: data.userId,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });
  }
}
