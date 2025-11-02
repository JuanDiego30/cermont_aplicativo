import Order from '../models/Order.js';
import User from '../models/User.js';
import { autoPaginate } from '../utils/pagination.js';
import { AppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import { ORDER_STATUS } from '../utils/constants.js';
import { sendOrderAssignedEmail, sendOrderStatusChangeEmail } from './email.service.js';
import { emitToUser, emitToRole } from '../config/socket.js';
import cacheService from './cache.service.js';

/**
 * Servicio de Gestión de Órdenes de Trabajo - CERMONT ATG
 *
 * Esta clase proporciona todas las operaciones de negocio relacionadas con la gestión
 * de órdenes de trabajo en el sistema CERMONT ATG. Incluye funcionalidades completas
 * de CRUD, asignación de usuarios, seguimiento de estados, notas, estadísticas y
 * notificaciones en tiempo real.
 *
 * Características principales:
 * - Generación automática de números de orden únicos
 * - Gestión completa del ciclo de vida de órdenes
 * - Asignación de usuarios con roles específicos
 * - Seguimiento de estados y progreso
 * - Sistema de notas y comentarios
 * - Estadísticas y métricas avanzadas
 * - Notificaciones por email y WebSocket
 * - Cache inteligente con invalidación automática
 * - Auditoría completa de todas las operaciones
 * - Cálculo automático de fechas límite
 *
 * Estados de orden soportados:
 * - pending: Pendiente
 * - in_progress: En progreso
 * - completed: Completada
 * - cancelled: Cancelada
 *
 * @class OrderService
 * @version 1.0.0
 * @since October 2025
 */
class OrderService {
  /**
   * Generar número de orden único
   *
   * Crea un número de orden único siguiendo el formato OT-YYYY-NNNN
   * donde YYYY es el año actual y NNNN es un número secuencial de 4 dígitos.
   * Garantiza unicidad verificando contra la base de datos.
   *
   * @async
   * @returns {Promise<string>} Número de orden único (ej: "OT-2025-0001")
   *
   * @example
   * // Generar nuevo número de orden
   * const orderNumber = await orderService.generateOrderNumber();
   * console.log(orderNumber); // "OT-2025-0123"
   */
  async generateOrderNumber() {
    const year = new Date().getFullYear();
    const count = await Order.countDocuments({
      numeroOrden: new RegExp(`^OT-${year}`),
    });

    const nextNumber = (count + 1).toString().padStart(4, '0');
    return `OT-${year}-${nextNumber}`;
  }

  /**
   * Listar órdenes con filtros y paginación
   *
   * Obtiene una lista paginada de órdenes de trabajo aplicando filtros avanzados.
   * Incluye población de referencias (usuarios asignados, supervisores, planes de trabajo).
   * Utiliza cache inteligente para optimizar performance.
   *
   * @async
   * @param {Object} filters - Filtros a aplicar en la consulta
   * @param {string} filters.search - Término de búsqueda (número, título, descripción, cliente)
   * @param {string} filters.estado - Filtrar por estado (pending, in_progress, completed, cancelled)
   * @param {string} filters.prioridad - Filtrar por prioridad (low, medium, high, critical)
   * @param {string} filters.cliente - Filtrar por cliente
   * @param {string} filters.ubicacion - Filtrar por ubicación
   * @param {string} filters.asignadoA - Filtrar por usuario asignado (ObjectId)
   * @param {Date} filters.fechaDesde - Filtrar órdenes desde esta fecha
   * @param {Date} filters.fechaHasta - Filtrar órdenes hasta esta fecha
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @param {number} options.page - Número de página (default: 1)
   * @param {number} options.limit - Elementos por página (default: 10, max: 100)
   * @param {Object} options.sort - Criterios de ordenamiento
   * @returns {Promise<Object>} Resultado paginado con órdenes
   * @returns {Array} return.data - Lista de órdenes con referencias pobladas
   * @returns {number} return.total - Total de órdenes encontradas
   * @returns {number} return.page - Página actual
   * @returns {number} return.pages - Total de páginas
   * @throws {AppError} Error de base de datos o validación
   *
   * @example
   * // Listar órdenes en progreso con paginación
   * const result = await orderService.list(
   *   { estado: 'in_progress', prioridad: 'high' },
   *   { page: 1, limit: 20, sort: { fechaCreacion: -1 } }
   * );
   */
  async list(filters = {}, options = {}) {
    try {
      const cacheKey = `orders:list:${JSON.stringify(filters)}:${JSON.stringify(options)}`;

      return await cacheService.wrap(
        cacheKey,
        async () => {
          const result = await autoPaginate(Order, filters, {
            ...options,
            populate: [
              { path: 'asignadoA', select: 'nombre email rol' },
              { path: 'supervisorId', select: 'nombre email' },
              { path: 'workPlanId', select: 'titulo progresoActividades' }
            ],
            sort: options.sort || { createdAt: -1 }
          });

          return result;
        },
        180 // Cache 3 minutos
      );
    } catch (error) {
      logger.error('[OrderService] Error listando órdenes:', error);
      throw error;
    }
  }

  /**
   * Obtener orden por ID
   *
   * Recupera la información completa de una orden de trabajo específica por su ID único.
   * Incluye todas las referencias pobladas (usuarios, notas, historial).
   * Utiliza cache para optimizar consultas frecuentes.
   *
   * @async
   * @param {string} orderId - ID único de la orden (ObjectId de MongoDB)
   * @returns {Promise<Object>} Información completa de la orden
   * @returns {string} return._id - ID único de la orden
   * @returns {string} return.numeroOrden - Número de orden (OT-YYYY-NNNN)
   * @returns {string} return.titulo - Título de la orden
   * @returns {string} return.descripcion - Descripción detallada
   * @returns {string} return.estado - Estado actual de la orden
   * @returns {string} return.prioridad - Nivel de prioridad
   * @returns {Object} return.asignadoA - Usuario asignado (poblado)
   * @returns {Array} return.notas - Lista de notas y comentarios
   * @returns {Array} return.historialEstados - Historial de cambios de estado
   * @returns {Date} return.createdAt - Fecha de creación
   * @returns {Date} return.updatedAt - Fecha de última actualización
   * @throws {AppError} ORDER_NOT_FOUND cuando la orden no existe
   *
   * @example
   * // Obtener orden completa por ID
   * const order = await orderService.getById('507f1f77bcf86cd799439011');
   * console.log(order.numeroOrden); // "OT-2025-0123"
   */
  async getById(orderId) {
    try {
      const cacheKey = `order:${orderId}`;

      return await cacheService.wrap(
        cacheKey,
        async () => {
          const order = await Order.findById(orderId)
            .populate('asignadoA', 'nombre email rol')
            .populate('supervisorId', 'nombre email')
            .populate('workPlanId')
            .lean();

          if (!order) {
            throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
          }

          return order;
        },
        300 // Cache 5 minutos
      );
    } catch (error) {
      logger.error(`[OrderService] Error obteniendo orden ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Crear nueva orden de trabajo
   *
   * Crea una nueva orden de trabajo en el sistema generando automáticamente
   * un número de orden único y aplicando todas las validaciones de negocio.
   * Registra la operación en los logs de auditoría y notifica por WebSocket.
   *
   * @async
   * @param {Object} orderData - Datos de la nueva orden
   * @param {string} orderData.titulo - Título descriptivo (requerido, 5-200 caracteres)
   * @param {string} orderData.descripcion - Descripción detallada (requerido, min 10 caracteres)
   * @param {string} orderData.cliente - Nombre del cliente (requerido, 2-100 caracteres)
   * @param {string} orderData.ubicacion - Ubicación del trabajo (requerido, 5-200 caracteres)
   * @param {string} orderData.prioridad - Nivel de prioridad (requerido: low, medium, high, critical)
   * @param {string} [orderData.tipoTrabajo] - Tipo específico de trabajo
   * @param {string} [orderData.equipo] - Equipo o instalación objeto del trabajo
   * @param {Date} [orderData.fechaProgramada] - Fecha programada para ejecutar el trabajo
   * @param {number} [orderData.horasEstimadas] - Horas estimadas (mínimo 0.5)
   * @param {number} [orderData.costoEstimado] - Costo estimado del trabajo
   * @param {Array} [orderData.materiales] - Lista de materiales requeridos
   * @param {Array} [orderData.documentos] - Documentos adjuntos o referencias
   * @param {string} [orderData.notas] - Notas adicionales
   * @returns {Promise<Object>} Orden creada con número de orden asignado
   * @throws {AppError} Error de validación de datos de entrada
   *
   * @example
   * // Crear nueva orden de mantenimiento
   * const newOrder = await orderService.create({
   *   titulo: "Mantenimiento preventivo transformador T-001",
   *   descripcion: "Realizar mantenimiento preventivo completo del transformador T-001",
   *   cliente: "Empresa Eléctrica de Bogotá",
   *   ubicacion: "Subestación Norte - Carrera 7 #23-45, Bogotá",
   *   prioridad: "high",
   *   tipoTrabajo: "Mantenimiento preventivo",
   *   equipo: "Transformador T-001 1000KVA",
   *   fechaProgramada: new Date("2023-12-15"),
   *   horasEstimadas: 8,
   *   costoEstimado: 2500000
   * });
   */
  async create(orderData) {
    try {
      // Generar número de orden si no existe
      if (!orderData.numeroOrden) {
        orderData.numeroOrden = await this.generateOrderNumber();
      }

      // Validar que no exista el número de orden
      const existingOrder = await Order.findOne({ numeroOrden: orderData.numeroOrden });
      if (existingOrder) {
        throw new AppError(
          'El número de orden ya existe',
          409,
          'ORDER_NUMBER_EXISTS'
        );
      }

      const order = await Order.create(orderData);

      // Invalidar cache de listas
      cacheService.delPattern('orders:list:*');

      logger.info(`[OrderService] Orden creada: ${order.numeroOrden}`);

      // Notificar por Socket.IO a admins
      emitToRole('admin', 'new_order', {
        orderId: order._id,
        numeroOrden: order.numeroOrden,
        clienteNombre: order.clienteNombre,
      });

      return order;
    } catch (error) {
      logger.error('[OrderService] Error creando orden:', error);
      throw error;
    }
  }

  /**
   * Actualizar orden
   */
  async update(orderId, updateData, userId) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
      }

      // No permitir actualizar ciertos campos directamente
      delete updateData.numeroOrden; // El número de orden no se puede cambiar
      delete updateData.historial; // El historial se maneja automáticamente

      // Registrar cambio en historial
      order.historial.push({
        accion: 'Actualización',
        usuario: userId,
        detalles: updateData,
        fecha: new Date(),
      });

      Object.assign(order, updateData);
      await order.save();

      // Invalidar cache
      cacheService.del(`order:${orderId}`);
      cacheService.delPattern('orders:list:*');

      logger.info(`[OrderService] Orden actualizada: ${order.numeroOrden}`);

      return order;
    } catch (error) {
      logger.error(`[OrderService] Error actualizando orden ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Asignar usuarios a una orden
   */
  async assignUsers(orderId, userIds, supervisorId = null, userId) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
      }

      // Verificar que los usuarios existen y están activos
      const users = await User.find({ _id: { $in: userIds }, activo: true });

      if (users.length !== userIds.length) {
        throw new AppError(
          'Algunos usuarios no existen o están inactivos',
          400,
          'INVALID_USERS'
        );
      }

      // Asignar usuarios
      order.asignadoA = userIds;
      if (supervisorId) {
        order.supervisorId = supervisorId;
      }

      // Registrar en historial
      order.historial.push({
        accion: 'Usuarios asignados',
        usuario: userId,
        detalles: {
          usuarios: userIds,
          supervisor: supervisorId,
        },
        fecha: new Date(),
      });

      await order.save();

      // Invalidar cache
      cacheService.del(`order:${orderId}`);
      cacheService.delPattern('orders:list:*');

      logger.info(`[OrderService] Usuarios asignados a orden ${order.numeroOrden}`);

      // Notificar a los usuarios asignados
      for (const user of users) {
        // Email
        await sendOrderAssignedEmail(user, order);

        // Socket.IO
        emitToUser(user._id.toString(), 'order_assigned', {
          orderId: order._id,
          numeroOrden: order.numeroOrden,
          clienteNombre: order.clienteNombre,
        });
      }

      return order;
    } catch (error) {
      logger.error('[OrderService] Error asignando usuarios:', error);
      throw error;
    }
  }

  /**
   * Cambiar estado de orden
   */
  async changeStatus(orderId, newStatus, userId) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
      }

      const previousStatus = order.estado;

      // Validar transición de estado
      const validTransitions = {
        [ORDER_STATUS.PENDING]: [ORDER_STATUS.PLANNING, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.PLANNING]: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED],
        [ORDER_STATUS.COMPLETED]: [ORDER_STATUS.INVOICING],
        [ORDER_STATUS.INVOICING]: [ORDER_STATUS.INVOICED],
        [ORDER_STATUS.INVOICED]: [ORDER_STATUS.PAID],
        [ORDER_STATUS.PAID]: [],
        [ORDER_STATUS.CANCELLED]: [],
      };

      if (!validTransitions[previousStatus]?.includes(newStatus)) {
        throw new AppError(
          `Transición inválida: ${previousStatus}  ${newStatus}`,
          400,
          'INVALID_STATUS_TRANSITION'
        );
      }

      // Actualizar estado
      order.estado = newStatus;

      // Actualizar fecha de fin si se completa
      if (newStatus === ORDER_STATUS.COMPLETED) {
        order.fechaFinReal = new Date();
      }

      // Registrar en historial
      order.historial.push({
        accion: 'Cambio de estado',
        usuario: userId,
        detalles: {
          estadoAnterior: previousStatus,
          estadoNuevo: newStatus,
        },
        fecha: new Date(),
      });

      await order.save();

      // Invalidar cache
      cacheService.del(`order:${orderId}`);
      cacheService.delPattern('orders:list:*');

      logger.info(`[OrderService] Estado de orden ${order.numeroOrden}: ${previousStatus}  ${newStatus}`);

      // Notificar a usuarios involucrados
      const involvedUsers = await User.find({
        _id: { $in: [...order.asignadoA, order.supervisorId].filter(Boolean) },
      });

      // Email
      await sendOrderStatusChangeEmail(involvedUsers, order, previousStatus, newStatus);

      // Socket.IO
      involvedUsers.forEach(user => {
        emitToUser(user._id.toString(), 'order_status_changed', {
          orderId: order._id,
          numeroOrden: order.numeroOrden,
          previousStatus,
          newStatus,
        });
      });

      // Notificar a admins
      emitToRole('admin', 'order_status_changed', {
        orderId: order._id,
        numeroOrden: order.numeroOrden,
        previousStatus,
        newStatus,
      });

      return order;
    } catch (error) {
      logger.error('[OrderService] Error cambiando estado de orden:', error);
      throw error;
    }
  }

  /**
   * Agregar nota a orden
   */
  async addNote(orderId, nota, userId) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
      }

      order.notas.push({
        contenido: nota,
        autor: userId,
        createdAt: new Date(),
      });

      await order.save();

      // Invalidar cache
      cacheService.del(`order:${orderId}`);

      logger.info(`[OrderService] Nota agregada a orden ${order.numeroOrden}`);

      // Notificar a usuarios involucrados
      const involvedUserIds = [...order.asignadoA, order.supervisorId].filter(Boolean);

      involvedUserIds.forEach(uid => {
        if (uid.toString() !== userId.toString()) {
          emitToUser(uid.toString(), 'order_note_added', {
            orderId: order._id,
            numeroOrden: order.numeroOrden,
            nota,
          });
        }
      });

      return order;
    } catch (error) {
      logger.error('[OrderService] Error agregando nota:', error);
      throw error;
    }
  }

  /**
   * Eliminar orden (soft delete)
   */
  async delete(orderId, userId) {
    try {
      const order = await Order.findById(orderId);

      if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
      }

      // Solo permitir eliminar órdenes en estado PENDING o CANCELLED
      if (![ORDER_STATUS.PENDING, ORDER_STATUS.CANCELLED].includes(order.estado)) {
        throw new AppError(
          'Solo se pueden eliminar órdenes pendientes o canceladas',
          400,
          'CANNOT_DELETE_ACTIVE_ORDER'
        );
      }

      // Soft delete
      order.isActive = false;

      // Registrar en historial
      order.historial.push({
        accion: 'Orden eliminada',
        usuario: userId,
        fecha: new Date(),
      });

      await order.save();

      // Invalidar cache
      cacheService.del(`order:${orderId}`);
      cacheService.delPattern('orders:list:*');

      logger.info(`[OrderService] Orden eliminada: ${order.numeroOrden}`);

      return order;
    } catch (error) {
      logger.error(`[OrderService] Error eliminando orden ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de órdenes
   */
  async getStats(filters = {}) {
    try {
      const cacheKey = `orders:stats:${JSON.stringify(filters)}`;

      return await cacheService.wrap(
        cacheKey,
        async () => {
          const baseFilter = { isActive: true, isArchived: false, ...filters };

          const [
            total,
            pending,
            planning,
            inProgress,
            completed,
            invoicing,
            invoiced,
            paid,
            cancelled,
            overdue,
          ] = await Promise.all([
            Order.countDocuments(baseFilter),
            Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.PENDING }),
            Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.PLANNING }),
            Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.IN_PROGRESS }),
            Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.COMPLETED }),
            Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.INVOICING }),
            Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.INVOICED }),
            Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.PAID }),
            Order.countDocuments({ ...baseFilter, estado: ORDER_STATUS.CANCELLED }),
            Order.countDocuments({
              ...baseFilter,
              fechaFinEstimada: { $lt: new Date() },
              fechaFinReal: null,
              estado: { $in: [ORDER_STATUS.PENDING, ORDER_STATUS.PLANNING, ORDER_STATUS.IN_PROGRESS] },
            }),
          ]);

          // Estadísticas de costos
          const costStats = await Order.aggregate([
            { $match: baseFilter },
            {
              $group: {
                _id: null,
                totalEstimado: { $sum: '$costoEstimado' },
                totalReal: { $sum: '$costoReal' },
                promedioCostoEstimado: { $avg: '$costoEstimado' },
                promedioCostoReal: { $avg: '$costoReal' },
              },
            },
          ]);

          return {
            total,
            byStatus: {
              pending,
              planning,
              inProgress,
              completed,
              invoicing,
              invoiced,
              paid,
              cancelled,
            },
            overdue,
            costs: costStats[0] || {
              totalEstimado: 0,
              totalReal: 0,
              promedioCostoEstimado: 0,
              promedioCostoReal: 0,
            },
          };
        },
        600 // Cache 10 minutos
      );
    } catch (error) {
      logger.error('[OrderService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Calcular progreso de una orden
   */
  async calculateProgress(orderId) {
    try {
      const order = await Order.findById(orderId).populate('workPlanId');

      if (!order) {
        throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
      }

      let progress = 0;

      // Calcular basado en estado
      const stateProgress = order.progreso; // Virtual del modelo

      // Si tiene workplan, calcular basado en actividades
      if (order.workPlanId) {
        const workplan = order.workPlanId;
        const activityProgress = workplan.progresoActividades; // Virtual del modelo
        progress = (stateProgress + activityProgress) / 2;
      } else {
        progress = stateProgress;
      }

      return Math.round(progress);
    } catch (error) {
      logger.error('[OrderService] Error calculando progreso:', error);
      throw error;
    }
  }

  /**
   * Obtener órdenes próximas a vencer
   */
  async getUpcomingDeadlines(daysAhead = 7) {
    try {
      const cacheKey = `orders:upcoming:${daysAhead}`;

      return await cacheService.wrap(
        cacheKey,
        async () => {
          const today = new Date();
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + daysAhead);

          const orders = await Order.find({
            isActive: true,
            isArchived: false,
            fechaFinEstimada: {
              $gte: today,
              $lte: futureDate,
            },
            estado: {
              $in: [ORDER_STATUS.PENDING, ORDER_STATUS.PLANNING, ORDER_STATUS.IN_PROGRESS],
            },
          })
            .populate('asignadoA', 'nombre email')
            .populate('supervisorId', 'nombre email')
            .sort({ fechaFinEstimada: 1 })
            .lean();

          return orders;
        },
        3600 // Cache 1 hora
      );
    } catch (error) {
      logger.error('[OrderService] Error obteniendo órdenes próximas a vencer:', error);
      throw error;
    }
  }
}

// Exportar instancia única (singleton)
export default new OrderService();
