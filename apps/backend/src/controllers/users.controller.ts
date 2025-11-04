/**
 * Users Controller (TypeScript - November 2025 - Clean & Fixed)
 * @description Gestión completa de usuarios CERMONT ATG
 */

import { Request, Response } from 'express';
import User from '../models/User.js';
import { successResponse, errorResponse, createdResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { ROLES } from '../utils/constants.js';
import { z } from 'zod';
import { createAuditLog } from '../middleware/auditLogger.js';
import type { AuditLogData } from '../types/index.js';

// ==================== HELPERS ====================

const getClientIP = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || 'unknown';
};

const createCompleteAuditLog = async (req: Request, data: Partial<AuditLogData>): Promise<void> => {
  await createAuditLog({
    ...data,
    ipAddress: getClientIP(req),
    userAgent: req.get('User-Agent') || 'unknown',
    method: req.method,
    endpoint: req.originalUrl || req.url,
  } as AuditLogData);
};

const requireAdmin = (req: Request): void => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    throw new Error('Acceso denegado: Se requiere rol admin');
  }
};

const requireSupervisorOrHigher = (req: Request): void => {
  const user = (req as any).user;
  const allowed = ['root', 'admin', 'coordinator_hes'];
  if (!user || !allowed.includes(user.role)) {
    throw new Error('Acceso denegado: Se requiere rol supervisor o superior');
  }
};

const requireAuthenticated = (req: Request): void => {
  const user = (req as any).user;
  if (!user || !user.userId) {
    throw new Error('No autenticado');
  }
};

const validateObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

// ==================== ZOD SCHEMAS ====================

const ROLE_VALUES = ['root', 'admin', 'coordinator_hes', 'engineer', 'technician', 'accountant', 'client'] as const;

const UserListQuerySchema = z.object({
  cursor: z.string().optional(),
  page: z.string().default('1').transform(val => Math.max(1, parseInt(val, 10))),
  limit: z.string().default('20').transform(val => Math.min(100, Math.max(1, parseInt(val, 10)))),
  rol: z.enum(ROLE_VALUES).optional(),
  activo: z.string().transform(val => val === 'true' ? true : val === 'false' ? false : undefined).optional(),
  search: z.string().min(2).max(100).optional(),
});

const CreateUserSchema = z.object({
  nombre: z.string().min(3).max(100),
  email: z.string().email().max(100),
  password: z.string().min(8),
  rol: z.enum(ROLE_VALUES),
  cedula: z.string().regex(/^\d{7,10}$/).optional(),
  telefono: z.string().regex(/^[\d\s\-()]{10,15}$/).optional(),
  cargo: z.string().max(100).optional(),
  especialidad: z.string().max(100).optional(),
});

const UpdateUserSchema = z.object({
  nombre: z.string().min(3).max(100).optional(),
  email: z.string().email().max(100).optional(),
  cedula: z.string().regex(/^\d{7,10}$/).optional(),
  telefono: z.string().regex(/^[\d\s\-()]{10,15}$/).optional(),
  cargo: z.string().max(100).optional(),
  especialidad: z.string().max(100).optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Al menos un campo requerido' });

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8).optional(),
  newPassword: z.string().min(8),
});

const SearchUsersSchema = z.object({
  q: z.string().min(2).max(100),
  limit: z.string().default('10').transform(val => Math.min(50, Math.max(1, parseInt(val, 10)))),
});

// ==================== CONTROLLERS ====================

export const getAllUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireSupervisorOrHigher(req);

  const query = UserListQuerySchema.parse(req.query);

  const filters: any = { isActive: true };

  if (query.rol) filters.rol = query.rol;
  if (query.activo !== undefined) filters.isActive = query.activo;
  if (query.search) {
    filters.$or = [
      { nombre: { $regex: query.search, $options: 'i' } },
      { email: { $regex: query.search, $options: 'i' } },
      { cedula: { $regex: query.search, $options: 'i' } },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [users, total] = await Promise.all([
    User.find(filters)
      .select('-password -refreshTokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    User.countDocuments(filters),
  ]);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET_USERS',
    resource: 'User',
    details: { page: query.page, limit: query.limit },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, users, 'Usuarios obtenidos exitosamente', HTTP_STATUS.OK, {
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      pages: Math.ceil(total / query.limit),
    },
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAuthenticated(req);

  const { id } = req.params;

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const user = await User.findOne({ _id: id, isActive: true })
    .select('-password -refreshTokens')
    .lean();

  if (!user) {
    errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET',
    resource: 'User',
    resourceId: id,
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, user, 'Usuario obtenido exitosamente', HTTP_STATUS.OK);
});

export const createUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAdmin(req);

  const data = CreateUserSchema.parse(req.body);

  const existingUser = await User.findOne({ 
    email: { $regex: new RegExp(`^${data.email}$`, 'i') } 
  });

  if (existingUser) {
    errorResponse(res, 'Email ya existe', HTTP_STATUS.CONFLICT);
    return;
  }

  const user = await User.create({
    ...data,
    createdBy: (req as any).user.userId,
  });

  logger.info(`Usuario creado: ${user.email}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'CREATE',
    resource: 'User',
    resourceId: user._id.toString(),
    details: { email: data.email, rol: data.rol },
    status: 'SUCCESS',
    severity: 'MEDIUM',
  });

  createdResponse(res, user.toAuthJSON(), 'Usuario creado exitosamente');
});

export const updateUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const updates = UpdateUserSchema.parse(req.body);

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const authUser = (req as any).user;
  if (authUser.role !== 'admin' && authUser.userId !== id) {
    errorResponse(res, 'Sin permisos', HTTP_STATUS.FORBIDDEN);
    return;
  }

  const user = await User.findOne({ _id: id, isActive: true });

  if (!user) {
    errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  if (updates.email && updates.email.toLowerCase() !== user.email.toLowerCase()) {
    const existing = await User.findOne({ 
      email: { $regex: new RegExp(`^${updates.email}$`, 'i') } 
    });
    if (existing) {
      errorResponse(res, 'Email ya existe', HTTP_STATUS.CONFLICT);
      return;
    }
  }

  Object.assign(user, updates);
  await user.save();

  logger.info(`Usuario actualizado: ${user.email}`);

  await createCompleteAuditLog(req, {
    userId: authUser.userId,
    action: 'UPDATE',
    resource: 'User',
    resourceId: id,
    details: { changes: Object.keys(updates) },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, user.toAuthJSON(), 'Usuario actualizado exitosamente', HTTP_STATUS.OK);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAdmin(req);

  const { id } = req.params;

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const user = await User.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true }
  ).lean();

  if (!user) {
    errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  logger.info(`Usuario eliminado: ${user.email}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'DELETE',
    resource: 'User',
    resourceId: id,
    details: { email: user.email },
    status: 'SUCCESS',
    severity: 'HIGH',
  });

  successResponse(res, null, 'Usuario eliminado exitosamente', HTTP_STATUS.OK);
});

export const toggleUserActive = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAdmin(req);

  const { id } = req.params;

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const user = await User.findById(id);

  if (!user) {
    errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  user.isActive = !user.isActive;
  await user.save();

  const action = user.isActive ? 'activado' : 'desactivado';
  logger.info(`Usuario ${action}: ${user.email}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'UPDATE',
    resource: 'User',
    resourceId: id,
    details: { newState: user.isActive },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, user.toAuthJSON(), `Usuario ${action} exitosamente`, HTTP_STATUS.OK);
});

export const changeUserPassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { currentPassword, newPassword } = ChangePasswordSchema.parse(req.body);

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const authUser = (req as any).user;
  if (authUser.role !== 'admin' && authUser.userId !== id) {
    errorResponse(res, 'Sin permisos', HTTP_STATUS.FORBIDDEN);
    return;
  }

  const user = await User.findById(id).select('+password');

  if (!user || !user.isActive) {
    errorResponse(res, 'Usuario no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  if (authUser.role !== 'admin') {
    if (!currentPassword) {
      errorResponse(res, 'Contraseña actual requerida', HTTP_STATUS.BAD_REQUEST);
      return;
    }
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      errorResponse(res, 'Contraseña actual incorrecta', HTTP_STATUS.BAD_REQUEST);
      return;
    }
  }

  user.password = newPassword;
  await user.save();

  logger.info(`Contraseña cambiada: ${user.email}`);

  await createCompleteAuditLog(req, {
    userId: authUser.userId,
    action: 'PASSWORD_CHANGE',
    resource: 'User',
    resourceId: id,
    details: { email: user.email },
    status: 'SUCCESS',
    severity: 'MEDIUM',
  });

  successResponse(res, null, 'Contraseña cambiada exitosamente', HTTP_STATUS.OK);
});

export const getUsersByRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireSupervisorOrHigher(req);

  const { role } = req.params;
  const activo = req.query.activo === 'true';

  const validRoles = ['root', 'admin', 'coordinator_hes', 'engineer', 'technician', 'accountant', 'client'];
  
  if (!validRoles.includes(role)) {
    errorResponse(res, `Rol inválido. Válidos: ${validRoles.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const users = await User.find({ rol: role, isActive: activo })
    .select('-password -refreshTokens')
    .sort({ nombre: 1 })
    .limit(1000)
    .lean();

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET_BY_ROLE',
    resource: 'User',
    details: { role, activo },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, { users, count: users.length }, `Usuarios con rol ${role}`, HTTP_STATUS.OK);
});

export const getUserStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAdmin(req);

  const [stats, porRol] = await Promise.all([
    User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
        },
      },
    ]),
    User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$rol',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
  ]);

  const result = {
    total: stats[0]?.total || 0,
    porRol: Object.fromEntries(porRol.map((item: any) => [item._id, item.count])),
  };

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET_STATS',
    resource: 'User',
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, result, 'Estadísticas obtenidas', HTTP_STATUS.OK);
});

export const searchUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireAuthenticated(req);

  const { q, limit } = SearchUsersSchema.parse(req.query);

  const users = await User.find({
    $or: [
      { nombre: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { cedula: { $regex: q, $options: 'i' } },
    ],
    isActive: true,
  })
    .select('-password -refreshTokens')
    .limit(limit)
    .sort({ nombre: 1 })
    .lean();

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'SEARCH',
    resource: 'User',
    details: { q, limit },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, users, 'Búsqueda completada', HTTP_STATUS.OK);
});
