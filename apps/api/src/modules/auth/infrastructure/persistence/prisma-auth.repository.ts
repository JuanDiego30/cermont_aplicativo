import { Injectable, Inject, Logger } from "@nestjs/common";
import { PrismaService } from "../../../../prisma/prisma.service";
import { IAuthRepository } from "../../domain/repositories";
import {
  AuthUserEntity,
  AuthUserProps,
} from "../../domain/entities/auth-user.entity";
import { randomUUID } from "crypto";
import { AUTH_CONSTANTS } from "../../auth.constants";
import { UserRole } from "../../../../common/enums/user-role.enum";

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  private readonly logger = new Logger(PrismaAuthRepository.name);

  private readonly userSelect = {
    id: true,
    email: true,
    password: true,
    name: true,
    role: true,
    phone: true,
    avatar: true,
    active: true,
    lastLogin: true,
    loginAttempts: true,
    lockedUntil: true,
    twoFactorEnabled: true,
  } as const;

  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService,
  ) {}

  async findByEmail(email: string): Promise<AuthUserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: this.userSelect,
    });
    if (!user) return null;
    return this.mapUser(user);
  }

  async findById(id: string): Promise<AuthUserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect,
    });
    if (!user) return null;
    return this.mapUser(user);
  }

  async findUserById(id: string): Promise<AuthUserEntity | null> {
    return this.findById(id);
  }

  async create(data: Omit<AuthUserProps, "id">): Promise<AuthUserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role,
        phone: data.phone,
        avatar: data.avatar,
        active: data.active,
      },
      select: this.userSelect,
    });
    return this.mapUser(user);
  }

  async updateLastLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  }

  async incrementLoginAttempts(
    userId: string,
    lockUntil?: Date,
  ): Promise<{ loginAttempts: number; lockedUntil: Date | null }> {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        loginAttempts: { increment: 1 },
        ...(lockUntil ? { lockedUntil: lockUntil, loginAttempts: 0 } : {}),
      },
      select: { loginAttempts: true, lockedUntil: true },
    });

    return {
      loginAttempts: updated.loginAttempts,
      lockedUntil: updated.lockedUntil,
    };
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { loginAttempts: 0, lockedUntil: null },
    });
  }

  async createRefreshToken(data: {
    token: string;
    userId: string;
    family: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token: data.token,
        userId: data.userId,
        family: data.family,
        expiresAt: data.expiresAt,
        ipAddress: data.ipAddress ?? null,
        userAgent: data.userAgent ?? null,
      },
    });
  }

  async findRefreshToken(token: string) {
    const rt = await this.prisma.refreshToken.findUnique({
      where: { token },
      select: {
        id: true,
        token: true,
        userId: true,
        family: true,
        expiresAt: true,
        isRevoked: true,
        user: {
          select: this.userSelect,
        },
      },
    });
    if (!rt) return null;
    return {
      id: rt.id,
      token: rt.token,
      userId: rt.userId,
      family: rt.family,
      expiresAt: rt.expiresAt,
      isRevoked: rt.isRevoked,
      user: this.mapUser(rt.user),
    };
  }

  async revokeRefreshToken(tokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { isRevoked: true },
    });
  }

  async revokeTokenFamily(family: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { family },
      data: { isRevoked: true },
    });
  }

  async createAuditLog(data: {
    userId: string;
    action: string;
    ip?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        entityType: "User",
        entityId: data.userId,
        action: data.action,
        userId: data.userId,
        ip: data.ip,
        userAgent: data.userAgent,
      },
    });
  }

  // Session methods (alias for refresh token operations for existing use cases)
  async findSessionByToken(token: string) {
    const rt = await this.findRefreshToken(token);
    if (!rt) return null;
    const isExpired = new Date() > rt.expiresAt;
    return {
      id: rt.id,
      userId: rt.userId,
      family: rt.family,
      isRevoked: rt.isRevoked,
      isExpired,
      rotate: (ip?: string, userAgent?: string) => {
        const newToken = randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(
          expiresAt.getDate() + AUTH_CONSTANTS.REFRESH_TOKEN_DAYS_DEFAULT,
        );

        return {
          refreshToken: newToken,
          token: newToken,
          userId: rt.userId,
          family: rt.family,
          expiresAt,
          ipAddress: ip,
          userAgent,
        };
      },
    };
  }

  async revokeSessionFamily(family: string): Promise<void> {
    return this.revokeTokenFamily(family);
  }

  async revokeSession(token: string): Promise<void> {
    const rt = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (rt) {
      await this.revokeRefreshToken(rt.id);
    }
  }

  async createSession(session: any): Promise<void> {
    await this.createRefreshToken({
      token: session.token || session.refreshToken,
      userId: session.userId,
      family: session.family,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
    });
  }

  private mapUser(user: any): AuthUserEntity {
    return AuthUserEntity.fromDatabase({
      id: user.id,
      email: user.email,
      password: user.password,
      name: user.name,
      role: user.role as UserRole,
      phone: user.phone,
      avatar: user.avatar,
      active: user.active,
      lastLogin: user.lastLogin,
      loginAttempts: user.loginAttempts,
      lockedUntil: user.lockedUntil,
      twoFactorEnabled: user.twoFactorEnabled,
    });
  }
}
