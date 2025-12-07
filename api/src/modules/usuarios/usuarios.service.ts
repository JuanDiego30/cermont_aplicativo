import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../../shared/errors/AppError.js';
import type { CreateUserDTO, UpdateUserDTO, UserFiltersDTO } from './usuarios.types.js';

const prisma = new PrismaClient();

export class UsuariosService {

    async findAll(filters: UserFiltersDTO) {
        const { role, active, search, page, limit } = filters;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (role) where.role = role;
        if (active !== undefined) where.active = active === 'true';
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const [usuarios, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    phone: true,
                    avatar: true,
                    active: true,
                    lastLogin: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        return {
            usuarios,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findById(id: string) {
        const usuario = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                avatar: true,
                active: true,
                lastLogin: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404);
        }

        return usuario;
    }

    async create(data: CreateUserDTO) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) {
            throw new AppError('El email ya está registrado', 409);
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const usuario = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
                phone: data.phone,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                active: true,
                createdAt: true,
            },
        });

        return usuario;
    }

    async update(id: string, data: UpdateUserDTO) {
        const usuario = await prisma.user.findUnique({ where: { id } });
        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404);
        }

        const updated = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
                avatar: true,
                active: true,
                updatedAt: true,
            },
        });

        return updated;
    }

    async delete(id: string) {
        const usuario = await prisma.user.findUnique({ where: { id } });
        if (!usuario) {
            throw new AppError('Usuario no encontrado', 404);
        }

        await prisma.user.update({
            where: { id },
            data: { active: false },
        });

        return { message: 'Usuario desactivado exitosamente' };
    }

    async changePassword(id: string, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });

        return { message: 'Contraseña actualizada exitosamente' };
    }
}

export const usuariosService = new UsuariosService();
