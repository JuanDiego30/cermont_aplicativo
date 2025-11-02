/**
 * Users Routes
 * @description Rutas para gestión de usuarios
 */

import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  getUsersByRole,
  getUserStats,
} from '../controllers/users.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin, requireMinRole, canModifyRole } from '../middleware/rbac.js';
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
 * /api/v1/users/stats/summary:
 *   get:
 *     tags: [Users]
 *     summary: Obtener estadísticas de usuarios
 *     description: Devuelve estadísticas generales del sistema de usuarios (solo administradores)
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
 *                     totalUsers:
 *                       type: integer
 *                       description: Total de usuarios registrados
 *                       example: 150
 *                     activeUsers:
 *                       type: integer
 *                       description: Usuarios activos
 *                       example: 142
 *                     inactiveUsers:
 *                       type: integer
 *                       description: Usuarios inactivos
 *                       example: 8
 *                     usersByRole:
 *                       type: object
 *                       description: Conteo de usuarios por rol
 *                       properties:
 *                         root:
 *                           type: integer
 *                           example: 1
 *                         admin:
 *                           type: integer
 *                           example: 3
 *                         coordinator_hes:
 *                           type: integer
 *                           example: 5
 *                         engineer:
 *                           type: integer
 *                           example: 45
 *                         supervisor:
 *                           type: integer
 *                           example: 25
 *                         technician:
 *                           type: integer
 *                           example: 35
 *                         accountant:
 *                           type: integer
 *                           example: 8
 *                         client:
 *                           type: integer
 *                           example: 28
 *                     recentRegistrations:
 *                       type: integer
 *                       description: Nuevos registros en los últimos 30 días
 *                       example: 12
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
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
/**
 * @route   GET /api/v1/users/stats/summary
 * @desc    Obtener estadísticas de usuarios
 * @access  Private (Admin only)
 */
router.get(
  '/stats/summary',
  requireAdmin,
  getUserStats
);

/**
 * @swagger
 * /api/v1/users/role/{rol}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuarios por rol
 *     description: Devuelve una lista paginada de usuarios filtrados por rol específico
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rol
 *         required: true
 *         schema:
 *           type: string
 *           enum: [root, admin, coordinator_hes, engineer, supervisor, technician, accountant, client]
 *         description: Rol de los usuarios a buscar
 *         example: "engineer"
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
 *           enum: [nombre, email, createdAt, updatedAt]
 *           default: createdAt
 *         description: Campo por el cual ordenar
 *         example: "nombre"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Dirección del ordenamiento
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Usuarios obtenidos exitosamente
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
 *                         $ref: '#/components/schemas/User'
 *       400:
 *         description: Parámetros inválidos
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
 * @route   GET /api/v1/users/role/:rol
 * @desc    Obtener usuarios por rol
 * @access  Private
 */
router.get(
  '/role/:rol',
  getUsersByRole
);

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Obtener todos los usuarios
 *     description: Devuelve una lista paginada de todos los usuarios del sistema (requiere rol engineer o superior)
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
 *           enum: [nombre, email, rol, createdAt, updatedAt]
 *           default: createdAt
 *         description: Campo por el cual ordenar
 *         example: "nombre"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Dirección del ordenamiento
 *         example: "asc"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, email, cédula)
 *         example: "Juan Pérez"
 *       - in: query
 *         name: rol
 *         schema:
 *           type: string
 *           enum: [root, admin, coordinator_hes, engineer, supervisor, technician, accountant, client]
 *         description: Filtrar por rol específico
 *         example: "engineer"
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *         example: true
 *     responses:
 *       200:
 *         description: Usuarios obtenidos exitosamente
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
 *                         $ref: '#/components/schemas/User'
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
 *       403:
 *         description: No tiene permisos suficientes
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
 * @route   GET /api/v1/users
 * @desc    Obtener todos los usuarios
 * @access  Private (Admin, Engineer)
 */
router.get(
  '/',
  requireMinRole('engineer'),
  cacheMiddleware(120), // ✅ AGREGAR: Cache 2 minutos
  getAllUsers
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     description: Devuelve la información completa de un usuario específico por su ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único del usuario
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
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
 *                   example: "Usuario obtenido exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: ID de usuario inválido
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
 *         description: No tiene permisos para ver este usuario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
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
 * @route   GET /api/v1/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (Owner or Admin)
 */
router.get(
  '/:id',
  validateObjectId('id'),
  cacheMiddleware(300), // ✅ AGREGAR: Cache 5 minutos
  getUserById
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Users]
 *     summary: Crear nuevo usuario
 *     description: Crea un nuevo usuario en el sistema (solo administradores y root)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - email
 *               - password
 *               - rol
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre completo del usuario
 *                 example: "María González"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico único
 *                 example: "maria.gonzalez@cermont.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Contraseña segura
 *                 example: "SecurePass123!"
 *               rol:
 *                 type: string
 *                 enum: [root, admin, coordinator_hes, engineer, supervisor, technician, accountant, client]
 *                 description: Rol del usuario en el sistema
 *                 example: "supervisor"
 *               telefono:
 *                 type: string
 *                 description: Número de teléfono
 *                 example: "+57 301 234 5678"
 *               cedula:
 *                 type: string
 *                 description: Número de cédula o identificación
 *                 example: "87654321"
 *               cargo:
 *                 type: string
 *                 description: Cargo laboral
 *                 example: "Supervisor de Campo"
 *               especialidad:
 *                 type: string
 *                 description: Especialidad técnica
 *                 example: "Supervisión de Obras"
 *           example:
 *             nombre: "María González"
 *             email: "maria.gonzalez@cermont.com"
 *             password: "SecurePass123!"
 *             rol: "supervisor"
 *             telefono: "+57 301 234 5678"
 *             cedula: "87654321"
 *             cargo: "Supervisor de Campo"
 *             especialidad: "Supervisión de Obras"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
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
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos de entrada inválidos o usuario ya existe
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
 *         description: No tiene permisos para crear usuarios o asignar este rol
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
 * @route   POST /api/v1/users
 * @desc    Crear nuevo usuario
 * @access  Private (Admin, Root)
 */
router.post(
  '/',
  requireAdmin,
  canModifyRole('rol'),
  createRateLimiter,
  invalidateCache('route:*'), // ✅ AGREGAR: Invalidar listas
  auditLogger('CREATE', 'User'), // ✅ AGREGAR
  createUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario existente (usuario propietario o administrador)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único del usuario a actualizar
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nombre completo del usuario
 *                 example: "María González Actualizada"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nuevo correo electrónico (debe ser único)
 *                 example: "maria.gonzalez.nuevo@cermont.com"
 *               rol:
 *                 type: string
 *                 enum: [root, admin, coordinator_hes, engineer, supervisor, technician, accountant, client]
 *                 description: Nuevo rol del usuario (solo administradores pueden cambiar roles)
 *                 example: "coordinator_hes"
 *               telefono:
 *                 type: string
 *                 description: Nuevo número de teléfono
 *                 example: "+57 302 345 6789"
 *               cedula:
 *                 type: string
 *                 description: Nueva cédula o identificación
 *                 example: "87654322"
 *               cargo:
 *                 type: string
 *                 description: Nuevo cargo laboral
 *                 example: "Coordinador HES Senior"
 *               especialidad:
 *                 type: string
 *                 description: Nueva especialidad técnica
 *                 example: "Coordinación HES"
 *               activo:
 *                 type: boolean
 *                 description: Estado activo/inactivo del usuario
 *                 example: true
 *           example:
 *             nombre: "María González Actualizada"
 *             email: "maria.gonzalez.nuevo@cermont.com"
 *             rol: "coordinator_hes"
 *             telefono: "+57 302 345 6789"
 *             cargo: "Coordinador HES Senior"
 *             especialidad: "Coordinación HES"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
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
 *                   example: "Usuario actualizado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
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
 *         description: No tiene permisos para actualizar este usuario o cambiar roles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email ya está en uso por otro usuario
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
 * @route   PUT /api/v1/users/:id
 * @desc    Actualizar usuario
 * @access  Private (Owner or Admin)
 */
router.put(
  '/:id',
  validateObjectId('id'),
  canModifyRole('rol'),
  invalidateCacheById('users'), // ✅ AGREGAR: Invalidar cache del usuario
  auditLogger('UPDATE', 'User'), // ✅ AGREGAR
  updateUser
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     description: Realiza un soft delete del usuario (solo administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único del usuario a eliminar
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
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
 *                   example: "Usuario eliminado exitosamente"
 *       400:
 *         description: ID de usuario inválido
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
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: No se puede eliminar el usuario (tiene dependencias)
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
 * @route   DELETE /api/v1/users/:id
 * @desc    Eliminar usuario (soft delete)
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  validateObjectId('id'),
  requireAdmin,
  invalidateCacheById('users'), // ✅ AGREGAR: Invalidar cache del usuario
  auditLogger('DELETE', 'User'), // ✅ AGREGAR
  deleteUser
);

/**
 * @swagger
 * /api/v1/users/{id}/toggle-active:
 *   patch:
 *     tags: [Users]
 *     summary: Activar/Desactivar usuario
 *     description: Cambia el estado activo/inactivo de un usuario (solo administradores)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: objectId
 *         description: ID único del usuario
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Estado del usuario cambiado exitosamente
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
 *                   example: "Usuario activado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: ID de usuario inválido
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
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: No se puede desactivar el usuario (es el último administrador)
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
 * @route   PATCH /api/v1/users/:id/toggle-active
 * @desc    Activar/Desactivar usuario
 * @access  Private (Admin only)
 */
router.patch(
  '/:id/toggle-active',
  validateObjectId('id'),
  requireAdmin,
  toggleUserActive
);

export default router;
