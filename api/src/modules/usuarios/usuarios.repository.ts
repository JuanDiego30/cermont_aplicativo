import { User, Prisma } from '@prisma/client';
import { prisma } from '../../config/database.js';
import type { UserFiltersDTO, CreateUserDTO, UpdateUserDTO } from './usuarios.types.js';

export interface PaginatedUsers {
  data: Omit<User, 'password'>[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class UsuariosRepository {
  /**
   * Buscar usuario por ID (sin password)
   */
  async findById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  /**
   * Listar usuarios con filtros y paginación
   */
  async findMany(filters: UserFiltersDTO): Promise<PaginatedUsers> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filters.role) {
      where.role = filters.role as User['role'];
    }

    if (filters.active !== undefined) {
      where.active = filters.active === 'true';
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          googleId: true,
          name: true,
          role: true,
          phone: true,
          avatar: true,
          active: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Crear nuevo usuario
   */
  async create(data: CreateUserDTO & { password: string }): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role || 'tecnico',
        phone: data.phone,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Actualizar usuario
   */
  async update(id: string, data: UpdateUserDTO): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Eliminar usuario (soft delete - desactivar)
   */
  async softDelete(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { active: false },
    });
  }

  /**
   * Eliminar usuario permanentemente
   */
  async hardDelete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  /**
   * Verificar si email existe
   */
  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const user = await prisma.user.findFirst({
      where: {
        email,
        ...(excludeId && { id: { not: excludeId } }),
      },
    });
    return !!user;
  }

  /**
   * Obtener conteo por rol
   */
  async getCountByRole(): Promise<Record<string, number>> {
    const result = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
      where: { active: true },
    });

    return result.reduce(
      (acc: Record<string, number>, item: { role: string; _count: number }) => ({ ...acc, [item.role]: item._count }),
      {} as Record<string, number>
    );
  }
}

// Export singleton instance
export const usuariosRepository = new UsuariosRepository();
