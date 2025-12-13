/**
 * @repository UsuarioRepository
 * @description Implementación del repositorio de usuarios con Prisma
 * @layer Infrastructure
 */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { IUsuarioRepository, UsuarioData } from '../../domain/repositories';

@Injectable()
export class UsuarioRepository implements IUsuarioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: {
    role?: string;
    active?: boolean;
    search?: string;
    page: number;
    limit: number;
  }): Promise<{ data: UsuarioData[]; total: number }> {
    const where: any = {};

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.active !== undefined) {
      where.active = filters.active;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const skip = (filters.page - 1) * filters.limit;

    const [usuarios, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: filters.limit,
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
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: usuarios.map((u) => ({
        ...u,
        phone: u.phone ?? undefined,
        avatar: u.avatar ?? undefined,
        lastLogin: u.lastLogin ?? undefined,
      })),
      total,
    };
  }

  async findById(id: string): Promise<UsuarioData | null> {
    const usuario = await this.prisma.user.findUnique({
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

    if (!usuario) return null;

    return {
      ...usuario,
      phone: usuario.phone ?? undefined,
      avatar: usuario.avatar ?? undefined,
      lastLogin: usuario.lastLogin ?? undefined,
    };
  }

  async findByEmail(email: string): Promise<UsuarioData | null> {
    const usuario = await this.prisma.user.findUnique({
      where: { email },
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

    if (!usuario) return null;

    return {
      ...usuario,
      phone: usuario.phone ?? undefined,
      avatar: usuario.avatar ?? undefined,
      lastLogin: usuario.lastLogin ?? undefined,
    };
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    role: string;
    phone?: string;
    avatar?: string;
  }): Promise<UsuarioData> {
    const usuario = await this.prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role as any,
        phone: data.phone,
        avatar: data.avatar,
      },
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

    return {
      ...usuario,
      phone: usuario.phone ?? undefined,
      avatar: usuario.avatar ?? undefined,
      lastLogin: usuario.lastLogin ?? undefined,
    };
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
    const updateData: any = { ...data };
    if (data.role) {
      updateData.role = data.role as any;
    }

    const usuario = await this.prisma.user.update({
      where: { id },
      data: updateData,
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

    return {
      ...usuario,
      phone: usuario.phone ?? undefined,
      avatar: usuario.avatar ?? undefined,
      lastLogin: usuario.lastLogin ?? undefined,
    };
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
}
