import User from '../models/User.js';
import { autoPaginate } from '../utils/pagination.js';
import { AppError } from '../utils/errorHandler.js';
import logger from '../utils/logger.js';
import cacheService from './cache.service.js';

/**
 * Servicio de Gestión de Usuarios - CERMONT ATG
 *
 * Esta clase proporciona todas las operaciones de negocio relacionadas con la gestión
 * de usuarios en el sistema CERMONT ATG. Incluye funcionalidades de CRUD, autenticación,
 * validaciones de negocio, cache inteligente y auditoría.
 *
 * Características principales:
 * - Gestión completa del ciclo de vida de usuarios
 * - Validaciones de unicidad (email, cédula)
 * - Cache inteligente con invalidación automática
 * - Soft delete para mantener integridad de datos
 * - Estadísticas y métricas de usuarios
 * - Logging completo de operaciones
 *
 * @class UserService
 * @version 1.0.0
 * @since October 2025
 */
class UserService {
  /**
   * Listar usuarios con filtros y paginación
   *
   * Obtiene una lista paginada de usuarios aplicando filtros avanzados.
   * Utiliza cache inteligente para optimizar performance.
   *
   * @async
   * @param {Object} filters - Filtros a aplicar en la consulta
   * @param {string} filters.search - Término de búsqueda (nombre, email, cédula)
   * @param {string} filters.rol - Filtrar por rol específico
   * @param {boolean} filters.activo - Filtrar por estado activo/inactivo
   * @param {Date} filters.fechaDesde - Filtrar usuarios creados desde esta fecha
   * @param {Date} filters.fechaHasta - Filtrar usuarios creados hasta esta fecha
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @param {number} options.page - Número de página (default: 1)
   * @param {number} options.limit - Elementos por página (default: 10, max: 100)
   * @param {Object} options.sort - Criterios de ordenamiento
   * @returns {Promise<Object>} Resultado paginado con usuarios
   * @returns {Array} return.data - Lista de usuarios
   * @returns {number} return.total - Total de usuarios encontrados
   * @returns {number} return.page - Página actual
   * @returns {number} return.pages - Total de páginas
   * @throws {AppError} Error de base de datos o validación
   *
   * @example
   * // Listar usuarios activos con paginación
   * const result = await userService.list(
   *   { activo: true, rol: 'engineer' },
   *   { page: 1, limit: 20, sort: { nombre: 1 } }
   * );
   */
  async list(filters = {}, options = {}) {
    try {
      const cacheKey = `users:list:${JSON.stringify(filters)}:${JSON.stringify(options)}`;
      
      // Intentar desde cache
      return await cacheService.wrap(
        cacheKey,
        async () => {
          const result = await autoPaginate(User, filters, {
            ...options,
            select: '-password -__v',
            sort: options.sort || { createdAt: -1 }
          });
          
          return result;
        },
        120 // Cache 2 minutos
      );
    } catch (error) {
      logger.error('[UserService] Error listando usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener usuario por ID
   *
   * Recupera la información completa de un usuario específico por su ID único.
   * Utiliza cache para optimizar consultas frecuentes.
   *
   * @async
   * @param {string} userId - ID único del usuario (ObjectId de MongoDB)
   * @returns {Promise<Object>} Información del usuario (sin contraseña)
   * @returns {string} return._id - ID único del usuario
   * @returns {string} return.nombre - Nombre completo del usuario
   * @returns {string} return.email - Correo electrónico del usuario
   * @returns {string} return.rol - Rol del usuario en el sistema
   * @returns {boolean} return.activo - Estado activo del usuario
   * @returns {Date} return.createdAt - Fecha de creación
   * @returns {Date} return.updatedAt - Fecha de última actualización
   * @throws {AppError} USER_NOT_FOUND cuando el usuario no existe
   *
   * @example
   * // Obtener usuario por ID
   * const user = await userService.getById('507f1f77bcf86cd799439011');
   * console.log(user.nombre); // "Juan Pérez"
   */
  async getById(userId) {
    try {
      const cacheKey = `user:${userId}`;
      
      return await cacheService.wrap(
        cacheKey,
        async () => {
          const user = await User.findById(userId)
            .select('-password -__v')
            .lean();
          
          if (!user) {
            throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
          }
          
          return user;
        },
        300 // Cache 5 minutos
      );
    } catch (error) {
      logger.error(`[UserService] Error obteniendo usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener usuario por email
   *
   * Busca un usuario por su dirección de correo electrónico.
   * Incluye la contraseña hasheada para procesos de autenticación.
   * Este método NO utiliza cache por seguridad.
   *
   * @async
   * @param {string} email - Correo electrónico del usuario
   * @returns {Promise<Object>} Usuario completo con contraseña (para autenticación)
   * @throws {AppError} USER_NOT_FOUND cuando el usuario no existe
   *
   * @example
   * // Obtener usuario para login
   * const user = await userService.getByEmail('usuario@cermont.com');
   * const isValidPassword = await user.comparePassword(password);
   */
  async getByEmail(email) {
    try {
      const user = await User.findOne({ email }).select('+password');
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
      }
      
      return user;
    } catch (error) {
      logger.error(`[UserService] Error obteniendo usuario por email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Crear nuevo usuario
   *
   * Crea un nuevo usuario en el sistema aplicando todas las validaciones de negocio.
   * Realiza verificaciones de unicidad para email y cédula, y registra la operación
   * en los logs de auditoría.
   *
   * @async
   * @param {Object} userData - Datos del nuevo usuario
   * @param {string} userData.nombre - Nombre completo (requerido, 2-100 caracteres)
   * @param {string} userData.email - Correo electrónico único (requerido, formato válido)
   * @param {string} userData.password - Contraseña segura (requerido, mínimo 8 caracteres)
   * @param {string} userData.rol - Rol del usuario (requerido, valores permitidos)
   * @param {string} [userData.telefono] - Número de teléfono
   * @param {string} [userData.cedula] - Número de cédula (único si se proporciona)
   * @param {string} [userData.cargo] - Cargo laboral
   * @param {string} [userData.especialidad] - Especialidad técnica
   * @returns {Promise<Object>} Usuario creado (sin contraseña)
   * @throws {AppError} EMAIL_ALREADY_EXISTS cuando el email ya está registrado
   * @throws {AppError} CEDULA_ALREADY_EXISTS cuando la cédula ya está registrada
   * @throws {AppError} Error de validación de datos
   *
   * @example
   * // Crear nuevo ingeniero
   * const newUser = await userService.create({
   *   nombre: "María González",
   *   email: "maria.gonzalez@cermont.com",
   *   password: "SecurePass123!",
   *   rol: "engineer",
   *   telefono: "+57 301 234 5678",
   *   cedula: "87654321",
   *   cargo: "Ingeniero Senior",
   *   especialidad: "Ingeniería Eléctrica"
   * });
   */
  async create(userData) {
    try {
      // Validar que el email no exista
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        throw new AppError(
          'El email ya está registrado',
          409,
          'EMAIL_ALREADY_EXISTS'
        );
      }

      // Validar que la cédula no exista
      if (userData.cedula) {
        const existingCedula = await User.findOne({ cedula: userData.cedula });
        
        if (existingCedula) {
          throw new AppError(
            'La cédula ya está registrada',
            409,
            'CEDULA_ALREADY_EXISTS'
          );
        }
      }

      // Crear usuario
      const user = await User.create(userData);

      // Invalidar cache de listas
      cacheService.delPattern('users:list:*');

      logger.info(`[UserService] Usuario creado: ${user.email}`);

      return user;
    } catch (error) {
      logger.error('[UserService] Error creando usuario:', error);
      throw error;
    }
  }

  /**
   * Actualizar usuario
   *
   * Actualiza la información de un usuario existente aplicando validaciones de negocio.
   * Verifica unicidad de email y cédula si se modifican, y registra la operación
   * en los logs de auditoría.
   *
   * @async
   * @param {string} userId - ID del usuario a actualizar
   * @param {Object} updateData - Datos a actualizar
   * @param {string} [updateData.nombre] - Nuevo nombre completo
   * @param {string} [updateData.email] - Nuevo correo electrónico (debe ser único)
   * @param {string} [updateData.rol] - Nuevo rol del usuario
   * @param {string} [updateData.telefono] - Nuevo número de teléfono
   * @param {string} [updateData.cedula] - Nueva cédula (debe ser única)
   * @param {string} [updateData.cargo] - Nuevo cargo laboral
   * @param {string} [updateData.especialidad] - Nueva especialidad técnica
   * @param {boolean} [updateData.activo] - Nuevo estado activo
   * @returns {Promise<Object>} Usuario actualizado
   * @throws {AppError} USER_NOT_FOUND cuando el usuario no existe
   * @throws {AppError} EMAIL_ALREADY_EXISTS cuando el email ya está en uso
   * @throws {AppError} CEDULA_ALREADY_EXISTS cuando la cédula ya está en uso
   *
   * @example
   * // Actualizar información de contacto
   * const updatedUser = await userService.update('507f1f77bcf86cd799439011', {
   *   telefono: "+57 302 345 6789",
   *   cargo: "Coordinador HES Senior"
   * });
   */
  async update(userId, updateData) {
    try {
      // Verificar que el usuario existe
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
      }

      // Si se actualiza email, verificar que no exista
      if (updateData.email && updateData.email !== user.email) {
        const existingEmail = await User.findOne({ email: updateData.email });
        
        if (existingEmail) {
          throw new AppError(
            'El email ya está registrado',
            409,
            'EMAIL_ALREADY_EXISTS'
          );
        }
      }

      // Si se actualiza cédula, verificar que no exista
      if (updateData.cedula && updateData.cedula !== user.cedula) {
        const existingCedula = await User.findOne({ cedula: updateData.cedula });
        
        if (existingCedula) {
          throw new AppError(
            'La cédula ya está registrada',
            409,
            'CEDULA_ALREADY_EXISTS'
          );
        }
      }

      // No permitir actualizar password directamente (usar changePassword)
      delete updateData.password;

      // Actualizar usuario
      Object.assign(user, updateData);
      await user.save();

      // Invalidar cache
      cacheService.del(`user:${userId}`);
      cacheService.delPattern('users:list:*');

      logger.info(`[UserService] Usuario actualizado: ${userId}`);

      return user;
    } catch (error) {
      logger.error(`[UserService] Error actualizando usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar usuario (soft delete)
   *
   * Realiza un soft delete del usuario cambiando su estado a inactivo.
   * Incluye validaciones de seguridad para evitar eliminar el último administrador.
   * Registra la operación en los logs de auditoría.
   *
   * @async
   * @param {string} userId - ID del usuario a eliminar
   * @returns {Promise<Object>} Usuario desactivado
   * @throws {AppError} USER_NOT_FOUND cuando el usuario no existe
   * @throws {AppError} CANNOT_DELETE_LAST_ADMIN cuando se intenta eliminar el último admin
   *
   * @example
   * // Desactivar usuario
   * const deletedUser = await userService.delete('507f1f77bcf86cd799439011');
   * console.log(deletedUser.activo); // false
   */
  async delete(userId) {
    try {
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
      }

      // Verificar que no sea el último admin
      if (user.rol === 'admin') {
        const adminCount = await User.countDocuments({ rol: 'admin', activo: true });
        
        if (adminCount <= 1) {
          throw new AppError(
            'No se puede eliminar el último administrador',
            400,
            'CANNOT_DELETE_LAST_ADMIN'
          );
        }
      }

      // Soft delete
      user.activo = false;
      await user.save();

      // Invalidar cache
      cacheService.del(`user:${userId}`);
      cacheService.delPattern('users:list:*');

      logger.info(`[UserService] Usuario desactivado: ${userId}`);

      return user;
    } catch (error) {
      logger.error(`[UserService] Error eliminando usuario ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   *
   * Cambia la contraseña del usuario verificando primero la contraseña actual.
   * Utiliza el método comparePassword del modelo User para validación segura.
   * Registra la operación en los logs de auditoría.
   *
   * @async
   * @param {string} userId - ID del usuario
   * @param {string} currentPassword - Contraseña actual del usuario
   * @param {string} newPassword - Nueva contraseña (mínimo 8 caracteres)
   * @returns {Promise<boolean>} true si la contraseña fue cambiada exitosamente
   * @throws {AppError} USER_NOT_FOUND cuando el usuario no existe
   * @throws {AppError} INVALID_CURRENT_PASSWORD cuando la contraseña actual es incorrecta
   *
   * @example
   * // Cambiar contraseña
   * const success = await userService.changePassword(
   *   '507f1f77bcf86cd799439011',
   *   'CurrentPass123!',
   *   'NewSecurePass456!'
   * );
   */
  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
      }

      // Verificar contraseña actual
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        throw new AppError(
          'Contraseña actual incorrecta',
          401,
          'INVALID_CURRENT_PASSWORD'
        );
      }

      // Actualizar contraseña (el pre-save hook la hasheará)
      user.password = newPassword;
      await user.save();

      logger.info(`[UserService] Contraseña cambiada para usuario: ${userId}`);

      return true;
    } catch (error) {
      logger.error(`[UserService] Error cambiando contraseña para ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de usuarios
   *
   * Genera estadísticas completas del sistema de usuarios utilizando agregación de MongoDB.
   * Incluye conteos totales, por rol, estados activos/inactivos.
   * Utiliza cache para optimizar performance (10 minutos).
   *
   * @async
   * @returns {Promise<Object>} Estadísticas del sistema de usuarios
   * @returns {number} return.total - Total de usuarios registrados
   * @returns {number} return.activos - Usuarios activos
   * @returns {number} return.inactivos - Usuarios inactivos
   * @returns {Array} return.porRol - Estadísticas por rol
   * @returns {string} return.porRol[]._id - Nombre del rol
   * @returns {number} return.porRol[].count - Total de usuarios en el rol
   * @returns {number} return.porRol[].activos - Usuarios activos en el rol
   *
   * @example
   * // Obtener estadísticas
   * const stats = await userService.getStats();
   * console.log(`Total usuarios: ${stats.total}`);
   * console.log(`Ingenieros activos: ${stats.porRol.find(r => r._id === 'engineer')?.activos || 0}`);
   */
  async getStats() {
    try {
      return await cacheService.wrap(
        'users:stats',
        async () => {
          const stats = await User.aggregate([
            {
              _id: "$rol",
              count: { $sum: 1 },
              activos: {
                $sum: { $cond: ["$activo", 1, 0] }
              }
            }
          ]);

          const total = await User.countDocuments();
          const activos = await User.countDocuments({ activo: true });

          return {
            total,
            activos,
            inactivos: total - activos,
            porRol: stats
          };
        },
        600 // Cache 10 minutos
      );
    } catch (error) {
      logger.error('[UserService] Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Exportar instancia única (singleton)
export default new UserService();
