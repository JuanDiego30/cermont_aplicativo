/**
 * @module OrdersController
 * @description Controlador para la gestión de órdenes de trabajo en el sistema CERMONT ATG
 *
 * Este módulo maneja todas las operaciones CRUD relacionadas con órdenes de trabajo,
 * incluyendo asignación de usuarios, cambio de estados, notas, y operaciones administrativas.
 *
 * @requires ../utils/response - Utilidades para respuestas HTTP estandarizadas
 * @requires ../utils/asyncHandler - Wrapper para manejo de errores asíncronos
 * @requires ../utils/logger - Sistema de logging de la aplicación
 * @requires ../utils/constants - Constantes del sistema incluyendo estados de orden
 * @requires ../services/order.service - Servicio de lógica de negocio para órdenes
 * @requires ../services/notification.service - Servicio de notificaciones
 * @requires ../utils/validators - Validadores de datos de entrada
 * @requires ../middleware/sanitize - Utilidades de sanitización
 *
 * @example
 * // Uso típico en rutas
 * import { getAllOrders, createOrder, updateOrder } from './controllers/orders.controller.js';
 * router.get('/orders', authMiddleware, getAllOrders);
 */

import { successResponse, errorResponse, createdResponse, HTTP_STATUS } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { ORDER_STATUS } from '../utils/constants.js';
import orderService from '../services/order.service.js';
import notificationService from '../services/notification.service.js';

// NUEVO: Importar validadores
import {
  validateOrderData,
  validateAndRespond,
} from '../utils/validators.js';
import { validateObjectId } from '../middleware/sanitize.js';

/**
 * Obtiene todas las órdenes con paginación y filtros
 * @function getAllOrders
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {string} [req.query.cursor] - Cursor para paginación cursor-based
 * @param {number} [req.query.page] - Página para paginación offset-based
 * @param {number} [req.query.limit=20] - Número de órdenes por página (máx 100)
 * @param {string} [req.query.status] - Filtrar por estado de orden
 * @param {string} [req.query.priority] - Filtrar por prioridad
 * @param {string} [req.query.cliente] - Filtrar por nombre de cliente
 * @param {string} [req.query.startDate] - Fecha de inicio (YYYY-MM-DD)
 * @param {string} [req.query.endDate] - Fecha de fin (YYYY-MM-DD)
 * @param {string} [req.query.search] - Búsqueda por número, cliente o descripción
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con lista paginada de órdenes
 *
 * @example
 * // GET /api/v1/orders?page=1&limit=10&status=in_progress&priority=high
 * {
 *   "success": true,
 *   "message": "Órdenes obtenidas exitosamente",
 *   "data": [...],
 *   "meta": {
 *     "pagination": {
 *       "page": 1,
 *       "limit": 10,
 *       "total": 25,
 *       "pages": 3
 *     }
 *   }
 * }
 *
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const {
    cursor,
    page,
    limit = 20,
    status,
    priority,
    cliente,
    startDate,
    endDate,
    search
  } = req.query;

  // Construir filtros
  const filters = { isActive: true, isArchived: false };

  if (status) filters.estado = status;
  if (priority) filters.prioridad = priority;
  if (cliente) filters.clienteNombre = new RegExp(cliente, 'i');

  // Filtros de fecha
  if (startDate || endDate) {
    filters.fechaInicioEstimada = {};
    if (startDate) filters.fechaInicioEstimada.$gte = new Date(startDate);
    if (endDate) filters.fechaInicioEstimada.$lte = new Date(endDate);
  }

  // Búsqueda por texto
  if (search) {
    filters.$or = [
      { numeroOrden: new RegExp(search, 'i') },
      { clienteNombre: new RegExp(search, 'i') },
      { descripcion: new RegExp(search, 'i') }
    ];
  }

  // Usar el servicio para obtener órdenes
  const result = await orderService.list(filters, {
    cursor,
    page,
    limit,
    sort: { createdAt: -1 }
  });

  successResponse(res, 'Órdenes obtenidas exitosamente', result.docs, HTTP_STATUS.OK, {
    pagination: result.pagination
  });
});

/**
 * Obtiene una orden específica por su ID
 * @function getOrderById
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la orden a obtener
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con datos de la orden
 *
 * @example
 * // GET /api/v1/orders/64f1a2b3c4d5e6f7g8h9i0j1
 * {
 *   "success": true,
 *   "message": "Orden obtenida exitosamente",
 *   "data": {
 *     "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
 *     "numeroOrden": "ORD-2024-001",
 *     "titulo": "Mantenimiento transformador",
 *     "estado": "in_progress",
 *     "prioridad": "high"
 *   }
 * }
 *
 * @throws {ErrorResponse} 400 - ID inválido
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 404 - Orden no encontrada
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const order = await orderService.getById(id);

  successResponse(res, 'Orden obtenida exitosamente', order);
});

/**
 * Crea una nueva orden de trabajo
 * @function createOrder
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos de la nueva orden
 * @param {string} req.body.titulo - Título de la orden
 * @param {string} req.body.descripcion - Descripción detallada
 * @param {string} req.body.clienteNombre - Nombre del cliente
 * @param {string} req.body.ubicacion - Ubicación del trabajo
 * @param {string} req.body.prioridad - Prioridad (low, medium, high, critical)
 * @param {string} [req.body.fechaProgramada] - Fecha programada (YYYY-MM-DD)
 * @param {number} [req.body.horasEstimadas] - Horas estimadas
 * @param {number} [req.body.costoEstimado] - Costo estimado
 * @param {Object} req.user - Usuario autenticado que crea la orden
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con orden creada
 *
 * @example
 * // POST /api/v1/orders
 * {
 *   "titulo": "Mantenimiento preventivo transformador",
 *   "descripcion": "Revisión completa del transformador T-001",
 *   "clienteNombre": "Empresa Eléctrica XYZ",
 *   "ubicacion": "Subestación Norte, Calle 123",
 *   "prioridad": "high",
 *   "fechaProgramada": "2024-12-15",
 *   "horasEstimadas": 8,
 *   "costoEstimado": 1500000
 * }
 *
 * @throws {ErrorResponse} 400 - Datos inválidos
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const createOrder = asyncHandler(async (req, res) => {
  const orderData = { ...req.body, creadoPor: req.user._id.toString() };
  const createdBy = req.user;

  // Validar datos de entrada
  const validation = validateOrderData(orderData);
  if (validation.errors.length > 0) {
    return errorResponse(res, 'Datos de orden inválidos', HTTP_STATUS.BAD_REQUEST, validation.errors);
  }

  // Crear orden usando el servicio
  const order = await orderService.create(orderData);

  // Notificar creación
  await notificationService.notifyOrderCreated(order, createdBy);

  logger.info(`Orden creada: ${order.numeroOrden} por ${createdBy.nombre}`);

  createdResponse(res, order, 'Orden creada exitosamente');
});

/**
 * Actualiza los datos de una orden existente
 * @function updateOrder
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la orden a actualizar
 * @param {Object} req.body - Datos a actualizar
 * @param {string} [req.body.titulo] - Nuevo título
 * @param {string} [req.body.descripcion] - Nueva descripción
 * @param {string} [req.body.ubicacion] - Nueva ubicación
 * @param {string} [req.body.prioridad] - Nueva prioridad
 * @param {Object} req.user - Usuario autenticado que realiza la actualización
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con orden actualizada
 *
 * @example
 * // PUT /api/v1/orders/64f1a2b3c4d5e6f7g8h9i0j1
 * {
 *   "titulo": "Mantenimiento correctivo transformador",
 *   "prioridad": "critical",
 *   "descripcion": "Se detectó falla eléctrica, requiere atención inmediata"
 * }
 *
 * @throws {ErrorResponse} 400 - ID o datos inválidos
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 404 - Orden no encontrada
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const updateOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const currentUser = req.user;

  // Validar ID
  if (!validateObjectId(id)) {
    return errorResponse(res, 'ID de orden inválido', HTTP_STATUS.BAD_REQUEST);
  }

  // Actualizar orden usando el servicio
  const order = await orderService.update(id, updateData, currentUser._id);

  logger.info(`Orden actualizada: ${order.numeroOrden} por ${currentUser.nombre}`);

  successResponse(res, 'Orden actualizada exitosamente', order);
});

/**
 * Elimina una orden del sistema (soft delete)
 * @function deleteOrder
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la orden a eliminar
 * @param {Object} req.user - Usuario autenticado que realiza la eliminación
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON confirmando eliminación
 *
 * @example
 * // DELETE /api/v1/orders/64f1a2b3c4d5e6f7g8h9i0j1
 * {
 *   "success": true,
 *   "message": "Orden eliminada exitosamente"
 * }
 *
 * @throws {ErrorResponse} 400 - ID inválido
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes (solo admin)
 * @throws {ErrorResponse} 404 - Orden no encontrada
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Validar ID
  if (!validateObjectId(id)) {
    return errorResponse(res, 'ID de orden inválido', HTTP_STATUS.BAD_REQUEST);
  }

  // Eliminar orden usando el servicio
  const order = await orderService.delete(id, currentUser._id);

  logger.info(`Orden eliminada: ${order.numeroOrden} por ${currentUser.nombre}`);

  successResponse(res, 'Orden eliminada exitosamente', order);
});

/**
 * Agrega una nota a una orden de trabajo
 * @function addNote
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la orden
 * @param {Object} req.body - Datos de la nota
 * @param {string} req.body.contenido - Contenido de la nota
 * @param {Object} req.user - Usuario autenticado que agrega la nota
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con orden actualizada
 *
 * @example
 * // POST /api/v1/orders/64f1a2b3c4d5e6f7g8h9i0j1/notes
 * {
 *   "contenido": "Cliente reporta que el transformador hace un ruido extraño"
 * }
 *
 * @throws {ErrorResponse} 400 - ID inválido o contenido vacío
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 404 - Orden no encontrada
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const addNote = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { contenido } = req.body;
  const currentUser = req.user;

  // Validar ID
  if (!validateObjectId(id)) {
    return errorResponse(res, 'ID de orden inválido', HTTP_STATUS.BAD_REQUEST);
  }

  if (!contenido || contenido.trim().length === 0) {
    return errorResponse(res, 'Contenido de la nota requerido', HTTP_STATUS.BAD_REQUEST);
  }

  // Agregar nota usando el servicio
  const order = await orderService.addNote(id, contenido.trim(), currentUser._id);

  // Notificar nueva nota
  await notificationService.notifyOrderNoteAdded(order, { contenido: contenido.trim() }, currentUser);

  logger.info(`Nota agregada a orden ${order.numeroOrden} por ${currentUser.nombre}`);

  successResponse(res, 'Nota agregada exitosamente', order);
});

/**
 * Actualiza el estado de una orden de trabajo
 * @function updateOrderStatus
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la orden
 * @param {Object} req.body - Datos del cambio de estado
 * @param {string} req.body.estado - Nuevo estado (pending, in_progress, completed, cancelled)
 * @param {Object} req.user - Usuario autenticado que cambia el estado
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con orden actualizada
 *
 * @example
 * // PATCH /api/v1/orders/64f1a2b3c4d5e6f7g8h9i0j1/status
 * {
 *   "estado": "in_progress"
 * }
 *
 * @throws {ErrorResponse} 400 - ID o estado inválido
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 404 - Orden no encontrada
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { estado: newStatus } = req.body;
  const currentUser = req.user;

  // Validar ID
  if (!validateObjectId(id)) {
    return errorResponse(res, 'ID de orden inválido', HTTP_STATUS.BAD_REQUEST);
  }

  if (!newStatus || !Object.values(ORDER_STATUS).includes(newStatus)) {
    return errorResponse(res, 'Estado de orden inválido', HTTP_STATUS.BAD_REQUEST);
  }

  // Obtener orden actual para comparar
  const currentOrder = await orderService.getById(id);
  const previousStatus = currentOrder.estado;

  // Cambiar estado usando el servicio
  const order = await orderService.changeStatus(id, newStatus, currentUser._id);

  // Notificar cambio de estado
  await notificationService.notifyOrderStatusChanged(order, previousStatus, newStatus, currentUser);

  logger.info(`Estado de orden ${order.numeroOrden}: ${previousStatus}  ${newStatus} por ${currentUser.nombre}`);

  successResponse(res, 'Estado de orden actualizado exitosamente', order);
});

/**
 * Asigna usuarios a una orden de trabajo
 * @function assignUsers
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la orden
 * @param {Object} req.body - Datos de asignación
 * @param {string[]} req.body.userIds - Array de IDs de usuarios a asignar
 * @param {string} [req.body.supervisorId] - ID del supervisor
 * @param {Object} req.user - Usuario autenticado que realiza la asignación
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con orden actualizada
 *
 * @example
 * // POST /api/v1/orders/64f1a2b3c4d5e6f7g8h9i0j1/assign
 * {
 *   "userIds": ["64f1a2b3c4d5e6f7g8h9i0j2", "64f1a2b3c4d5e6f7g8h9i0j3"],
 *   "supervisorId": "64f1a2b3c4d5e6f7g8h9i0j4"
 * }
 *
 * @throws {ErrorResponse} 400 - IDs inválidos o datos faltantes
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 404 - Orden o usuarios no encontrados
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const assignUsers = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userIds, supervisorId } = req.body;
  const currentUser = req.user;

  // Validar ID
  if (!validateObjectId(id)) {
    return errorResponse(res, 'ID de orden inválido', HTTP_STATUS.BAD_REQUEST);
  }

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return errorResponse(res, 'IDs de usuarios requeridos', HTTP_STATUS.BAD_REQUEST);
  }

  // Validar IDs de usuarios
  for (const userId of userIds) {
    if (!validateObjectId(userId)) {
      return errorResponse(res, `ID de usuario inválido: ${userId}`, HTTP_STATUS.BAD_REQUEST);
    }
  }

  if (supervisorId && !validateObjectId(supervisorId)) {
    return errorResponse(res, 'ID de supervisor inválido', HTTP_STATUS.BAD_REQUEST);
  }

  // Asignar usuarios usando el servicio
  const order = await orderService.assignUsers(id, userIds, supervisorId, currentUser._id);

  // Notificar asignación
  const assignedUsers = await orderService.getInvolvedUsers(userIds);
  await notificationService.notifyOrderAssigned(order, assignedUsers, currentUser);

  logger.info(`Usuarios asignados a orden ${order.numeroOrden} por ${currentUser.nombre}`);

  successResponse(res, 'Usuarios asignados exitosamente', order);
});

/**
 * Obtiene estadísticas generales de órdenes
 * @function getOrderStats
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {string} [req.query.startDate] - Fecha de inicio para filtrar
 * @param {string} [req.query.endDate] - Fecha de fin para filtrar
 * @param {string} [req.query.cliente] - Filtrar por cliente específico
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con estadísticas de órdenes
 *
 * @example
 * // GET /api/v1/orders/stats?startDate=2024-01-01&endDate=2024-12-31
 * {
 *   "success": true,
 *   "message": "Estadísticas de órdenes obtenidas exitosamente",
 *   "data": {
 *     "total": 150,
 *     "porEstado": {
 *       "pending": 20,
 *       "in_progress": 45,
 *       "completed": 80,
 *       "cancelled": 5
 *     },
 *     "porPrioridad": {
 *       "low": 30,
 *       "medium": 60,
 *       "high": 40,
 *       "critical": 20
 *     }
 *   }
 * }
 *
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getOrderStats = asyncHandler(async (req, res) => {
  const { startDate, endDate, cliente } = req.query;

  // Construir filtros
  const filters = {};
  if (startDate || endDate) {
    filters.fechaInicioEstimada = {};
    if (startDate) filters.fechaInicioEstimada.$gte = new Date(startDate);
    if (endDate) filters.fechaInicioEstimada.$lte = new Date(endDate);
  }
  if (cliente) filters.clienteNombre = cliente;

  const stats = await orderService.getStats(filters);

  successResponse(res, 'Estadísticas de órdenes obtenidas exitosamente', stats);
});

/**
 * Archiva una orden de trabajo
 * @function archiveOrder
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la orden a archivar
 * @param {Object} req.user - Usuario autenticado que archiva la orden
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con orden archivada
 *
 * @example
 * // PATCH /api/v1/orders/64f1a2b3c4d5e6f7g8h9i0j1/archive
 * {
 *   "success": true,
 *   "message": "Orden archivada exitosamente"
 * }
 *
 * @throws {ErrorResponse} 400 - ID inválido
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes (solo admin)
 * @throws {ErrorResponse} 404 - Orden no encontrada
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const archiveOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Validar ID
  if (!validateObjectId(id)) {
    return errorResponse(res, 'ID de orden inválido', HTTP_STATUS.BAD_REQUEST);
  }

  // Archivar orden (usar update con isArchived: true)
  const order = await orderService.update(id, { isArchived: true }, currentUser._id);

  logger.info(`Orden archivada: ${order.numeroOrden} por ${currentUser.nombre}`);

  successResponse(res, 'Orden archivada exitosamente', order);
});

/**
 * Obtiene el progreso de una orden específica
 * @function getOrderProgress
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID de la orden
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con progreso de la orden
 *
 * @example
 * // GET /api/v1/orders/64f1a2b3c4d5e6f7g8h9i0j1/progress
 * {
 *   "success": true,
 *   "message": "Progreso de orden obtenido exitosamente",
 *   "data": {
 *     "progress": 75
 *   }
 * }
 *
 * @throws {ErrorResponse} 400 - ID inválido
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 404 - Orden no encontrada
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getOrderProgress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Validar ID
  if (!validateObjectId(id)) {
    return errorResponse(res, 'ID de orden inválido', HTTP_STATUS.BAD_REQUEST);
  }

  const progress = await orderService.calculateProgress(id);

  successResponse(res, 'Progreso de orden obtenido exitosamente', { progress });
});

/**
 * Obtiene órdenes próximas a vencer
 * @function getUpcomingDeadlines
 * @memberof module:OrdersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {number} [req.query.days=7] - Días hacia adelante para buscar (1-90)
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con órdenes próximas a vencer
 *
 * @example
 * // GET /api/v1/orders/upcoming-deadlines?days=14
 * {
 *   "success": true,
 *   "message": "Órdenes próximas a vencer obtenidas exitosamente",
 *   "data": [
 *     {
 *       "numeroOrden": "ORD-2024-001",
 *       "titulo": "Mantenimiento transformador",
 *       "fechaProgramada": "2024-12-15",
 *       "diasRestantes": 3
 *     }
 *   ]
 * }
 *
 * @throws {ErrorResponse} 400 - Parámetro days inválido
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getUpcomingDeadlines = asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;

  const daysAhead = parseInt(days);
  if (isNaN(daysAhead) || daysAhead < 1 || daysAhead > 90) {
    return errorResponse(res, 'Días debe ser un número entre 1 y 90', HTTP_STATUS.BAD_REQUEST);
  }

  const orders = await orderService.getUpcomingDeadlines(daysAhead);

  successResponse(res, 'Órdenes próximas a vencer obtenidas exitosamente', orders);
});
