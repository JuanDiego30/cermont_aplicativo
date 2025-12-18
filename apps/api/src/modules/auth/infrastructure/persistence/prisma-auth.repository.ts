
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { IAuthRepository } from '../../domain/repositories';
import { AuthUserEntity, AuthUserProps } from '../../domain/entities/auth-user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findByEmail(email: string): Promise<AuthUserEntity | null> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) return null;
        return this.mapUser(user);
    }

    async findById(id: string): Promise<AuthUserEntity | null> {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) return null;
        return this.mapUser(user);
    }

    async findUserById(id: string): Promise<AuthUserEntity | null> {
        return this.findById(id);
    }

    async create(data: Omit<AuthUserProps, 'id'>): Promise<AuthUserEntity> {
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
        });
        return this.mapUser(user);
    }

    async updateLastLogin(userId: string): Promise<void> {
        await this.prisma.user.update({
            where: { id: userId },
            data: { lastLogin: new Date() },
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
            include: { user: true },
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
                entityType: 'User',
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
                const newToken = uuidv4();
                return { refreshToken: newToken };
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

    async createSession(session: { refreshToken: string }): Promise<void> {
        // Session creation handled by createRefreshToken with full data
        // This is a minimal implementation for interface compatibility
    }

    private mapUser(user: any): AuthUserEntity {
        return AuthUserEntity.fromDatabase({
            id: user.id,
            email: user.email,
            password: user.password,
            name: user.name,
            role: user.role as 'admin' | 'supervisor' | 'tecnico',
            phone: user.phone,
            avatar: user.avatar,
            active: user.active,
            lastLogin: user.lastLogin,
        });
    }
}
