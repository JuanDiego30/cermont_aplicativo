/**
 * ToolKits Controller (TypeScript - November 2025 - FIXED)
 * @description Gestión completa de kits de herramientas CERMONT ATG
 */

import { Request, Response } from 'express';
import ToolKit from '../models/ToolKit.js';
import { successResponse, errorResponse, createdResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import type { AuditLogData } from '../types/index.js';

// ==================== HELPERS ====================

const getClientIP = (req: Request): string => {
  return req.ip || req.socket.remoteAddress || 'unknown';
};

const createCompleteAuditLog = async (req: Request, data: Partial<AuditLogData>): Promise<void> => {
  const auditLog = await import('../middleware/auditLogger.js');
  await auditLog.createAuditLog({
    ...data,
    ipAddress: getClientIP(req),
    userAgent: req.get('User-Agent') || 'unknown',
    method: req.method,
    endpoint: req.originalUrl || req.url,
  } as AuditLogData);
};

const requireSupervisorOrHigher = (req: Request): void => {
  const user = (req as any).user;
  const allowed = ['root', 'admin', 'coordinator_hes', 'engineer'];
  if (!user || !allowed.includes(user.role)) {
    throw new Error('Acceso denegado: Se requiere rol supervisor o superior');
  }
};

const validateObjectId = (id: string): boolean => /^[0-9a-fA-F]{24}$/.test(id);

// ==================== CONSTANTS ====================

const TOOLKIT_CATEGORIES = ['electrico', 'telecomunicaciones', 'CCTV', 'instrumentacion', 'general'] as const;
type ToolKitCategory = typeof TOOLKIT_CATEGORIES[number];

// ==================== ZOD SCHEMAS ====================

const ToolKitListQuerySchema = z.object({
  page: z.string().default('1').transform((val) => Math.max(1, parseInt(val, 10))),
  limit: z.string().default('10').transform((val) => Math.min(50, Math.max(1, parseInt(val, 10)))),
  categoria: z.enum(TOOLKIT_CATEGORIES).optional(),
  search: z.string().max(100).optional(),
});

const CreateToolKitSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().min(10).max(500).optional(),
  categoria: z.enum(TOOLKIT_CATEGORIES),
  herramientas: z.array(z.object({
    nombre: z.string().min(1).max(100),
    cantidad: z.number().min(1).max(100),
    unidad: z.string().max(20).optional(),
  })).default([]),
  equipos: z.array(z.object({
    nombre: z.string().min(1).max(100),
    cantidad: z.number().min(1),
    observaciones: z.string().max(200).optional(),
  })).default([]),
  elementosSeguridad: z.array(z.object({
    nombre: z.string().min(1).max(100),
    cantidad: z.number().min(1),
  })).default([]),
});

const UpdateToolKitSchema = CreateToolKitSchema.partial();

const CloneToolKitSchema = z.object({
  nombre: z.string().min(1).max(100),
});

const MostUsedQuerySchema = z.object({
  limit: z.string().default('10').transform((val) => Math.min(20, Math.max(1, parseInt(val, 10)))),
});

// ==================== CONTROLLERS ====================

export const getAllToolKits = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireSupervisorOrHigher(req);

  const query = ToolKitListQuerySchema.parse(req.query);

  const filter: any = { isActive: true };

  if (query.categoria) filter.categoria = query.categoria;
  if (query.search) {
    const searchRegex = { $regex: query.search, $options: 'i' };
    filter.$or = [
      { nombre: searchRegex },
      { descripcion: searchRegex },
    ];
  }

  const skip = (query.page - 1) * query.limit;

  const [toolkits, total] = await Promise.all([
    ToolKit.find(filter)
      .populate('creadoPor', 'nombre email')
      .sort({ vecesUtilizado: -1, nombre: 1 })
      .skip(skip)
      .limit(query.limit)
      .lean(),
    ToolKit.countDocuments(filter),
  ]);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET_TOOLKITS',
    resource: 'ToolKit',
    details: { page: query.page, limit: query.limit, categoria: query.categoria },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  const pages = Math.ceil(total / query.limit);

  successResponse(res, toolkits, 'Kits obtenidos exitosamente', HTTP_STATUS.OK, {
    pagination: { page: query.page, limit: query.limit, total, pages, hasMore: query.page < pages },
  });
});

export const getToolKitById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID de kit inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const toolkit = await ToolKit.findOne({ _id: id, isActive: true })
    .populate('creadoPor', 'nombre email cargo')
    .lean();

  if (!toolkit) {
    errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET_TOOLKIT',
    resource: 'ToolKit',
    resourceId: id,
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, toolkit, 'Kit obtenido exitosamente', HTTP_STATUS.OK);
});

export const getToolKitsByCategory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { categoria } = req.params;

  if (!TOOLKIT_CATEGORIES.includes(categoria as ToolKitCategory)) {
    errorResponse(res, `Categoría inválida. Válidas: ${TOOLKIT_CATEGORIES.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const toolkits = await ToolKit.find({ categoria, isActive: true })
    .populate('creadoPor', 'nombre email')
    .sort({ vecesUtilizado: -1 })
    .lean();

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET_TOOLKITS_BY_CATEGORY',
    resource: 'ToolKit',
    details: { categoria },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, { toolkits, count: toolkits.length }, `Kits de ${categoria} obtenidos`, HTTP_STATUS.OK);
});

export const createToolKit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireSupervisorOrHigher(req);

  const data = CreateToolKitSchema.parse(req.body);
  const toolkitData = {
    ...data,
    creadoPor: (req as any).user.userId,
  };

  const existingToolkit = await ToolKit.findOne({ nombre: { $regex: new RegExp(`^${toolkitData.nombre}$`, 'i') } });
  if (existingToolkit) {
    errorResponse(res, 'Ya existe un kit con ese nombre', HTTP_STATUS.CONFLICT);
    return;
  }

  const toolkit = await ToolKit.create(toolkitData);

  logger.info(`ToolKit created: ${toolkit.nombre}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'CREATE',
    resource: 'ToolKit',
    resourceId: toolkit._id.toString(),
    details: { nombre: toolkitData.nombre, categoria: toolkitData.categoria },
    status: 'SUCCESS',
    severity: 'MEDIUM',
  });

  createdResponse(res, toolkit, 'Kit creado exitosamente');
});

export const updateToolKit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireSupervisorOrHigher(req);

  const { id } = req.params;
  const updates = UpdateToolKitSchema.parse(req.body);

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const toolkit = await ToolKit.findOne({ _id: id, isActive: true });

  if (!toolkit) {
    errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  if (updates.nombre && updates.nombre.toLowerCase() !== toolkit.nombre.toLowerCase()) {
    const existingToolkit = await ToolKit.findOne({ nombre: { $regex: new RegExp(`^${updates.nombre}$`, 'i') } });
    if (existingToolkit) {
      errorResponse(res, 'Ya existe un kit con ese nombre', HTTP_STATUS.CONFLICT);
      return;
    }
  }

  Object.assign(toolkit, updates);
  await toolkit.save();

  logger.info(`ToolKit updated: ${toolkit.nombre}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'UPDATE',
    resource: 'ToolKit',
    resourceId: id,
    details: { changes: Object.keys(updates), nombre: toolkit.nombre },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  await toolkit.populate('creadoPor', 'nombre email');

  successResponse(res, toolkit.toJSON(), 'Kit actualizado exitosamente', HTTP_STATUS.OK);
});

export const deleteToolKit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const toolkit = await ToolKit.findOneAndUpdate(
    { _id: id, isActive: true },
    { isActive: false },
    { new: true }
  ).lean();

  if (!toolkit) {
    errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  logger.info(`ToolKit deleted: ${toolkit.nombre}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'DELETE',
    resource: 'ToolKit',
    resourceId: id,
    details: { nombre: toolkit.nombre },
    status: 'SUCCESS',
    severity: 'HIGH',
  });

  successResponse(res, null, 'Kit eliminado exitosamente', HTTP_STATUS.OK);
});

export const incrementToolKitUsage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const toolkitUsed = await ToolKit.findOneAndUpdate(
    { _id: id, isActive: true },
    { $inc: { vecesUtilizado: 1 } },
    { new: true, lean: true }
  );

  if (!toolkitUsed) {
    errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  logger.info(`ToolKit used: ${toolkitUsed.nombre}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'USE_TOOLKIT',
    resource: 'ToolKit',
    resourceId: id,
    details: { nombre: toolkitUsed.nombre },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, toolkitUsed, 'Uso registrado exitosamente', HTTP_STATUS.OK);
});

export const getMostUsedToolKits = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireSupervisorOrHigher(req);

  const { limit } = MostUsedQuerySchema.parse({ limit: (req.query.limit as string) || '10' });

  const toolkits = await ToolKit.find({ isActive: true })
    .sort({ vecesUtilizado: -1 })
    .limit(limit)
    .populate('creadoPor', 'nombre email')
    .lean();

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET_MOST_USED_TOOLKITS',
    resource: 'ToolKit',
    details: { limit },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, toolkits, 'Kits más utilizados obtenidos', HTTP_STATUS.OK);
});

export const cloneToolKit = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireSupervisorOrHigher(req);

  const { id } = req.params;
  const { nombre } = CloneToolKitSchema.parse(req.body);

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const originalToolkit = await ToolKit.findOne({ _id: id, isActive: true }).lean();
  if (!originalToolkit) {
    errorResponse(res, 'Kit original no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  const existingToolkit = await ToolKit.findOne({ nombre: { $regex: new RegExp(`^${nombre}$`, 'i') } });
  if (existingToolkit) {
    errorResponse(res, 'Ya existe un kit con ese nombre', HTTP_STATUS.CONFLICT);
    return;
  }

  const clonedData = {
    nombre,
    descripcion: `Clon de: ${originalToolkit.nombre}`,
    categoria: originalToolkit.categoria,
    herramientas: originalToolkit.herramientas || [],
    equipos: originalToolkit.equipos || [],
    elementosSeguridad: originalToolkit.elementosSeguridad || [],
    creadoPor: (req as any).user.userId,
    vecesUtilizado: 0,
    isActive: true,
  };

  const clonedToolkit = await ToolKit.create(clonedData);

  logger.info(`ToolKit cloned: ${originalToolkit.nombre} -> ${nombre}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'CLONE',
    resource: 'ToolKit',
    resourceId: clonedToolkit._id.toString(),
    details: { originalId: id, nombre },
    status: 'SUCCESS',
    severity: 'MEDIUM',
  });

  createdResponse(res, clonedToolkit, 'Kit clonado exitosamente');
});

export const toggleToolKitActive = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!validateObjectId(id)) {
    errorResponse(res, 'ID inválido', HTTP_STATUS.BAD_REQUEST);
    return;
  }

  const toolkitToToggle = await ToolKit.findById(id);
  if (!toolkitToToggle) {
    errorResponse(res, 'Kit no encontrado', HTTP_STATUS.NOT_FOUND);
    return;
  }

  toolkitToToggle.isActive = !toolkitToToggle.isActive;
  await toolkitToToggle.save();

  logger.info(`ToolKit ${toolkitToToggle.isActive ? 'activated' : 'deactivated'}: ${toolkitToToggle.nombre}`);

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: `TOGGLE_${toolkitToToggle.isActive ? 'ACTIVATE' : 'DEACTIVATE'}`,
    resource: 'ToolKit',
    resourceId: id,
    details: { nombre: toolkitToToggle.nombre, newState: toolkitToToggle.isActive },
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, toolkitToToggle, `Kit ${toolkitToToggle.isActive ? 'activado' : 'desactivado'}`, HTTP_STATUS.OK);
});

export const getToolKitStats = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  requireSupervisorOrHigher(req);

  const stats = await ToolKit.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$categoria',
        count: { $sum: 1 },
        totalUsage: { $sum: '$vecesUtilizado' },
        avgUsage: { $avg: '$vecesUtilizado' },
      },
    },
    { $sort: { totalUsage: -1 } },
  ]);

  const totalToolkits = await ToolKit.countDocuments({ isActive: true });
  const totalUsageAgg = await ToolKit.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: '$vecesUtilizado' } } },
  ]);
  const totalUsage = totalUsageAgg[0]?.total || 0;

  await createCompleteAuditLog(req, {
    userId: (req as any).user.userId,
    action: 'GET_TOOLKIT_STATS',
    resource: 'ToolKit',
    status: 'SUCCESS',
    severity: 'LOW',
  });

  successResponse(res, { stats, summary: { totalToolkits, totalUsage } }, 'Estadísticas obtenidas', HTTP_STATUS.OK);
});
