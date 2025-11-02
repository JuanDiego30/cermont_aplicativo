/**
 * @module UsersController
 * @description Controlador para la gestión de usuarios en el sistema CERMONT ATG
 *
 * Este módulo maneja todas las operaciones CRUD relacionadas con usuarios,
 * incluyendo gestión de roles, permisos, y operaciones administrativas.
 *
 * @requires ../utils/response - Utilidades para respuestas HTTP estandarizadas
 * @requires ../utils/asyncHandler - Wrapper para manejo de errores asíncronos
 * @requires ../utils/logger - Sistema de logging de la aplicación
 * @requires ../utils/constants - Constantes del sistema incluyendo roles
 * @requires ../services/user.service - Servicio de lógica de negocio para usuarios
 * @requires ../services/notification.service - Servicio de notificaciones
 *
 * @example
 * // Uso típico en rutas
 * import { getAllUsers, createUser, updateUser } from './controllers/users.controller.js';
 * router.get('/users', authMiddleware, rbacMiddleware(['admin']), getAllUsers);
 */

import { successResponse, errorResponse, createdResponse, HTTP_STATUS } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { logger } from '../utils/logger.js';
import { ROLES } from '../utils/constants.js';
import userService from '../services/user.service.js';
import notificationService from '../services/notification.service.js';

/**
 * Obtiene todos los usuarios con paginación y filtros
 * @function getAllUsers
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {string} [req.query.cursor] - Cursor para paginación cursor-based
 * @param {number} [req.query.page] - Página para paginación offset-based
 * @param {number} [req.query.limit=20] - Número de usuarios por página (máx 100)
 * @param {string} [req.query.rol] - Filtrar por rol específico
 * @param {boolean} [req.query.activo] - Filtrar por estado activo/inactivo
 * @param {string} [req.query.search] - Búsqueda por nombre, email o cédula
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con lista paginada de usuarios
 *
 * @example
 * // GET /api/v1/users?page=1&limit=10&rol=engineer&activo=true
 * {
 *   "success": true,
 *   "message": "Usuarios obtenidos exitosamente",
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
 * @throws {ErrorResponse} 403 - Permisos insuficientes
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    cursor,
    page,
    limit = 20,
    rol,
    activo,
    search
  } = req.query;

  // Construir filtros
  const filters = {};

  if (rol) filters.rol = rol;
  if (activo !== undefined) filters.activo = activo === 'true';

  // Búsqueda por texto
  if (search) {
    filters.$or = [
      { nombre: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { cedula: new RegExp(search, 'i') }
    ];
  }

  // Usar el servicio para obtener usuarios
  const result = await userService.list(filters, {
    cursor,
    page,
    limit,
    sort: { createdAt: -1 }
  });

  successResponse(res, 'Usuarios obtenidos exitosamente', result.docs, HTTP_STATUS.OK, {
    pagination: result.pagination
  });
});

/**
 * Obtiene un usuario específico por su ID
 * @function getUserById
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del usuario a obtener
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con datos del usuario
 *
 * @example
 * // GET /api/v1/users/64f1a2b3c4d5e6f7g8h9i0j1
 * {
 *   "success": true,
 *   "message": "Usuario obtenido exitosamente",
 *   "data": {
 *     "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
 *     "nombre": "Juan Pérez",
 *     "email": "juan.perez@cermont.com",
 *     "rol": "engineer",
 *     "activo": true
 *   }
 * }
 *
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes
 * @throws {ErrorResponse} 404 - Usuario no encontrado
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await userService.getById(id);

  successResponse(res, 'Usuario obtenido exitosamente', user);
});

/**
 * Crea un nuevo usuario en el sistema
 * @function createUser
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.body - Datos del nuevo usuario
 * @param {string} req.body.nombre - Nombre completo del usuario
 * @param {string} req.body.email - Email único del usuario
 * @param {string} req.body.password - Contraseña (mín 8 caracteres)
 * @param {string} req.body.rol - Rol del usuario
 * @param {string} [req.body.cedula] - Cédula de ciudadanía
 * @param {string} [req.body.telefono] - Número de teléfono
 * @param {string} [req.body.cargo] - Cargo en la empresa
 * @param {Object} req.user - Usuario autenticado que realiza la creación
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con usuario creado
 *
 * @example
 * // POST /api/v1/users
 * {
 *   "nombre": "María González",
 *   "email": "maria.gonzalez@cermont.com",
 *   "password": "SecurePass123!",
 *   "rol": "technician",
 *   "cedula": "1234567890",
 *   "telefono": "+573001234567",
 *   "cargo": "Técnico Electricista"
 * }
 *
 * @throws {ErrorResponse} 400 - Datos inválidos
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes (solo admin)
 * @throws {ErrorResponse} 409 - Email ya existe
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const createUser = asyncHandler(async (req, res) => {
  const userData = req.body;
  const createdBy = req.user; // Usuario que crea

  // Crear usuario usando el servicio
  const user = await userService.create(userData);

  // Notificar creación
  await notificationService.notifyUserCreated(user, createdBy);

  logger.info(`Usuario creado: ${user.email} por ${createdBy.nombre}`);

  createdResponse(res, 'Usuario creado exitosamente', user);
});

/**
 * Actualiza los datos de un usuario existente
 * @function updateUser
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del usuario a actualizar
 * @param {Object} req.body - Datos a actualizar
 * @param {string} [req.body.nombre] - Nuevo nombre
 * @param {string} [req.body.email] - Nuevo email
 * @param {string} [req.body.telefono] - Nuevo teléfono
 * @param {string} [req.body.cargo] - Nuevo cargo
 * @param {Object} req.user - Usuario autenticado que realiza la actualización
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con usuario actualizado
 *
 * @example
 * // PUT /api/v1/users/64f1a2b3c4d5e6f7g8h9i0j1
 * {
 *   "telefono": "+573007654321",
 *   "cargo": "Supervisor Senior"
 * }
 *
 * @throws {ErrorResponse} 400 - Datos inválidos
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes
 * @throws {ErrorResponse} 404 - Usuario no encontrado
 * @throws {ErrorResponse} 409 - Email ya existe
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const currentUser = req.user;

  // Verificar permisos (admin puede actualizar cualquier usuario, usuario solo sí mismo)
  if (currentUser.rol !== ROLES.ADMIN && currentUser._id.toString() !== id) {
    return errorResponse(res, 'No tienes permisos para actualizar este usuario', HTTP_STATUS.FORBIDDEN);
  }

  // Actualizar usuario usando el servicio
  const user = await userService.update(id, updateData, currentUser._id);

  logger.info(`Usuario actualizado: ${user.email} por ${currentUser.nombre}`);

  successResponse(res, 'Usuario actualizado exitosamente', user);
});

/**
 * Elimina un usuario del sistema (soft delete)
 * @function deleteUser
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del usuario a eliminar
 * @param {Object} req.user - Usuario autenticado que realiza la eliminación
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON confirmando eliminación
 *
 * @example
 * // DELETE /api/v1/users/64f1a2b3c4d5e6f7g8h9i0j1
 * {
 *   "success": true,
 *   "message": "Usuario eliminado exitosamente"
 * }
 *
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes (solo admin)
 * @throws {ErrorResponse} 404 - Usuario no encontrado
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Eliminar usuario usando el servicio
  const user = await userService.delete(id, currentUser._id);

  logger.info(`Usuario eliminado: ${user.email} por ${currentUser.nombre}`);

  successResponse(res, 'Usuario eliminado exitosamente', user);
});

/**
 * Activa o desactiva un usuario en el sistema
 * @function toggleUserActive
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del usuario a activar/desactivar
 * @param {Object} req.user - Usuario autenticado que realiza la acción
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con usuario actualizado
 *
 * @example
 * // PATCH /api/v1/users/64f1a2b3c4d5e6f7g8h9i0j1/toggle-active
 * {
 *   "success": true,
 *   "message": "Usuario activado exitosamente",
 *   "data": { "activo": true, ... }
 * }
 *
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes (solo admin)
 * @throws {ErrorResponse} 404 - Usuario no encontrado
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const toggleUserActive = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;

  // Obtener usuario actual
  const user = await userService.getById(id);

  // Cambiar estado activo usando el servicio de actualización
  const updateData = { activo: !user.activo };
  const updatedUser = await userService.update(id, updateData, currentUser._id);

  const action = updatedUser.activo ? 'activado' : 'desactivado';
  logger.info(`Usuario ${action}: ${updatedUser.email} por ${currentUser.nombre}`);

  successResponse(res, `Usuario ${action} exitosamente`, updatedUser);
});

/**
 * Cambia la contraseña de un usuario
 * @function changeUserPassword
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.id - ID del usuario
 * @param {Object} req.body - Datos de cambio de contraseña
 * @param {string} [req.body.currentPassword] - Contraseña actual (requerida para no-admin)
 * @param {string} req.body.newPassword - Nueva contraseña
 * @param {Object} req.user - Usuario autenticado que realiza el cambio
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON confirmando cambio
 *
 * @example
 * // PATCH /api/v1/users/64f1a2b3c4d5e6f7g8h9i0j1/change-password
 * {
 *   "currentPassword": "OldPass123!",
 *   "newPassword": "NewSecurePass456!"
 * }
 *
 * @throws {ErrorResponse} 400 - Datos inválidos o contraseña actual incorrecta
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes
 * @throws {ErrorResponse} 404 - Usuario no encontrado
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const changeUserPassword = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  const currentUser = req.user;

  // Verificar permisos (admin puede cambiar cualquier contraseña, usuario solo la suya)
  if (currentUser.rol !== ROLES.ADMIN && currentUser._id.toString() !== id) {
    return errorResponse(res, 'No tienes permisos para cambiar esta contraseña', HTTP_STATUS.FORBIDDEN);
  }

  // Para usuarios no admin, requieren contraseña actual
  const requireCurrentPassword = currentUser.rol !== ROLES.ADMIN;

  if (requireCurrentPassword && !currentPassword) {
    return errorResponse(res, 'Contraseña actual requerida', HTTP_STATUS.BAD_REQUEST);
  }

  // Cambiar contraseña usando el servicio
  await userService.changePassword(
    id,
    requireCurrentPassword ? currentPassword : null,
    newPassword
  );

  // Notificar cambio de contraseña
  const user = await userService.getById(id);
  await notificationService.notifyPasswordChanged(user);

  logger.info(`Contraseña cambiada para usuario: ${user.email} por ${currentUser.nombre}`);

  successResponse(res, 'Contraseña cambiada exitosamente');
});

/**
 * Obtiene usuarios filtrados por rol específico
 * @function getUsersByRole
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.params - Parámetros de ruta
 * @param {string} req.params.role - Rol para filtrar usuarios
 * @param {Object} req.query - Parámetros de consulta
 * @param {boolean} [req.query.activo=true] - Filtrar solo usuarios activos
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con usuarios del rol especificado
 *
 * @example
 * // GET /api/v1/users/role/engineer?activo=true
 * {
 *   "success": true,
 *   "message": "Usuarios con rol engineer obtenidos exitosamente",
 *   "data": [...]
 * }
 *
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getUsersByRole = asyncHandler(async (req, res) => {
  const { role } = req.params;
  const { activo = true } = req.query;

  // Usar el servicio para filtrar por rol
  const result = await userService.list(
    { rol: role, activo: activo === 'true' },
    { limit: 1000, sort: { nombre: 1 } }
  );

  successResponse(res, `Usuarios con rol ${role} obtenidos exitosamente`, result);
});

/**
 * Obtiene estadísticas generales de usuarios
 * @function getUserStats
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con estadísticas de usuarios
 *
 * @example
 * // GET /api/v1/users/stats
 * {
 *   "success": true,
 *   "message": "Estadísticas de usuarios obtenidas exitosamente",
 *   "data": {
 *     "total": 150,
 *     "activos": 142,
 *     "inactivos": 8,
 *     "porRol": {
 *       "admin": 5,
 *       "engineer": 25,
 *       "technician": 89,
 *       "client": 31
 *     }
 *   }
 * }
 *
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes (solo admin)
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getStats();

  successResponse(res, 'Estadísticas de usuarios obtenidas exitosamente', stats);
});

/**
 * Busca usuarios por término de búsqueda
 * @function searchUsers
 * @memberof module:UsersController
 *
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} req.query - Parámetros de consulta
 * @param {string} req.query.q - Término de búsqueda (mín 2 caracteres)
 * @param {number} [req.query.limit=10] - Número máximo de resultados
 * @param {Object} res - Objeto de respuesta Express
 *
 * @returns {Promise<void>} Respuesta JSON con resultados de búsqueda
 *
 * @example
 * // GET /api/v1/users/search?q=gonzalez&limit=5
 * {
 *   "success": true,
 *   "message": "Búsqueda de usuarios completada",
 *   "data": [...]
 * }
 *
 * @throws {ErrorResponse} 400 - Término de búsqueda inválido
 * @throws {ErrorResponse} 401 - No autorizado
 * @throws {ErrorResponse} 403 - Permisos insuficientes
 * @throws {ErrorResponse} 500 - Error interno del servidor
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const { q: searchTerm, limit = 10 } = req.query;

  if (!searchTerm || searchTerm.length < 2) {
    return errorResponse(res, 'Término de búsqueda requerido (mínimo 2 caracteres)', HTTP_STATUS.BAD_REQUEST);
  }

  // Usar el servicio con filtros de búsqueda
  const filters = {
    $or: [
      { nombre: new RegExp(searchTerm, 'i') },
      { email: new RegExp(searchTerm, 'i') },
      { cedula: new RegExp(searchTerm, 'i') }
    ],
    activo: true
  };

  const result = await userService.list(filters, {
    limit: parseInt(limit),
    sort: { nombre: 1 }
  });

  successResponse(res, 'Búsqueda de usuarios completada', result);
});
