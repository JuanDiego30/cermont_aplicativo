import { Types } from 'mongoose';
import Order from '';
import { logger } from '';
import { ORDER_STATUS } from '';
import { createAuditLog } from '';
import { CustomError } from '';
export const archiveOrder = async (orderId, userId, options = {}) => {
    try {
        if (!Types.ObjectId.isValid(orderId) || !Types.ObjectId.isValid(userId)) {
            throw new CustomError('orderId y userId deben ser ObjectIds válidos', 'INVALID_ID');
        }
        const order = await Order.findById(orderId).select('estado isArchived historial numeroOrden fechaFinReal').lean();
        if (!order) {
            throw new CustomError('Orden no encontrada', 'NOT_FOUND');
        }
        if (order.isArchived) {
            throw new CustomError('Orden ya archivada', 'ALREADY_ARCHIVED');
        }
        if ([ORDER_STATUS.pending, ORDER_STATUS.inProgress].includes(order.estado)) {
            throw new CustomError('No se puede archivar órdenes activas o pendientes', 'INVALID_STATUS');
        }
        const session = await Order.startSession();
        let archivedOrder;
        await session.withTransaction(async () => {
            const orderDoc = await Order.findById(orderId).session(session);
            if (!orderDoc)
                throw new CustomError('Orden no encontrada en transacción', 'NOT_FOUND');
            orderDoc.isArchived = true;
            orderDoc.historial.push({
                accion: `Orden archivada${options.reason ? `: ${options.reason}` : ''}`,
                usuario: new Types.ObjectId(userId),
                fecha: new Date(),
            });
            archivedOrder = await orderDoc.save({ session });
        });
        await session.endSession();
        await createAuditLog({
            accion: 'ARCHIVE_ORDER',
            usuarioId: new Types.ObjectId(userId),
            entidad: 'Order',
            entidadId: new Types.ObjectId(orderId),
            detalles: { reason: options.reason },
        });
        logger.info(`Orden archivada: ${order.numeroOrden} por usuario ${userId}`);
        if (options.notify) {
            logger.info('Notificación de archivado pendiente (email service)');
        }
        return archivedOrder.populate('asignadoA supervisorId', 'nombre email');
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al archivar orden:', { orderId, userId, error: error.message });
        throw new CustomError('Error interno al archivar orden', 'INTERNAL_ERROR', error.message);
    }
};
export const unarchiveOrder = async (orderId, userId, options = {}) => {
    try {
        if (!Types.ObjectId.isValid(orderId) || !Types.ObjectId.isValid(userId)) {
            throw new CustomError('orderId y userId deben ser ObjectIds válidos', 'INVALID_ID');
        }
        const order = await Order.findById(orderId).select('isArchived historial numeroOrden').lean();
        if (!order) {
            throw new CustomError('Orden no encontrada', 'NOT_FOUND');
        }
        if (!order.isArchived) {
            throw new CustomError('Orden no está archivada', 'NOT_ARCHIVED');
        }
        const session = await Order.startSession();
        let unarchivedOrder;
        await session.withTransaction(async () => {
            const orderDoc = await Order.findById(orderId).session(session);
            if (!orderDoc)
                throw new CustomError('Orden no encontrada en transacción', 'NOT_FOUND');
            orderDoc.isArchived = false;
            orderDoc.historial.push({
                accion: `Orden desarchivada${options.reason ? `: ${options.reason}` : ''}`,
                usuario: new Types.ObjectId(userId),
                fecha: new Date(),
            });
            unarchivedOrder = await orderDoc.save({ session });
        });
        await session.endSession();
        await createAuditLog({
            accion: 'UNARCHIVE_ORDER',
            usuarioId: new Types.ObjectId(userId),
            entidad: 'Order',
            entidadId: new Types.ObjectId(orderId),
            detalles: { reason: options.reason },
        });
        logger.info(`Orden desarchivada: ${order.numeroOrden} por usuario ${userId}`);
        return unarchivedOrder;
    }
    catch (error) {
        if (error instanceof CustomError)
            throw error;
        logger.error('Error al desarchivar orden:', { orderId, userId, error: error.message });
        throw new CustomError('Error interno al desarchivar orden', 'INTERNAL_ERROR', error.message);
    }
};
export const getArchivedOrders = async (filters = {}) => {
    try {
        const { page = 1, limit = 20, search, estado, assignedTo } = filters;
        const skip = (page - 1) * Math.max(limit, 1);
        const query = { isArchived: true };
        if (search) {
            query.$or = [
                { numeroOrden: { $regex: new RegExp(search, 'i') } },
                { nombreCliente: { $regex: new RegExp(search, 'i') } },
            ];
        }
        if (estado && ORDER_STATUS.includes(estado)) {
            query.estado = estado;
        }
        if (assignedTo && Types.ObjectId.isValid(assignedTo)) {
            query.asignadoA = new Types.ObjectId(assignedTo);
        }
        const pipeline = [
            { $match: query },
            { $sort: { updatedAt: -1 } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'asignadoA',
                    foreignField: '_id',
                    as: 'asignadoA',
                    pipeline: [{ $project: { nombre: 1, email: 1 } }],
                    let: { localId: '$_id' },
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
        const orders = await Order.aggregate(pipeline).allowDiskUse(true).exec();
        const total = await Order.countDocuments(query).lean();
        return {
            orders,
            total,
            pages: Math.ceil(total / limit),
            page,
            limit,
        };
    }
    catch (error) {
        logger.error('Error al obtener órdenes archivadas:', { filters, error: error.message });
        throw new CustomError('Error al obtener órdenes archivadas', 'QUERY_ERROR', error.message);
    }
};
export const autoArchiveOldOrders = async (daysOld = 90, status = ORDER_STATUS.completed) => {
    try {
        if (daysOld < 1)
            throw new CustomError('daysOld debe ser positivo', 'INVALID_PARAM');
        if (!ORDER_STATUS.includes(status))
            throw new CustomError('Status inválido', 'INVALID_STATUS');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const result = await Order.updateMany({
            estado: status,
            fechaFinReal: { $lte: cutoffDate },
            isArchived: false,
        }, {
            $set: { isArchived: true },
            $push: {
                historial: {
                    accion: 'Orden archivada automáticamente (antigüedad)',
                    usuario: null,
                    fecha: new Date(),
                },
            },
        }, { multi: true });
        if (result.modifiedCount > 0) {
            await createAuditLog({
                accion: 'AUTO_ARCHIVE_ORDERS',
                usuarioId: null,
                entidad: 'Order',
                detalles: { daysOld, status, modifiedCount: result.modifiedCount, matchedCount: result.matchedCount },
            });
        }
        logger.info(`${result.modifiedCount} órdenes archivadas automáticamente (días: ${daysOld}, status: ${status})`);
        return result;
    }
    catch (error) {
        logger.error('Error en archivo automático:', { daysOld, status, error: error.message });
        if (error instanceof CustomError)
            throw error;
        throw new CustomError('Error en archivo automático', 'BULK_UPDATE_ERROR', error.message);
    }
};
export const purgeArchivedOrders = async (daysOld = 365) => {
    try {
        if (daysOld < 30)
            throw new CustomError('daysOld mínimo 30 días para purge', 'INVALID_PARAM');
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const countQuery = { isArchived: true, updatedAt: { $lte: cutoffDate } };
        const count = await Order.countDocuments(countQuery).lean();
        if (count === 0) {
            logger.info('No hay órdenes para purgar');
            return { deletedCount: 0 };
        }
        await createAuditLog({
            accion: 'PURGE_ARCHIVED_ORDERS',
            usuarioId: null,
            entidad: 'Order',
            detalles: { daysOld, count },
        });
        if (process.env.NODE_ENV === 'production') {
            logger.warn(`Purge confirmado: ${count} órdenes a eliminar permanentemente`);
        }
        const result = await Order.deleteMany(countQuery);
        logger.warn(`${result.deletedCount} órdenes archivadas eliminadas permanentemente (días: ${daysOld})`);
        return result;
    }
    catch (error) {
        logger.error('Error al purgar órdenes archivadas:', { daysOld, error: error.message });
        if (error instanceof CustomError)
            throw error;
        throw new CustomError('Error al purgar órdenes archivadas', 'PURGE_ERROR', error.message);
    }
};
//# sourceMappingURL=archiving.service.js.map