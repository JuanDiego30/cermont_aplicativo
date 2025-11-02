/**
 * Orders Routes
 * @description Rutas para gestión de órdenes de trabajo
 */

import { Router } from 'express';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  addNote,
  updateOrderStatus,
  assignUsers,
  getOrderStats,
  archiveOrder,
} from '../controllers/orders.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireMinRole, requireAdmin } from '../middleware/rbac.js';
import { validateObjectId } from '../middleware/validate.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
// ✅ AGREGAR: Importar auditLogger
import { auditLogger } from '../middleware/auditLogger.js';
import { cacheMiddleware, invalidateCache, invalidateCacheById } from '../middleware/cacheMiddleware.js';

const router = Router();

/**
 * Todas las rutas requieren autenticación
 */
router.use(authenticate);

/**
 * @swagger
 * /api/v1/orders/stats:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener estadísticas de órdenes
 *     description: Devuelve estadísticas generales del sistema de órdenes de trabajo
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estadísticas obtenidas exitosamente"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalOrders:
 *                       type: integer
 *                       description: Total de órdenes registradas
 *                       example: 250
 *                     activeOrders:
 *                       type: integer
 *                       description: Órdenes activas
 *                       example: 45
 *                     completedOrders:
 *                       type: integer
 *                       description: Órdenes completadas
 *                       example: 180
 *                     cancelledOrders:
 *                       type: integer
 *                       description: Órdenes canceladas
 *                       example: 25
 *                     ordersByStatus:
 *                       type: object
 *                       description: Conteo de órdenes por estado
 *                       properties:
 *                         pending:
 *                           type: integer
 *                           example: 15
 *                         in_progress:
 *                           type: integer
 *                           example: 30
 *                         completed:
 *                           type: integer
 *                           example: 180
 *                         cancelled:
 *                           type: integer
 *                           example: 25
 *                     ordersByPriority:
 *                       type: object
 *                       description: Conteo de órdenes por prioridad
 *                       properties:
 *                         low:
 *                           type: integer
 *                           example: 50
 *                         medium:
 *                           type: integer
 *                           example: 120
 *                         high:
 *                           type: integer
 *                           example: 60
 *                         critical:
 *                           type: integer
 *                           example: 20
 *                     recentActivity:
 *                       type: integer
 *                       description: Órdenes con actividad en los últimos 7 días
 *                       example: 35
 *                     averageCompletionTime:
 *                       type: number
 *                       description: Tiempo promedio de completación en días
 *                       example: 12.5
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No tiene permisos suficientes (requiere engineer o superior)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   GET /api/v1/orders/stats
 * @desc    Obtener estadísticas de órdenes
 * @access  Private (Admin, Engineer)
 */
router.get(
  '/stats',
  requireMinRole('engineer'),
  getOrderStats
);

/**
 * @swagger
 * /api/v1/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener todas las órdenes
 *     description: Devuelve una lista paginada de órdenes de trabajo con filtros avanzados
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *         example: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [numeroOrden, titulo, prioridad, estado, fechaCreacion, fechaActualizacion]
 *           default: fechaCreacion
 *         description: Campo por el cual ordenar
 *         example: "prioridad"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Dirección del ordenamiento
 *         example: "desc"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (número de orden, título, descripción)
 *         example: "Mantenimiento transformador"
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *         description: Filtrar por estado de la orden
 *         example: "in_progress"
 *       - in: query
 *         name: prioridad
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filtrar por prioridad
 *         example: "high"
 *       - in: query
 *         name: cliente
 *         schema:
 *           type: string
 *         description: Filtrar por cliente
 *         example: "Empresa ABC"
 *       - in: query
 *         name: ubicacion
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación
 *         example: "Bogotá"
 *       - in: query
 *         name: asignadoA
 *         schema:
 *           type: string
 *           format: objectId
 *         description: Filtrar por usuario asignado
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar órdenes desde esta fecha
 *         example: "2023-01-01"
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtrar órdenes hasta esta fecha
 *         example: "2023-12-31"
 *     responses:
 *       200:
 *         description: Órdenes obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Order'
 *       400:
 *         description: Parámetros de consulta inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   GET /api/v1/orders
 * @desc    Obtener todas las órdenes con filtros
 * @access  Private
 */
router.get(
  '/',
  cacheMiddleware(60), // ✅ AGREGAR: Cache 1 minuto
  getAllOrders
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Obtener orden por ID
 *     description: Devuelve la información completa de una orden de trabajo específica
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único de la orden
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Orden obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orden obtenida exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: ID de orden inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   GET /api/v1/orders/:id
 * @desc    Obtener orden por ID
 * @access  Private
 */
router.get(
  '/:id',
  validateObjectId('id'),
  cacheMiddleware(180), // ✅ AGREGAR: Cache 3 minutos
  getOrderById
);

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Crear nueva orden de trabajo
 *     description: Crea una nueva orden de trabajo en el sistema CERMONT ATG
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - descripcion
 *               - cliente
 *               - ubicacion
 *               - prioridad
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Título descriptivo de la orden
 *                 example: "Mantenimiento preventivo transformador T-001"
 *               descripcion:
 *                 type: string
 *                 minLength: 10
 *                 description: Descripción detallada del trabajo a realizar
 *                 example: "Realizar mantenimiento preventivo completo del transformador T-001 incluyendo revisión de bornes, limpieza, pruebas eléctricas y lubricación de partes móviles."
 *               cliente:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre del cliente o empresa
 *                 example: "Empresa Eléctrica de Bogotá"
 *               ubicacion:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Ubicación donde se realizará el trabajo
 *                 example: "Subestación Norte - Carrera 7 #23-45, Bogotá"
 *               prioridad:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Nivel de prioridad de la orden
 *                 example: "high"
 *               tipoTrabajo:
 *                 type: string
 *                 description: Tipo específico de trabajo
 *                 example: "Mantenimiento preventivo"
 *               equipo:
 *                 type: string
 *                 description: Equipo o instalación objeto del trabajo
 *                 example: "Transformador T-001 1000KVA"
 *               fechaProgramada:
 *                 type: string
 *                 format: date
 *                 description: Fecha programada para ejecutar el trabajo
 *                 example: "2023-12-15"
 *               horasEstimadas:
 *                 type: number
 *                 minimum: 0.5
 *                 description: Horas estimadas para completar el trabajo
 *                 example: 8
 *               costoEstimado:
 *                 type: number
 *                 minimum: 0
 *                 description: Costo estimado del trabajo
 *                 example: 2500000
 *               materiales:
 *                 type: array
 *                 description: Lista de materiales requeridos
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Aceite dieléctrico"
 *                     cantidad:
 *                       type: number
 *                       example: 200
 *                     unidad:
 *                       type: string
 *                       example: "litros"
 *               documentos:
 *                 type: array
 *                 description: Documentos adjuntos o referencias
 *                 items:
 *                   type: string
 *                   example: "Especificaciones técnicas T-001.pdf"
 *               notas:
 *                 type: string
 *                 description: Notas adicionales
 *                 example: "Coordinar con supervisor de turno"
 *           example:
 *             titulo: "Mantenimiento preventivo transformador T-001"
 *             descripcion: "Realizar mantenimiento preventivo completo del transformador T-001 incluyendo revisión de bornes, limpieza, pruebas eléctricas y lubricación de partes móviles."
 *             cliente: "Empresa Eléctrica de Bogotá"
 *             ubicacion: "Subestación Norte - Carrera 7 #23-45, Bogotá"
 *             prioridad: "high"
 *             tipoTrabajo: "Mantenimiento preventivo"
 *             equipo: "Transformador T-001 1000KVA"
 *             fechaProgramada: "2023-12-15"
 *             horasEstimadas: 8
 *             costoEstimado: 2500000
 *             materiales: [
 *               {
 *                 nombre: "Aceite dieléctrico",
 *                 cantidad: 200,
 *                 unidad: "litros"
 *               }
 *             ]
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orden creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No tiene permisos para crear órdenes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Demasiadas solicitudes de creación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/orders
 * @desc    Crear nueva orden
 * @access  Private (Admin, Engineer)
 */
router.post(
  '/',
  requireMinRole('engineer'),
  createRateLimiter,
  invalidateCache('route:*/api/orders*'), // ✅ AGREGAR
  auditLogger('CREATE', 'Order'), // ✅ AGREGAR
  createOrder
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   put:
 *     tags: [Orders]
 *     summary: Actualizar orden de trabajo
 *     description: Actualiza la información de una orden de trabajo existente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único de la orden a actualizar
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Título descriptivo de la orden
 *                 example: "Mantenimiento preventivo transformador T-001 (Actualizado)"
 *               descripcion:
 *                 type: string
 *                 minLength: 10
 *                 description: Descripción detallada del trabajo
 *                 example: "Actualización: Realizar mantenimiento preventivo completo incluyendo pruebas adicionales de aislamiento."
 *               cliente:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre del cliente
 *                 example: "Empresa Eléctrica de Bogotá S.A. ESP"
 *               ubicacion:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *                 description: Ubicación del trabajo
 *                 example: "Subestación Norte - Carrera 7 #23-45, Bogotá D.C."
 *               prioridad:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Nivel de prioridad
 *                 example: "critical"
 *               tipoTrabajo:
 *                 type: string
 *                 description: Tipo de trabajo
 *                 example: "Mantenimiento preventivo urgente"
 *               equipo:
 *                 type: string
 *                 description: Equipo objeto del trabajo
 *                 example: "Transformador T-001 1000KVA - Serie XYZ"
 *               fechaProgramada:
 *                 type: string
 *                 format: date
 *                 description: Nueva fecha programada
 *                 example: "2023-12-10"
 *               horasEstimadas:
 *                 type: number
 *                 minimum: 0.5
 *                 description: Horas estimadas actualizadas
 *                 example: 12
 *               costoEstimado:
 *                 type: number
 *                 minimum: 0
 *                 description: Costo estimado actualizado
 *                 example: 3200000
 *               materiales:
 *                 type: array
 *                 description: Lista actualizada de materiales
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Aceite dieléctrico premium"
 *                     cantidad:
 *                       type: number
 *                       example: 250
 *                     unidad:
 *                       type: string
 *                       example: "litros"
 *               documentos:
 *                 type: array
 *                 description: Documentos actualizados
 *                 items:
 *                   type: string
 *                   example: "Especificaciones técnicas actualizadas T-001.pdf"
 *               notas:
 *                 type: string
 *                 description: Notas adicionales actualizadas
 *                 example: "Coordinar con supervisor y equipo de emergencias"
 *           example:
 *             titulo: "Mantenimiento preventivo transformador T-001 (Actualizado)"
 *             descripcion: "Actualización: Realizar mantenimiento preventivo completo incluyendo pruebas adicionales de aislamiento."
 *             prioridad: "critical"
 *             fechaProgramada: "2023-12-10"
 *             horasEstimadas: 12
 *             costoEstimado: 3200000
 *     responses:
 *       200:
 *         description: Orden actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orden actualizada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No tiene permisos para actualizar órdenes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   PUT /api/v1/orders/:id
 * @desc    Actualizar orden
 * @access  Private (Admin, Engineer, Supervisor)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  invalidateCacheById('orders'), // ✅ AGREGAR
  auditLogger('UPDATE', 'Order'), // ✅ AGREGAR
  updateOrder
);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   delete:
 *     tags: [Orders]
 *     summary: Eliminar orden de trabajo
 *     description: Realiza un soft delete de la orden de trabajo (solo administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único de la orden a eliminar
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Orden eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orden eliminada exitosamente"
 *       400:
 *         description: ID de orden inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No tiene permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: No se puede eliminar la orden (tiene dependencias o está en progreso)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   DELETE /api/v1/orders/:id
 * @desc    Eliminar orden (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  requireAdmin,
  auditLogger('DELETE', 'Order'), // ✅ AGREGAR
  deleteOrder
);

/**
 * @swagger
 * /api/v1/orders/{id}/notes:
 *   post:
 *     tags: [Orders]
 *     summary: Agregar nota a orden
 *     description: Agrega una nueva nota o comentario a una orden de trabajo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único de la orden
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - contenido
 *             properties:
 *               contenido:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 description: Contenido de la nota
 *                 example: "Se identificó una anomalía en el sistema de enfriamiento que requiere atención inmediata."
 *               tipo:
 *                 type: string
 *                 enum: [general, tecnico, administrativo, urgente]
 *                 description: Tipo de nota
 *                 example: "tecnico"
 *               visibilidad:
 *                 type: string
 *                 enum: [public, private, team]
 *                 description: Nivel de visibilidad de la nota
 *                 example: "team"
 *           example:
 *             contenido: "Se identificó una anomalía en el sistema de enfriamiento que requiere atención inmediata."
 *             tipo: "tecnico"
 *             visibilidad: "team"
 *     responses:
 *       200:
 *         description: Nota agregada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Nota agregada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/orders/:id/notes
 * @desc    Agregar nota a orden
 * @access  Private
 */
router.post(
  '/:id/notes',
  validateObjectId('id'),
  addNote
);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     tags: [Orders]
 *     summary: Actualizar estado de orden
 *     description: Cambia el estado de una orden de trabajo (requiere supervisor o superior)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único de la orden
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *                 description: Nuevo estado de la orden
 *                 example: "in_progress"
 *               comentario:
 *                 type: string
 *                 description: Comentario opcional sobre el cambio de estado
 *                 example: "Iniciando trabajos de mantenimiento según programación"
 *               fechaInicio:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio real del trabajo (para estado in_progress)
 *                 example: "2023-12-15T08:00:00Z"
 *               fechaFin:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de finalización real del trabajo (para estado completed)
 *                 example: "2023-12-15T16:00:00Z"
 *           example:
 *             estado: "in_progress"
 *             comentario: "Iniciando trabajos de mantenimiento según programación"
 *             fechaInicio: "2023-12-15T08:00:00Z"
 *     responses:
 *       200:
 *         description: Estado de orden actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Estado de orden actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Estado inválido o transición no permitida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No tiene permisos para cambiar estados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Transición de estado no permitida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   PATCH /api/v1/orders/:id/status
 * @desc    Actualizar estado de orden
 * @access  Private (Supervisor or above)
 */
router.patch(
  '/:id/status',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  updateOrderStatus
);

/**
 * @swagger
 * /api/v1/orders/{id}/assign:
 *   post:
 *     tags: [Orders]
 *     summary: Asignar usuarios a orden
 *     description: Asigna o reasigna usuarios a una orden de trabajo
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único de la orden
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuarios
 *             properties:
 *               usuarios:
 *                 type: array
 *                 minItems: 1
 *                 description: Lista de IDs de usuarios a asignar
 *                 items:
 *                   type: string
 *                   format: objectId
 *                   example: "507f1f77bcf86cd799439012"
 *               roles:
 *                 type: object
 *                 description: Roles específicos para cada usuario en la orden
 *                 properties:
 *                   supervisor:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: objectId
 *                     example: ["507f1f77bcf86cd799439012"]
 *                   tecnico:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: objectId
 *                     example: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *                   coordinador:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: objectId
 *                     example: ["507f1f77bcf86cd799439015"]
 *               comentario:
 *                 type: string
 *                 description: Comentario sobre la asignación
 *                 example: "Equipo asignado según disponibilidad y especialización"
 *           example:
 *             usuarios: ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *             roles: {
 *               supervisor: ["507f1f77bcf86cd799439012"],
 *               tecnico: ["507f1f77bcf86cd799439013", "507f1f77bcf86cd799439014"]
 *             }
 *             comentario: "Equipo asignado según disponibilidad y especialización"
 *     responses:
 *       200:
 *         description: Usuarios asignados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuarios asignados exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Datos de entrada inválidos o usuarios no encontrados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No tiene permisos para asignar usuarios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Algunos usuarios ya están asignados a otras órdenes activas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/orders/:id/assign
 * @desc    Asignar usuarios a orden
 * @access  Private (Admin, Engineer, Supervisor)
 */
router.post(
  '/:id/assign',
  validateObjectId('id'),
  requireMinRole('supervisor'),
  assignUsers
);

/**
 * @swagger
 * /api/v1/orders/{id}/archive:
 *   post:
 *     tags: [Orders]
 *     summary: Archivar orden
 *     description: Archiva una orden completada para mantener el historial (solo administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único de la orden a archivar
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comentario:
 *                 type: string
 *                 description: Comentario sobre el archivado
 *                 example: "Orden completada exitosamente según especificaciones"
 *               calificacion:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Calificación del trabajo realizado (1-5)
 *                 example: 5
 *           example:
 *             comentario: "Orden completada exitosamente según especificaciones"
 *             calificacion: 5
 *     responses:
 *       200:
 *         description: Orden archivada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Orden archivada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/Order'
 *       400:
 *         description: Orden no puede ser archivada (no está completada)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No tiene permisos de administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Orden no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   POST /api/v1/orders/:id/archive
 * @desc    Archivar orden
 * @access  Private (Admin only)
 */
router.post(
  '/:id/archive',
  validateObjectId('id'),
  requireAdmin,
  archiveOrder
);

export default router;
