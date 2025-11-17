import type { IUserRepository } from '../../../domain/repositories/IUserRepository.js';
import type { User } from '../../../domain/entities/User.js';
import { UserRole } from '../../../shared/constants/roles.js'; // ✅ Importar centralizado

/**
 * Error personalizado para operaciones de listado de usuarios
 * Incluye código de error y status HTTP para manejo consistente
 * @class UserListError
 * @extends {Error}
 */
export class UserListError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number
  ) {
    super(message);
    this.name = 'UserListError';
    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * Filtros para buscar usuarios en el repositorio
 * @interface UserFilters
 */
export interface UserFilters {
  /** Filtrar por rol del usuario */
  role?: UserRole;
  /** Filtrar por estado activo del usuario */
  active?: boolean;
  /** Búsqueda por nombre o email */
  search?: string;
}

/**
 * DTO para listar usuarios con paginación y filtros
 * @interface ListUsersFilters
 */
export interface ListUsersFilters {
  /** Número de página (mínimo 1, default: 1) */
  page?: number;
  /** Cantidad de resultados por página (1-100, default: 20) */
  limit?: number;
  /** Rol del usuario para filtrar (opcional) */
  role?: UserRole;
  /** Estado activo del usuario (opcional) */
  active?: boolean;
  /** Búsqueda por nombre o email (opcional) */
  search?: string;
}

/**
 * Resultado paginado de usuarios con metadata completa
 * @interface PaginatedUsers
 */
export interface PaginatedUsers {
  /** Lista de usuarios sin contraseñas */
  data: Omit<User, 'password'>[];
  /** Total de usuarios que coinciden con los filtros */
  total: number;
  /** Página actual */
  page: number;
  /** Límite de resultados por página */
  limit: number;
  /** Total de páginas disponibles */
  totalPages: number;
  /** Indica si hay página anterior */
  hasPreviousPage: boolean;
  /** Indica si hay página siguiente */
  hasNextPage: boolean;
}

/**
 * Caso de uso: Listar usuarios con paginación y filtros
 * Excluye contraseñas de los resultados por seguridad
 * @class ListUsers
 * @since 1.0.0
 */
export class ListUsers {
  // Configuración de paginación
  private static readonly PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MIN_LIMIT: 1,
    MAX_LIMIT: 100,
    MIN_PAGE: 1,
  } as const;

  private static readonly MIN_SEARCH_LENGTH = 2;

  constructor(private readonly userRepository: IUserRepository) {}

  /**
   * Ejecuta el listado de usuarios con paginación y filtros
   * @param {ListUsersFilters} filters - Parámetros de paginación y filtros
   * @returns {Promise<PaginatedUsers>} Resultado paginado sin contraseñas
   * @throws {UserListError} Si hay errores de validación
   */
  async execute(filters: ListUsersFilters = {}): Promise<PaginatedUsers> {
    try {
      const page = this.validatePage(filters.page);
      const limit = this.validateLimit(filters.limit);
      const userFilters = this.buildFilters(filters);

      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.userRepository.find({ ...userFilters, skip, limit }),
        this.userRepository.count(userFilters),
      ]);

      const data = this.sanitizeUsers(users);
      const paginationMetadata = this.buildPaginationMetadata(page, limit, total);

      console.info(
        `[ListUsers] 👥 Listado de usuarios: página ${page}/${paginationMetadata.totalPages}, ${data.length} resultados (total: ${total})`
      );

      return {
        data,
        total,
        page,
        limit,
        ...paginationMetadata,
      };
    } catch (error) {
      if (error instanceof UserListError) {
        throw error;
      }

      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      console.error('[ListUsers] Error inesperado:', errorMessage);

      throw new UserListError(
        `Error interno al listar usuarios: ${errorMessage}`,
        'INTERNAL_ERROR',
        500
      );
    }
  }

  /**
   * Remueve contraseñas de los usuarios por seguridad
   * @private
   * @param {User[]} users - Usuarios con contraseñas
   * @returns {Omit<User, 'password'>[]} Usuarios sin contraseñas
   */
  private sanitizeUsers(users: User[]): Omit<User, 'password'>[] {
    return users.map((user) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, ...safeUser } = user as User & { password?: string };
      return safeUser;
    });
  }

  /**
   * Construye metadata de paginación
   * @private
   * @param {number} page - Página actual
   * @param {number} limit - Límite por página
   * @param {number} total - Total de resultados
   * @returns Metadata de paginación
   */
  private buildPaginationMetadata(page: number, limit: number, total: number) {
    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
      hasNextPage: page < totalPages,
    };
  }

  /**
   * Valida el número de página
   * @private
   * @param {number} [page] - Página a validar
   * @returns {number} Página validada o valor por defecto
   * @throws {UserListError} Si la página es inválida
   */
  private validatePage(page?: number): number {
    if (page === undefined || page === null) {
      return ListUsers.PAGINATION.DEFAULT_PAGE;
    }

    this.validateIntegerParam(page, 'página', 'PAGE');

    if (page < ListUsers.PAGINATION.MIN_PAGE) {
      throw new UserListError(
        `El número de página debe ser al menos ${ListUsers.PAGINATION.MIN_PAGE}`,
        'PAGE_TOO_SMALL',
        400
      );
    }

    return page;
  }

  /**
   * Valida el límite de resultados por página
   * @private
   * @param {number} [limit] - Límite a validar
   * @returns {number} Límite validado o valor por defecto
   * @throws {UserListError} Si el límite es inválido
   */
  private validateLimit(limit?: number): number {
    if (limit === undefined || limit === null) {
      return ListUsers.PAGINATION.DEFAULT_LIMIT;
    }

    this.validateIntegerParam(limit, 'límite', 'LIMIT');

    if (limit < ListUsers.PAGINATION.MIN_LIMIT) {
      throw new UserListError(
        `El límite debe ser al menos ${ListUsers.PAGINATION.MIN_LIMIT}`,
        'LIMIT_TOO_SMALL',
        400
      );
    }

    if (limit > ListUsers.PAGINATION.MAX_LIMIT) {
      throw new UserListError(
        `El límite no puede exceder ${ListUsers.PAGINATION.MAX_LIMIT}`,
        'LIMIT_TOO_LARGE',
        400
      );
    }

    return limit;
  }

  /**
   * Valida un parámetro entero genérico
   * @private
   * @param {number} value - Valor a validar
   * @param {string} displayName - Nombre para mostrar en errores
   * @param {string} errorPrefix - Prefijo para códigos de error
   * @throws {UserListError} Si el valor no es entero
   */
  private validateIntegerParam(value: number, displayName: string, errorPrefix: string): void {
    if (typeof value !== 'number') {
      throw new UserListError(
        `El ${displayName} debe ser un número`,
        `INVALID_${errorPrefix}_TYPE`,
        400
      );
    }

    if (!Number.isInteger(value)) {
      throw new UserListError(
        `El ${displayName} debe ser un entero`,
        `INVALID_${errorPrefix}_INTEGER`,
        400
      );
    }
  }

  /**
   * Construye el objeto de filtros con validaciones
   * @private
   * @param {ListUsersFilters} filters - Filtros del DTO
   * @returns {UserFilters} Filtros validados para el repositorio
   * @throws {UserListError} Si algún filtro es inválido
   */
  private buildFilters(filters: ListUsersFilters): UserFilters {
    const userFilters: UserFilters = {};

    if (filters.role !== undefined) {
      this.validateUserRole(filters.role);
      userFilters.role = filters.role;
    }

    if (filters.active !== undefined) {
      this.validateBoolean(filters.active, 'active', 'campo active');
      userFilters.active = filters.active;
    }

    if (filters.search !== undefined) {
      const sanitizedSearch = this.validateSearch(filters.search);
      if (sanitizedSearch) {
        userFilters.search = sanitizedSearch;
      }
    }

    return userFilters;
  }

  /**
   * Valida que el rol sea un valor del enum UserRole
   * @private
   * @param {UserRole} role - Rol a validar
   * @throws {UserListError} Si el rol no es válido
   */
  private validateUserRole(role: UserRole): void {
    const validRoles = Object.values(UserRole);

    if (!validRoles.includes(role)) {
      throw new UserListError(
        `Rol inválido. Valores permitidos: ${validRoles.join(', ')}`,
        'INVALID_USER_ROLE',
        400
      );
    }
  }

  /**
   * Valida un parámetro booleano
   * @private
   * @param {boolean} value - Valor a validar
   * @param {string} fieldCode - Código del campo (para error code)
   * @param {string} displayName - Nombre para mostrar en errores
   * @throws {UserListError} Si el valor no es booleano
   */
  private validateBoolean(value: boolean, fieldCode: string, displayName: string): void {
    if (typeof value !== 'boolean') {
      throw new UserListError(
        `El ${displayName} debe ser un booleano`,
        `INVALID_${fieldCode.toUpperCase()}_TYPE`,
        400
      );
    }
  }

  /**
   * Valida y sanitiza el término de búsqueda
   * @private
   * @param {string} search - Término a validar
   * @returns {string | undefined} Término sanitizado o undefined si es vacío
   * @throws {UserListError} Si el término es inválido
   */
  private validateSearch(search: string): string | undefined {
    if (typeof search !== 'string') {
      throw new UserListError(
        'El campo search debe ser una cadena',
        'INVALID_SEARCH_TYPE',
        400
      );
    }

    const trimmedSearch = search.trim();

    if (trimmedSearch.length === 0) {
      return undefined;
    }

    if (trimmedSearch.length < ListUsers.MIN_SEARCH_LENGTH) {
      throw new UserListError(
        `El término de búsqueda debe tener al menos ${ListUsers.MIN_SEARCH_LENGTH} caracteres`,
        'SEARCH_TOO_SHORT',
        400
      );
    }

    return trimmedSearch;
  }
}




