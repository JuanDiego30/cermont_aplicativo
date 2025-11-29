import bcrypt from 'bcrypt';
import { prisma } from '../prisma.js';
import type { User, UserRole } from '../../../domain/entities/User.js';
import type { 
  IUserRepository, 
  UserFilters, 
  PaginationParams, 
  SortingParams 
} from '../../../domain/repositories/IUserRepository.js';

export class UserRepository implements IUserRepository {
  
  // --- Mappers ---

  private toSafeEntity(user: any): User {
    const { password, passwordHistory, mfaSecret, ...safeUser } = user;
    
    // Reconstruir estructura de dominio
    return {
      id: safeUser.id,
      email: safeUser.email,
      password: '', // No exponer password real en safe entity
      name: safeUser.name,
      role: safeUser.role as UserRole,
      active: safeUser.active,
      avatar: safeUser.avatar,
      mfaEnabled: safeUser.mfaEnabled ?? false,
      lastPasswordChange: safeUser.lastPasswordChange ?? new Date(),
      passwordExpiresAt: safeUser.passwordExpiresAt ?? new Date(),
      createdAt: safeUser.createdAt,
      updatedAt: safeUser.updatedAt,
      lastLogin: safeUser.lastLogin,
      loginAttempts: safeUser.loginAttempts,
      lockedUntil: safeUser.lockedUntil,
      
      // Agrupar seguridad
      security: {
        passwordHistory: typeof passwordHistory === 'string'
          ? JSON.parse(passwordHistory)
          : passwordHistory || [],
        mfaEnabled: safeUser.mfaEnabled,
        mfaSecret: mfaSecret,
        lastPasswordChange: safeUser.lastPasswordChange,
        passwordExpiresAt: safeUser.passwordExpiresAt
      }
    };
  }

  private toEntityWithPassword(user: any): User {
    const safeUser = this.toSafeEntity(user);
    // Re-inyectar password para uso interno (login)
    return {
      ...safeUser,
      password: user.password
    };
  }

  // --- Implementación ---

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id } });
    return user ? this.toSafeEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.toSafeEntity(user) : null;
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? this.toEntityWithPassword(user) : null;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    // Nota: Idealmente el hashing debe venir hecho del servicio
    const hashedPassword = await bcrypt.hash(data.password!, 10); 

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        active: data.active ?? true,
        mfaEnabled: data.security?.mfaEnabled ?? false,
        avatar: data.avatar,
        loginAttempts: 0,
        passwordHistory: data.security?.passwordHistory ? JSON.stringify(data.security.passwordHistory) : '[]',
        mfaSecret: data.security?.mfaSecret,
        lastPasswordChange: data.security?.lastPasswordChange || new Date(),
        passwordExpiresAt: data.security?.passwordExpiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    return this.toSafeEntity(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData: any = {};

    if (data.email) updateData.email = data.email;
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.active !== undefined) updateData.active = data.active;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    
    // Flatten security object updates
    if (data.security) {
      if (data.security.mfaEnabled !== undefined) updateData.mfaEnabled = data.security.mfaEnabled;
      if (data.security.mfaSecret) updateData.mfaSecret = data.security.mfaSecret;
      if (data.security.lastPasswordChange) updateData.lastPasswordChange = data.security.lastPasswordChange;
      if (data.security.passwordExpiresAt) updateData.passwordExpiresAt = data.security.passwordExpiresAt;
      if (data.security.passwordHistory) updateData.passwordHistory = JSON.stringify(data.security.passwordHistory);
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.toSafeEntity(user);
  }

  async delete(id: string): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }

  async findAll(
    filters: UserFilters,
    pagination?: PaginationParams,
    sorting?: SortingParams
  ): Promise<User[]> {
    const where: any = {};

    if (filters.role) where.role = filters.role;
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.email) where.email = filters.email;
    
    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search } }, // mode insensitive en Postgres
        { name: { contains: filters.search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      take: pagination?.limit,
      skip: pagination?.skip,
      orderBy: sorting
        ? { [sorting.field]: sorting.order }
        : { createdAt: 'desc' },
    });

    return users.map(u => this.toSafeEntity(u));
  }

  async count(filters: UserFilters): Promise<number> {
    const where: any = {};
    if (filters.role) where.role = filters.role;
    if (filters.active !== undefined) where.active = filters.active;
    if (filters.email) where.email = filters.email;
    if (filters.search) {
        where.OR = [
          { email: { contains: filters.search } },
          { name: { contains: filters.search } },
        ];
    }
    return prisma.user.count({ where });
  }

  async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async incrementFailedLogins(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        loginAttempts: { increment: 1 },
        lastFailedLogin: new Date(),
      },
    });
  }

  async recordFailedLogin(id: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        loginAttempts: { increment: 1 },
        lastFailedLogin: new Date(),
      },
    });
    return this.toSafeEntity(user);
  }

  async resetLoginAttempts(id: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        loginAttempts: 0,
        lastFailedLogin: null,
        lockedUntil: null // Desbloqueo implícito
      },
    });
    return this.toSafeEntity(user);
  }

  async recordSuccessfulLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        lastLogin: new Date(),
        loginAttempts: 0,
        lastFailedLogin: null,
      },
    });
  }

  // --- Legacy / Compatibilidad ---

  async deactivate(id: string): Promise<User> {
    return this.update(id, { active: false });
  }

  async activate(id: string): Promise<User> {
    return this.update(id, { active: true });
  }

  async emailExists(email: string, excludeId?: string): Promise<boolean> {
    const where: any = { email };
    if (excludeId) where.id = { not: excludeId };
    const count = await prisma.user.count({ where });
    return count > 0;
  }

  async updateLoginAttempts(id: string, attempts: number, lockedUntil?: Date | null): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        loginAttempts: attempts,
        lockedUntil: lockedUntil ?? null,
        lastFailedLogin: attempts > 0 ? new Date() : null,
      },
    });
  }
}

export const userRepository = new UserRepository();
