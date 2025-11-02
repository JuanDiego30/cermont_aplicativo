/**
 * Archiving Service
 * @description Servicio para archivar y desarchivar entidades
 */

import Order from '../models/Order.js';
import { logger } from '../utils/logger.js';

/**
 * Archivar orden de trabajo
 */
export const archiveOrder = async (orderId, userId) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    order.isArchived = true;
    order.historial.push({
      accion: 'Orden archivada',
      usuario: userId,
      fecha: new Date(),
    });

    await order.save();

    logger.info(`Orden archivada: ${order.numeroOrden}`);
    return order;
  } catch (error) {
    logger.error('Error al archivar orden:', error);
    throw error;
  }
};

/**
 * Desarchivar orden de trabajo
 */
export const unarchiveOrder = async (orderId, userId) => {
  try {
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Orden no encontrada');
    }

    order.isArchived = false;
    order.historial.push({
      accion: 'Orden desarchivada',
      usuario: userId,
      fecha: new Date(),
    });

    await order.save();

    logger.info(`Orden desarchivada: ${order.numeroOrden}`);
    return order;
  } catch (error) {
    logger.error('Error al desarchivar orden:', error);
    throw error;
  }
};

/**
 * Obtener todas las órdenes archivadas
 */
export const getArchivedOrders = async (filters = {}) => {
  try {
    const query = { isArchived: true, ...filters };
    const orders = await Order.find(query)
      .sort({ updatedAt: -1 })
      .populate('asignadoA', 'nombre email')
      .populate('supervisorId', 'nombre email');

    return orders;
  } catch (error) {
    logger.error('Error al obtener órdenes archivadas:', error);
    throw error;
  }
};

/**
 * Archivar automáticamente órdenes completadas antiguas
 * @param {number} daysOld - Días de antigüedad para archivar
 */
export const autoArchiveOldOrders = async (daysOld = 90) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Order.updateMany(
      {
        estado: 'paid',
        fechaFinReal: { $lte: cutoffDate },
        isArchived: false,
      },
      {
        $set: { isArchived: true },
      }
    );

    logger.info(`${result.modifiedCount} órdenes archivadas automáticamente`);
    return result;
  } catch (error) {
    logger.error('Error en archivo automático:', error);
    throw error;
  }
};

/**
 * Eliminar permanentemente órdenes archivadas muy antiguas
 * @param {number} daysOld - Días de antigüedad para eliminación permanente
 */
export const purgeArchivedOrders = async (daysOld = 365) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Order.deleteMany({
      isArchived: true,
      updatedAt: { $lte: cutoffDate },
    });

    logger.warn(`${result.deletedCount} órdenes eliminadas permanentemente`);
    return result;
  } catch (error) {
    logger.error('Error al purgar órdenes archivadas:', error);
    throw error;
  }
};
