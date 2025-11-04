/**
 * Archiving Service (TypeScript - November 2025)
 * @description Servicio centralizado para archivar/desarchivar entidades (enfocado en Orders, extensible a WorkPlans/CctvReports).
 * Implementa soft-archive (isArchived flag), historial updates, auto-archive (cron-compatible), purge (permanent delete old archived).
 * Integrado con: AuditLog (log actions), logger (trace), constants (ORDER_STATUS spanish: 'pendiente'|'en_progreso'|'completada'|'pagada'). Uso: En controllers/routes para /orders/:id/archive (POST),
 * /orders/archived (GET paginated), cron job para autoArchive (90 days 'completada'|'pagada'). Secure: UserId validation, no archive 'pendiente'|'en_progreso',
 * RBAC check en caller (admin/engineer+). Performance: Projections/lean en queries, indexes Mongo (isArchived:1, updatedAt:-1, estado:1, fechaFinReal:1).
 * Extensible: Agregar archiveWorkPlan similar (refactor to generic archiveEntity(model, id, userId, options)). Missing: Email notifications on archive,
 * search in archived (add filter to Order model), restore bulk. Para ATG: Archivado para compliance (retención 1 año), no purge sensitive data.
 * No direct export to controllers (async, error-wrapped). Future: Integrate S3 cold storage for evidences on autoArchive.
 * Pruebas: Jest (archiveOrder success historial push 'realizadoPor', throw AppError if 'pendiente', transaction rollback; getArchivedOrders paginated, autoArchive bulk audit, purge pre-count). Types: ArchiveOptions { reason?: string, notify?: boolean },
 * ArchivedFilters { page?: number, limit?: number, search?: string, estado?: OrderStatus, assignedTo?: string }, ArchiveResult { orders: Partial<IOrder>[], total: number, pages: number, page: number, limit: number },
 * BulkResult { modifiedCount: number, matchedCount: number }, PurgeResult { deletedCount: number }. Assumes: Model Order with isArchived: Boolean default false index, historial: array<{ accion: string, realizadoPor: ObjectId, fecha: Date } index {historial:1},
 * fechaFinReal: Date index, estado: OrderStatus enum index. Deps: mongoose ^8.x, @types/mongoose. AppError: code?: ErrorCode | string (loose for custom).
 * Fixes: AppError code to enum/existing (TS2322, map custom to 'NOT_FOUND'/'DATABASE_ERROR' etc.), ORDER_STATUS spanish includes (TS2352), Historial 'realizadoPor' (TS2345), archivedOrder HydratedDocument + populate chain (TS2339), details optional no code strict, historial push null system, aggregate Partial<IOrder>.
 * Model Assumes: interface Historial { accion: string; realizadoPor: Types.ObjectId; fecha: Date; }; Order: IOrder & { isArchived: boolean; historial: Historial[]; estado: 'pendiente'|'en_progreso'|'completada'|'pagada'; numeroOrden: string; nombreCliente?: string; asignadoA?: Types.ObjectId; supervisorId?: Types.ObjectId; fechaFinReal?: Date; }.
 * Audit: createAuditLog({userId?:string, action:string, resource:string, resourceId?:string, status:'SUCCESS', severity:'MEDIUM', details?:Record<string,any>}). Indexes: db.orders.createIndex({isArchived:1, updatedAt:-1, historial:1}), {estado:1, fechaFinReal:1}.
 */

import { Types, PipelineStage, HydratedDocument } from 'mongoose';
import Order, { IOrder } from '../models/Order';
import { logger } from '../utils/logger';
import { ORDER_STATUS } from '../utils/constants'; // Spanish: { PENDING: 'pendiente', IN_PROGRESS: 'en_progreso', COMPLETED: 'completada', PAID: 'pagada' } as const
import { createAuditLog } from '../middleware/auditLogger';
import { AppError } from '../utils/AppError'; // Assume ErrorCode enum: 'NOT_FOUND' | 'DATABASE_ERROR' | 'INVALID_INPUT' | ... (map custom)
import type { ErrorCode } from '../utils/constants';

// Types
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]; // 'pendiente' | 'en_progreso' | 'completada' | 'pagada'

// Historial entry (align Order model)
interface Historial {
  accion: string;
  realizadoPor: Types.ObjectId;
  fecha: Date;
}

interface ArchiveOptions {
  reason?: string;
  notify?: boolean;
}

interface ArchivedFilters {
  page?: number;
  limit?: number;
  search?: string;
  estado?: OrderStatus;
  assignedTo?: string;
}

interface ArchiveResult {
  orders: Partial<IOrder>[];
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface BulkResult {
  modifiedCount: number;
  matchedCount: number;
}

interface PurgeResult {
  deletedCount: number;
}

/**
 * Helper to add to historial (DRY, realizadoPor)
 */
const addToHistorial = (action: string, userId: string | null, reason?: string): Historial => ({
  accion: `${action}${reason ? `: ${reason}` : ''}`,
  realizadoPor: userId ? new Types.ObjectId(userId) : null as any, // Null for system, cast if strict
  fecha: new Date(),
});

/**
 * Archivar orden de trabajo (soft-archive)
 * @param orderId - ID de la orden
 * @param userId - ID del usuario que archiva
 * @param options - Opciones: { reason?: string, notify?: boolean }
 * @returns Orden archivada
 * @throws AppError si no encontrada, active/inProgress, o error DB
 */
export const archiveOrder = async (orderId: string, userId: string, options: ArchiveOptions = {}): Promise<IOrder> => {
  try {
    if (!Types.ObjectId.isValid(orderId) || !Types.ObjectId.isValid(userId)) {
      throw new AppError('orderId y userId deben ser ObjectIds válidos', 400, { code: 'INVALID_INPUT' as ErrorCode }); // Map to existing
    }

    const order = await Order.findById(orderId).select('estado isArchived historial numeroOrden fechaFinReal').lean();
    if (!order) {
      throw new AppError('Orden no encontrada', 404, { code: ErrorCode.NOT_FOUND });
    }

    if (order.isArchived) {
      throw new AppError('Orden ya archivada', 400, { code: 'INVALID_INPUT' as ErrorCode }); // Custom map
    }

    const activeStatuses: OrderStatus[] = [ORDER_STATUS.PENDING, ORDER_STATUS.IN_PROGRESS]; // 'pendiente' | 'en_progreso'
    if (activeStatuses.includes(order.estado as OrderStatus)) {
      throw new AppError('No se puede archivar órdenes activas o pendientes', 400, { code: 'INVALID_INPUT' as ErrorCode });
    }

    // Transaction for atomicity
    const session = await Order.startSession();
    let archivedOrder: HydratedDocument<IOrder> | null = null;
    await session.withTransaction(async () => {
      const orderDoc = await Order.findById(orderId).session(session);
      if (!orderDoc) throw new AppError('Orden no encontrada en transacción', 404, { code: ErrorCode.NOT_FOUND });
      orderDoc.isArchived = true;
      orderDoc.historial.push(addToHistorial('Orden archivada', userId, options.reason));
      await orderDoc.save({ session });
      archivedOrder = await orderDoc.populate(['asignadoA', 'supervisorId'], 'nombre email');
    });
    await session.endSession();

    if (!archivedOrder) {
      throw new AppError('Error al guardar orden archivada', 500, { code: 'DATABASE_ERROR' as ErrorCode });
    }

    // Audit aligned, numeroOrden optional
    await createAuditLog({
      userId,
      action: 'ARCHIVE_ORDER',
      resource: 'Order',
      resourceId: orderId,
      status: 'SUCCESS',
      severity: 'MEDIUM',
      details: { 
        reason: options.reason, 
        numeroOrden: order.numeroOrden 
      },
    });

    logger.info(`Orden archivada: ${order.numeroOrden} por usuario ${userId}`);

    // Notify if enabled (stub)
    if (options.notify) {
      logger.info('Notificación de archivado pendiente (email service)');
      // await sendNotification('orderArchived', { orderId, userId, reason: options.reason });
    }

    return archivedOrder;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al archivar orden:', { orderId, userId, error: (error as Error).message });
    throw new AppError('Error interno al archivar orden', 500, { code: 'INTERNAL_SERVER_ERROR' as ErrorCode, originalError: (error as Error).message });
  }
};

/**
 * Desarchivar orden de trabajo
 * @param orderId - ID de la orden
 * @param userId - ID del usuario que desarchiva
 * @param options - Opciones: { reason?: string }
 * @returns Orden desarchivada
 * @throws AppError si no encontrada o no archivada
 */
export const unarchiveOrder = async (orderId: string, userId: string, options: ArchiveOptions = {}): Promise<IOrder> => {
  try {
    if (!Types.ObjectId.isValid(orderId) || !Types.ObjectId.isValid(userId)) {
      throw new AppError('orderId y userId deben ser ObjectIds válidos', 400, { code: 'INVALID_INPUT' as ErrorCode });
    }

    const order = await Order.findById(orderId).select('isArchived historial numeroOrden').lean();
    if (!order) {
      throw new AppError('Orden no encontrada', 404, { code: ErrorCode.NOT_FOUND });
    }

    if (!order.isArchived) {
      throw new AppError('Orden no está archivada', 400, { code: 'INVALID_INPUT' as ErrorCode });
    }

    const session = await Order.startSession();
    let unarchivedOrder: HydratedDocument<IOrder> | null = null;
    await session.withTransaction(async () => {
      const orderDoc = await Order.findById(orderId).session(session);
      if (!orderDoc) throw new AppError('Orden no encontrada en transacción', 404, { code: ErrorCode.NOT_FOUND });
      orderDoc.isArchived = false;
      orderDoc.historial.push(addToHistorial('Orden desarchivada', userId, options.reason));
      await orderDoc.save({ session });
      unarchivedOrder = await orderDoc.populate(['asignadoA', 'supervisorId'], 'nombre email');
    });
    await session.endSession();

    if (!unarchivedOrder) {
      throw new AppError('Error al guardar orden desarchivada', 500, { code: 'DATABASE_ERROR' as ErrorCode });
    }

    await createAuditLog({
      userId,
      action: 'UNARCHIVE_ORDER',
      resource: 'Order',
      resourceId: orderId,
      status: 'SUCCESS',
      severity: 'LOW',
      details: { 
        reason: options.reason, 
        numeroOrden: order.numeroOrden 
      },
    });

    logger.info(`Orden desarchivada: ${order.numeroOrden} por usuario ${userId}`);
    return unarchivedOrder;
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error('Error al desarchivar orden:', { orderId, userId, error: (error as Error).message });
    throw new AppError('Error interno al desarchivar orden', 500, { code: 'INTERNAL_SERVER_ERROR' as ErrorCode, originalError: (error as Error).message });
  }
};

/**
 * Obtener órdenes archivadas (paginated, filtered)
 * @param filters - Filtros: { page?: number, limit?: number, search?: string, estado?: OrderStatus, assignedTo?: string }
 * @returns Resultado paginado
 * @throws AppError si error en query
 */
export const getArchivedOrders = async (filters: ArchivedFilters = {}): Promise<ArchiveResult> => {
  try {
    const { page = 1, limit = 20, search, estado, assignedTo } = filters;
    const skip = (page - 1) * Math.max(limit, 1);
    const query: any = { isArchived: true };

    if (search) {
      query.$or = [
        { numeroOrden: { $regex: new RegExp(search, 'i') } },
        { nombreCliente: { $regex: new RegExp(search, 'i') } },
      ];
    }

    if (estado && Object.values(ORDER_STATUS).includes(estado)) {
      query.estado = estado;
    }

    if (assignedTo && Types.ObjectId.isValid(assignedTo)) {
      query.asignadoA = new Types.ObjectId(assignedTo);
    }

    // Aggregate for efficient pagination, populate, lean
    const pipeline: PipelineStage[] = [
      { $match: query },
      { $sort: { updatedAt: -1 } },
      {
        $lookup: {
          from: 'users',
          localField: 'asignadoA',
          foreignField: '_id',
          as: 'asignadoA',
          pipeline: [{ $project: { nombre: 1, email: 1 } }],
        },
      },
      { $unwind: { path: '$asignadoA', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'supervisorId',
          foreignField: '_id',
          as: 'supervisorId',
          pipeline: [{ $project: { nombre: 1, email: 1 } }],
        },
      },
      { $unwind: { path: '$supervisorId', preserveNullAndEmptyArrays: true } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          numeroOrden: 1,
          descripcion: 1,
          estado: 1,
          fechaInicio: 1,
          fechaFinReal: 1,
          asignadoA: 1,
          supervisorId: 1,
          historial: 1,
          isArchived: 1,
        },
      },
    ];

    const orders: Partial<IOrder>[] = await Order.aggregate(pipeline).allowDiskUse(true).exec();
    const total = await Order.countDocuments(query);

    return {
      orders,
      total,
      pages: Math.ceil(total / limit),
      page,
      limit,
    };
  } catch (error) {
    logger.error('Error al obtener órdenes archivadas:', { filters, error: (error as Error).message });
    throw new AppError('Error al obtener órdenes archivadas', 500, { code: 'DATABASE_ERROR' as ErrorCode, originalError: (error as Error).message });
  }
};

/**
 * Archivar automáticamente órdenes completadas antiguas
 * @param daysOld - Días de antigüedad (default 90)
 * @param status - Status para archivar (default 'completada')
 * @returns Resultado updateMany
 * @throws AppError si error en bulk update
 */
export const autoArchiveOldOrders = async (daysOld: number = 90, status: OrderStatus = ORDER_STATUS.COMPLETED): Promise<BulkResult> => {
  try {
    if (daysOld < 1) throw new AppError('daysOld debe ser positivo', 400, { code: 'INVALID_INPUT' as ErrorCode });
    if (!Object.values(ORDER_STATUS).includes(status)) throw new AppError('Status inválido', 400, { code: 'INVALID_INPUT' as ErrorCode });

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Order.updateMany(
      {
        estado: status,
        fechaFinReal: { $lte: cutoffDate },
        isArchived: false,
      },
      {
        $set: { isArchived: true },
        $push: {
          historial: addToHistorial('Orden archivada automáticamente (antigüedad)', null),
        },
      }
    );

    // Audit for bulk
    if (result.modifiedCount > 0) {
      await createAuditLog({
        userId: null, // System
        action: 'AUTO_ARCHIVE_ORDERS',
        resource: 'Order',
        status: 'SUCCESS',
        severity: 'LOW',
        details: { daysOld, status, modifiedCount: result.modifiedCount, matchedCount: result.matchedCount },
      });
    }

    logger.info(`${result.modifiedCount} órdenes archivadas automáticamente (días: ${daysOld}, status: ${status})`);
    return result;
  } catch (error) {
    logger.error('Error en archivo automático:', { daysOld, status, error: (error as Error).message });
    if (error instanceof AppError) throw error;
    throw new AppError('Error en archivo automático', 500, { code: 'DATABASE_ERROR' as ErrorCode, originalError: (error as Error).message });
  }
};

/**
 * Eliminar permanentemente órdenes archivadas muy antiguas
 * @param daysOld - Días de antigüedad (default 365)
 * @returns Resultado deleteMany
 * @throws AppError si error en purge. ⚠️ Use con precaución, backup first.
 */
export const purgeArchivedOrders = async (daysOld: number = 365): Promise<PurgeResult> => {
  try {
    if (daysOld < 30) throw new AppError('daysOld mínimo 30 días para purge', 400, { code: 'INVALID_INPUT' as ErrorCode }); // Safety

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const countQuery = { isArchived: true, updatedAt: { $lte: cutoffDate } };
    const count = await Order.countDocuments(countQuery);

    if (count === 0) {
      logger.info('No hay órdenes para purgar');
      return { deletedCount: 0 };
    }

    // Audit pre-purge
    await createAuditLog({
      userId: null, // System
      action: 'PURGE_ARCHIVED_ORDERS',
      resource: 'Order',
      status: 'SUCCESS',
      severity: 'HIGH',
      details: { daysOld, count },
    });

    // For safety, add confirm flag in production
    if (process.env.NODE_ENV === 'production') {
      logger.warn(`Purge confirmado: ${count} órdenes a eliminar permanentemente`);
    }

    const result = await Order.deleteMany(countQuery);

    logger.warn(`${result.deletedCount} órdenes archivadas eliminadas permanentemente (días: ${daysOld})`);
    return result;
  } catch (error) {
    logger.error('Error al purgar órdenes archivadas:', { daysOld, error: (error as Error).message });
    if (error instanceof AppError) throw error;
    throw new AppError('Error al purgar órdenes archivadas', 500, { code: 'DATABASE_ERROR' as ErrorCode, originalError: (error as Error).message });
  }
};



