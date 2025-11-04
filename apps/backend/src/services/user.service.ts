/**
 * User Service (TypeScript - November 2025 - FIXED)
 * @description Servicio completo para gestión de usuarios CERMONT ATG
 */

import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/AppError.js';
import type { Types } from 'mongoose';

// ==================== INTERFACES ====================

interface CreateUserDto {
  nombre: string;
  apellido?: string;
  email: string;
  password: string;
  rol: 'root' | 'admin' | 'coordinator_hes' | 'engineer' | 'technician' | 'accountant' | 'client';
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
}

interface UpdateUserDto {
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: 'root' | 'admin' | 'coordinator_hes' | 'engineer' | 'technician' | 'accountant' | 'client';
  telefono?: string;
  cedula?: string;
  cargo?: string;
  especialidad?: string;
}

interface ListFilters {
  search?: string;
  rol?: string;
  isActive?: boolean;
  especialidad?: string;
}

interface ListOptions {
  page?: number;
  limit?: number;
  sort?: Record<string, 1 | -1>;
}

interface PaginatedResult<T> {
  docs: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

interface UserStats {
  total: number;
  activos: number;
  inactivos: number;
  porRol: Array<{ _id: string; count: number; activos: number }>;
  newThisMonth?: number;
}

// ==================== SERVICE CLASS ====================

class UserService {
  /**
   * Listar usuarios con filtros y paginación
   */
  async list(filters: ListFilters = {}, options: ListOptions = {}): Promise<PaginatedResult<any>> {
    try {
      const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
      const skip = (page - 1) * limit;

      const query: any = { isActive: true };

      if (filters.search) {
        query.$or = [
          { nombre: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
          { cedula: { $regex: filters.search, $options: 'i' } },
        ];
      }

      if (filters.rol) query.rol = filters.rol;
      if (filters.isActive !== undefined) query.isActive = filters.isActive;
      if (filters.especialidad) query.especialidad = { $regex: filters.especialidad, $options: 'i' };

      const [docs, total] = await Promise.all([
        User.find(query)
          .select('-password -refreshTokens')
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .lean(),
        User.countDocuments(query),
      ]);

      const pages = Math.ceil(total / limit);

      return {
        docs,
        pagination: {
          page,
          limit,
          total,
          pages,
          hasMore: page < pages,
        },
      };
    } catch (error) {
      logger.error('[UserService] Error listing users:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   */
  async getById(userId: string): Promise<any> {
    try {
      const user = await User.findById(userId)
        .select('-password -refreshTokens')
        .lean();

      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      return user;
    } catch (error) {
      logger.error(`[UserService] Error getting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener usuario por email (con password para auth)
   */
  async getByEmail(email: string): Promise<any> {
    try {
      const user = await User.findOne({ email: email.toLowerCase() })
        .select('+password +loginAttempts +lockUntil +tokenVersion');

      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      return user;
    } catch (error) {
      logger.error(`[UserService] Error getting user by email:`, error);
      throw error;
    }
  }

  /**
   * Crear nuevo usuario
   */
  async create(userData: CreateUserDto, creatorId?: string): Promise<any> {
    try {
      const validRoles = ['root', 'admin', 'coordinator_hes', 'engineer', 'technician', 'accountant', 'client'];
      
      if (!validRoles.includes(userData.rol)) {
        throw new AppError('Rol inválido', 400);
      }

      const existingEmail = await User.findOne({ email: userData.email.toLowerCase() });
      if (existingEmail) {
        throw new AppError('Email ya registrado', 409);
      }

      if (userData.cedula) {
        const existingCedula = await User.findOne({ cedula: userData.cedula });
        if (existingCedula) {
          throw new AppError('Cédula ya registrada', 409);
        }
      }

      const user = await User.create({
        ...userData,
        email: userData.email.toLowerCase(),
      });

      logger.info(`[UserService] User created: ${user.email}`);

      return user.toAuthJSON();
    } catch (error) {
      logger.error('[UserService] Error creating user:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   */
  async updateUser(userId: string, updateData: UpdateUserDto, updaterId?: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      if (updateData.rol) {
        const validRoles = ['root', 'admin', 'coordinator_hes', 'engineer', 'technician', 'accountant', 'client'];
        if (!validRoles.includes(updateData.rol)) {
          throw new AppError('Rol inválido', 400);
        }
      }

      if (updateData.email && updateData.email !== user.email) {
        const existingEmail = await User.findOne({ email: updateData.email.toLowerCase() });
        if (existingEmail) {
          throw new AppError('Email ya registrado', 409);
        }
      }

      if (updateData.cedula && updateData.cedula !== user.cedula) {
        const existingCedula = await User.findOne({ cedula: updateData.cedula });
        if (existingCedula) {
          throw new AppError('Cédula ya registrada', 409);
        }
      }

      Object.assign(user, updateData);
      await user.save();

      logger.info(`[UserService] User updated: ${userId}`);

      return user.toAuthJSON();
    } catch (error) {
      logger.error(`[UserService] Error updating user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar usuario (soft delete)
   */
  async deleteUser(userId: string, deleterId?: string): Promise<any> {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      if (user.rol === 'admin') {
        const adminCount = await User.countDocuments({ rol: 'admin', isActive: true });
        if (adminCount <= 1) {
          throw new AppError('No se puede eliminar el último admin', 400);
        }
      }

      if (deleterId && deleterId === userId && ['admin', 'root'].includes(user.rol)) {
        throw new AppError('No se puede auto-eliminar', 403);
      }

      user.isActive = false;
      await user.save();

      logger.info(`[UserService] User deactivated: ${userId}`);

      return user.toAuthJSON();
    } catch (error) {
      logger.error(`[UserService] Error deleting user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    changerId?: string
  ): Promise<boolean> {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw new AppError('Contraseña actual incorrecta', 401);
      }

      if (newPassword.length < 8) {
        throw new AppError('Contraseña debe tener al menos 8 caracteres', 400);
      }

      user.password = newPassword;
      await user.save();

      logger.info(`[UserService] Password changed for user: ${userId}`);

      return true;
    } catch (error) {
      logger.error(`[UserService] Error changing password for ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas
   */
  async getStats(filters: Partial<ListFilters> = {}): Promise<UserStats> {
    try {
      const baseMatch: any = { isActive: true };
      
      if (filters.rol) baseMatch.rol = filters.rol;
      if (filters.especialidad) baseMatch.especialidad = { $regex: filters.especialidad, $options: 'i' };

      const [porRol, total, activos, newThisMonth] = await Promise.all([
        User.aggregate([
          { $match: baseMatch },
          {
            $group: {
              _id: '$rol',
              count: { $sum: 1 },
              activos: { $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] } },
            },
          },
          { $sort: { count: -1 } },
        ]),
        User.countDocuments(baseMatch),
        User.countDocuments({ ...baseMatch, isActive: true }),
        User.countDocuments({
          ...baseMatch,
          createdAt: { $gte: this.getMonthStart() },
        }),
      ]);

      return {
        total,
        activos,
        inactivos: total - activos,
        porRol,
        newThisMonth,
      };
    } catch (error) {
      logger.error('[UserService] Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Helper: Inicio del mes actual
   */
  private getMonthStart(): Date {
    const date = new Date();
    date.setDate(1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}

// ==================== EXPORT ====================

export default new UserService();
export { UserService };
export type { 
  CreateUserDto, 
  UpdateUserDto, 
  ListFilters, 
  ListOptions, 
  UserStats,
  PaginatedResult
};



