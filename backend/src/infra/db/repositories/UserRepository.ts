import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import type { User } from '@/domain/entities/User.js';
import type { IUserRepository } from '@/domain/repositories/IUserRepository.js';

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toSafeEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toSafeEntity(user) : null;
  }

  async create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: data.role,
        active: data.active ?? true,
        mfaEnabled: data.mfaEnabled ?? false,
        avatar: data.avatar,
        loginAttempts: 0,
        passwordHistory: data.passwordHistory ? JSON.stringify(data.passwordHistory) : '[]',
        lastPasswordChange: data.lastPasswordChange || new Date(),
        passwordExpiresAt: data.passwordExpiresAt || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
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
    if (data.mfaEnabled !== undefined) updateData.mfaEnabled = data.mfaEnabled;
    if (data.mfaSecret) updateData.mfaSecret = data.mfaSecret;

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    if (data.passwordHistory) {
      updateData.passwordHistory = JSON.stringify(data.passwordHistory);
    }

    if (data.lastPasswordChange) updateData.lastPasswordChange = data.lastPasswordChange;
    if (data.passwordExpiresAt) updateData.passwordExpiresAt = data.passwordExpiresAt;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return this.toSafeEntity(user);
  }

  async delete(id: string): Promise<boolean> {
    try {
      await prisma.user.delete({
        where: { id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async findAll(filters?: {
    role?: string;
    active?: boolean;
    limit?: number;
    skip?: number;
  }): Promise<{ users: User[]; total: number }> {
    const where: any = {};

    if (filters?.role) where.role = filters.role;
    if (filters?.active !== undefined) where.active = filters.active;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: filters?.limit || 50,
        skip: filters?.skip || 0,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => this.toSafeEntity(u)),
      total,
    };
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

  async resetFailedLogins(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: {
        loginAttempts: 0,
        lastFailedLogin: null,
      },
    });
  }

  async lockAccount(id: string, lockedUntil: Date): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        lockedUntil,
        loginAttempts: 0,
      },
    });

    return this.toSafeEntity(user);
  }

  async unlockAccount(id: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        active: true,
        loginAttempts: 0,
        lastFailedLogin: null,
      },
    });

    return this.toSafeEntity(user);
  }

  // M�todos adicionales requeridos por la interfaz
  async findByIdWithPassword(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? this.toSafeEntity(user) : null;
  }

  async updatePassword(id: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
        lastPasswordChange: new Date(),
        passwordExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    });

    return this.toSafeEntity(user);
  }

  async findByRole(role: string): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { role },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.toSafeEntity(u));
  }

  async findActive(): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.toSafeEntity(u));
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? this.toEntityWithPassword(user) : null;
  }

  async updateLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() },
    });
  }

  async updateProfile(id: string, data: { name?: string; mfaEnabled?: boolean; avatar?: string }): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data,
    });

    return this.toSafeEntity(user);
  }

  async changePassword(id: string, oldPassword: string, newPassword: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return false;

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) return false;

    await this.updatePassword(id, newPassword);
    return true;
  }

  async getUserStats(): Promise<{ total: number; active: number; inactive: number }> {
    const [total, active, inactive] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { active: true } }),
      prisma.user.count({ where: { active: false } }),
    ]);

    return { total, active, inactive };
  }

  // M�s m�todos requeridos por la interfaz
  async findInactive(): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { active: false },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.toSafeEntity(u));
  }

  async find(filters?: {
    role?: string;
    active?: boolean;
    search?: string;
    limit?: number;
    skip?: number;
  }): Promise<User[]> {
    const where: any = {};

    if (filters?.role) where.role = filters.role;
    if (filters?.active !== undefined) where.active = filters.active;
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search } },
        { name: { contains: filters.search } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      take: filters?.limit || 50,
      skip: filters?.skip || 0,
      orderBy: { createdAt: 'desc' },
    });

    return users.map((u) => this.toSafeEntity(u));
  }

  async count(filters?: {
    role?: string;
    active?: boolean;
    search?: string;
  }): Promise<number> {
    const where: any = {};

    if (filters?.role) where.role = filters.role;
    if (filters?.active !== undefined) where.active = filters.active;
    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search } },
        { name: { contains: filters.search } },
      ];
    }

    return await prisma.user.count({ where });
  }

  async getStats(): Promise<any> {
    return await this.getUserStats();
  }

  // M�todos faltantes
  async existsByEmail(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return !!user;
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
      },
    });

    return this.toSafeEntity(user);
  }

  private toSafeEntity(user: any): User {
    const { password, ...safeUser } = user;
    void password;

    return {
      ...safeUser,
      passwordHistory: typeof user.passwordHistory === 'string'
        ? JSON.parse(user.passwordHistory)
        : user.passwordHistory || [],
    };
  }

  private toEntityWithPassword(user: any): User {
    return {
      ...user,
      passwordHistory: typeof user.passwordHistory === 'string'
        ? JSON.parse(user.passwordHistory)
        : user.passwordHistory || [],
    };
  }
}

export const userRepository = new UserRepository();
