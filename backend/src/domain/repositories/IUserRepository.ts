import { User } from '../entities/User';
import { UserRole } from '../../shared/constants/roles';

/**
 * Filtros para buscar usuarios
 * @interface UserFilters
 */
export interface UserFilters {
  /** Filtrar por rol del usuario */
  role?: UserRole;
  /** Filtrar por estado activo (true=activos, false=inactivos, undefined=todos) */
  active?: boolean;
  /** Búsqueda de texto en name o email */
  search?: string;
  /** Número de página (para paginación offset-based) */
  page?: number;
  /** Límite de resultados por página */
  limit?: number;
  /** Saltar N registros (alternativa a page) */
  skip?: number;
}

/**
 * Repositorio: Usuarios
 * Contrato para persistencia de usuarios del sistema
 * @interface IUserRepository
 * @since 1.0.0
 */
export interface IUserRepository {
  /**
   * Crea un nuevo usuario
   * @param {Omit<User, 'id' | 'createdAt' | 'updatedAt'>} user - Datos del usuario (timestamps generados automáticamente)
   * @returns {Promise<User>} Usuario creado con ID y timestamps asignados
   * @throws {Error} Si el email ya existe o falla la persistencia
   */
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;

  /**
   * Busca un usuario por ID
   * @param {string} id - ID del usuario
   * @returns {Promise<User | null>} Usuario encontrado o null si no existe
   */
  findById(id: string): Promise<User | null>;

  /**
   * Busca un usuario por email (único en el sistema)
   * @param {string} email - Email del usuario (normalizado a lowercase)
   * @returns {Promise<User | null>} Usuario encontrado o null si no existe
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Busca un usuario por email incluyendo el hash de la contraseña
   * @param {string} email - Email del usuario
   * @returns {Promise<User | null>} Usuario con el hash de la contraseña
   */
  findByEmailWithPassword(email: string): Promise<User | null>;

  /**
   * Busca un usuario por ID y retorna también la contraseña (usado para autenticación)
   * @param {string} id - ID del usuario
   * @returns {Promise<User | null>} Usuario con contraseña o null si no existe
   */
  findByIdWithPassword(id: string): Promise<User | null>;

  /**
   * Actualiza la contraseña de un usuario
   * @param {string} id - ID del usuario
   * @param {string} newPassword - Nueva contraseña hasheada
   * @returns {Promise<User>} Usuario actualizado
   * @throws {Error} Si el usuario no existe
   */
  updatePassword(id: string, newPassword: string): Promise<User>;

  /**
   * Compara la contraseña dada con la registrada para el usuario
   * @param {string} id - ID del usuario
   * @param {string} password - Contraseña en texto plano a comparar
   * @returns {Promise<boolean>} True si las contraseñas coinciden
   */
  comparePassword(id: string, password: string): Promise<boolean>;

  /**
   * Busca usuarios por rol
   * @param {UserRole} role - Rol del usuario
   * @returns {Promise<User[]>} Lista de usuarios con ese rol
   */
  findByRole(role: UserRole): Promise<User[]>;

  /**
   * Busca usuarios activos
   * @param {Partial<UserFilters>} [filters] - Filtros opcionales adicionales
   * @returns {Promise<User[]>} Lista de usuarios activos
   */
  findActive(filters?: Partial<UserFilters>): Promise<User[]>;

  /**
   * Busca usuarios inactivos
   * @returns {Promise<User[]>} Lista de usuarios inactivos
   */
  findInactive(): Promise<User[]>;

  /**
   * Busca usuarios con filtros y paginación
   * @param {UserFilters} filters - Filtros de búsqueda
   * @returns {Promise<User[]>} Lista de usuarios que coinciden con los filtros
   */
  find(filters: UserFilters): Promise<User[]>;

  /**
   * Cuenta el total de usuarios con filtros
   * @param {Omit<UserFilters, 'page' | 'limit' | 'skip'>} filters - Filtros (sin paginación)
   * @returns {Promise<number>} Total de usuarios que coinciden con los filtros
   */
  count(filters: Omit<UserFilters, 'page' | 'limit' | 'skip'>): Promise<number>;

  /**
   * Obtiene estadísticas agregadas de usuarios
   * Útil para dashboards y reportes
   * @returns {Promise<{total: number; active: number; inactive: number; byRole: Record<UserRole, number>; locked: number}>} Estadísticas de usuarios
   */
  getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byRole: Record<UserRole, number>;
    locked: number;
  }>;

  /**
   * Actualiza un usuario parcialmente
   * @param {string} id - ID del usuario
   * @param {Partial<User>} user - Datos a actualizar (updatedAt se actualiza automáticamente)
   * @returns {Promise<User>} Usuario actualizado
   * @throws {Error} Si el usuario no existe o el email ya está en uso
   */
  update(id: string, user: Partial<User>): Promise<User>;

  /**
   * Elimina un usuario permanentemente (hard delete)
   * ADVERTENCIA: Esta operación es irreversible
   * @param {string} id - ID del usuario
   * @returns {Promise<boolean>} True si se eliminó correctamente, false si no existía
   */
  delete(id: string): Promise<boolean>;

  /**
   * Verifica si existe un usuario con el email dado
   * @param {string} email - Email a verificar (normalizado a lowercase)
   * @returns {Promise<boolean>} True si existe un usuario con ese email
   */
  existsByEmail(email: string): Promise<boolean>;

  /**
   * Bloquea una cuenta de usuario por tiempo determinado
   * Establece lockedUntil a una fecha futura
   * @param {string} id - ID del usuario
   * @param {Date} lockedUntil - Fecha hasta la cual estará bloqueada la cuenta
   * @returns {Promise<User>} Usuario actualizado con cuenta bloqueada
   */
  lockAccount(id: string, lockedUntil: Date): Promise<User>;

  /**
   * Desbloquea una cuenta de usuario
   * Establece lockedUntil=undefined
   * @param {string} id - ID del usuario
   * @returns {Promise<User>} Usuario desbloqueado
   * @throws {Error} Si el usuario no existe
   */
  unlockAccount(id: string): Promise<User>;

  /**
   * Registra un intento fallido de inicio de sesión
   * Incrementa loginAttempts en 1
   * @param {string} id - ID del usuario
   * @returns {Promise<User>} Usuario con el intento fallido registrado
   */
  recordFailedLogin(id: string): Promise<User>;

  /**
   * Restablece los intentos de inicio de sesión fallidos
   * Establece loginAttempts=0 y lockedUntil=undefined
   * @param {string} id - ID del usuario
   * @returns {Promise<User>} Usuario con los intentos restablecidos
   */
  resetLoginAttempts(id: string): Promise<User>;
}

