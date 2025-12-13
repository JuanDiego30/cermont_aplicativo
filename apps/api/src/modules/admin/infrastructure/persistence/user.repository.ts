/**
 * @repository UserRepository
 * 
 * Implementación del repositorio de usuarios con Prisma.
 * Implementa la interfaz IUserRepository definida en el dominio.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  IUserRepository,
  PaginatedResult,
  UserFilters,
  UserStats,
} from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserPrismaMapper } from './user.prisma.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return UserPrismaMapper.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return null;

    return UserPrismaMapper.toDomain(user);
  }

  async findAll(filters: UserFilters): Promise<PaginatedResult<UserEntity>> {
    const { page = 1, pageSize = 10, role, active, search } = filters;
    const skip = (page - 1) * pageSize;

    // Construir where clause dinámicamente
    const where: Record<string, unknown> = {};

    if (role) {
      where.role = role;
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
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(UserPrismaMapper.toDomain),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: user.id.getValue() },
    });

    let savedUser;

    if (existingUser) {
      // Update
      savedUser = await this.prisma.user.update({
        where: { id: user.id.getValue() },
        data: UserPrismaMapper.toUpdateData(user),
      });
    } else {
      // Create
      savedUser = await this.prisma.user.create({
        data: UserPrismaMapper.toCreateData(user),
      });
    }

    return UserPrismaMapper.toDomain(savedUser);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.toLowerCase() },
    });
    return count > 0;
  }

  async countByRole(role: string): Promise<number> {
    return this.prisma.user.count({
      where: { role, active: true },
    });
  }

  async countActive(): Promise<number> {
    return this.prisma.user.count({
      where: { active: true },
    });
  }

  async getStats(): Promise<UserStats> {
    const [total, activos, porRolData] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { active: true } }),
      this.prisma.user.groupBy({
        by: ['role'],
        _count: { id: true },
      }),
    ]);

    const porRol = porRolData.reduce(
      (acc, item) => {
        acc[item.role] = item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      activos,
      porRol,
    };
  }

  async findByRole(role: string): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(UserPrismaMapper.toDomain);
  }

  async countAdmins(): Promise<number> {
    return this.prisma.user.count({
      where: { role: 'admin', active: true },
    });
  }
}
