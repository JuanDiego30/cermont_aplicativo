/**
 * @repository PrismaUsuarioRepository
 * @description Implementación de IUsuarioRepository usando Prisma
 * @layer Infrastructure
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
    IUsuarioRepository,
    UsuarioData,
} from '../../domain/repositories';
import { Prisma, UserRole } from '.prisma/client';

@Injectable()
export class PrismaUsuarioRepository implements IUsuarioRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters: {
        role?: string;
        active?: boolean;
        search?: string;
        page: number;
        limit: number;
    }): Promise<{ data: UsuarioData[]; total: number }> {
        const { page, limit, role, active, search } = filters;
        const skip = (page - 1) * limit;

        const where: Prisma.UserWhereInput = {};

        if (role) {
            where.role = role as UserRole;
        }

        if (active !== undefined) {
            where.active = active;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users.map(this.mapToDomain),
            total,
        };
    }

    async findById(id: string): Promise<UsuarioData | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        return user ? this.mapToDomain(user) : null;
    }

    async findByEmail(email: string): Promise<UsuarioData | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        return user ? this.mapToDomain(user) : null;
    }

    async create(data: {
        email: string;
        password: string;
        name: string;
        role: string;
        phone?: string;
        avatar?: string;
    }): Promise<UsuarioData> {
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: data.password,
                name: data.name,
                role: data.role as UserRole,
                phone: data.phone,
                avatar: data.avatar,
            },
        });

        return this.mapToDomain(user);
    }

    async update(
        id: string,
        data: Partial<{
            email: string;
            password: string;
            name: string;
            role: string;
            phone: string;
            avatar: string;
            active: boolean;
        }>,
    ): Promise<UsuarioData> {
        const updateData: Prisma.UserUpdateInput = {};

        if (data.email) updateData.email = data.email;
        if (data.password) updateData.password = data.password;
        if (data.name) updateData.name = data.name;
        if (data.role) updateData.role = data.role as UserRole;
        if (data.phone) updateData.phone = data.phone;
        if (data.avatar) updateData.avatar = data.avatar;
        if (data.active !== undefined) updateData.active = data.active;

        const user = await this.prisma.user.update({
            where: { id },
            data: updateData,
        });

        return this.mapToDomain(user);
    }

    async deactivate(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { active: false },
        });
    }

    async activate(id: string): Promise<void> {
        await this.prisma.user.update({
            where: { id },
            data: { active: true },
        });
    }

    // Helper mapper
    private mapToDomain(user: any): UsuarioData {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone ?? undefined,
            avatar: user.avatar ?? undefined,
            active: user.active,
            lastLogin: user.lastLogin ?? undefined,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
